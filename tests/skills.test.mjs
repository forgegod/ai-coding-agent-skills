import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(root, "skills");

const credentialPatterns = [
  /\b(ghp|gho|ghs|ghr)_[A-Za-z0-9]{16,}/,
  /\bsk-[A-Za-z0-9]{20,}/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  /BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY/,
  /\bAKIA[0-9A-Z]{16}\b/,
];

async function skillFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await skillFiles(file)));
    } else if (entry.isFile() && entry.name === "SKILL.md") {
      files.push(file);
    }
  }
  return files.sort();
}

function frontmatterFields(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):(?:\s+(.*))?$/);
    if (field) fields[field[1]] = (field[2] ?? "").trim();
  }
  return fields;
}

test("skills/ ships the DOX chain for the playbook tree", async () => {
  for (const relative of ["AGENTS.md", "autonomous-ai-agents/AGENTS.md", "software-development/AGENTS.md"]) {
    const info = await stat(path.join(skillsRoot, relative)).catch(() => null);
    assert.ok(info?.isFile(), `missing ${relative}`);
  }
});

test("autonomous-implementation-review packages its selection helper", async () => {
  const directory = path.join(skillsRoot, "autonomous-ai-agents", "autonomous-implementation-review");
  const source = await readFile(path.join(directory, "SKILL.md"), "utf8");
  const helper = await readFile(path.join(directory, "scripts", "herdr_panes.py"), "utf8");
  assert.match(source, /name: autonomous-implementation-review/);
  assert.match(source, /independent review loop/i);
  assert.match(source, /scripts\/herdr_panes\.py/);
  assert.match(source, /Goal lifecycle and durable handoff/);
  assert.match(source, /\/goal pause`, `\/compress here 2`, inspect `\/context`, then `\/goal resume`/);
  assert.match(source, /Do not send these commands to `exec`/);
  assert.match(source, /automatically compresses.*50% by default/i);
  assert.match(source, /assistant response containing slash-command text does not execute/i);
  assert.match(source, /\/goal -- Continue <task name> from <handoff-record path>/);
  assert.match(source, /`Continue` is a `\/goal` control verb/);
  assert.match(source, /Do not use `\/loop` for this workflow/);
  assert.match(source, /cadence and does not maintain this completion contract/);
  assert.match(source, /\/compress here 2/);
  assert.match(source, /durable handoff record/i);
  assert.match(source, /Herdr prompt delivery/);
  assert.match(source, /herdr agent prompt <pane-id> "<text>"/);
  assert.match(source, /bracketed-paste mode/);
  assert.match(source, /herdr agent send-keys <pane-id> <key>\.\.\./);
  assert.match(source, /Do not use `send-keys` to type or submit normal task text/);
  assert.match(source, /\/new --yes <goal-name>/);
  assert.match(source, /`--yes` bypasses Hermes' reset confirmation/);
  assert.match(source, /send `\/busy queue` and confirm it before selecting the model/);
  assert.match(source, /accidental follow-up input queues instead of redirecting the role task/);
  assert.match(source, /### Explicit stop requests/);
  assert.match(source, /\/stop` stops Hermes background processes/);
  assert.match(source, /The CHG phase table is the only progress authority/);
  assert.match(source, /do not require a second questionnaire or create a parallel plan/);
  assert.match(source, /Herdr lifecycle monitoring/);
  assert.match(source, /herdr agent wait <pane-id> --until idle --until done --until blocked/);
  assert.match(source, /Do not install or depend on `herdr integration install hermes` for lifecycle monitoring/);
  assert.match(source, /resumable session ID for server-restart recovery/);
  assert.match(source, /Do not poll terminal text, diffs, or workspace state to decide that the executor has settled/);
  assert.match(helper, /herdr pane list/);
});

test("every SKILL.md carries name, description, and version in its frontmatter", async () => {
  const files = await skillFiles(skillsRoot);
  assert.ok(files.length >= 2, "expected at least two playbooks");
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const fields = frontmatterFields(source);
    assert.ok(fields, `${path.relative(root, file)} has no YAML frontmatter`);
    for (const field of ["name", "description", "version"]) {
      assert.ok(
        fields[field],
        `${path.relative(root, file)} frontmatter is missing ${field}`,
      );
    }
  }
});

test("every SKILL.md name matches its directory", async () => {
  const files = await skillFiles(skillsRoot);
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const fields = frontmatterFields(source);
    const directory = path.basename(path.dirname(file));
    assert.equal(
      fields?.name,
      directory,
      `${path.relative(root, file)} name '${fields?.name}' does not match its directory '${directory}'`,
    );
  }
});

test("skills/ packages a self-contained CAP/CHG phase workflow", async () => {
  const names = [
    "application-records",
    "phased-plan-design",
    "phased-plan-execution",
    "phased-plan-overview",
    "phased-plan-refactoring",
  ];
  const sources = new Map();
  for (const name of names) {
    const file = path.join(skillsRoot, "software-development", name, "SKILL.md");
    const source = await readFile(file, "utf8");
    sources.set(name, source);
    assert.doesNotMatch(source, /(?:~\/.hermes|\/home\/)/, `${name} depends on agent-private paths`);
  }

  const records = sources.get("application-records");
  const phaseSkills = [
    "phased-plan-design",
    "phased-plan-execution",
    "phased-plan-overview",
    "phased-plan-refactoring",
  ];
  for (const name of phaseSkills) {
    assert.match(records, new RegExp(`\\b${name}\\b`), `application-records does not route to ${name}`);
  }
  assert.match(sources.get("phased-plan-design"), /active CHG/i);
  assert.match(sources.get("phased-plan-execution"), /CHG phase table/i);
  assert.match(sources.get("phased-plan-overview"), /docs\/changes\/active/i);
  assert.match(sources.get("phased-plan-refactoring"), /one progress authority/i);
  const rootAgent = await readFile(path.join(root, "AGENTS.md"), "utf8");
  assert.match(rootAgent, /shared agent profile/);
});

test("skills package separate review storage and a visual handoff gate", async () => {
  const sources = {};
  for (const name of ["application-records", "capability-wireframes", "phased-plan-design", "phased-plan-execution"]) {
    sources[name] = await readFile(path.join(skillsRoot, "software-development", name, "SKILL.md"), "utf8");
  }
  for (const name of ["application-records", "capability-wireframes"]) {
    assert.match(sources[name], /docs\/changes\/reviews\/CHG-/);
    assert.match(sources[name], /review-only/);
    assert.match(sources[name], /README\.md/);
  }
  assert.match(sources["capability-wireframes"], /Primary surface/);
  assert.match(sources["capability-wireframes"], /existing CAP|existing capabilit/i);
  for (const name of ["phased-plan-design", "phased-plan-execution"]) {
    assert.match(sources[name], /visual handoff/i);
    assert.match(sources[name], /review package/i);
  }
});

test("git-commit-message requires confirmation except in explicit autonomous mode", async () => {
  const source = await readFile(
    path.join(skillsRoot, "software-development", "git-commit-message", "SKILL.md"),
    "utf8",
  );
  assert.match(source, /In normal operation, present a preview and stop/i);
  assert.match(source, /same turn/);
  assert.match(source, /In normal operation, apply uses the preview exactly/i);
  assert.match(source, /returns changes/);
  assert.match(source, /Outside\s+explicitly enabled autonomous mode, a preview is not permission to commit/i);
  assert.match(source, /explicitly enabled autonomous mode/);
  assert.match(source, /do not wait for a separate confirmation/);
  assert.match(source, /never infer it from an agent's name, identity, or[\s\S]*ability to act autonomously/);
  assert.doesNotMatch(source, /(?:~\/\.hermes|\/home\/)/);
});

test("no repository skill carries credential markers", async () => {
  const files = await skillFiles(skillsRoot);
  const doxFiles = [
    "AGENTS.md",
    "software-development/AGENTS.md",
  ];
  const all = [...files];
  for (const relative of doxFiles) {
    all.push(path.join(skillsRoot, relative));
  }
  for (const file of all) {
    const source = await readFile(file, "utf8");
    for (const pattern of credentialPatterns) {
      assert.ok(
        !pattern.test(source),
        `${path.relative(root, file)} contains a credential-shaped marker`,
      );
    }
  }
});
