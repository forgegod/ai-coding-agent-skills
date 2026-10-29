#!/usr/bin/env node
// Read-only committed OpenSpec evidence checks. Not a lock or execution attestation.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, constants, fstatSync, lstatSync, openSync, readFileSync, readSync, realpathSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
const decode = (bytes, message) => {
  try { return decoder.decode(bytes); } catch { throw new Error(message); }
};
const text = (value) => typeof value === "string" && value.trim().length > 0;

// Inherited Git topology/config overrides could redirect every check to different objects.
const REFUSED_ENV = ["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_NAMESPACE", "GIT_GRAFT_FILE", "GIT_SHALLOW_FILE", "GIT_REPLACE_REF_BASE", "GIT_CONFIG_COUNT", "GIT_CONFIG_PARAMETERS"];
const childEnv = { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !REFUSED_ENV.includes(key))), GIT_NO_REPLACE_OBJECTS: "1", GIT_OPTIONAL_LOCKS: "0" };
const MAX_EVIDENCE_BYTES = 1024 * 1024;
const MAX_PLANNING_BYTES = 4 * 1024 * 1024;
const MAX_CLOSURE_COMMITS = 200;

// Replacement objects are disabled and repository-configured fsmonitor commands are
// neutralized for every child process; the helper never runs repository hooks.
const gitBytes = (repo, ...args) => execFileSync("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "-C", repo, ...args], { env: childEnv, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
const git = (repo, ...args) => decode(gitBytes(repo, ...args), "Git output is not valid UTF-8");

function commit(repo, value) {
  const length = git(repo, "rev-parse", "--show-object-format").trim() === "sha256" ? 64 : 40;
  requireThat(typeof value === "string" && new RegExp(`^[a-f0-9]{${length}}$`).test(value), "Expected a full literal commit SHA");
  requireThat(git(repo, "rev-parse", "--verify", `${value}^{commit}`).trim() === value, "Commit identity mismatch");
  return value;
}
function topology(repo) {
  requireThat(!git(repo, "for-each-ref", "--format=%(refname)", "refs/replace/").trim(), "Git replace refs are unsupported; preserve work and use an unmodified object graph");
  const grafts = path.resolve(repo, git(repo, "rev-parse", "--git-path", "info/grafts").trim());
  let bytes;
  try { bytes = readFileSync(grafts); }
  catch (error) { requireThat(error.code === "ENOENT", "Git graft file is unreadable"); }
  requireThat(!bytes || !bytes.toString("utf8").trim(), "Git graft files are unsupported; preserve work and use an unmodified object graph");
}
function ancestor(repo, older, newer) {
  try { git(repo, "merge-base", "--is-ancestor", older, newer); }
  catch { throw new Error("Required commit ancestry is absent; preserve work"); }
}
function entries(repo, ref) {
  return new Map(git(repo, "ls-tree", "-r", "-z", "--full-tree", ref).split("\0").filter(Boolean).map((line) => {
    const separator = line.indexOf("\t");
    requireThat(separator > 0, "Malformed tree entry");
    const [mode, type, oid] = line.slice(0, separator).split(" ");
    requireThat(/^[0-7]{6}$/.test(mode ?? "") && /^[a-f0-9]{40,64}$/.test(oid ?? ""), "Malformed tree entry");
    return [line.slice(separator + 1), { mode, type, oid }];
  }));
}
function root(change) {
  requireThat(typeof change === "string" && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(change), "Expected a literal OpenSpec change name");
  return `openspec/changes/${change}/`;
}
function archivePattern(change) {
  return new RegExp(`^openspec/changes/archive/\\d{4}-\\d{2}-\\d{2}-${change}/`);
}
const fenceMark = /^( {0,3})(`{3,}|~{3,})(.*)$/;
const indentedCode = /^(?: {4,}|\t)/;
const bulletList = /^(?:[-*+]|\d{1,9}[.)])[ \t]+\[/;

// Strict task grammar: a list checkbox at 0-3 leading spaces, optionally blockquoted.
// Fenced blocks, indented code and HTML comments are not tasks; anything else that
// still looks like a checkbox is ambiguous, so it fails closed instead of being skipped.
function taskLines(source) {
  const bom = source.startsWith("\ufeff") ? "\ufeff" : "";
  source = source.slice(bom.length);
  const tasks = [];
  let fence = null;
  let comment = false;
  const normalized = (source.match(/[^\n]*\n|[^\n]+$/g) ?? []).map((line) => {
    const body = line.replace(/\r?\n$/, "");
    const eol = line.slice(body.length);
    const quote = /^(?: {0,3}> ?)*/.exec(body)[0];
    const content = body.slice(quote.length);
    if (fence) {
      const close = fenceMark.exec(content);
      if (close && close[2][0] === fence[0] && close[2].length >= fence.length && !close[3].trim()) fence = null;
      return line;
    }
    const mark = fenceMark.exec(content);
    if (mark && !(mark[2][0] === "`" && mark[3].includes("`"))) { fence = mark[2]; return line; }
    if (comment) { if (content.includes("-->")) comment = false; return line; }
    if (content.startsWith("<!--")) { comment = !content.slice(4).includes("-->"); return line; }
    requireThat(!(indentedCode.test(content) && bulletList.test(content.trimStart())), "Ambiguous indented task line; task items must start at no more than three spaces");
    const task = /^( {0,3})([-*+]|\d{1,9}[.)])([ \t]+)\[([^\]]*)\](.*)$/.exec(content);
    if (!task) return line;
    const state = task[4];
    const rest = task[5];
    if (!/^[ xX]$/.test(state)) {
      // Explicit Markdown links are ordinary list text, not task checkboxes.
      if (state.trim().length > 1 && /^[([]/.test(rest)) return line;
      throw new Error("Unknown task checkbox state");
    }
    requireThat(rest === "" || /^[ \t]/.test(rest), "Task text requires whitespace after the checkbox");
    tasks.push(state.toLowerCase() === "x");
    return `${quote}${task[1]}${task[2]}${task[3]}[ ]${rest}${eol}`;
  }).join("");
  requireThat(!fence, "Unclosed Markdown fence in task file");
  requireThat(!comment, "Unclosed HTML comment in task file");
  requireThat(tasks.length > 0, "Expected at least one real OpenSpec task");
  return { normalized: bom + normalized, complete: tasks.every(Boolean) };
}
function planning(repo, ref, change) {
  const prefix = root(change);
  const tree = entries(repo, ref);
  const required = ["openspec/config.yaml", `${prefix}.openspec.yaml`, `${prefix}proposal.md`, `${prefix}tasks.md`];
  for (const file of required) requireThat(tree.has(file), `Missing planning file: ${file}`);
  const paths = [...tree.keys()].filter((file) => required.includes(file) || file === `${prefix}design.md` || file.startsWith(`${prefix}specs/`)).sort();
  // Path, mode and raw blob bytes are length-framed into one SHA-256 digest so that
  // arbitrary bytes hash distinctly instead of being lossily re-encoded.
  const hash = createHash("sha256");
  let complete = false;
  for (const file of paths) {
    const entry = tree.get(file);
    requireThat(entry.type === "blob" && ["100644", "100755"].includes(entry.mode), `Planning inputs must be regular files: ${file}`);
    let bytes = gitBytes(repo, "show", `${ref}:${file}`);
    requireThat(bytes.length <= MAX_PLANNING_BYTES, `Planning input is too large: ${file}`);
    if (file === `${prefix}tasks.md`) {
      const tasks = taskLines(decode(bytes, `Planning input is not valid UTF-8: ${file}`));
      bytes = Buffer.from(tasks.normalized, "utf8");
      complete = tasks.complete;
    } else decode(bytes, `Planning input is not valid UTF-8: ${file}`);
    hash.update(JSON.stringify([file, entry.mode, bytes.length]));
    hash.update(Buffer.from([0]));
    hash.update(bytes);
    hash.update(Buffer.from([0]));
  }
  return { digest: hash.digest("hex"), complete };
}
function clean(repo, head) {
  requireThat(git(repo, "rev-parse", "HEAD").trim() === head, "Checkout HEAD changed");
  requireThat(git(repo, "symbolic-ref", "--quiet", "HEAD").trim(), "Expected an attached branch");
  requireThat(!git(repo, "status", "--porcelain=v1", "--untracked-files=all").trim(), "Dirty checkout; preserve uncommitted work");
}
function candidate(o, requireCheckout = true) {
  const base = commit(o.repo, o.base);
  const head = commit(o.repo, o.head);
  const plan = commit(o.repo, o.plan);
  root(o.change);
  ancestor(o.repo, base, head);
  ancestor(o.repo, plan, head);
  const approved = planning(o.repo, plan, o.change);
  const current = planning(o.repo, head, o.change);
  requireThat(current.digest === approved.digest, "Planning content changed after approval");
  if (o["expect-plan"] !== undefined) requireThat(o["expect-plan"] === current.digest, "Approved plan digest mismatch");
  if (requireCheckout) clean(o.repo, head);
  return { base, head, plan, planDigest: current.digest, tree: git(o.repo, "rev-parse", `${head}^{tree}`).trim(), tasksComplete: current.complete };
}
function evidence(file) {
  const absolute = path.resolve(file);
  const before = lstatSync(absolute);
  requireThat(before.isFile() && !before.isSymbolicLink() && before.size <= MAX_EVIDENCE_BYTES, "Expected a regular bounded evidence JSON file");
  // Read through one descriptor: the path cannot be swapped for a symlink or larger
  // file between inspection and use. O_NOFOLLOW is applied where the platform has it.
  let descriptor;
  try { descriptor = openSync(absolute, constants.O_RDONLY | (constants.O_NOFOLLOW || 0)); }
  catch { throw new Error("Expected a regular bounded evidence JSON file"); }
  try {
    const info = fstatSync(descriptor);
    requireThat(info.isFile() && info.size <= MAX_EVIDENCE_BYTES && info.dev === before.dev && info.ino === before.ino, "Evidence file changed while it was opened");
    const buffer = Buffer.alloc(info.size + 1);
    let total = 0;
    while (total < buffer.length) {
      const read = readSync(descriptor, buffer, total, buffer.length - total, null);
      if (read === 0) break;
      total += read;
    }
    requireThat(total === info.size, "Evidence file changed while it was read");
    const bytes = buffer.subarray(0, total);
    const source = decode(bytes, "Evidence file is not valid UTF-8");
    let value;
    try { value = JSON.parse(source); } catch { throw new Error("Evidence file is not valid JSON"); }
    requireThat(value && typeof value === "object" && !Array.isArray(value) && value.schemaVersion === 1, "Unsupported evidence schema");
    return { value, bytes, sha256: createHash("sha256").update(bytes).digest("hex") };
  } finally { closeSync(descriptor); }
}
function identity(value, o) {
  requireThat(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/[1-9][0-9]*$/.test(o.issue ?? ""), "Expected a canonical GitHub issue URL");
  requireThat(value.change === o.change && value.issueUrl === o.issue, "Evidence change/issue identity mismatch");
}
function gates(value, ref) {
  requireThat(Array.isArray(value) && value.length > 0, "Missing executed gate evidence");
  for (const gate of value) requireThat(gate && text(gate.command) && gate.commit === ref && gate.exitCode === 0 && text(gate.evidence), "Failed, missing or wrong-revision gate evidence");
}
function review(value, snapshot, o) {
  requireThat(value && typeof value === "object", "Missing review evidence");
  requireThat(value.schemaVersion === 1, "Unsupported review schema");
  identity(value, o);
  requireThat(value.head === snapshot.head && value.planDigest === snapshot.planDigest, "Review names a stale candidate or plan");
  requireThat(value.verdict === "pass" && Array.isArray(value.findings) && value.findings.length === 0, "Unresolved review findings");
  requireThat(text(value.reviewer) && text(value.reference), "Missing independent review references");
  gates(value.gates, snapshot.head);
}
const sameEntry = (a, b) => Boolean(a && b && a.oid === b.oid && a.mode === b.mode && a.type === b.type);
const isEvidence = (relative) => relative.startsWith("evidence/") && /\.(?:json|md|txt|log)$/.test(relative);
const isRegular = (entry) => entry?.mode === "100644" && entry.type === "blob";
function archivesIn(tree, change) {
  const pattern = archivePattern(change);
  return [...new Set([...tree.keys()].filter((file) => pattern.test(file)).map((file) => file.match(pattern)[0]))];
}
// One commit edge may only add new evidence or move the package into one archive.
function delta(before, after, change, label) {
  const active = root(change);
  const pattern = archivePattern(change);
  for (const file of new Set([...before.keys(), ...after.keys()])) {
    const old = before.get(file);
    const current = after.get(file);
    if (sameEntry(old, current)) continue;
    const reject = () => { throw new Error(`Unverified target content: ${file} (${label})`); };
    if (file.startsWith(active)) {
      const relative = file.slice(active.length);
      if (!current) {
        requireThat(archivesIn(after, change).some((prefix) => sameEntry(old, after.get(prefix + relative))), `Unverified target content: ${file} (${label})`);
        continue;
      }
      requireThat(!old && isRegular(current) && isEvidence(relative), `Unverified target content: ${file} (${label})`);
      continue;
    }
    const archive = pattern.test(file) ? file.match(pattern)[0] : null;
    if (!archive) reject();
    const relative = file.slice(archive.length);
    requireThat(!old, `Unverified target content: ${file} (${label})`);
    requireThat((isRegular(current) && isEvidence(relative)) || sameEntry(current, before.get(active + relative)), `Unverified target content: ${file} (${label})`);
  }
}
// Every closure commit is checked against its in-range parents, not only the net
// verified..target diff, so evidence added and later rewritten cannot disappear.
function fresh(repo, verified, target, change, limit) {
  const commits = git(repo, "rev-list", `${verified}..${target}`).trim().split("\n").filter(Boolean);
  requireThat(commits.length <= limit, `Closure history is too large to verify (${commits.length} commits > ${limit})`);
  const known = new Set([verified, ...commits]);
  const trees = new Map([[verified, entries(repo, verified)]]);
  const tree = (ref) => {
    if (!trees.has(ref)) trees.set(ref, entries(repo, ref));
    return trees.get(ref);
  };
  for (const sha of commits) {
    const [current, ...parents] = git(repo, "rev-list", "--parents", "-n", "1", sha).trim().split(/\s+/);
    requireThat(current === sha && parents.length > 0, "Closure history contains an unrelated root commit");
    for (const parent of parents.filter((value) => known.has(value))) delta(tree(parent), tree(sha), change, `commit ${sha}`);
  }
  delta(tree(verified), tree(target), change, `verified..target ${target}`);
  const after = tree(target);
  const archives = archivesIn(after, change);
  requireThat(archives.length <= 1, "Duplicate canonical change archives");
  if (archives.length) requireThat(![...after.keys()].some((file) => file.startsWith(root(change))), "Both active and archived canonical change exist");
}
function receiptPath(value, change) {
  requireThat(text(value), "Receipt path must name a committed evidence JSON file");
  requireThat(!path.isAbsolute(value) && !value.includes("\\"), "Receipt path must be a repository-relative POSIX path");
  requireThat(value.split("/").every((segment) => segment && segment !== "." && segment !== ".."), "Receipt path must not contain empty, '.' or '..' segments");
  const active = root(change);
  const owner = value.startsWith(active) ? active : (value.match(archivePattern(change)) ?? [null])[0];
  requireThat(owner, "Receipt path must be inside the selected change or its archive");
  const relative = value.slice(owner.length);
  requireThat(relative.startsWith("evidence/") && relative.endsWith(".json"), "Receipt path must name a committed evidence JSON file");
  return value;
}
function receipt(o) {
  const record = evidence(o.receipt);
  identity(record.value, o);
  const snapshot = candidate({ ...o, base: record.value.base, head: record.value.head, plan: record.value.plan, "expect-plan": record.value.planDigest }, false);
  requireThat(snapshot.tasksComplete, "Incomplete implementation tasks cannot complete a change");
  review(record.value.review, snapshot, o);
  const integrated = commit(o.repo, record.value.integrated);
  const verified = commit(o.repo, record.value.verified);
  const target = commit(o.repo, o.target);
  ancestor(o.repo, snapshot.head, integrated);
  ancestor(o.repo, integrated, verified);
  ancestor(o.repo, verified, target);
  const prPrefix = o.issue.split("/issues/")[0] + "/pull/";
  requireThat(typeof record.value.integrationReference === "string" && record.value.integrationReference.startsWith(prPrefix) && /^[1-9][0-9]*$/.test(record.value.integrationReference.slice(prPrefix.length)), "Missing canonical integration PR reference");
  for (const ref of [integrated, verified]) {
    const current = planning(o.repo, ref, o.change);
    requireThat(current.digest === snapshot.planDigest && current.complete, "Integrated planning content changed or tasks incomplete");
  }
  gates(record.value.gates, verified);
  fresh(o.repo, verified, target, o.change, o.limit);
  if (o["receipt-path"] !== undefined) {
    const published = receiptPath(o["receipt-path"], o.change);
    const entry = entries(o.repo, target).get(published);
    requireThat(entry && isRegular(entry), "Published receipt must be a committed regular file");
    requireThat(gitBytes(o.repo, "show", `${target}:${published}`).equals(record.bytes), "Published receipt bytes differ from the supplied evidence file");
  }
  clean(o.repo, target);
  return { ...snapshot, integrated, verified, target, receiptSha256: record.sha256 };
}
function main() {
  const command = process.argv[2];
  requireThat(["candidate", "review", "receipt"].includes(command), "Expected candidate, review or receipt command");
  for (const key of REFUSED_ENV) requireThat(process.env[key] === undefined, "Git topology overrides are unsupported");
  const args = process.argv.slice(3);
  const names = ["repo", "change", ...(command === "receipt" ? ["target", "receipt", "issue", "receipt-path", "max-closure-commits"] : ["base", "head", "plan", "expect-plan", ...(command === "review" ? ["issue", "review"] : [])])];
  const seen = new Set();
  for (const arg of args) {
    const match = /^--([A-Za-z][A-Za-z-]*)(?:=|$)/.exec(arg);
    if (!match) continue;
    requireThat(!seen.has(match[1]), `Duplicate option --${match[1]}`);
    seen.add(match[1]);
  }
  const { values: o } = parseArgs({ args, options: Object.fromEntries(names.map((key) => [key, { type: "string" }])), strict: true, allowPositionals: false });
  for (const key of names.filter((key) => !["expect-plan", "receipt-path", "max-closure-commits"].includes(key))) requireThat(text(o[key]), `Missing --${key}`);
  if (o["expect-plan"] !== undefined) requireThat(/^[a-f0-9]{64}$/.test(o["expect-plan"]), "Expected a full plan digest");
  requireThat(path.isAbsolute(o.repo) && realpathSync(o.repo) === realpathSync(git(o.repo, "rev-parse", "--show-toplevel").trim()), "Expected an absolute repository-root path");
  topology(o.repo);
  if (command === "candidate") return console.log(JSON.stringify({ ok: true, ...candidate(o) }));
  if (command === "review") {
    const snapshot = candidate(o);
    review(evidence(o.review).value, snapshot, o);
    return console.log(JSON.stringify({ ok: true, ...snapshot }));
  }
  const limit = o["max-closure-commits"] === undefined ? MAX_CLOSURE_COMMITS : Number(o["max-closure-commits"]);
  requireThat(Number.isInteger(limit) && limit > 0 && limit <= MAX_CLOSURE_COMMITS, `--max-closure-commits must be an integer from 1 to ${MAX_CLOSURE_COMMITS}`);
  console.log(JSON.stringify({ ok: true, ...receipt({ ...o, limit }) }));
}
try { main(); }
catch (error) { console.log(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; }
