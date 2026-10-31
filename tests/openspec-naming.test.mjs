import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const helper = new URL("../skills/software-development/openspec-delivery/scripts/change-name.mjs", import.meta.url);
const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
const decode = (text) => [...text].reduce((n, char) => n * 32n + BigInt(alphabet.indexOf(char)), 0n);
function invoke(args, cwd) {
  const result = spawnSync(process.execPath, [fileURLToPath(helper), ...args], { encoding: "utf8", cwd });
  return { status: result.status, ...(result.stdout.trim() ? JSON.parse(result.stdout) : { error: result.stderr }) };
}
async function scratch(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "openspec-naming-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test("generate emits a lowercase ULID name and matching path/branch without writes", async (t) => {
  const cwd = await scratch(t);
  const before = Date.now();
  const result = invoke(["generate", "--slug", "add-dark-mode"], cwd);
  assert.equal(result.status, 0, result.error);
  assert.equal(result.ok, true);
  assert.match(result.name, /^add-dark-mode-[0-7][0-9a-hjkmnp-tv-z]{25}$/);
  assert.equal(result.path, `openspec/changes/${result.name}`);
  assert.equal(result.branch, `change/${result.name}`);
  const timestamp = Number(decode(result.name.slice(-26, -16)));
  assert.ok(timestamp >= before && timestamp <= Date.now());
  const second = invoke(["generate", "--slug", "add-dark-mode"], cwd);
  assert.equal(second.status, 0, second.error);
  assert.notEqual(second.name, result.name);
  assert.deepEqual(await readdir(cwd), []);
  assert.equal(spawnSync("git", ["check-ref-format", "--branch", result.branch]).status, 0);
});

test("a symlinked helper invocation still emits its JSON result", async (t) => {
  const dir = await scratch(t);
  const alias = path.join(dir, "change-name.mjs");
  await symlink(fileURLToPath(helper), alias, "file");
  const result = spawnSync(process.execPath, [alias, "generate", "--slug", "example"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.notEqual(result.stdout.trim(), "", "Symlink invocation must not silently skip main");
  const output = JSON.parse(result.stdout);
  assert.equal(output.ok, true);
  assert.match(output.name, /^example-[0-7][0-9a-hjkmnp-tv-z]{25}$/);
});

test("resolve reuses exact or uniquely matching active names and never creates a missing change", async (t) => {
  const repo = await scratch(t);
  const name = "add-dark-mode-01arz3ndektsv4rrffq69g5fav";
  const changes = path.join(repo, "openspec/changes");
  for (const entry of [name, "legacy-change", "add-dark-mode-extra", "archive/2026-10-30-other-change"]) {
    await mkdir(path.join(changes, entry), { recursive: true });
  }
  const before = await readdir(changes, { recursive: true });
  for (const selection of [name, "add-dark-mode", "legacy-change"]) {
    const result = invoke(["resolve", "--repo", repo, "--name", selection]);
    assert.equal(result.status, 0, result.error);
    assert.equal(result.ok, true);
    assert.equal(result.name, selection === "legacy-change" ? selection : name);
    assert.equal(result.branch, `change/${result.name}`);
    assert.equal(result.path, `openspec/changes/${result.name}`);
  }
  for (const selection of ["missing", "add-dark", "other-change", "archive"]) {
    const result = invoke(["resolve", "--repo", repo, "--name", selection]);
    assert.notEqual(result.status, 0);
    assert.equal(result.ok, false);
  }
  assert.equal(invoke(["resolve", "--repo", repo, "--name", "missing"]).code, "not-found");
  assert.deepEqual(await readdir(changes, { recursive: true }), before);
});

test("ambiguous slugs list all matches and require explicit selection, including legacy names", async (t) => {
  const repo = await scratch(t);
  const names = ["add-dark-mode", "add-dark-mode-01arz3ndektsv4rrffq69g5fav", "add-dark-mode-01arz3ndektsv4rrffq69g5faw"];
  for (const name of names.toReversed()) await mkdir(path.join(repo, "openspec/changes", name), { recursive: true });
  const result = invoke(["resolve", "--repo", repo, "--name", "add-dark-mode"]);
  assert.equal(result.status, 1);
  assert.equal(result.ok, false);
  assert.equal(result.code, "ambiguous");
  assert.deepEqual(result.matches, names);
  assert.equal(result.name, undefined);
  for (const name of names) {
    const selected = invoke(["resolve", "--repo", repo, "--name", name, "--exact"]);
    assert.equal(selected.status, 0, selected.error);
    assert.equal(selected.name, name);
  }
});

test("ULID encoding preserves timestamp and all entropy bits at boundaries", async () => {
  const { generateName } = await import(helper);
  assert.equal(generateName("example", 0, new Uint8Array(10)).name, `example-${"0".repeat(26)}`);
  assert.equal(generateName("example", 0xffffffffffff, new Uint8Array(10).fill(255)).name, `example-7${"z".repeat(25)}`);
  const bytes = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const result = generateName("example", 123456789, bytes).name.slice(-26);
  assert.equal(decode(result.slice(0, 10)), 123456789n);
  assert.equal(decode(result.slice(10)), bytes.reduce((n, b) => (n << 8n) | BigInt(b), 0n));
  for (const timestamp of [-1, 1.5, NaN, Infinity, 0x1000000000000]) assert.throws(() => generateName("example", timestamp, bytes), /timestamp/);
  for (const entropy of [[], new Uint8Array(9), new Uint8Array(11), "0123456789"]) assert.throws(() => generateName("example", 0, entropy), /entropy/);
});

test("naming refuses invalid identifiers and CLI misuse rather than repairing inputs", async (t) => {
  const repo = await scratch(t);
  await mkdir(path.join(repo, "openspec/changes"), { recursive: true });
  const invalid = ["", "../escape", "a/b", "-leading", "trailing-", "two--hyphens", "Uppercase", "sp ace", "1number", "archive", " padded", "a".repeat(201), "add-dark-mode-01arz3ndektsv4rrffq69g5fav"];
  for (const slug of invalid) {
    const result = invoke(["generate", `--slug=${slug}`]);
    assert.equal(result.status, 1, slug);
    assert.equal(result.ok, false);
    assert.equal(result.name, undefined);
  }
  const commands = [[], ["unknown"], ["generate"], ["generate", "--slug", "x", "--slug=y"], ["generate", "--slug", "x", "extra"], ["generate", "--slug", "x", "--repo", repo], ["generate", "--slug", "x", "--exact"], ["resolve", "--repo", repo], ["resolve", "--name", "x"], ["resolve", "--repo", ".", "--name", "x"], ["resolve", "--repo", repo, "--name", "../escape"], ["resolve", "--repo", repo, "--name", "x", "--name=y"], ["resolve", "--repo", repo, "--repo", repo, "--name", "x"], ["resolve", "--repo", repo, "--name", "x", "--exact", "--exact"], ["resolve", "--repo", repo, "--name", "x", "--slug", "x"], ["resolve", "--repo", repo, "--name", "x", "--unknown"]];
  for (const args of commands) {
    const result = invoke(args);
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.equal(result.code, "invalid-input");
    assert.equal(result.name, undefined);
  }
  const maxSlugLength = 200 - 1 - 26;
  const boundary = invoke(["generate", "--slug", "a".repeat(maxSlugLength)]);
  assert.equal(boundary.status, 0, boundary.error);
  assert.equal(boundary.name.length, 200);
  const tooLong = invoke(["generate", "--slug", "a".repeat(maxSlugLength + 1)]);
  assert.equal(tooLong.status, 1, "The full name must fit OpenSpec's 200-character limit");
});

test("resolver refuses missing or symlinked discovery directories and leaves them untouched", async (t) => {
  const base = await scratch(t);
  const repo = path.join(base, "repo");
  await mkdir(repo);
  assert.equal(invoke(["resolve", "--repo", repo, "--name", "example"]).code, "invalid-input");
  const changes = path.join(repo, "openspec/changes");
  await mkdir(path.join(changes, "example"), { recursive: true });
  await writeFile(path.join(changes, ".gitkeep"), "");
  const outside = path.join(base, "outside");
  await mkdir(outside);
  for (const target of [repo, path.join(repo, "openspec"), changes, path.join(changes, "example")]) {
    const saved = `${target}-saved`;
    await rename(target, saved);
    await symlink(outside, target, "dir");
    const result = invoke(["resolve", "--repo", repo, "--name", "example"]);
    assert.equal(result.status, 1, target);
    assert.match(result.error, /symlink/i);
    await rm(target);
    await rename(saved, target);
  }
  await mkdir(path.join(changes, "Bad_Name"));
  assert.match(invoke(["resolve", "--repo", repo, "--name", "example"]).error, /Malformed/);
  assert.deepEqual(await readdir(outside), []);
});
