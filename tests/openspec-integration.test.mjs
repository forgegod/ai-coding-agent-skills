import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const guard = fileURLToPath(new URL("../skills/software-development/openspec-delivery/scripts/change-guard.mjs", import.meta.url));
const change = "fixture-change";
const changeRoot = `openspec/changes/${change}`;
const archived = `openspec/changes/archive/2026-10-29-${change}`;
const oneMiB = 1024 * 1024;
const env = { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: os.devNull };
const git = (cwd, ...args) => execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", env, stdio: ["ignore", "pipe", "pipe"] }).trim();
const commit = (repo, message) => { git(repo, "add", "--", "."); git(repo, "commit", "-m", message); return git(repo, "rev-parse", "HEAD"); };

test("OpenSpec package documents explicit authority, writer separation and read-only evidence limits", async () => {
  const packageRoot = path.dirname(path.dirname(guard));
  const skill = await readFile(path.join(packageRoot, "SKILL.md"), "utf8");
  const reference = await readFile(path.join(packageRoot, "references/guard.md"), "utf8");
  for (const pattern of [/explicitly selects/i, /never selects it/i, /operator-serialized/, /sole.*task.*writer/i, /at most two/, /planning-only/i, /not.*lock/i, /squash.*rebase/i, /post-merge/, /stock.*apply/i]) assert.match(skill, pattern);
  for (const pattern of [/candidate --repo/, /review --repo/, /receipt --repo/, /schemaVersion/, /planDigest/, /exitCode/, /does not authenticate/, /fences/, /append-only/]) assert.match(reference, pattern);
  for (const pattern of [/valid UTF-8/, /refs\/replace/, /grafts/, /fsmonitor/, /Every commit in `verified\.\.target`/, /--receipt-path/, /duplicate/i, /raw blob bytes/]) assert.match(reference, pattern);
  assert.doesNotMatch(skill, /adoption history|reviewer found|previously reported/i);
  assert.match(skill, /version: 1\.0\.2/);
  assert.doesNotMatch(skill, /\/home\/|~\/.hermes/);
});

async function fixture(t, options = {}) {
  const name = options.name ?? change;
  const changeRoot = `openspec/changes/${name}`;
  const scratch = await mkdtemp(path.join(os.tmpdir(), "openspec-guard-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const repo = path.join(scratch, "source");
  await mkdir(path.join(repo, changeRoot, "specs/example"), { recursive: true });
  git(repo, "init", "-b", "main", ...(options.objectFormat ? [`--object-format=${options.objectFormat}`] : []));
  git(repo, "config", "user.name", "Fixture");
  git(repo, "config", "user.email", "fixture@example.invalid");
  git(repo, "config", "commit.gpgsign", "false");
  git(repo, "config", "core.hooksPath", path.join(scratch, "no-hooks"));
  await writeFile(path.join(repo, "openspec/config.yaml"), "schema: spec-driven\n");
  await writeFile(path.join(repo, changeRoot, ".openspec.yaml"), "schema: spec-driven\n");
  await writeFile(path.join(repo, changeRoot, "proposal.md"), "# Scope\nOne bounded change.\n");
  await writeFile(path.join(repo, changeRoot, "tasks.md"), options.planTasks ?? "# Tasks\n- [ ] 1.1 Implement and test\n");
  await writeFile(path.join(repo, changeRoot, "specs/example/spec.md"), "## ADDED Requirements\nFixture behavior.\n");
  await writeFile(path.join(repo, "implementation.txt"), "baseline\n");
  const base = commit(repo, "Baseline and plan");
  git(repo, "switch", "-c", "change/fixture");
  await writeFile(path.join(repo, "implementation.txt"), "implemented\n");
  await writeFile(path.join(repo, changeRoot, "tasks.md"), options.headTasks ?? "# Tasks\n- [x] 1.1 Implement and test\n");
  const head = commit(repo, "Implement");
  return { scratch, repo, base, head, name };
}

function invoke(f, command = "candidate", extra = []) {
  const common = command === "receipt" ? ["--target", f.target ?? f.head] : ["--base", f.base, "--head", f.head, "--plan", f.plan ?? f.base];
  const identity = command === "candidate" ? [] : ["--issue", "https://github.com/example/project/issues/1"];
  const result = spawnSync(process.execPath, [guard, command, "--repo", f.repo, "--change", f.name ?? change, ...common, ...identity, ...extra], { encoding: "utf8", env: { ...env, ...f.env } });
  return { status: result.status, ...(result.stdout.trim() ? JSON.parse(result.stdout) : { error: result.stderr }) };
}

test("OpenSpec candidate binds committed planning and supports an independent clone without Git writes", async (t) => {
  const f = await fixture(t);
  const result = invoke(f);
  assert.equal(result.status, 0, result.error);
  assert.equal(result.head, f.head);
  assert.match(result.planDigest, /^[a-f0-9]{64}$/);
  const clone = path.join(f.scratch, "independent");
  git(f.scratch, "clone", "--no-local", f.repo, clone);
  const before = [git(clone, "rev-parse", "HEAD"), git(clone, "status", "--porcelain=v1"), await readFile(path.join(clone, ".git/index"))];
  const other = invoke({ ...f, repo: clone });
  assert.equal(other.status, 0, other.error);
  assert.equal(other.planDigest, result.planDigest);
  assert.equal(other.tree, result.tree);
  assert.deepEqual([git(clone, "rev-parse", "HEAD"), git(clone, "status", "--porcelain=v1"), await readFile(path.join(clone, ".git/index"))], before);
});

test("OpenSpec candidate rejects changed plans, dirty work, symbolic SHAs and missing objects", async (t) => {
  const f = await fixture(t);
  assert.match(invoke({ ...f, head: "HEAD" }).error, /full literal/);
  assert.notEqual(invoke({ ...f, head: "a".repeat(40) }).status, 0);
  assert.match(invoke({ ...f, name: "../escape" }).error, /literal/);
  await writeFile(path.join(f.repo, "untracked.txt"), "preserve\n");
  assert.match(invoke(f).error, /Dirty/);
  await rm(path.join(f.repo, "untracked.txt"));
  await writeFile(path.join(f.repo, changeRoot, "tasks.md"), "# Tasks\n- [x] 1.1 Different scope\n");
  f.head = commit(f.repo, "Alter the approved task");
  assert.match(invoke(f).error, /Planning content changed/);
});

test("OpenSpec guard binds a generated full name and rejects the short slug", async (t) => {
  const { generateName } = await import("../skills/software-development/openspec-delivery/scripts/change-name.mjs");
  const identity = generateName("add-dark-mode");
  const f = await fixture(t, { name: identity.name });
  git(f.repo, "branch", "-m", identity.branch);
  const before = [git(f.repo, "status", "--porcelain=v1"), await readFile(path.join(f.repo, ".git/index"))];
  const result = invoke(f);
  assert.equal(result.status, 0, result.error);
  assert.match(result.planDigest, /^[a-f0-9]{64}$/);
  assert.notEqual(invoke({ ...f, name: "add-dark-mode" }).status, 0);
  assert.deepEqual([git(f.repo, "status", "--porcelain=v1"), await readFile(path.join(f.repo, ".git/index"))], before);
});

test("OpenSpec plan digest preserves checkbox progress but not examples inside fences", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.repo, changeRoot, "tasks.md"), "# Tasks\n- [x] 1.1 Implement and test\n```md\n- [ ] example\n```\n");
  f.head = commit(f.repo, "Planning example");
  f.base = f.head;
  const before = invoke(f);
  assert.equal(before.status, 0, before.error);
  await writeFile(path.join(f.repo, changeRoot, "tasks.md"), "# Tasks\n- [x] 1.1 Implement and test\n```md\n- [x] example\n```\n");
  f.head = commit(f.repo, "Changed fenced definition");
  assert.match(invoke(f).error, /Planning content changed/);
});

test("identity frontmatter remains bound while task checkbox progress is allowed", async (t) => {
  const metadata = "---\nmetadata_version: 1\nartifact: tasks\nchange: fixture-change\n---\n";
  const f = await fixture(t, {
    planTasks: `${metadata}# Tasks\n- [ ] 1.1 Implement and test\n`,
    headTasks: `${metadata}# Tasks\n- [x] 1.1 Implement and test\n`,
  });
  const before = invoke(f);
  assert.equal(before.status, 0, before.error);
  const issueHeader = "---\nmetadata_version: 1\nartifact: proposal\nchange: fixture-change\ngithub_issue: https://github.com/example/project/issues/1\n---\n";
  await writeFile(path.join(f.repo, changeRoot, "proposal.md"), `${issueHeader}# Scope\nOne bounded change.\n`);
  f.head = commit(f.repo, "Bind issue before approval");
  f.plan = f.head;
  assert.equal(invoke(f).status, 0);
  await writeFile(path.join(f.repo, changeRoot, "proposal.md"), `${issueHeader.replace("issues/1", "issues/2")}# Scope\nOne bounded change.\n`);
  f.head = commit(f.repo, "Change issue after approval");
  assert.match(invoke(f).error, /Planning content changed/);
});

test("OpenSpec candidate refuses duplicate CLI options instead of taking the last value", async (t) => {
  const f = await fixture(t);
  const result = invoke(f, "candidate", ["--head", f.base]);
  assert.notEqual(result.status, 0);
  assert.match(result.error, /duplicate/i);
  assert.equal(invoke(f).status, 0);
});

test("OpenSpec candidate refuses Git replace refs and graft overrides", async (t) => {
  const replaced = await fixture(t);
  git(replaced.repo, "replace", replaced.base, replaced.head);
  const result = invoke(replaced);
  assert.notEqual(result.status, 0);
  assert.match(result.error, /replace refs?/i);

  const grafted = await fixture(t);
  git(grafted.repo, "checkout", "--orphan", "orphan-head");
  git(grafted.repo, "rm", "-r", "-q", "--cached", "--", ".");
  await writeFile(path.join(grafted.repo, "implementation.txt"), "implemented\n");
  await writeFile(path.join(grafted.repo, changeRoot, "tasks.md"), "# Tasks\n- [x] 1.1 Implement and test\n");
  const orphan = commit(grafted.repo, "Unrelated root");
  await mkdir(path.join(grafted.repo, ".git/info"), { recursive: true });
  await writeFile(path.join(grafted.repo, ".git/info/grafts"), `${orphan} ${grafted.base}\n`);
  grafted.head = orphan;
  const graftResult = invoke(grafted);
  assert.notEqual(graftResult.status, 0);
  assert.match(graftResult.error, /graft/i);

  const override = await fixture(t);
  const graftFile = path.join(override.scratch, "grafts");
  await writeFile(graftFile, `${override.head} ${override.base}\n`);
  const overrideResult = invoke({ ...override, env: { GIT_GRAFT_FILE: graftFile } });
  assert.notEqual(overrideResult.status, 0);
  assert.match(overrideResult.error, /graft|override/i);
});

test("OpenSpec planning bytes are hashed raw and must be valid UTF-8", async (t) => {
  for (const file of ["proposal.md", "tasks.md"]) {
    const f = await fixture(t);
    await writeFile(path.join(f.repo, changeRoot, file), Buffer.from([0x23, 0x20, 0x80, 0x0a]));
    f.head = commit(f.repo, `Invalid bytes in ${file}`);
    f.base = f.head;
    const invalid = invoke(f);
    assert.notEqual(invalid.status, 0, `${file} accepted invalid UTF-8`);
    assert.match(invalid.error, /UTF-8/);
  }
  const valid = await fixture(t);
  await writeFile(path.join(valid.repo, changeRoot, "proposal.md"), Buffer.from([0x23, 0x20, 0xc3, 0xa9, 0x0a]));
  valid.head = commit(valid.repo, "Accented scope");
  valid.base = valid.head;
  const accepted = invoke(valid);
  assert.equal(accepted.status, 0, accepted.error);
});

test("OpenSpec task parsing preserves UTF-8 BOM identity and counts a first-line task", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.repo, changeRoot, "tasks.md");
  const content = await readFile(file);
  await writeFile(file, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), content]));
  f.head = commit(f.repo, "Add a BOM after approval");
  const changed = invoke(f);
  assert.notEqual(changed.status, 0, "Adding a BOM must change the approved digest");
  assert.match(changed.error, /Planning content changed/);
  const tasks = "\ufeff- [ ] 1.1 Pending first task\n- [x] 1.2 Finished second task\n";
  const pending = await fixture(t, { planTasks: tasks, headTasks: tasks });
  const result = invoke(pending);
  assert.equal(result.status, 0, result.error);
  assert.equal(result.tasksComplete, false);
});

test("OpenSpec task grammar counts every canonical list form and rejects ambiguous task-like lines", async (t) => {
  for (const pending of ["+ [ ] 1.2 Later", "* [ ] 1.2 Later", "1. [ ] 1.2 Later", "1) [ ] 1.2 Later", "> - [ ] 1.2 Later", "  - [ ] 1.2 Later", "- [ ]"]) {
    const f = await fixture(t, { planTasks: `# Tasks\n- [ ] 1.1 First\n${pending}\n`, headTasks: `# Tasks\n- [x] 1.1 First\n${pending}\n` });
    const result = invoke(f);
    assert.equal(result.status, 0, `${pending}: ${result.error}`);
    assert.equal(result.tasksComplete, false, `pending task ignored: ${pending}`);
  }
  for (const [line, pattern] of [["- [ ]no-space", /whitespace after/], ["- [!] 1.2 Later", /checkbox state/], ["- [x ] 1.2 Later", /checkbox state/], ["- [xx] 1.2 Later", /checkbox state/], ["- [?!] 1.2 Later", /checkbox state/], ["    - [ ] 1.2 Later", /indented/i], ["\t- [ ] 1.2 Later", /indented/i]]) {
    const f = await fixture(t, { planTasks: `# Tasks\n- [ ] 1.1 First\n${line}\n`, headTasks: `# Tasks\n- [x] 1.1 First\n${line}\n` });
    const result = invoke(f);
    assert.notEqual(result.status, 0, `ambiguous task accepted: ${line}`);
    assert.match(result.error, pattern, line);
  }
});

test("OpenSpec task files ignore fenced, indented and commented examples but reject unclosed state", async (t) => {
  for (const [label, example] of [
    ["comment", "<!--\n- [ ] hidden example\n-->\n"],
    ["nested fence", "````md\n```md\n- [ ] hidden example\n```\n- [x] nested example\n````\n"],
    ["tilde fence", "~~~\n- [ ] hidden example\n~~~\n"],
  ]) {
    const body = `# Tasks\n- [x] 1.1 First\n${example}`;
    const f = await fixture(t, { planTasks: body, headTasks: body });
    const result = invoke(f);
    assert.equal(result.status, 0, `${label}: ${result.error}`);
    assert.equal(result.tasksComplete, true, `${label} counted an example as a task`);
  }
  for (const [label, body, pattern] of [
    ["unclosed comment", "# Tasks\n- [x] 1.1 First\n<!--\n- [ ] hidden\n", /unclosed .*comment/i],
    ["unclosed fence", "# Tasks\n- [x] 1.1 First\n```\n- [ ] hidden\n", /unclosed .*fence/i],
    ["empty tasks", "# Tasks\nNothing to do.\n", /at least one real/i],
  ]) {
    const f = await fixture(t, { planTasks: body, headTasks: body });
    assert.match(invoke(f).error, pattern, label);
  }
});

test("OpenSpec planning requires regular non-symlink inputs, object formats and exact optional digests", async (t) => {
  const missing = await fixture(t);
  await rm(path.join(missing.repo, "openspec/config.yaml"));
  missing.head = commit(missing.repo, "Remove project config");
  missing.base = missing.head;
  assert.match(invoke(missing).error, /Missing planning file/);

  const linked = await fixture(t);
  await rm(path.join(linked.repo, changeRoot, "proposal.md"));
  await symlink("tasks.md", path.join(linked.repo, changeRoot, "proposal.md"));
  linked.head = commit(linked.repo, "Symlink planning input");
  linked.base = linked.head;
  assert.match(invoke(linked).error, /regular files/);

  const f = await fixture(t);
  assert.match(invoke(f, "candidate", ["--expect-plan", "0".repeat(64)]).error, /Approved plan digest mismatch/);

  const orphan = await fixture(t);
  git(orphan.repo, "checkout", "--orphan", "unrelated");
  git(orphan.repo, "rm", "-r", "-q", "--cached", "--", ".");
  await writeFile(path.join(orphan.repo, "unrelated.txt"), "root\n");
  const unrelated = commit(orphan.repo, "Unrelated root");
  assert.match(invoke({ ...orphan, base: unrelated }).error, /ancestry/);
});

test("OpenSpec candidate supports Git SHA-256 repositories", async (t) => {
  const f = await fixture(t, { objectFormat: "sha256" });
  assert.match(f.head, /^[a-f0-9]{64}$/);
  const result = invoke(f);
  assert.equal(result.status, 0, result.error);
  assert.match(result.planDigest, /^[a-f0-9]{64}$/);
});

function reviewFor(f, snapshot) {
  return { schemaVersion: 1, change,
    issueUrl: "https://github.com/example/project/issues/1", head: f.head,
    planDigest: snapshot.planDigest, verdict: "pass", findings: [],
    reviewer: "independent-fixture", reference: "https://example.invalid/review/1",
    gates: [{ command: "fixture-test", commit: f.head, exitCode: 0, evidence: "https://example.invalid/run/1" }] };
}

test("OpenSpec review binds exact candidate, plan and successful gate evidence", async (t) => {
  const f = await fixture(t);
  const snapshot = invoke(f);
  const file = path.join(f.scratch, "review.json");
  const review = reviewFor(f, snapshot);
  await writeFile(file, JSON.stringify(review));
  assert.equal(invoke(f, "review", ["--review", file]).status, 0);
  for (const mutate of [
    (r) => { r.head = f.base; },
    (r) => { r.planDigest = "0".repeat(64); },
    (r) => { r.findings = [{ severity: "high", message: "unresolved" }]; },
    (r) => { r.gates[0].exitCode = 1; },
    (r) => { r.gates[0].commit = f.base; },
    (r) => { r.change = "other-change"; },
    (r) => { r.issueUrl = "https://github.com/example/project/pull/1"; },
    (r) => { r.issueUrl = "https://github.com/other/project/issues/1"; },
    (r) => { r.gates = []; },
    (r) => { r.reference = ""; },
    (r) => { r.schemaVersion = 2; },
  ]) {
    const invalid = structuredClone(review);
    mutate(invalid);
    await writeFile(file, JSON.stringify(invalid));
    const result = invoke(f, "review", ["--review", file]);
    assert.notEqual(result.status, 0, JSON.stringify(invalid));
  }
});

async function integrated(t, options = {}) {
  const f = await fixture(t, options);
  const snapshot = invoke(f);
  git(f.repo, "switch", "main");
  git(f.repo, "merge", "--no-ff", "change/fixture", "-m", "Integrate candidate");
  f.target = git(f.repo, "rev-parse", "HEAD");
  const receipt = { schemaVersion: 1, change,
    issueUrl: "https://github.com/example/project/issues/1", base: f.base, head: f.head,
    plan: f.base, planDigest: snapshot.planDigest, integrated: f.target, verified: f.target,
    integrationReference: "https://github.com/example/project/pull/2", review: reviewFor(f, snapshot),
    gates: [{ command: "fixture-integration-test", commit: f.target, exitCode: 0, evidence: "https://example.invalid/integrated-run/1" }] };
  const file = path.join(f.scratch, "receipt.json");
  await writeFile(file, JSON.stringify(receipt));
  return { ...f, receipt, file, archived };
}

test("OpenSpec receipt requires real integration ancestry and exact successful target evidence", async (t) => {
  const f = await integrated(t);
  const result = invoke(f, "receipt", ["--receipt", f.file]);
  assert.equal(result.status, 0, result.error);
  assert.match(result.receiptSha256, /^[a-f0-9]{64}$/);
  for (const mutate of [
    (r) => { r.gates[0].exitCode = 1; },
    (r) => { r.gates[0].commit = f.head; },
    (r) => { r.verified = f.base; },
    (r) => { r.integrated = f.base; },
    (r) => { r.head = f.base; },
    (r) => { r.review.verdict = "fail"; },
    (r) => { r.integrationReference = ""; },
  ]) {
    const invalid = structuredClone(f.receipt);
    mutate(invalid);
    await writeFile(f.file, JSON.stringify(invalid));
    assert.notEqual(invoke(f, "receipt", ["--receipt", f.file]).status, 0, JSON.stringify(invalid));
  }
});

test("receipt accepts an exact clean detached verification worktree but candidates still need a branch", async (t) => {
  const f = await integrated(t);
  const verification = path.join(f.scratch, "verification");
  git(f.repo, "worktree", "add", "--detach", verification, f.target);
  const detached = { ...f, repo: verification };
  const result = invoke(detached, "receipt", ["--receipt", f.file]);
  assert.equal(result.status, 0, result.error);
  await writeFile(path.join(verification, "unfinished.txt"), "preserve\n");
  assert.match(invoke(detached, "receipt", ["--receipt", f.file]).error, /Dirty/);
  await rm(path.join(verification, "unfinished.txt"));
  git(verification, "checkout", "--detach", f.head);
  assert.match(invoke(detached, "receipt", ["--receipt", f.file]).error, /HEAD changed/);
  assert.notEqual(invoke(detached).status, 0, "Candidate validation must still reject detached HEAD");
});

test("OpenSpec receipt refuses evidence that is not one regular bounded JSON object", async (t) => {
  const f = await integrated(t);
  const candidates = [
    ["malformed", "{", /JSON/],
    ["array", "[]", /schema/],
    ["empty", "", /JSON/],
    ["unsupported", JSON.stringify({ ...f.receipt, schemaVersion: 2 }), /schema/],
    ["oversize", JSON.stringify({ ...f.receipt, padding: "x".repeat(oneMiB) }), /regular bounded/],
  ];
  for (const [label, content, pattern] of candidates) {
    const file = path.join(f.scratch, `${label}.json`);
    await writeFile(file, content);
    const result = invoke(f, "receipt", ["--receipt", file]);
    assert.notEqual(result.status, 0, label);
    assert.match(result.error, pattern, label);
  }
  const link = path.join(f.scratch, "link.json");
  await symlink(f.file, link);
  assert.match(invoke(f, "receipt", ["--receipt", link]).error, /regular bounded/);
  const directory = path.join(f.scratch, "directory.json");
  await mkdir(directory);
  assert.match(invoke(f, "receipt", ["--receipt", directory]).error, /regular bounded/);
});

test("OpenSpec receipt permits exact archival plus new evidence, never unverified product changes", async (t) => {
  const f = await integrated(t);
  await mkdir(path.join(f.repo, "openspec/changes/archive"), { recursive: true });
  await rename(path.join(f.repo, changeRoot), path.join(f.repo, archived));
  await mkdir(path.join(f.repo, archived, "evidence"));
  await writeFile(path.join(f.repo, archived, "evidence/receipt.json"), JSON.stringify(f.receipt));
  f.target = commit(f.repo, "Archive with actual fixture evidence");
  let result = invoke(f, "receipt", ["--receipt", f.file]);
  assert.equal(result.status, 0, result.error);
  await writeFile(path.join(f.repo, "implementation.txt"), "changed after verification\n");
  f.target = commit(f.repo, "Unverified product change");
  result = invoke(f, "receipt", ["--receipt", f.file]);
  assert.match(result.error, /Unverified target content/);
});

test("OpenSpec receipt refuses archive rewrites and evidence-prefix lookalikes", async (t) => {
  const f = await integrated(t);
  await mkdir(path.join(f.repo, changeRoot, "evidence-other"));
  await writeFile(path.join(f.repo, changeRoot, "evidence-other/bypass.md"), "not evidence\n");
  f.target = commit(f.repo, "Not an allowed evidence path");
  assert.match(invoke(f, "receipt", ["--receipt", f.file]).error, /Unverified target content/);
});

test("OpenSpec receipt refuses both a second archive and an active copy beside the archive", async (t) => {
  const duplicate = await integrated(t);
  await mkdir(path.join(duplicate.repo, "openspec/changes/archive"), { recursive: true });
  for (const day of ["2026-10-28", "2026-10-29"]) {
    await cp(path.join(duplicate.repo, changeRoot), path.join(duplicate.repo, `openspec/changes/archive/${day}-${change}`), { recursive: true });
  }
  duplicate.target = commit(duplicate.repo, "Two archives");
  assert.match(invoke(duplicate, "receipt", ["--receipt", duplicate.file]).error, /Duplicate canonical change archives/);

  const both = await integrated(t);
  await mkdir(path.join(both.repo, "openspec/changes/archive"), { recursive: true });
  await cp(path.join(both.repo, changeRoot), path.join(both.repo, archived), { recursive: true });
  both.target = commit(both.repo, "Active and archived");
  assert.match(invoke(both, "receipt", ["--receipt", both.file]).error, /Both active and archived/);
});

test("OpenSpec receipt enforces append-only evidence across every closure commit", async (t) => {
  const f = await integrated(t);
  await mkdir(path.join(f.repo, "openspec/changes/archive"), { recursive: true });
  await rename(path.join(f.repo, changeRoot), path.join(f.repo, archived));
  await mkdir(path.join(f.repo, archived, "evidence"));
  const published = path.join(f.repo, archived, "evidence/receipt.json");
  await writeFile(published, JSON.stringify(f.receipt));
  commit(f.repo, "Archive and publish evidence");
  await writeFile(published, JSON.stringify({ ...f.receipt, rewritten: true }));
  f.target = commit(f.repo, "Rewrite published evidence");
  const result = invoke(f, "receipt", ["--receipt", f.file]);
  assert.notEqual(result.status, 0);
  assert.match(result.error, /Unverified target content/);
});

test("OpenSpec receipt binds published bytes when an in-tree receipt path is given", async (t) => {
  const f = await integrated(t);
  await mkdir(path.join(f.repo, "openspec/changes/archive"), { recursive: true });
  await rename(path.join(f.repo, changeRoot), path.join(f.repo, archived));
  await mkdir(path.join(f.repo, archived, "evidence"));
  const published = path.join(f.repo, archived, "evidence/receipt.json");
  const bytes = await readFile(f.file, "utf8");
  await writeFile(published, bytes);
  f.target = commit(f.repo, "Archive with published receipt");
  const receiptPath = `${archived}/evidence/receipt.json`;
  const result = invoke(f, "receipt", ["--receipt", f.file, "--receipt-path", receiptPath]);
  assert.equal(result.status, 0, result.error);

  await writeFile(published, JSON.stringify({ ...f.receipt, reviewer: "someone else" }));
  git(f.repo, "add", "--", ".");
  git(f.repo, "commit", "--amend", "-m", "Archive with a different published receipt");
  f.target = git(f.repo, "rev-parse", "HEAD");
  assert.match(invoke(f, "receipt", ["--receipt", f.file, "--receipt-path", receiptPath]).error, /Published receipt bytes/);

  for (const invalid of ["../receipt.json", `${archived}/proposal.md`, `${archived}/evidence/receipt.json/../../proposal.md`]) {
    const rejected = invoke(f, "receipt", ["--receipt", f.file, "--receipt-path", invalid]);
    assert.notEqual(rejected.status, 0, invalid);
    assert.match(rejected.error, /receipt path/i, invalid);
  }
});

test("OpenSpec receipt rejects a closure history too large to inspect", async (t) => {
  const f = await integrated(t);
  await mkdir(path.join(f.repo, "openspec/changes/archive"), { recursive: true });
  await rename(path.join(f.repo, changeRoot), path.join(f.repo, archived));
  await mkdir(path.join(f.repo, archived, "evidence"));
  for (let index = 0; index < 3; index += 1) {
    await writeFile(path.join(f.repo, archived, `evidence/run-${index}.log`), `run ${index}\n`);
    f.target = commit(f.repo, `Evidence ${index}`);
  }
  const result = invoke(f, "receipt", ["--receipt", f.file, "--max-closure-commits", "2"]);
  assert.notEqual(result.status, 0);
  assert.match(result.error, /closure history/i);
});

test("OpenSpec receipt refuses plans changed on the integrated branch after candidate review", async (t) => {
  const f = await integrated(t);
  await writeFile(path.join(f.repo, changeRoot, "proposal.md"), "# Replaced scope\nDifferent approval required.\n");
  f.target = commit(f.repo, "Change plan after candidate review");
  f.receipt.integrated = f.target;
  f.receipt.verified = f.target;
  f.receipt.gates[0].commit = f.target;
  await writeFile(f.file, JSON.stringify(f.receipt));
  const result = invoke(f, "receipt", ["--receipt", f.file]);
  assert.notEqual(result.status, 0);
  assert.match(result.error, /Integrated planning content changed/);
});

test("OpenSpec receipt refuses completion while implementation tasks are still open", async (t) => {
  const tasks = "# Tasks\n- [ ] 1.1 Implement and test\n";
  const f = await integrated(t, { planTasks: tasks, headTasks: tasks });
  const result = invoke(f, "receipt", ["--receipt", f.file]);
  assert.notEqual(result.status, 0);
  assert.match(result.error, /Incomplete implementation tasks/);
});

test("OpenSpec candidate checks the requested repository, not inherited Git topology overrides", async (t) => {
  const f = await fixture(t);
  const clone = path.join(f.scratch, "other-repository");
  git(f.scratch, "clone", "--no-local", f.repo, clone);
  await writeFile(path.join(f.repo, "preserve-untracked.txt"), "dirty requested checkout\n");
  const result = invoke({ ...f, env: { GIT_DIR: path.join(clone, ".git"), GIT_WORK_TREE: clone } });
  assert.notEqual(result.status, 0);
});

test("OpenSpec freshness inspection never executes repository fsmonitor configuration", { skip: process.platform === "win32" }, async (t) => {
  const f = await fixture(t);
  const marker = path.join(f.scratch, "fsmonitor-ran");
  const hook = path.join(f.scratch, "fsmonitor.sh");
  await writeFile(hook, `#!/bin/sh\necho ran >> "${marker}"\necho ""\n`);
  await chmod(hook, 0o755);
  git(f.repo, "config", "core.fsmonitor", hook);
  const result = invoke(f);
  assert.equal(result.status, 0, result.error);
  await assert.rejects(readFile(marker), /ENOENT/);
});
