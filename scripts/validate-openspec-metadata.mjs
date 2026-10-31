#!/usr/bin/env node
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isAlias, isMap, parseDocument, visit } from "yaml";

const defaultRoot = fileURLToPath(new URL("../", import.meta.url));
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const validName = (value) => /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) && value.length <= 200 && value !== "archive";

const archivePrefix = "openspec/changes/archive/";

// Archive is a layout, not a change. Every entry must be archive/<date>-<change>/<artifact>;
// native artifacts at its root and undated change directories fail closed.
function artifactAt(relative) {
  if (relative.startsWith(archivePrefix)) {
    const [entry, ...rest] = relative.slice(archivePrefix.length).split("/");
    const tail = rest.join("/");
    const dated = /^\d{4}-\d{2}-\d{2}-(.+)$/.exec(entry);
    const looksNative = (value) => /(?:^|\/)(?:proposal|design|tasks)\.md$|(?:^|\/)spec\.md$/.test(value);
    if (!dated) {
      // A non-artifact file (for example an empty-archive placeholder) is not a native artifact.
      requireThat(!looksNative(entry), `${relative}: invalid archive layout (archive is not a change; native artifacts belong inside archive/<YYYY-MM-DD>-<change>/)`);
      return null;
    }
    requireThat(rest.length > 0, `${relative}: invalid archive layout (archive entry must be a dated change directory)`);
    const change = dated[1];
    if (["proposal.md", "design.md", "tasks.md"].includes(tail)) return { artifact: tail.slice(0, -3), change };
    const spec = /^specs\/(.+)\/spec\.md$/.exec(tail);
    if (spec) return { artifact: "delta-spec", change, capability: spec[1] };
    return null;
  }
  let match = /^openspec\/specs\/(.+)\/spec\.md$/.exec(relative);
  if (match) return { artifact: "spec", capability: match[1] };
  match = /^openspec\/changes\/([^/]+)\/(.+)$/.exec(relative);
  if (!match) return null;
  const [, change, tail] = match;
  if (["proposal.md", "design.md", "tasks.md"].includes(tail)) return { artifact: tail.slice(0, -3), change };
  const spec = /^specs\/(.+)\/spec\.md$/.exec(tail);
  return spec ? { artifact: "delta-spec", change, capability: spec[1] } : null;
}

export async function validateMetadata({ root = defaultRoot, requireIssue = false } = {}) {
  const files = [];
  const locations = new Map();
  const claim = (identity, relative) => locations.set(identity, [...(locations.get(identity) ?? []), relative]);
  async function walk(relative) {
    const absolute = path.join(root, relative);
    const stat = await lstat(absolute);
    requireThat(!stat.isSymbolicLink(), `Symlinked source: ${relative}`);
    if (stat.isDirectory()) {
      const active = /^openspec\/changes\/([^/]+)$/.exec(relative);
      if (active && active[1] !== "archive") {
        requireThat(validName(active[1]), `${relative}: invalid change directory`);
        claim(active[1], relative);
      }
      const archived = /^openspec\/changes\/archive\/([^/]+)$/.exec(relative);
      if (archived) {
        const match = /^(\d{4}-\d{2}-\d{2})-(.+)$/.exec(archived[1]);
        const date = match && new Date(`${match[1]}T00:00:00Z`);
        requireThat(match && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === match[1] && validName(match[2]), `${relative}: invalid archive directory`);
        claim(match[2], relative);
      }
      for (const name of (await readdir(absolute)).sort()) await walk(`${relative}/${name}`);
      return;
    }
    const expected = artifactAt(relative);
    if (!expected) return;
    requireThat(stat.isFile(), `Not a regular file: ${relative}`);
    let source;
    try { source = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await readFile(absolute)); }
    catch { throw new Error(`${relative}: expected valid UTF-8`); }
    if (expected.capability) requireThat(expected.capability.split("/").every((part) => /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(part)), `${relative}: invalid capability path`);
    if (expected.artifact === "delta-spec") {
      requireThat(!/^\uFEFF?---(?:\r?\n|$)/.test(source), `${relative}: delta spec must not have frontmatter (upstream strict validation)`);
      requireThat(source.trim(), `${relative}: empty delta spec`);
      files.push(relative);
      return;
    }
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
    requireThat(frontmatter, `${relative}: missing YAML frontmatter`);
    const doc = parseDocument(frontmatter[1]);
    requireThat(doc.errors.length === 0 && doc.warnings.length === 0, `${relative}: invalid YAML: ${[...doc.errors, ...doc.warnings].map((error) => error.message).join("; ")}`);
    requireThat(isMap(doc.contents), `${relative}: frontmatter must be a mapping`);
    visit(doc, (_, node) => { requireThat(!isAlias(node), `${relative}: YAML aliases are not supported`); });
    const data = doc.toJS();
    const allowed = ["metadata_version", ...Object.keys(expected), ...(expected.artifact === "proposal" ? ["github_issue"] : [])];
    for (const key of Object.keys(data)) requireThat(allowed.includes(key), `${relative}: unexpected field ${key}`);
    requireThat(data?.metadata_version === 1, `${relative}: metadata_version must be 1`);
    for (const [key, value] of Object.entries(expected)) requireThat(data[key] === value, `${relative}: ${key} must match ${value}`);
    if (expected.artifact === "proposal") {
      const issue = data.github_issue;
      requireThat(issue === null || (typeof issue === "string" && /^https:\/\/github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\/[A-Za-z0-9_.-]+\/issues\/[1-9][0-9]*$/.test(issue) && ![".", ".."].includes(issue.split("/")[4])), `${relative}: github_issue must be a GitHub issue URL or explicit null`);
      requireThat(!requireIssue || relative.startsWith("openspec/changes/archive/") || issue !== null, `${relative}: github_issue is required before approval`);
    }
    requireThat(source.slice(frontmatter[0].length).trim(), `${relative}: empty Markdown body`);
    files.push(relative);
  }
  await walk("openspec");
  // One identity, one location: an active change and its dated archive (or two dated
  // archives) would otherwise be validated as two independent changes. Empty directories
  // claim the identity too, because an interrupted move leaves them behind.
  for (const [identity, claimed] of locations) {
    requireThat(claimed.length === 1, `${identity}: duplicate change identity in ${claimed.join(", ")}`);
  }
  requireThat(files.length > 0, "No native OpenSpec artifacts found");
  return { ok: true, files };
}

async function main() {
  let root = defaultRoot;
  let requireIssue = false;
  const args = process.argv.slice(2);
  const seen = new Set();
  while (args.length) {
    const option = args.shift();
    requireThat(!seen.has(option), `Duplicate option: ${option}`);
    seen.add(option);
    if (option === "--root") {
      requireThat(args[0] && !args[0].startsWith("--"), "--root requires a path");
      root = path.resolve(args.shift());
    }
    else if (option === "--require-issue") requireIssue = true;
    else throw new Error(`Unknown option: ${option}`);
  }
  console.log(JSON.stringify(await validateMetadata({ root, requireIssue }), null, 2));
}
if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
