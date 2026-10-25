import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const guard = fileURLToPath(new URL("../skills/software-development/phased-plan-closeout/scripts/phase-guard.mjs", import.meta.url));
const chg = "docs/changes/active/CHG-001-example.md";
const record = (state = "in-progress", second = "pending") => `# Example\n\n| # | Phase | Status | Verification gate |\n| --- | --- | --- | --- |\n| 1 | Implement | ${state} | npm test |\n| 2 | Integrate | ${second} | npm test |\n`;
const git = (cwd, ...args) => execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: os.devNull } }).trim();

// The guard resolves blobs with Git's own clean filter, so it must see the same
// Git configuration the fixture used to build its index.
const gitEnv = { GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: os.devNull };

async function fixture(t, state = "in-progress", second = "pending", createWorker = true, objectFormat = "sha1") {
  const scratch = await mkdtemp(path.join(os.tmpdir(), "phase-guard-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const target = path.join(scratch, "primary");
  const worktree = path.join(scratch, "worker");
  await mkdir(target);
  git(target, "init", "-b", "main", `--object-format=${objectFormat}`);
  git(target, "config", "user.email", "fixture@example.invalid");
  git(target, "config", "user.name", "Fixture");
  git(target, "config", "commit.gpgsign", "false");
  git(target, "config", "core.hooksPath", path.join(scratch, "no-hooks"));
  await mkdir(path.dirname(path.join(target, chg)), { recursive: true });
  await writeFile(path.join(target, chg), record("pending") + "\nInitial fixture.\n");
  git(target, "add", "--", chg);
  git(target, "commit", "-m", "Initial record");
  await writeFile(path.join(target, chg), record(state, second));
  git(target, "commit", "-am", "Reserve phase");
  const reservation = git(target, "rev-parse", "HEAD");
  const branch = `phase/CHG-001-example/1/${reservation}`;
  if (!createWorker) return { target, worktree, reservation, branch };
  git(target, "worktree", "add", "-b", branch, worktree, reservation);
  await writeFile(path.join(worktree, "implementation.txt"), "Reviewed implementation.\n");
  git(worktree, "add", "--", "implementation.txt");
  git(worktree, "commit", "-m", "Implement phase");
  const worktreeHead = git(worktree, "rev-parse", "HEAD");
  return { target, worktree, reservation, worktreeHead, branch };
}

function invoke(args, env = {}) {
  const result = spawnSync(process.execPath, [guard, ...args], { encoding: "utf8", env: { ...process.env, ...gitEnv, ...env } });
  assert.equal(result.signal, null);
  assert.ok(result.stdout.trim(), result.stderr);
  return { status: result.status, ...JSON.parse(result.stdout) };
}

function preflight(f, extra = []) {
  return invoke(["preflight", "--target", f.target, "--worktree", f.worktree,
    "--target-branch", "main", "--worktree-branch", f.branch,
    "--reservation", f.reservation, "--chg", chg, "--phase", "1",
    "--target-head", f.reservation, "--worktree-head", f.worktreeHead, ...extra]);
}

test("create-preview returns exact argv without creating a branch or worktree", async (t) => {
  const f = await fixture(t, "in-progress", "pending", false);
  const destination = path.join(path.dirname(f.worktree), "worker with spaces ' quote");
  const before = git(f.target, "worktree", "list", "--porcelain");
  const result = invoke(["create-preview", "--target", f.target, "--target-branch", "main",
    "--reservation", f.reservation, "--chg", chg, "--phase", "1", "--worktree", destination]);
  assert.equal(result.status, 0, JSON.stringify(result));
  assert.deepEqual(result.argv, ["git", "-C", f.target, "worktree", "add", "-b", f.branch, "--", destination, f.reservation]);
  assert.equal(git(f.target, "worktree", "list", "--porcelain"), before);
  assert.equal(git(f.target, "branch", "--list", f.branch), "");
  // Only the fixture executes the preview: verify standalone argv, never shell interpolation.
  execFileSync(result.argv[0], result.argv.slice(1), { stdio: "pipe" });
  const located = invoke(["locate", "--repo", f.target, "--reservation", f.reservation, "--chg", chg, "--phase", "1"]);
  assert.equal(located.status, 0, JSON.stringify(located));
  assert.equal(located.worktree, destination);
});

test("preflight proves clean code-only FF topology without changing Git state", async (t) => {
  const f = await fixture(t);
  const before = [git(f.target, "rev-parse", "HEAD"), git(f.worktree, "rev-parse", "HEAD"), git(f.target, "status", "--porcelain"), git(f.worktree, "status", "--porcelain")];
  const result = preflight(f);
  assert.equal(result.status, 0, JSON.stringify(result));
  assert.equal(result.ok, true);
  assert.equal(result.phase, "1");
  assert.equal(result.state, "in-progress");
  assert.equal(result.targetBlob, result.worktreeBlob);
  assert.deepEqual([git(f.target, "rev-parse", "HEAD"), git(f.worktree, "rev-parse", "HEAD"), git(f.target, "status", "--porcelain"), git(f.worktree, "status", "--porcelain")], before);
});

for (const scenario of ["existing branch", "existing directory", "competing worker", "nested destination", "dirty target", "advanced target", "wrong target branch", "force option"]) {
  test(`create-preview refuses ${scenario} without mutation`, async (t) => {
    const f = await fixture(t, "in-progress", "pending", false);
    let destination = f.worktree;
    if (scenario === "existing branch") git(f.target, "branch", f.branch, f.reservation);
    if (scenario === "existing directory") await mkdir(destination);
    if (scenario === "competing worker") git(f.target, "worktree", "add", "-b", "other", destination, f.reservation);
    if (scenario === "nested destination") destination = path.join(f.target, "worker");
    if (scenario === "dirty target") await writeFile(path.join(f.target, "untracked.txt"), "Keep me.\n");
    if (scenario === "advanced target") git(f.target, "commit", "--allow-empty", "-m", "Advance fixture");
    const before = [git(f.target, "worktree", "list", "--porcelain"), git(f.target, "show-ref"), git(f.target, "status", "--porcelain")];
    const result = invoke(["create-preview", "--target", f.target, "--target-branch", scenario === "wrong target branch" ? "wrong" : "main",
      "--reservation", f.reservation, "--chg", chg, "--phase", "1", "--worktree", destination,
      ...(scenario === "force option" ? ["--force"] : [])]);
    assert.equal(result.status, 1, JSON.stringify(result));
    assert.equal(result.argv, undefined);
    assert.deepEqual([git(f.target, "worktree", "list", "--porcelain"), git(f.target, "show-ref"), git(f.target, "status", "--porcelain")], before);
  });
}

test("row readback proves completion evidence against the integrated commit", async (t) => {
  const f = await fixture(t);
  git(f.target, "merge", "--ff-only", f.worktreeHead);
  await writeFile(path.join(f.target, chg), record(`done (npm test exit 0 @ ${f.worktreeHead.slice(0, 12)})`));
  git(f.target, "commit", "-am", "Complete phase");
  const completion = git(f.target, "rev-parse", "HEAD");
  const result = invoke(["row", "--repo", f.target, "--ref", completion, "--chg", chg,
    "--phase", "1", "--expect", "done", "--evidence-commit", f.worktreeHead]);
  assert.equal(result.status, 0, JSON.stringify(result));
  assert.match(result.state, /^done \(npm test exit 0 @ /);
  assert.equal(result.ref, completion);
});

for (const side of ["target", "worktree"]) {
  test(`preflight refuses ${side} CHG edits already committed on its branch`, async (t) => {
    const f = await fixture(t);
    await writeFile(path.join(f[side], chg), record("done (wrong evidence)"));
    git(f[side], "commit", "-am", "Competing record edit");
    const changedHead = git(f[side], "rev-parse", "HEAD");
    const result = preflight(f, [`--${side}-head`, changedHead]);
    assert.equal(result.status, 1);
    assert.match(result.error, /CHG blob mismatch/);
    assert.notEqual(result.targetBlob, result.worktreeBlob);
    assert.match(await readFile(path.join(f[side], chg), "utf8"), /wrong evidence/);
    assert.equal(git(f[side], "rev-parse", "HEAD"), changedHead);
  });
  test(`preflight refuses ${side} unstaged or staged edits without discarding them`, async (t) => {
    const f = await fixture(t);
    const changed = path.join(f[side], chg);
    await writeFile(changed, record("done (preserve me)"));
    for (const staged of [false, true]) {
      if (staged) git(f[side], "add", "--", chg);
      const before = git(f[side], "status", "--porcelain");
      const result = preflight(f);
      assert.equal(result.status, 1);
      assert.match(result.error, /dirty/);
      assert.equal(git(f[side], "status", "--porcelain"), before);
      assert.match(await readFile(changed, "utf8"), /preserve me/);
    }
  });
}

test("matching final CHG blobs cannot hide a reverted worktree CHG commit", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.worktree, chg), record("pending"));
  git(f.worktree, "commit", "-am", "Wrong phase edit");
  await writeFile(path.join(f.worktree, chg), record());
  git(f.worktree, "commit", "-am", "Restore old record");
  const result = preflight(f, ["--worktree-head", git(f.worktree, "rev-parse", "HEAD")]);
  assert.equal(result.status, 1);
  assert.equal(result.targetBlob, result.worktreeBlob);
  assert.match(result.error, /Worktree history changes/);
});

test("preflight refuses stale heads, wrong branches, and divergent code-only histories", async (t) => {
  const f = await fixture(t);
  assert.match(preflight(f, ["--target-head", f.worktreeHead]).error, /HEAD changed/);
  assert.match(preflight(f, ["--target-branch", "other"]).error, /branch/);
  git(f.worktree, "checkout", "--detach");
  assert.equal(preflight(f).ok, false);
  git(f.worktree, "checkout", f.branch);
  await writeFile(path.join(f.target, "unrelated.txt"), "Target advanced.\n");
  git(f.target, "add", "--", "unrelated.txt");
  git(f.target, "commit", "-m", "Advance target");
  const result = preflight(f, ["--target-head", git(f.target, "rev-parse", "HEAD")]);
  assert.equal(result.status, 1);
  assert.equal(result.targetBlob, result.worktreeBlob);
});

test("preflight refuses a reservation containing implementation paths", async (t) => {
  const f = await fixture(t);
  const result = preflight(f, ["--reservation", f.worktreeHead]);
  assert.equal(result.status, 1);
});

for (const [state, second, expected] of [
  ["pending", "pending", "not in-progress"],
  ["in-progress", "in-progress", "Multiple in-progress"],
]) {
  test(`preflight rejects invalid reservation table: ${state}/${second}`, async (t) => {
    const f = await fixture(t, state, second);
    const result = preflight(f);
    assert.equal(result.status, 1);
    assert.match(result.error, new RegExp(expected));
  });
}

test("row readback rejects duplicate phase IDs, absent phases, and invented evidence", async (t) => {
  const f = await fixture(t);
  const readRow = (phase, expect, evidence = f.worktreeHead) => invoke(["row", "--repo", f.target,
    "--ref", git(f.target, "rev-parse", "HEAD"), "--chg", chg,
    "--phase", phase, "--expect", expect, ...(expect === "done" ? ["--evidence-commit", evidence] : [])]);
  assert.match(readRow("3", "in-progress").error, /absent/);
  assert.match(readRow("1", "done").error, /expected state/);
  git(f.target, "merge", "--ff-only", f.worktreeHead);
  for (const [text, expected] of [
    [record().replace("| 2 |", "| 1 |"), /Duplicate phase/],
    [record("done (looks good)"), /Expected done/],
    [record(`done (npm test exit 0 @ ${f.reservation.slice(0, 12)})`), /different implementation/],
    [record(`done (npm test exit 0 @ ${f.worktreeHead.slice(0, 12)})`, "in-progress"), /Another phase/],
  ]) {
    await writeFile(path.join(f.target, chg), text);
    git(f.target, "commit", "-am", "Bad evidence fixture");
    const result = readRow("1", "done");
    assert.equal(result.status, 1);
    assert.match(result.error, expected);
  }
});

test("guard rejects wildcard and traversal CHG paths instead of normalizing them", async (t) => {
  const f = await fixture(t);
  for (const bad of ["docs/changes/active/CHG-*.md", "docs/changes/active/../active/CHG-001-example.md"]) {
    const result = preflight(f, ["--chg", bad]);
    assert.equal(result.status, 1);
    assert.match(result.error, /literal/);
  }
});

test("integrated phase can resume verification, archive, read back, and retire its worktree", async (t) => {
  const f = await fixture(t);
  const reserved = invoke(["row", "--repo", f.target, "--ref", f.reservation,
    "--chg", chg, "--phase", "1", "--expect", "in-progress"]);
  assert.equal(reserved.status, 0);
  git(f.target, "merge", "--ff-only", f.worktreeHead);
  // A retry after code integration is a no-op topology, not a competing reservation.
  assert.equal(preflight(f, ["--target-head", f.worktreeHead]).status, 0);
  const archived = chg.replace("/active/", "/archive/");
  await mkdir(path.dirname(path.join(f.target, archived)), { recursive: true });
  git(f.target, "mv", "--", chg, archived);
  await writeFile(path.join(f.target, archived), record(`done (node --test exit 0 @ ${f.worktreeHead})`, "done (prior gate evidence)"));
  git(f.target, "add", "--", archived);
  assert.equal(invoke(["paths", "--repo", f.target, "--allow-path", chg, "--allow-path", archived]).status, 0);
  git(f.target, "commit", "-m", "Archive completed change");
  const completion = git(f.target, "rev-parse", "HEAD");
  assert.equal(invoke(["paths", "--repo", f.target, "--ref", completion, "--allow-path", chg, "--allow-path", archived]).status, 0);
  const result = invoke(["row", "--repo", f.target, "--ref", completion, "--chg", archived,
    "--phase", "1", "--expect", "done", "--evidence-commit", f.worktreeHead]);
  assert.equal(result.status, 0, JSON.stringify(result));
  git(f.target, "worktree", "remove", f.worktree);
  assert.doesNotMatch(git(f.target, "worktree", "list", "--porcelain"), /worker/);
  assert.equal(git(f.target, "status", "--porcelain"), "");
});

test("guard refuses unrelated Git repositories and nonliteral commit identifiers", async (t) => {
  const f = await fixture(t);
  const other = await fixture(t);
  assert.match(preflight(f, ["--worktree", other.worktree, "--worktree-branch", other.branch, "--worktree-head", other.worktreeHead]).error, /different repositories/);
  assert.match(preflight(f, ["--reservation", "main"]).error, /full commit SHA/);
  assert.match(preflight(f, ["--phase", "1b"]).error, /numeric phase/);
  await writeFile(path.join(f.worktree, "untracked.txt"), "Preserve this input.\n");
  assert.match(preflight(f).error, /dirty/);
  assert.equal(await readFile(path.join(f.worktree, "untracked.txt"), "utf8"), "Preserve this input.\n");
});

test("paths validates exact staged and committed record allowlists without modifying the index", async (t) => {
  const f = await fixture(t);
  const committed = invoke(["paths", "--repo", f.target, "--ref", f.reservation, "--allow-path", chg]);
  assert.equal(committed.status, 0, JSON.stringify(committed));
  await writeFile(path.join(f.target, chg), record("done (candidate)"));
  git(f.target, "add", "--", chg);
  const args = ["paths", "--repo", f.target, "--allow-path", chg];
  assert.equal(invoke(args).status, 0);
  await writeFile(path.join(f.target, "unrelated.txt"), "Must not be swept into a status commit.\n");
  git(f.target, "add", "--", "unrelated.txt");
  const before = git(f.target, "diff", "--cached");
  assert.match(invoke(args).error, /allowlist/);
  assert.equal(git(f.target, "diff", "--cached"), before);
  // The test deliberately creates a contaminated status commit to prove readback refuses it.
  git(f.target, "commit", "-m", "Contaminated fixture");
  assert.match(invoke(["paths", "--repo", f.target, "--ref", git(f.target, "rev-parse", "HEAD"), "--allow-path", chg]).error, /allowlist/);
});

test("done readback refuses stale reviewed-tip evidence and enforces evidence arguments", async (t) => {
  const f = await fixture(t);
  git(f.target, "merge", "--ff-only", f.worktreeHead);
  await writeFile(path.join(f.target, chg), record(`done (npm test exit 0 @ ${f.reservation})`));
  git(f.target, "commit", "-am", "Stale evidence fixture");
  const args = ["row", "--repo", f.target, "--ref", git(f.target, "rev-parse", "HEAD"),
    "--chg", chg, "--phase", "1", "--expect", "done"];
  assert.match(invoke(args).error, /requires --evidence-commit/);
  assert.match(invoke([...args, "--evidence-commit", f.reservation]).error, /reviewed implementation tip/);
  assert.match(invoke(["row", "--repo", f.target, "--ref", f.reservation, "--chg", chg,
    "--phase", "1", "--expect", "in-progress", "--evidence-commit", f.worktreeHead]).error, /only valid for done/);
});

test("path allowlists preserve significant filename whitespace instead of trimming it", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.target, " extra.txt"), "Distinct filename.\n");
  git(f.target, "add", "--", " extra.txt");
  assert.equal(invoke(["paths", "--repo", f.target, "--allow-path", "extra.txt"]).status, 1);
  assert.equal(invoke(["paths", "--repo", f.target, "--allow-path", " extra.txt"]).status, 0);
});

test("record readback detects same-path hook rewrites using the reviewed index digest", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.target, chg), record() + "\nReviewed metadata.\n");
  git(f.target, "add", "--", chg);
  const args = ["paths", "--repo", f.target, "--allow-path", chg];
  const before = invoke(args);
  assert.match(before.contentDigest ?? "", /^[a-f0-9]{64}$/);
  assert.equal(before.base, f.reservation);
  const hooks = git(f.target, "config", "core.hooksPath");
  await mkdir(hooks);
  await writeFile(path.join(hooks, "pre-commit"), `#!/bin/sh\nprintf '\\nUnreviewed hook content.\\n' >> '${chg}'\ngit add -- '${chg}'\n`, { mode: 0o755 });
  git(f.target, "commit", "-m", "Hook mutation fixture");
  const ref = git(f.target, "rev-parse", "HEAD");
  assert.equal(invoke([...args, "--ref", ref]).status, 0, "paths alone cannot catch a same-file rewrite");
  const checked = invoke([...args, "--ref", ref, "--base", before.base, "--expect-content", before.contentDigest]);
  assert.equal(checked.status, 1);
  assert.match(checked.error, /content differs/);
  assert.match(await readFile(path.join(f.target, chg), "utf8"), /Unreviewed hook content/);
  assert.equal(git(f.target, "rev-parse", "HEAD"), ref, "readback must not repair history");
});

test("locate recovers exactly one reservation-named worktree and preserves unfinished edits", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.worktree, "implementation.txt"), "Unfinished edits.\n");
  const before = git(f.worktree, "status", "--porcelain");
  const result = invoke(["locate", "--repo", f.target, "--reservation", f.reservation, "--chg", chg, "--phase", "1"]);
  assert.equal(result.status, 0, JSON.stringify(result));
  assert.equal(result.worktree, f.worktree);
  assert.equal(result.branch, f.branch);
  assert.equal(result.worktreeHead, f.worktreeHead);
  assert.equal(git(f.worktree, "status", "--porcelain"), before);
  assert.equal(await readFile(path.join(f.worktree, "implementation.txt"), "utf8"), "Unfinished edits.\n");
});

for (const scenario of ["missing", "competing", "duplicate branch", "wrong branch", "detached", "locked", "CHG edit", "staged CHG edit"]) {
  test(`locate fails closed for ${scenario} without adopting another checkout`, async (t) => {
    const f = await fixture(t);
    if (scenario === "missing") git(f.target, "worktree", "remove", f.worktree);
    if (scenario === "competing") git(f.target, "worktree", "add", "-b", "competitor", path.join(f.target, "..", "other"), f.reservation);
    if (scenario === "duplicate branch") git(f.target, "worktree", "add", "--force", path.join(f.target, "..", "other"), f.branch);
    if (scenario === "wrong branch") git(f.worktree, "branch", "-m", "legacy-worker");
    if (scenario === "detached") git(f.worktree, "checkout", "--detach");
    if (scenario === "locked") git(f.target, "worktree", "lock", f.worktree);
    if (scenario.includes("CHG edit")) {
      await writeFile(path.join(f.worktree, chg), record("pending"));
      if (scenario.startsWith("staged")) {
        git(f.worktree, "add", "--", chg);
        await writeFile(path.join(f.worktree, chg), record());
      }
    }
    const inventory = git(f.target, "worktree", "list", "--porcelain");
    const result = invoke(["locate", "--repo", f.target, "--reservation", f.reservation, "--chg", chg, "--phase", "1"]);
    assert.equal(result.status, 1, JSON.stringify(result));
    assert.equal(git(f.target, "worktree", "list", "--porcelain"), inventory);
    if (["competing", "duplicate branch", "wrong branch"].includes(scenario)) assert.equal(preflight(f).status, 1);
  });
}

test("record content digest round-trips renamed, new, and mode-changed paths", async (t) => {
  const f = await fixture(t);
  const archive = chg.replace("/active/", "/archive/");
  await mkdir(path.dirname(path.join(f.target, archive)), { recursive: true });
  git(f.target, "mv", "--", chg, archive);
  const filename = " new record.txt";
  await writeFile(path.join(f.target, filename), "Planned input.\n");
  git(f.target, "add", "--", filename);
  git(f.target, "update-index", "--chmod=+x", filename);
  const args = ["paths", "--repo", f.target, "--allow-path", chg, "--allow-path", archive, "--allow-path", filename];
  const before = invoke([...args, "--base", f.reservation]);
  assert.equal(before.status, 0, JSON.stringify(before));
  git(f.target, "commit", "-m", "Record batch fixture");
  const ref = git(f.target, "rev-parse", "HEAD");
  assert.equal(invoke([...args, "--ref", ref, "--base", before.base, "--expect-content", before.contentDigest]).status, 0);
  assert.match(invoke([...args, "--ref", ref, "--base", ref, "--expect-content", before.contentDigest]).error, /base changed/);
});

test("root commits fail the existing single-parent record check before parent lookup", async (t) => {
  const f = await fixture(t);
  const root = git(f.target, "rev-parse", `${f.reservation}^`);
  for (const args of [
    ["paths", "--repo", f.target, "--ref", root, "--allow-path", chg],
    ["locate", "--repo", f.target, "--reservation", root, "--chg", chg, "--phase", "1"],
  ]) {
    const result = invoke(args);
    assert.equal(result.status, 1);
    assert.equal(result.error, "Expected a single-parent record commit");
  }
});

test("unborn worktree registration reports an ownership handoff without silently excluding it", async (t) => {
  const f = await fixture(t);
  const other = path.join(f.target, "..", "unborn");
  git(f.target, "worktree", "add", "--detach", other, `${f.reservation}^`);
  git(other, "symbolic-ref", "HEAD", "refs/heads/unborn-fixture");
  const before = git(f.target, "worktree", "list", "--porcelain");
  const result = invoke(["locate", "--repo", f.target, "--reservation", f.reservation, "--chg", chg, "--phase", "1"]);
  assert.equal(result.status, 1);
  assert.match(result.error, /unresolved HEAD.*ownership handoff/);
  assert.equal(git(f.target, "worktree", "list", "--porcelain"), before);
});

test("candidate binds unstaged and untracked content through index and commit without staging", async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.worktree, "implementation.txt"), "Changed implementation.\n");
  await writeFile(path.join(f.worktree, "new test.txt"), "Regression.\n");
  const args = ["candidate", "--repo", f.worktree, "--base", f.worktreeHead,
    "--allow-path", "implementation.txt", "--allow-path", "new test.txt"];
  const status = git(f.worktree, "status", "--porcelain");
  const frozen = invoke([...args, "--boundary", "worktree"]);
  assert.equal(frozen.status, 0, JSON.stringify(frozen));
  assert.equal(git(f.worktree, "status", "--porcelain"), status);
  assert.equal(git(f.worktree, "diff", "--cached"), "");
  git(f.worktree, "add", "--", "implementation.txt", "new test.txt");
  assert.equal(invoke([...args, "--boundary", "index", "--expect-content", frozen.contentDigest]).status, 0);
  git(f.worktree, "commit", "-m", "Reviewed content");
  const ref = git(f.worktree, "rev-parse", "HEAD");
  assert.equal(invoke([...args, "--boundary", "commit", "--ref", ref, "--expect-content", frozen.contentDigest]).status, 0);
  await writeFile(path.join(f.worktree, "new test.txt"), "Unreviewed drift.\n");
  assert.notEqual(invoke([...args, "--boundary", "commit", "--ref", ref, "--expect-content", frozen.contentDigest]).status, 0);
});

test("candidate rejects post-review edits, unstaged additions, omissions, and same-path commit rewrites", async t => {
  const f = await fixture(t);
  const file = path.join(f.worktree, "new.txt");
  await writeFile(file, "Reviewed.\n");
  const args = ["candidate", "--repo", f.worktree, "--base", f.worktreeHead, "--allow-path", "new.txt"];
  const frozen = invoke([...args, "--boundary", "worktree"]);
  assert.equal(frozen.status, 0);
  const expect = ["--expect-content", frozen.contentDigest];
  assert.match(invoke([...args, "--boundary", "index", ...expect]).error, /Index differs/);
  await writeFile(file, "Different.\n");
  assert.match(invoke([...args, "--boundary", "worktree", ...expect]).error, /reviewed content/);
  git(f.worktree, "add", "--", "new.txt");
  assert.match(invoke([...args, "--boundary", "index", ...expect]).error, /reviewed content/);
  // Simulates a hook that replaces the staged content under the same path.
  git(f.worktree, "commit", "-m", "Rewritten content");
  const ref = git(f.worktree, "rev-parse", "HEAD");
  assert.match(invoke([...args, "--boundary", "commit", "--ref", ref, ...expect]).error, /reviewed content/);
});

test("candidate fingerprints binary contents, deletions, executable modes and symlink targets", async t => {
  if (process.platform === "win32") return t.skip("POSIX executable and symlink fixture");
  const f = await fixture(t);
  await rm(path.join(f.worktree, "implementation.txt"));
  await writeFile(path.join(f.worktree, "binary"), Buffer.from([0, 128, 255]));
  await chmod(path.join(f.worktree, "binary"), 0o755);
  await symlink("binary", path.join(f.worktree, "link"));
  const args = ["candidate", "--repo", f.worktree, "--base", f.worktreeHead,
    ...["implementation.txt", "binary", "link"].flatMap(p => ["--allow-path", p])];
  const frozen = invoke([...args, "--boundary", "worktree"]);
  assert.equal(frozen.status, 0, JSON.stringify(frozen));
  git(f.worktree, "add", "--", "implementation.txt", "binary", "link");
  assert.equal(invoke([...args, "--boundary", "index", "--expect-content", frozen.contentDigest]).status, 0);
  await chmod(path.join(f.worktree, "binary"), 0o644);
  assert.match(invoke([...args, "--boundary", "worktree", "--expect-content", frozen.contentDigest]).error, /reviewed content/);
  await chmod(path.join(f.worktree, "binary"), 0o755);
  await rm(path.join(f.worktree, "link"));
  await symlink("elsewhere", path.join(f.worktree, "link"));
  assert.match(invoke([...args, "--boundary", "worktree", "--expect-content", frozen.contentDigest]).error, /reviewed content/);
});

test("candidate includes unexpected untracked files but ignores disposable build output", async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.worktree, ".gitignore"), "dist/\n");
  await mkdir(path.join(f.worktree, "dist"));
  await writeFile(path.join(f.worktree, "dist", "build.js"), "ignored");
  const args = ["candidate", "--repo", f.worktree, "--base", f.worktreeHead, "--allow-path", ".gitignore", "--boundary", "worktree"];
  assert.equal(invoke(args).status, 0);
  await writeFile(path.join(f.worktree, "unexpected.txt"), "Do not omit me");
  assert.match(invoke(args).error, /exact allowlist/);
  assert.match(invoke([...args, "--allow-path", ".gitignore"]).error, /exact allowlist/);
});

for (const format of ["sha1", "sha256"]) {
  test(`candidate raw-byte digest equals Git's staged and committed ${format} trees`, async t => {
    const f = await fixture(t, "in-progress", "pending", true, format);
    const names = ["empty", "binary", "crlf", "utf8", "large"];
    const contents = [Buffer.alloc(0), Buffer.from([0, 128, 255, 10]), Buffer.from("a\r\nb\r\n"),
      Buffer.from("Unicode: λ🙂\n"), Buffer.alloc(1024 * 1024, 255)];
    for (let i = 0; i < names.length; i++) await writeFile(path.join(f.worktree, names[i]), contents[i]);
    const args = ["candidate", "--repo", f.worktree, "--base", f.worktreeHead,
      ...names.flatMap(name => ["--allow-path", name])];
    const frozen = invoke([...args, "--boundary", "worktree"]);
    assert.equal(frozen.status, 0, JSON.stringify(frozen));
    git(f.worktree, "-c", "core.autocrlf=false", "add", "--", ...names);
    const indexed = invoke(["paths", "--repo", f.worktree, ...names.flatMap(name => ["--allow-path", name])]);
    assert.equal(indexed.status, 0, JSON.stringify(indexed));
    assert.equal(frozen.contentDigest, indexed.contentDigest);
    assert.equal(invoke([...args, "--boundary", "index", "--expect-content", frozen.contentDigest]).status, 0);
    git(f.worktree, "commit", "-m", "Git-generated reference objects");
    assert.equal(invoke([...args, "--boundary", "commit", "--ref", git(f.worktree, "rev-parse", "HEAD"),
      "--expect-content", frozen.contentDigest]).status, 0);
  });
}

test("candidate Git subprocess count is constant as file count grows", async t => {
  const f = await fixture(t);
  const scratch = path.dirname(f.target);
  const probe = path.join(scratch, "count-git.mjs");
  const log = path.join(scratch, "git-calls.jsonl");
  await writeFile(probe, `import cp from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { appendFileSync } from 'node:fs';
const original = cp.execFileSync;
cp.execFileSync = function(file, args, options) {
  if (file === 'git') appendFileSync(process.env.GIT_PROBE_LOG, JSON.stringify(args) + '\\n');
  return original.call(this, file, args, options);
};
syncBuiltinESMExports();\n`);
  const counts = [];
  for (const count of [1, 40]) {
    const names = Array.from({ length: count }, (_, i) => `new-${i}.txt`);
    for (const name of names) await writeFile(path.join(f.worktree, name), "content\n");
    await writeFile(log, "");
    const r = invoke(["candidate", "--repo", f.worktree, "--base", f.worktreeHead, "--boundary", "worktree",
      ...names.flatMap(name => ["--allow-path", name])],
    { NODE_OPTIONS: `--import=${JSON.stringify(probe)}`, GIT_PROBE_LOG: log });
    assert.equal(r.status, 0, JSON.stringify(r));
    const calls = (await readFile(log, "utf8")).trim().split("\n").map(line => JSON.parse(line));
    counts.push(calls.length);
  }
  assert.equal(counts[0], counts[1], `Git subprocesses grew with files: ${counts}`);
  assert.ok(counts[0] <= 10, `Expected bounded Git metadata calls, saw ${counts[0]}`);
});

test("candidate ignores a checkout eol conversion but refuses a changed .gitattributes", async t => {
  const f = await fixture(t);
  const scratch = path.dirname(f.target);
  const repo = path.join(scratch, "eol");
  await mkdir(repo);
  git(repo, "init", "-b", "main");
  git(repo, "config", "user.email", "fixture@example.invalid");
  git(repo, "config", "user.name", "Fixture");
  git(repo, "config", "commit.gpgsign", "false");
  git(repo, "config", "core.autocrlf", "false");
  // A native CRLF fixture: Git stores LF and checks out CRLF.
  await writeFile(path.join(repo, ".gitattributes"), "crlf.keymap text eol=crlf\n");
  await writeFile(path.join(repo, "crlf.keymap"), "line one\nline two\n");
  git(repo, "add", "--", ".gitattributes", "crlf.keymap");
  git(repo, "commit", "-m", "Add CRLF fixture");
  const base = git(repo, "rev-parse", "HEAD");
  // Check the fixture out as CRLF, exactly as a working tree with eol=crlf has it.
  await rm(path.join(repo, "crlf.keymap"));
  git(repo, "checkout", "--", "crlf.keymap");
  assert.match(await readFile(path.join(repo, "crlf.keymap"), "utf8"), /\r\n/);
  assert.equal(git(repo, "status", "--porcelain"), "", "fixture checkout must look clean to Git");

  // The untouched CRLF fixture is not a candidate change: only the edited file is.
  await writeFile(path.join(repo, "source.ts"), "export const changed = true;\n");
  const allowed = ["candidate", "--repo", repo, "--base", base, "--boundary", "worktree", "--allow-path", "source.ts"];
  const ok = invoke(allowed);
  assert.equal(ok.status, 0, JSON.stringify(ok));
  assert.deepEqual(ok.paths, ["source.ts"]);

  // Editing .gitattributes changes how other files normalize, so refuse it.
  await writeFile(path.join(repo, ".gitattributes"), "crlf.keymap text eol=crlf\nsource.ts text eol=crlf\n");
  const drifted = invoke([...allowed, "--allow-path", ".gitattributes"]);
  assert.equal(drifted.status, 1, JSON.stringify(drifted));
  assert.match(drifted.error, /\.gitattributes/);
});
