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
  const transport = await readFile(path.join(directory, "references", "herdr.md"), "utf8");
  const lifecycle = await readFile(path.join(directory, "references", "lifecycle-watch.md"), "utf8");
  const environment = await readFile(path.join(directory, "references", "environment-passthrough.md"), "utf8");
  assert.ok(source.length < 6500, "keep the normal orchestration path compact");
  assert.ok(transport.length < 6500, "transport reference must not accumulate duplicated procedures");
  assert.match(source, /references\/herdr\.md/);
  assert.match(source, /\/goal draft \/openspec-delivery <name>/);
  assert.match(source, /automated role loop is Herdr-only/);
  assert.match(source, /Dispatch failed prerequisites to a fresh\s+implementer session/);
  assert.match(source, /orchestrator does not edit worker code/);
  assert.match(source, /openspec-delivery/);
  assert.match(source, /must not edit `tasks\.md`/);
  assert.match(source, /Iteration budget exhausted/);
  assert.match(source, /orchestrator.*alone decides/i);
  assert.match(source, /--resume-from/);
  assert.match(source, /existing checkout/);
  assert.doesNotMatch(source, /durable handoff record|<handoff-record path>|scratch handoff/i);
  assert.doesNotMatch(source, /git .*merge|git .*commit|git .*worktree remove/);
  assert.match(source, /Use `\/goal`, not `\/loop`/);
  assert.match(source, /\/compress here 2/);
  for (const expected of [/clarify/, /pane ID/, /agent rename <pane-id> exec/,
    /agent's\s+`name`, not its display `label`/, /scripts\/herdr_panes\.py/,
    /herdr agent prompt <pane-id> "<text>"/, /\/new --yes <goal-name>/,
    /\/busy queue/, /\/model <configured-key>/,
    /lifecycle-watch\.md/,
    /not an immediate\s+foreground-turn interrupt/, /Do not install `herdr integration install hermes`/]) {
    assert.match(transport, expected);
  }
  assert.match(transport, /\/model <configured-key>`[\s\S]*then `\/status`[\s\S]*Agent Running/);
  assert.match(transport, /A missing card, mismatched model or rejection stops the role/);
  assert.match(lifecycle, /`\/status` readback belongs to herdr\.md step 4, before arming/);
  assert.match(lifecycle, /Never inject a status request while watching/);
  for (const expected of [/herdr_lifecycle_watch\.mjs/, /never runs `agent prompt`/,
    /inconclusive_fast/, /--resume-from/, /no lifecycle deadline/, /state_change_seq/, /completion_seq/]) {
    assert.match(lifecycle, expected);
  }
  assert.match(helper, /herdr pane list/);
  assert.match(environment, /terminal\.env_passthrough/);
  assert.match(environment, /HERDR_ENV/);
  assert.match(environment, /HERDR_WORKSPACE_ID/);
  assert.match(environment, /does not create\s+variables missing from the Hermes process/);
  assert.match(environment, /Do not pass through `HERMES_HOME`/);
  assert.match(environment, /no wildcard/);
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
    const ceiling = fields.name === "capability-wireframes" ? 1024 : 60;
    assert.ok(fields.description.length <= ceiling, `${path.relative(root, file)} description exceeds ${ceiling} characters`);
    assert.ok(
      fields.description.endsWith("."),
      `${path.relative(root, file)} description must end with a period`,
    );
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

test("skills/ packages the OpenSpec companion set without a second phase tracker", async () => {
  const names = ["openspec-delivery", "openspec-next", "git-commit-message", "capability-wireframes"];
  for (const name of names) {
    const source = await readFile(path.join(skillsRoot, "software-development", name, "SKILL.md"), "utf8");
    assert.doesNotMatch(source, /(?:~\/\.hermes|\/home\/)/, `${name} depends on agent-private paths`);
    assert.doesNotMatch(source, /phased-plan-|application-records/);
  }
  const integration = await readFile(path.join(skillsRoot, "software-development/openspec-delivery/SKILL.md"), "utf8");
  assert.match(integration, /tasks\.md/);
  assert.match(integration, /documentation and review records|documentation or review/i);
  const rootAgent = await readFile(path.join(root, "AGENTS.md"), "utf8");
  assert.match(rootAgent, /shared agent profile/);
  const workflowContract = await readFile(path.join(skillsRoot, "software-development", "AGENTS.md"), "utf8");
  assert.match(workflowContract, /tasks\.md/);
  const autonomousContract = await readFile(path.join(skillsRoot, "autonomous-ai-agents", "AGENTS.md"), "utf8");
  assert.match(autonomousContract, /`delegate_task` is research-only/i);
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
  assert.match(source, /openspec-delivery/);
  assert.match(source, /Do not combine a documentation or evidence batch with implementation/);
  assert.doesNotMatch(source, /phased-plan-closeout/);
  assert.match(source, /Repository commit-message rules override/);
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
