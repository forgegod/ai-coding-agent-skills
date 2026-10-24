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
  const environment = await readFile(path.join(directory, "references", "environment-passthrough.md"), "utf8");
  assert.ok(source.length < 6500, "keep the normal orchestration path compact");
  assert.ok(transport.length < 6500, "transport reference must not accumulate duplicated procedures");
  assert.match(source, /references\/herdr\.md/);
  assert.match(source, /\/goal draft Execute only phase <phase-number> of <active-chg-path>/);
  assert.match(source, /automated role loop is Herdr-only/);
  assert.match(source, /Dispatch failed prerequisites to a fresh\s+implementer session/);
  assert.match(source, /orchestrator does not edit worker code/);
  assert.match(source, /orchestrator follows `phased-plan-closeout`/);
  assert.match(source, /executor\s+must not edit or commit the CHG path/);
  assert.match(source, /forced final reply cannot run checks, update the CHG, or resume itself/i);
  assert.match(source, /existing worktree/);
  assert.doesNotMatch(source, /durable handoff record|<handoff-record path>|scratch handoff/i);
  assert.doesNotMatch(source, /git .*merge|git .*commit|git .*worktree remove/);
  assert.match(source, /Use `\/goal`, not `\/loop`/);
  assert.match(source, /\/compress here 2/);
  for (const expected of [/clarify/, /pane ID/, /agent rename <pane-id> exec/,
    /agent's\s+`name`, not its display `label`/, /scripts\/herdr_panes\.py/,
    /herdr agent prompt <pane-id> "<text>"/, /\/new --yes <goal-name>/,
    /\/busy queue/, /\/model <configured-key>/,
    /herdr agent wait <pane-id> --until idle --until done --until blocked/,
    /not an immediate\s+foreground-turn interrupt/, /Do not install `herdr integration install hermes`/]) {
    assert.match(transport, expected);
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

test("skills/ packages a self-contained CAP/CHG phase workflow", async () => {
  const names = [
    "application-records",
    "phased-plan-design",
    "phased-plan-execution",
    "phased-plan-closeout",
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
    "phased-plan-closeout",
    "phased-plan-overview",
    "phased-plan-refactoring",
  ];
  for (const name of phaseSkills) {
    assert.match(records, new RegExp(`\\b${name}\\b`), `application-records does not route to ${name}`);
  }
  assert.match(sources.get("phased-plan-design"), /active CHG/i);
  assert.match(sources.get("phased-plan-execution"), /CHG phase table/i);
  for (const name of ["phased-plan-design", "phased-plan-execution", "phased-plan-overview", "phased-plan-refactoring"]) {
    const source = sources.get(name);
    assert.match(source, /phased-plan-closeout/);
    assert.match(source, /executor must not\s+edit or\s+commit the CHG path/i);
    assert.doesNotMatch(source, /reset that\s+path|follow its declared rebase|git .*merge --|git .*commit -/i);
  }
  assert.match(records, /does not change phase state, archive a CHG, or prescribe phase lifecycle/i);
  const overview = sources.get("phased-plan-overview");
  assert.match(overview, /docs\/changes\/active/i);
  assert.match(overview, /\/goal draft Execute only phase <phase-number> of <active-chg-path>/);
  assert.match(overview, /Stop after verified target completion and cleanup; do not push or start another phase/);
  assert.match(overview, /print exactly one\s+command and do not dispatch it/);
  assert.match(overview, /Historical evidence for earlier completed phases is allowed/);
  assert.match(overview, /Treat an `in-progress` target row as the reserved phase/);
  assert.match(overview, /committed or dirty\s+worktree CHG change/);
  assert.match(sources.get("phased-plan-refactoring"), /one progress authority/i);
  const closeout = await readFile(
    path.join(skillsRoot, "software-development", "phased-plan-closeout", "SKILL.md"),
    "utf8",
  );
  assert.match(closeout, /name: phased-plan-closeout/);
  assert.match(closeout, /argument-hint: "\[--reserve \| --commit-ff\]"/);
  assert.match(closeout, /orchestrator is the sole Git\/CHG writer/);
  assert.match(closeout, /identical reservation\/target\/worktree CHG blobs/);
  assert.match(closeout, /phase-guard\.mjs preflight/);
  assert.match(closeout, /phase-guard\.mjs row/);
  assert.match(closeout, /done \(<command> exit 0 @ <implementation-sha>\)/);
  assert.match(closeout, /references\/record-writes\.md/);
  const recordWrites = await readFile(path.join(skillsRoot, "software-development/phased-plan-closeout/references/record-writes.md"), "utf8");
  assert.match(recordWrites, /git-commit-message/);
  const commands = [...recordWrites.matchAll(/^[ \t]*```text\n([\s\S]*?)\n[ \t]*```/gm)].map((match) => match[1]).join("\n");
  assert.match(commands, /phase-guard\.mjs paths --repo <target> --base <base-sha> --allow-path <path>/);
  assert.match(commands, /phase-guard\.mjs paths --repo <target> --ref <record-sha> --base <base-sha> --expect-content <reviewed-content-digest> --allow-path <path>/);
  assert.match(recordWrites, /operator-approved recovery decision/);
  for (const name of ["phased-plan-design", "phased-plan-refactoring"]) {
    assert.match(sources.get(name), /references\/record-writes\.md/);
    assert.match(sources.get(name), /unwritten proposal/);
    assert.match(sources.get(name), /target-only/);
  }
  assert.match(closeout, /phase\/.*full-reservation-sha/);
  const recovery = await readFile(path.join(skillsRoot, "software-development/phased-plan-closeout/references/recovery.md"), "utf8");
  assert.match(closeout, /references\/recovery\.md/);
  assert.match(recovery, /phase-guard\.mjs locate/);
  assert.match(closeout, /git -C <target> merge --ff-only <reviewed-sha>/);
  assert.match(closeout, /git -C <target> worktree remove <worktree-path>/);
  const rootAgent = await readFile(path.join(root, "AGENTS.md"), "utf8");
  assert.match(rootAgent, /shared agent profile/);
  const workflowContract = await readFile(path.join(skillsRoot, "software-development", "AGENTS.md"), "utf8");
  assert.match(workflowContract, /single Git\/CHG writer/);
  const autonomousContract = await readFile(path.join(skillsRoot, "autonomous-ai-agents", "AGENTS.md"), "utf8");
  assert.match(autonomousContract, /`delegate_task` is research-only/i);
});

test("phase overview bounds discovery, recovery, and the final handoff", async () => {
  const source = await readFile(
    path.join(skillsRoot, "software-development/phased-plan-overview/SKILL.md"),
    "utf8",
  );
  assert.ok(source.length < 7000, "keep overview guidance bounded");
  assert.match(source, /## Scope and stopping rule/);
  assert.match(source, /Do not rerun implementation tests, lint, builds, or visual gates/);
  assert.match(source, /Do not scan archives or upstream assessments/);
  assert.match(source, /Do not search host directories or inspect Herdr\/Hermes source/);
  assert.match(source, /\$HERDR_ENV=1/);
  assert.match(source, /\$HERDR_WORKSPACE_ID/);
  assert.match(source, /single active CHG is unambiguous/);
  assert.match(source, /## Decision table/);
  assert.match(source, /No in-progress row; cleanup proved complete/);
  assert.match(source, /do not run it for an already removed worktree/);
  assert.match(source, /merged leftover branch ref alone is not outstanding cleanup/);
  assert.match(source, /Run the repository's record validator once/);
  assert.match(source, /Stop gathering evidence once/);
  assert.match(source, /## Final answer/);
  assert.match(source, /Do not repeat the full phase table/);
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
  assert.match(source, /phased-plan-closeout.*controls/s);
  assert.match(source, /Do not combine its record-only target commits with implementation/);
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
