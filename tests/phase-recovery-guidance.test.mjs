import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../skills/software-development/", import.meta.url);
const read = file => readFile(new URL(file, root), "utf8");
const guard = fileURLToPath(new URL("phased-plan-closeout/scripts/phase-guard.mjs", root));
const chg = "docs/changes/active/CHG-001-example.md";
const record = state => `# Example\n\n| # | Phase | Status | Verification gate |\n| --- | --- | --- | --- |\n| 1 | Implement | ${state} | node --test |\n| 2 | Integrate | pending | node --test |\n`;
const git = (repo, ...args) => execFileSync("git", ["-C", repo, ...args], {
  encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: os.devNull },
}).trim();

async function fixture(t) {
  const scratch = await mkdtemp(path.join(os.tmpdir(), "phase-recovery-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const target = path.join(scratch, "target");
  const worker = path.join(scratch, "worker");
  await mkdir(path.dirname(path.join(target, chg)), { recursive: true });
  git(target, "init", "-b", "main");
  git(target, "config", "user.name", "Fixture");
  git(target, "config", "user.email", "fixture@example.invalid");
  git(target, "config", "commit.gpgsign", "false");
  git(target, "config", "core.hooksPath", path.join(scratch, "no-hooks"));
  await writeFile(path.join(target, chg), record("pending"));
  git(target, "add", "--", chg);
  git(target, "commit", "-m", "Initial record");
  await writeFile(path.join(target, chg), record("in-progress"));
  git(target, "commit", "-am", "Reserve phase");
  const reservation = git(target, "rev-parse", "HEAD");
  const branch = `phase/CHG-001-example/1/${reservation}`;
  git(target, "worktree", "add", "-b", branch, worker, reservation);
  await writeFile(path.join(worker, "implementation.txt"), "Reviewed content.\n");
  git(worker, "add", "--", "implementation.txt");
  git(worker, "commit", "-m", "Implement phase");
  const implementation = git(worker, "rev-parse", "HEAD");
  git(target, "merge", "--ff-only", implementation);
  await writeFile(path.join(target, chg), record(`done (node --test exit 0 @ ${implementation})`));
  git(target, "commit", "-am", "Complete phase");
  return { target, worker, branch, reservation, implementation, completion: git(target, "rev-parse", "HEAD") };
}

function invoke(f, ...args) {
  const result = spawnSync(process.execPath, [guard, ...args, "--repo", f.target, "--chg", chg, "--phase", "1"], { encoding: "utf8" });
  assert.equal(result.signal, null);
  return { status: result.status, ...JSON.parse(result.stdout) };
}

// Execute the documented argv in real isolated repositories, not an imitation
// of Git ref matching. Only synthetic fixture identities replace placeholders.
async function recipe(f, fragment) {
  const source = await read("phased-plan-closeout/references/recovery.md");
  const line = source.split("\n").map(line => line.trim()).find(line => line.startsWith("git ") && line.includes(fragment));
  assert.ok(line, `Missing canonical recovery recipe: ${fragment}`);
  const replacements = {
    "<target>": f.target, "<CHG-filename-without-.md>": "CHG-001-example",
    "<number>": "1", "<reservation-sha>": f.reservation,
    "<implementation-sha>": f.implementation, "<target-head-sha>": f.completion,
  };
  const argv = line.split(" ").map(token => token.replace(/<[^>]+>/g, placeholder => {
    assert.ok(placeholder in replacements, `Unexpected placeholder ${placeholder}`);
    return replacements[placeholder];
  }));
  const result = spawnSync(argv[0], argv.slice(1), { encoding: "utf8" });
  assert.equal(result.signal, null);
  return { status: result.status, stdout: result.stdout.trim(), stderr: result.stderr };
}

test("recovery guidance chooses registered versus removed before locate", async () => {
  const text = (await read("phased-plan-closeout/references/recovery.md")).replace(/\s+/g, " ");
  assert.match(text, /Classify the phase lifecycle before choosing a command/);
  assert.match(text, /Registered worktree:[\s\S]*`locate`/);
  assert.match(text, /Already removed:[\s\S]*Do not run `locate`/);
  assert.match(text, /Missing exact ref[\s\S]*requires an operator handoff/);
  assert.doesNotMatch(text, /then `locate`\. Do not compare/);
});

test("guards keep immutable SHA arguments and classify caller mistakes separately", async () => {
  const text = (await read("phased-plan-closeout/references/recovery.md")).replace(/\s+/g, " ");
  assert.match(text, /full commit SHAs, never `HEAD`, branch names, or abbreviated SHAs/);
  assert.match(text, /invocation error, not evidence of corrupt history or missing ownership/);
});

test("selection and handoff outcomes are reported separately", async () => {
  for (const file of ["phased-plan-overview/SKILL.md", "phased-plan-next/SKILL.md"]) {
    const text = (await read(file)).replace(/\s+/g, " ");
    assert.match(text, /Report selection and (?:transport|handoff) separately/);
    assert.match(text, /does not invalidate (?:a verified|the) selection/);
  }
});

for (const registered of [true, false]) {
  test(`completed phase recipe proves exact nested branch with worktree ${registered ? "registered" : "removed"}`, async t => {
    const f = await fixture(t);
    if (!registered) git(f.target, "worktree", "remove", f.worker);
    const before = [git(f.target, "show-ref"), git(f.target, "status", "--porcelain"), git(f.target, "worktree", "list", "--porcelain")];
    const row = invoke(f, "row", "--ref", f.completion, "--expect", "done", "--evidence-commit", f.implementation);
    assert.equal(row.status, 0, JSON.stringify(row));
    const ref = await recipe(f, "show-ref --verify --hash");
    assert.equal(ref.status, 0, ref.stderr);
    assert.equal(ref.stdout, f.implementation);
    assert.equal((await recipe(f, "merge-base --is-ancestor")).status, 0);
    const inventory = await recipe(f, "worktree list --porcelain");
    assert.equal(inventory.status, 0, inventory.stderr);
    assert.equal(inventory.stdout.includes(`branch refs/heads/${f.branch}`), registered);
    if (registered) {
      const owner = invoke(f, "locate", "--reservation", f.reservation);
      assert.equal(owner.status, 0, JSON.stringify(owner));
      assert.equal(owner.worktree, f.worker);
    }
    assert.deepEqual([git(f.target, "show-ref"), git(f.target, "status", "--porcelain"), git(f.target, "worktree", "list", "--porcelain")], before);
  });
}

test("exact-ref recipe distinguishes absent ref from successful empty wildcard listing", async t => {
  const f = await fixture(t);
  git(f.target, "worktree", "remove", f.worker);
  // Reproduce the misleading query: Git succeeds, but * does not span /1/<sha>.
  assert.equal(git(f.target, "for-each-ref", "--format=%(refname)", "refs/heads/phase/CHG-001-example/*"), "");
  assert.equal((await recipe(f, "show-ref --verify --hash")).stdout, f.implementation);
  git(f.target, "branch", "-d", f.branch);
  const missing = await recipe(f, "show-ref --verify --hash");
  assert.notEqual(missing.status, 0);
  assert.equal(missing.stdout, "");
});

test("symbolic HEAD rejection is an invocation error, not failed completion evidence", async t => {
  const f = await fixture(t);
  const args = ["row", "--expect", "done", "--evidence-commit", f.implementation];
  const bad = invoke(f, ...args, "--ref", "HEAD");
  assert.equal(bad.status, 1);
  assert.equal(bad.error, "Expected a full commit SHA");
  assert.equal(invoke(f, ...args, "--ref", f.completion).status, 0);
});
