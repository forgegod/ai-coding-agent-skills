import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scripts = fileURLToPath(new URL("../skills/software-development/openspec-delivery/scripts/", import.meta.url));
const refused = ["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_NAMESPACE", "GIT_GRAFT_FILE", "GIT_SHALLOW_FILE", "GIT_REPLACE_REF_BASE", "GIT_CONFIG_COUNT", "GIT_CONFIG_PARAMETERS"];
const runtime = ["PATH", "HOME", "XDG_CONFIG_HOME", "TMPDIR", "TMP", "TEMP"];
const windows = ["SystemRoot", "WINDIR", "ComSpec", "PATHEXT", "USERPROFILE", "APPDATA", "LOCALAPPDATA"];
const selectors = ["GIT_CONFIG_GLOBAL", "GIT_CONFIG_SYSTEM", "GIT_CONFIG_NOSYSTEM"];
const fixed = { GIT_NO_REPLACE_OBJECTS: "1", GIT_OPTIONAL_LOCKS: "0", LC_ALL: "C" };
const darwinObserverSelfInjection = "__CF_USER_TEXT_ENCODING";
const windowsProcessBaseline = { HOMEDRIVE: "", HOMEPATH: "", LOGONSERVER: "", SYSTEMDRIVE: "", USERDOMAIN: "", USERNAME: "" };
// Node on Darwin records this after CoreFoundation startup. It is not in the helper env object.
function inheritedChildEnv(recorded, expected) {
  const env = { ...recorded };
  if (Object.hasOwn(env, darwinObserverSelfInjection) && !Object.hasOwn(expected, darwinObserverSelfInjection)) delete env[darwinObserverSelfInjection];
  return env;
}

test("Darwin Node observer self-injection is not a helper forward", () => {
  const expected = { PATH: "/bin", LC_ALL: "C" };
  const recorded = { ...expected, [darwinObserverSelfInjection]: "0x1F5:0x0:0x0", SYNTHETIC_CREDENTIAL: "leak" };
  const compared = inheritedChildEnv(recorded, expected);
  assert.equal(Object.hasOwn(compared, darwinObserverSelfInjection), false);
  assert.equal(compared.SYNTHETIC_CREDENTIAL, "leak");
  const forwarded = { ...expected, [darwinObserverSelfInjection]: "forwarded" };
  assert.equal(inheritedChildEnv(forwarded, forwarded)[darwinObserverSelfInjection], "forwarded");
});
// Git for Windows accepts the Win32 device name, not Node's \\.\nul path.
const gitNullDevice = process.platform === "win32" ? "NUL" : os.devNull;
const environmentModule = () => import(pathToFileURL(path.join(scripts, "git-environment.mjs")));

test("environment constructor reads only present allowlisted values after checking all names", async () => {
  const { gitEnvironment } = await environmentModule();
  for (const platform of ["linux", "darwin", "win32"]) {
    const allowed = [...runtime, ...(platform === "win32" ? windows : []), ...selectors];
    const reads = [];
    const source = {};
    for (const name of allowed) Object.defineProperty(source, name, { enumerable: true, get() { reads.push(name); return name; } });
    for (const name of ["SYNTHETIC_CREDENTIAL", "NODE_OPTIONS", "LD_PRELOAD", "DYLD_INSERT_LIBRARIES", "GIT_SSH_COMMAND", "GIT_TRACE", ...Object.keys(fixed), ...(platform === "win32" ? [] : windows)]) {
      Object.defineProperty(source, name, { enumerable: true, get() { throw new Error(`Unexpected value read: ${name}`); } });
    }
    assert.deepEqual(gitEnvironment(source, platform), { ...Object.fromEntries(allowed.map((name) => [name, name])), ...fixed, ...(platform === "win32" ? windowsProcessBaseline : {}) });
    assert.deepEqual(reads.sort(), allowed.sort());
    assert.deepEqual(gitEnvironment({}, platform), { ...fixed, ...(platform === "win32" ? windowsProcessBaseline : {}) });
    assert.deepEqual(gitEnvironment(Object.fromEntries(selectors.map((name) => [name, ""])), platform), { ...Object.fromEntries(selectors.map((name) => [name, ""])), ...fixed, ...(platform === "win32" ? windowsProcessBaseline : {}) });
    for (const name of refused) {
      for (const value of ["", "synthetic"]) assert.throws(() => gitEnvironment({ [name]: value }, platform), /override/i);
      const unread = Object.defineProperties({}, {
        PATH: { enumerable: true, get() { throw new Error("Read before refusal"); } },
        [name]: { enumerable: true, get() { throw new Error("Read forbidden value"); } },
      });
      assert.throws(() => gitEnvironment(unread, platform), /override/i);
      if (platform === "win32") assert.throws(() => gitEnvironment({ [name.toLowerCase()]: "" }, platform), /override/i);
      else    assert.deepEqual(gitEnvironment({ [name.toLowerCase()]: "" }, platform), { ...fixed, ...(platform === "win32" ? windowsProcessBaseline : {}) });
    }
  }
});

test("Windows name simulation canonicalizes allowlist names and refuses ambiguous aliases before reads", async () => {
  const { gitEnvironment } = await environmentModule();
  for (const name of [...runtime, ...windows, ...selectors]) {
    const alias = name === name.toLowerCase() ? name.toUpperCase() : name.toLowerCase();
    assert.deepEqual(gitEnvironment({ [alias]: "synthetic" }, "win32"), { [name]: "synthetic", ...fixed, ...windowsProcessBaseline });
    const source = {};
    for (const key of [name, alias]) Object.defineProperty(source, key, { enumerable: true, get() { throw new Error("Read ambiguous value"); } });
    assert.throws(() => gitEnvironment(source, "win32"), /ambiguous|duplicate/i);
  }
  for (const platform of ["linux", "darwin"]) assert.deepEqual(gitEnvironment({ PATH: "one", Path: "two", home: "ignored" }, platform), { PATH: "one", ...fixed });
});

async function fixture(t) {
  const scratch = await realpath(await mkdtemp(path.join(os.tmpdir(), "git-environment-")));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const repo = path.join(scratch, "repo");
  const home = path.join(scratch, "home");
  await mkdir(home);
  await mkdir(path.join(repo, "openspec/changes/example/specs/example"), { recursive: true });
  const env = {};
  for (const name of [...runtime, ...windows]) {
    const key = Object.keys(process.env).find((key) => process.platform === "win32" ? key.toUpperCase() === name.toUpperCase() : key === name);
    if (key !== undefined) env[name] = process.env[key];
  }
  Object.assign(env, { HOME: home, XDG_CONFIG_HOME: home, USERPROFILE: home, APPDATA: home, LOCALAPPDATA: home, GIT_CONFIG_GLOBAL: gitNullDevice, GIT_CONFIG_NOSYSTEM: "1" });
  const git = (...args) => {
    const result = spawnSync("git", ["-C", repo, ...args], { env, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git("init", "-b", "main");
  git("config", "user.name", "Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", path.join(scratch, "no-hooks"));
  for (const [file, bytes] of Object.entries({
    "openspec/config.yaml": "schema: spec-driven\n",
    "openspec/changes/example/.openspec.yaml": "schema: spec-driven\n",
    "openspec/changes/example/proposal.md": "# Scope\nSynthetic fixture.\n",
    "openspec/changes/example/tasks.md": "- [ ] 1.1 Implement\n",
    "openspec/changes/example/specs/example/spec.md": "## ADDED Requirements\nSynthetic fixture.\n",
  })) await writeFile(path.join(repo, file), bytes);
  git("add", ".");
  git("commit", "-m", "fixture");
  const base = git("rev-parse", "HEAD");
  const observed = path.join(scratch, "children.jsonl");
  const child = path.join(scratch, "git-child.mjs");
  const preload = path.join(scratch, "observe.mjs");
  // Instrument only the executable: each helper still supplies its real argv/options.
  // The actual child records its inherited environment, then runs real Git unchanged.
  await writeFile(child, `import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
appendFileSync(${JSON.stringify(observed)}, JSON.stringify({ env: process.env, args: process.argv.slice(2) }) + "\\n");
const result = spawnSync("git", process.argv.slice(2), { stdio: "inherit" });
process.exit(result.status ?? 1);
`);
  await writeFile(preload, `import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
const original = cp.execFileSync;
cp.execFileSync = (command, args, options) => command === "git"
  ? original(process.execPath, [${JSON.stringify(child)}, ...args], options)
  : original(command, args, options);
syncBuiltinESMExports();
`);
  function invoke(helper, selected = env, instrument = true) {
    const args = helper === "change-guard.mjs"
      ? ["candidate", "--head", base, "--plan", base]
      : ["prepare"];
    const result = spawnSync(process.execPath, [...(instrument ? ["--import", pathToFileURL(preload).href] : []), path.join(scripts, helper), ...args, "--repo", repo, "--change", "example", "--base", base], { env: selected, encoding: "utf8" });
    return { status: result.status, ...JSON.parse(result.stdout || "{}"), stderr: result.stderr };
  }
  return { scratch, repo, home, env, git, base, observed, invoke };
}

for (const helper of ["change-guard.mjs", "change-workspace.mjs"]) {
  test(`${helper}: real fixtures retain replacement-ref and graft refusal`, async (t) => {
    const f = await fixture(t);
    f.git("update-ref", `refs/replace/${f.base}`, f.base);
    let result = f.invoke(helper, f.env, false);
    assert.equal(result.status, 1);
    assert.match(result.error, /replace refs/i);
    f.git("update-ref", "-d", `refs/replace/${f.base}`);
    await writeFile(path.join(f.repo, ".git/info/grafts"), `${f.base}\n`);
    result = f.invoke(helper, f.env, false);
    assert.equal(result.status, 1);
    assert.match(result.error, /graft/i);
    assert.equal(await readFile(path.join(f.repo, ".git/info/grafts"), "utf8"), `${f.base}\n`);
  });

  test(`${helper}: selected global fsmonitor command stays neutralized`, async (t) => {
    const f = await fixture(t);
    const marker = path.join(f.scratch, "fsmonitor-ran");
    const hook = path.join(f.scratch, process.platform === "win32" ? "fsmonitor.cmd" : "fsmonitor.sh");
    if (process.platform === "win32") await writeFile(hook, `@echo off\r\necho ran > "${marker}"\r\n`);
    else {
      await writeFile(hook, `#!/bin/sh\nprintf ran > '${marker}'\n`);
      await chmod(hook, 0o755);
    }
    const config = path.join(f.scratch, "global.config");
    const configuredHook = process.platform === "win32" ? hook.replaceAll("\\", "/") : hook;
    await writeFile(config, `[core]\n\tfsmonitor = ${JSON.stringify(configuredHook)}\n`);
    const result = f.invoke(helper, { ...f.env, GIT_CONFIG_GLOBAL: config }, false);
    assert.equal(result.status, 0, result.error);
    await assert.rejects(readFile(marker), { code: "ENOENT" });
  });

  test(`${helper}: every forbidden override refuses before launching a child, including empty values`, async (t) => {
    const f = await fixture(t);
    for (const name of refused) {
      for (const key of process.platform === "win32" ? [name, name.toLowerCase()] : [name]) {
        for (const value of ["", "synthetic"]) {
          const result = f.invoke(helper, { ...f.env, [key]: value });
          assert.equal(result.status, 1, `${key}=${value}`);
          assert.match(result.error, /override/i);
          await assert.rejects(readFile(f.observed), { code: "ENOENT" });
        }
      }
    }
  });

  test(`${helper}: real Git honors isolated global/system and absent/empty configuration selectors`, async (t) => {
    const f = await fixture(t);
    const ignored = path.join(f.scratch, "ignore");
    const global = path.join(f.scratch, "global.config");
    const system = path.join(f.scratch, "system.config");
    await writeFile(ignored, "synthetic-untracked.txt\n");
    const config = `[core]\n\texcludesFile = ${JSON.stringify(ignored)}\n`;
    await writeFile(global, config);
    await writeFile(system, config);
    await writeFile(path.join(f.home, ".gitconfig"), config);
    await writeFile(path.join(f.repo, "synthetic-untracked.txt"), "preserve this work\n");
    const cases = [
      { selectors: { GIT_CONFIG_GLOBAL: global, GIT_CONFIG_NOSYSTEM: "1" }, clean: true },
      { selectors: { GIT_CONFIG_NOSYSTEM: "1" }, clean: true },
      { selectors: { GIT_CONFIG_GLOBAL: "", GIT_CONFIG_NOSYSTEM: "1" }, clean: false },
      { selectors: { GIT_CONFIG_GLOBAL: gitNullDevice, GIT_CONFIG_NOSYSTEM: "1" }, clean: false },
      ...[undefined, "", "0", "1"].map((value) => ({ selectors: { GIT_CONFIG_GLOBAL: gitNullDevice, GIT_CONFIG_SYSTEM: system, ...(value === undefined ? {} : { GIT_CONFIG_NOSYSTEM: value }) }, clean: value !== "1" })),
      { selectors: { GIT_CONFIG_GLOBAL: "", GIT_CONFIG_SYSTEM: "", GIT_CONFIG_NOSYSTEM: "" }, clean: false },
    ];
    for (const entry of cases) {
      const env = { ...f.env };
      for (const name of selectors) delete env[name];
      Object.assign(env, entry.selectors);
      const result = f.invoke(helper, env);
      assert.equal(result.status, entry.clean ? 0 : 1, JSON.stringify({ ...entry, result }));
      if (!entry.clean) assert.match(result.error, /dirty|clean/i);
      const children = (await readFile(f.observed, "utf8")).trim().split("\n").map(JSON.parse);
      for (const { env: child } of children) {
        for (const name of selectors) {
          assert.equal(Object.hasOwn(child, name), Object.hasOwn(entry.selectors, name), name);
          assert.equal(child[name], entry.selectors[name], name);
        }
      }
      await rm(f.observed);
      assert.equal(await readFile(path.join(f.repo, "synthetic-untracked.txt"), "utf8"), "preserve this work\n");
    }
    for (const name of ["GIT_CONFIG_GLOBAL", "GIT_CONFIG_SYSTEM"]) {
      const invalid = path.join(f.scratch, "invalid.config");
      await writeFile(invalid, "[invalid syntax\n");
      const result = f.invoke(helper, { ...f.env, GIT_CONFIG_NOSYSTEM: "0", [name]: invalid }, false);
      assert.equal(result.status, 1, name);
      assert.match(result.error, /bad config|invalid config/i);
    }
  });

  test(`${helper}: actual Git child inherits only allowed values and fixed controls`, async (t) => {
    const f = await fixture(t);
    const env = { ...f.env, SYNTHETIC_CREDENTIAL: "must-not-reach-child", GIT_TRACE: "1", GIT_SSH_COMMAND: "synthetic-do-not-run", GIT_NO_REPLACE_OBJECTS: "0", GIT_OPTIONAL_LOCKS: "1", LC_ALL: "synthetic-locale" };
    const result = f.invoke(helper, env);
    assert.equal(result.status, 0, result.error ?? result.stderr);
    const children = (await readFile(f.observed, "utf8")).trim().split("\n").map(JSON.parse);
    assert.ok(children.length > 1);
    const expected = Object.fromEntries([...runtime, ...(process.platform === "win32" ? windows : []), ...selectors].filter((key) => Object.hasOwn(env, key)).map((key) => [key, env[key]]));
    Object.assign(expected, fixed);
    if (process.platform === "win32") Object.assign(expected, windowsProcessBaseline);
    for (const child of children) {
      assert.deepEqual(inheritedChildEnv(child.env, expected), expected);
      assert.deepEqual(child.args.slice(0, 5), ["--no-optional-locks", "-c", "core.fsmonitor=false", "-C", f.repo]);
    }
  });
}
