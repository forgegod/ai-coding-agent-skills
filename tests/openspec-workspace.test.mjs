import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const helper = fileURLToPath(new URL("../skills/software-development/openspec-delivery/scripts/change-workspace.mjs", import.meta.url));

test("workspace inventory normalizes Git for Windows worktree paths", async () => {
  const { normalizeWorktreePath } = await import("../skills/software-development/openspec-delivery/scripts/change-workspace.mjs");
  assert.equal(normalizeWorktreePath("C:/work/repo--example", "win32"), "C:\\work\\repo--example");
  assert.equal(normalizeWorktreePath("/work/repo--example", "linux"), "/work/repo--example");
});

test("workspace numeric C0/DEL predicate is equivalent over every UTF-16 code unit and Unicode paths", async () => {
  const { hasControlCharacter } = await import("../skills/software-development/openspec-delivery/scripts/change-workspace.mjs");
  assert.equal(typeof hasControlCharacter, "function");
  const original = /[\x00-\x1f\x7f]/;
  for (let code = 0; code <= 0xffff; code += 1) {
    const character = String.fromCharCode(code);
    assert.equal(hasControlCharacter(character), original.test(character), `code unit ${code}`);
    assert.equal(hasControlCharacter(`/workspace/é/😀/${character}/end`), original.test(character), `embedded code unit ${code}`);
  }
  for (const value of ["", "/workspace/東京/😀", "C:\\work\\café", "/space here/文件", "/before\n/after", "/a\u007fb", "/a\u0080b", "/a\ud800b", "/a\udc00b"]) {
    assert.equal(hasControlCharacter(value), original.test(value), JSON.stringify(value));
  }
});
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
const git = (repo, ...args) => run("git", ["-C", repo, ...args]);
function invoke(f, command, extra = [], env = {}) {
  const result = spawnSync(process.execPath, [helper, command, "--repo", f.repo, "--change", "example", "--base", f.base, ...extra], { encoding: "utf8", env: { ...process.env, ...env } });
  let value;
  try { value = JSON.parse(result.stdout); } catch { value = { error: result.stderr }; }
  return { status: result.status, ...value };
}
async function fixture(t) {
  // macOS /var and /tmp are symlink aliases. The helper rejects a non-canonical parent.
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), "openspec-workspace-")));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repo = path.join(root, "repo");
  await mkdir(repo);
  run("git", ["init", "-b", "main", repo]);
  git(repo, "config", "user.name", "Fixture");
  git(repo, "config", "user.email", "fixture@example.invalid");
  await writeFile(path.join(repo, "source.txt"), "original\n");
  git(repo, "add", "source.txt");
  git(repo, "commit", "-m", "base");
  return { root, repo, base: git(repo, "rev-parse", "HEAD"), workspace: path.join(root, "repo--example") };
}
function executePreview(preview) {
  assert.equal(preview.status, 0, preview.error);
  assert.equal(preview.argv[0], "git");
  run(preview.argv[0], preview.argv.slice(1));
}

test("prepare previews creation without writes, locates the result and reuses it without another branch", async (t) => {
  const f = await fixture(t);
  const before = git(f.repo, "worktree", "list", "--porcelain");
  const preview = invoke(f, "prepare");
  assert.equal(preview.status, 0, preview.error);
  assert.equal(preview.action, "create");
  assert.equal(preview.workspace, f.workspace);
  assert.equal(preview.branch, "change/example");
  assert.deepEqual(preview.argv, ["git", "-C", f.repo, "worktree", "add", "-b", "change/example", "--", f.workspace, f.base]);
  assert.equal(git(f.repo, "worktree", "list", "--porcelain"), before);
  executePreview(preview);
  const located = invoke(f, "locate");
  assert.equal(located.status, 0, located.error);
  assert.equal(located.head, f.base);
  assert.equal(located.dirty, false);
  const reused = invoke(f, "prepare");
  assert.equal(reused.action, "reuse");
  assert.equal(reused.argv, undefined);
  await writeFile(path.join(f.workspace, "unfinished.txt"), "retain me");
  const resumed = invoke(f, "prepare");
  assert.equal(resumed.status, 0, resumed.error);
  assert.equal(resumed.dirty, true, "Existing work is reported, not repaired or discarded");
  assert.equal(await readFile(path.join(f.workspace, "unfinished.txt"), "utf8"), "retain me");
});

test("synthetic owner-plan and incomplete-bootstrap procedure does not promote setup to implementation", async (t) => {
  const f = await fixture(t);
  const laggingTarget = f.base;
  executePreview(invoke(f, "prepare"));
  const planFile = "openspec/changes/example/proposal.md";
  await mkdir(path.dirname(path.join(f.workspace, planFile)), { recursive: true });
  await writeFile(path.join(f.workspace, planFile), "# Synthetic owner-only plan\n");
  git(f.workspace, "add", "--", planFile);
  git(f.workspace, "commit", "-m", "Synthetic owner plan");
  const ownerPlan = git(f.workspace, "rev-parse", "HEAD");
  assert.notEqual(ownerPlan, laggingTarget);
  assert.equal(git(f.repo, "ls-tree", "--name-only", laggingTarget, "--", planFile), "");
  assert.equal(git(f.workspace, "ls-tree", "--name-only", ownerPlan, "--", planFile), planFile);
  assert.equal(git(f.workspace, "merge-base", ownerPlan, "HEAD"), ownerPlan);
  await writeFile(path.join(f.workspace, "incomplete-bootstrap.txt"), "synthetic setup residue; not implementation\n");
  const resumed = invoke(f, "prepare");
  assert.equal(resumed.status, 0, resumed.error);
  assert.equal(resumed.action, "reuse");
  assert.equal(resumed.dirty, true);
  assert.equal(git(f.workspace, "rev-parse", "HEAD"), ownerPlan);
  assert.equal(await readFile(path.join(f.workspace, "source.txt"), "utf8"), "original\n");
  assert.equal(await readFile(path.join(f.workspace, "incomplete-bootstrap.txt"), "utf8"), "synthetic setup residue; not implementation\n");
  // Policy/textual assertions, not workspace-helper approval/authority enforcement.
  const guidance = await readFile(new URL("../skills/software-development/openspec-delivery/references/workspace.md", import.meta.url), "utf8");
  for (const pattern of [/owning branch can contain the committed plan while a lagging\s+target does not/, /absence\s+from that target is not plan absence/, /Incomplete authorized bootstrap remains bootstrap, not accepted\s+implementation/, /Preserve its residue/, /rather\s+than treating setup authority as implementation authority/, /Covered plan drift\s+refuses continuation until separately approved recovery/, /grants neither approval nor commit authority/, /resets neither restrictions nor the correction\/re-review budget/]) assert.match(guidance, pattern);
});

test("prepare refuses dirty sources, branch and destination collisions, nested paths and stale bases", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.repo, "unowned.txt"), "retain");
  assert.match(invoke(f, "prepare").error, /clean/i);
  await rm(path.join(f.repo, "unowned.txt"));
  await mkdir(f.workspace);
  assert.match(invoke(f, "prepare").error, /exists|collision/i);
  await rm(f.workspace, { recursive: true });
  assert.match(invoke(f, "prepare", ["--workspace", path.join(f.repo, "nested")]).error, /inside|overlap/i);
  git(f.repo, "branch", "change/example");
  assert.match(invoke(f, "prepare").error, /branch.*exists|unregistered/i);
  git(f.repo, "branch", "-d", "change/example");
  await writeFile(path.join(f.repo, "source.txt"), "new\n");
  git(f.repo, "commit", "-am", "advance");
  assert.match(invoke(f, "prepare").error, /base|HEAD/i);
});

test("retire requires exact clean head reachable from verified closure and never deletes refs", async (t) => {
  const f = await fixture(t);
  executePreview(invoke(f, "prepare"));
  await writeFile(path.join(f.workspace, "source.txt"), "implemented\n");
  git(f.workspace, "commit", "-am", "implementation");
  const candidate = git(f.workspace, "rev-parse", "HEAD");
  const args = ["--head", candidate, "--target", f.base];
  assert.match(invoke(f, "retire", args).error, /ancestor|reachable/i);
  git(f.repo, "merge", "--ff-only", candidate);
  assert.match(invoke(f, "retire", ["--head", f.base, "--target", candidate]).error, /head/i);
  await writeFile(path.join(f.workspace, "untracked.txt"), "retain");
  assert.match(invoke(f, "retire", ["--head", candidate, "--target", candidate]).error, /clean/i);
  await rm(path.join(f.workspace, "untracked.txt"));
  const preview = invoke(f, "retire", ["--head", candidate, "--target", candidate]);
  assert.deepEqual(preview.argv, ["git", "-C", f.repo, "worktree", "remove", "--", f.workspace]);
  executePreview(preview);
  assert.equal(git(f.repo, "rev-parse", "refs/heads/change/example"), candidate);
  assert.match(invoke(f, "locate").error, /exactly one|not registered/i);
});

test("workspace previews reject unsafe identity, symlinks, topology overrides and CLI misuse", async (t) => {
  const f = await fixture(t);
  const outside = path.join(f.root, "outside");
  await mkdir(outside);
  await symlink(outside, f.workspace, "dir");
  assert.notEqual(invoke(f, "prepare").status, 0);
  await rm(f.workspace);
  for (const code of [...Array.from({ length: 31 }, (_, index) => index + 1), 127]) {
    const result = invoke(f, "prepare", ["--workspace", `${f.workspace}${String.fromCharCode(code)}`]);
    assert.equal(result.status, 1);
    assert.match(result.error, /safe workspace path/);
  }
  assert.match(invoke(f, "prepare", ["--workspace", `${f.root}${path.sep}unused${path.sep}..${path.sep}destination`]).error, /normalized/);
  const alias = path.join(f.root, "parent-alias");
  await symlink(outside, alias, "dir");
  assert.match(invoke(f, "prepare", ["--workspace", path.join(alias, "destination")]).error, /canonical parent/);
  for (const extra of [["--change", "../escape"], ["--base", "HEAD"], ["--unknown"], ["--branch", "-bad"], ["--workspace", "relative"]]) {
    assert.notEqual(invoke(f, "prepare", extra).status, 0, JSON.stringify(extra));
  }
  assert.notEqual(invoke(f, "prepare", [], { GIT_INDEX_FILE: path.join(f.root, "other-index") }).status, 0);
  executePreview(invoke(f, "prepare"));
  git(f.repo, "worktree", "lock", f.workspace);
  assert.match(invoke(f, "locate").error, /locked/i);
});

test("workspace setup and reuse reject symlinked planning ancestors without following them", async (t) => {
  for (const relative of ["openspec", "openspec/changes", "openspec/changes/example"]) {
    const f = await fixture(t);
    const outside = path.join(f.root, "outside");
    await mkdir(outside);
    const link = path.join(f.repo, relative);
    await mkdir(path.dirname(link), { recursive: true });
    await symlink(outside, link, "dir");
    git(f.repo, "add", "--", "openspec");
    git(f.repo, "commit", "-m", "symlink fixture");
    f.base = git(f.repo, "rev-parse", "HEAD");
    const setup = invoke(f, "prepare");
    assert.notEqual(setup.status, 0, relative);
    assert.match(setup.error, /symlink/i);
  }
  const f = await fixture(t);
  executePreview(invoke(f, "prepare"));
  const outside = path.join(f.root, "outside");
  await mkdir(outside);
  await symlink(outside, path.join(f.workspace, "openspec"), "dir");
  assert.match(invoke(f, "prepare").error, /symlink/i);
});

test("workspace helper refuses inherited graft-file overrides before inspecting ancestry", async (t) => {
  const f = await fixture(t);
  const grafts = path.join(f.root, "external-grafts");
  await writeFile(grafts, "");
  const result = invoke(f, "prepare", [], { GIT_GRAFT_FILE: grafts });
  assert.notEqual(result.status, 0);
  assert.match(result.error, /override.*GIT_GRAFT_FILE/i);
});

test("remote-only branch collisions never create a tracking branch", async (t) => {
  const f = await fixture(t);
  git(f.repo, "update-ref", "refs/remotes/origin/change/example", f.base);
  const result = invoke(f, "prepare");
  assert.notEqual(result.status, 0);
  assert.match(result.error, /branch.*exists|unregistered/i);
  assert.equal(git(f.repo, "for-each-ref", "--format=%(refname)", "refs/heads/change/example"), "");
  assert.equal(git(f.repo, "worktree", "list", "--porcelain").includes(f.workspace), false);
});

test("closure workspace starts from the verified target and retires only after closure integration", async (t) => {
  const f = await fixture(t);
  executePreview(invoke(f, "prepare"));
  await writeFile(path.join(f.workspace, "source.txt"), "implemented\n");
  git(f.workspace, "commit", "-am", "implementation");
  const candidate = git(f.workspace, "rev-parse", "HEAD");
  git(f.repo, "merge", "--no-ff", "change/example", "-m", "integrate");
  const target = git(f.repo, "rev-parse", "HEAD");
  const closure = { ...f, base: target };
  const workspace = path.join(f.root, "repo--example--closure");
  const selectors = ["--branch", "closure/example", "--workspace", workspace];
  executePreview(invoke(closure, "prepare", selectors));
  assert.equal(git(workspace, "rev-parse", "HEAD"), target);
  await writeFile(path.join(workspace, "receipt.txt"), "synthetic closure evidence\n");
  git(workspace, "add", "receipt.txt");
  git(workspace, "commit", "-m", "closure");
  const head = git(workspace, "rev-parse", "HEAD");
  assert.notEqual(invoke(closure, "retire", [...selectors, "--head", head, "--target", target]).status, 0);
  git(f.repo, "merge", "--no-ff", "closure/example", "-m", "integrate closure");
  const closed = git(f.repo, "rev-parse", "HEAD");
  executePreview(invoke(closure, "retire", [...selectors, "--head", head, "--target", closed]));
  executePreview(invoke(f, "retire", ["--head", candidate, "--target", closed]));
  assert.equal(git(f.repo, "rev-parse", "refs/heads/closure/example"), head);
  assert.equal(git(f.repo, "rev-parse", "refs/heads/change/example"), candidate);
});
