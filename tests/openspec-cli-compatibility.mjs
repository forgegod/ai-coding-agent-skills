// Opt-in real upstream probe. All CLI writes stay in a disposable project/HOME.
// The child environment is an allowlist, not a sandbox: it prevents accidental inheritance of
// credentials and npm configuration, and does not restrict filesystem or network access.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMetadata } from "../scripts/validate-openspec-metadata.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const pinned = "1.16.0";
const win32Names = ["SystemRoot", "WINDIR", "ComSpec", "PATHEXT"];

// Minimal platform execution allowlist plus scratch HOME/XDG/telemetry. Nothing else is inherited:
// credentials, NPM_TOKEN-style variables, npm_config_* and NODE_OPTIONS must not reach the child.
export function executionEnvironment(source, { home, platform = process.platform } = {}) {
  assert.ok(home, "executionEnvironment requires a scratch home");
  const env = { HOME: home, XDG_CONFIG_HOME: path.join(home, ".config"), OPENSPEC_TELEMETRY: "0" };
  if (platform === "win32") Object.assign(env, {
    USERPROFILE: home,
    APPDATA: path.join(home, "AppData", "Roaming"),
    LOCALAPPDATA: path.join(home, "AppData", "Local"),
  });
  for (const name of ["PATH", "TMPDIR", "TMP", "TEMP", ...(platform === "win32" ? win32Names : [])]) {
    if (typeof source[name] === "string") env[name] = source[name];
  }
  return env;
}

const header = (artifact, extra = "", name) => `---\nmetadata_version: 1\nartifact: ${artifact}\n${artifact === "spec" ? "" : `change: ${name}\n`}${extra}---\n`;

// Upstream core has six workflows. This does not redefine this repository's
// seven-workflow prerequisite inventory (which also requires verification).
const coreSkills = [
  "openspec-propose", "openspec-explore", "openspec-apply-change",
  "openspec-update-change", "openspec-sync-specs", "openspec-archive-change",
].sort();
const coreCommands = ["propose.md", "explore.md", "apply.md", "update.md", "sync.md", "archive.md"].sort();
const requiredCoreFiles = [
  ...coreSkills.map((name) => `.claude/skills/${name}/SKILL.md`),
  ...coreCommands.map((name) => `.claude/commands/opsx/${name}`),
].sort();
const forbiddenReferences = [
  "/openspec-new-change", "/openspec-continue-change", "/openspec-ff-change",
  "/openspec-bulk-archive-change", "/openspec-verify-change", "/openspec-onboard",
  "/opsx:new", "/opsx:continue", "/opsx:ff", "/opsx:bulk-archive", "/opsx:verify", "/opsx:onboard",
  "/openspec-new", "/openspec-continue", "/openspec-ff", "/openspec-bulk-archive", "/openspec-verify",
];

function assertCoreInventory(skills, commands) {
  assert.deepEqual([...skills].sort(), coreSkills, "core skill inventory");
  assert.deepEqual([...commands].sort(), coreCommands, "core command inventory");
}

function assertCoreReferences(relative, content) {
  // Tokenize first so ordinary words, native CLI fallbacks and longer unrelated
  // names are not banned. Hyphenated variants of omitted workflows remain banned.
  const tokens = content.matchAll(/(?<![\w/-])(?:\/?openspec-[\w-]+|\/opsx:[\w-]+)/g);
  for (const [token] of tokens) {
    const invocation = token.startsWith("/") ? token : `/${token}`;
    assert.ok(!forbiddenReferences.some((forbidden) => invocation === forbidden || invocation.startsWith(`${forbidden}-`)), `${relative}: forbidden optional workflow reference ${token}`);
  }
}

async function collectCoreFiles(project) {
  async function directory(relative) {
    const stat = await lstat(path.join(project, relative));
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), `${relative}: expected a real directory`);
    return readdir(path.join(project, relative), { withFileTypes: true });
  }
  await directory(".claude");
  const skills = await directory(".claude/skills");
  const commandsRoot = await directory(".claude/commands");
  assert.deepEqual(commandsRoot.map((entry) => entry.name).sort(), ["opsx"], "core command namespace inventory");
  const commands = await directory(".claude/commands/opsx");
  assertCoreInventory(skills.map((entry) => entry.name), commands.filter((entry) => !entry.isDirectory()).map((entry) => entry.name));
  for (const skill of coreSkills) await directory(`.claude/skills/${skill}`);
  const files = new Map();
  async function walk(relative) {
    for (const entry of await directory(relative)) {
      const child = `${relative}/${entry.name}`;
      const stat = await lstat(path.join(project, child));
      assert.ok(!stat.isSymbolicLink(), `${child}: symlinks are not generated regular files`);
      if (stat.isDirectory()) await walk(child);
      else {
        assert.ok(stat.isFile(), `${child}: expected a regular file`);
        const content = await readFile(path.join(project, child), "utf8");
        assert.ok(content.trim().length > 0, `${child}: empty generated file`);
        files.set(child, content);
      }
    }
  }
  await walk(".claude/skills");
  await walk(".claude/commands");
  for (const relative of requiredCoreFiles) assert.ok(files.has(relative), `${relative}: missing required regular file from scan`);
  return { skills: skills.map((entry) => entry.name).sort(), commands: commands.filter((entry) => !entry.isDirectory()).map((entry) => entry.name).sort(), files };
}

function referenceControls() {
  const harmless = "Use /openspec-propose, /openspec-explore, /openspec-apply-change, /openspec-update-change, /openspec-sync-specs and /openspec-archive-change.\n"
    + "Use /opsx:propose /opsx:explore /opsx:apply /opsx:update /opsx:sync /opsx:archive.\n"
    + "Continue, verify, onboard, new and bulk-archive are ordinary words; run openspec new change or openspec continue.\n"
    + "Unrelated names /openspec-newish and /opsx:verifyish are not omitted workflows.\n";
  const surfaces = [".claude/skills/openspec-propose/SKILL.md", ".claude/commands/opsx/propose.md"];
  for (const relative of surfaces) {
    assert.doesNotThrow(() => assertCoreReferences(relative, harmless));
    for (const token of forbiddenReferences) {
      for (const insertion of [`Next: ${token}.`, `Next:${token}`, `\`\`\`text\n${token}\n\`\`\``, `(${token})`, `${token}-extra`]) {
        assert.throws(() => assertCoreReferences(relative, `${harmless}\n${insertion}`), (error) => error instanceof assert.AssertionError && error.message.includes(relative) && error.message.includes(token));
      }
    }
    for (const token of forbiddenReferences.filter((token) => token.startsWith("/openspec-"))) {
      assert.throws(() => assertCoreReferences(relative, token.slice(1)), { code: "ERR_ASSERTION" });
    }
  }
  console.log(`PASS: ${forbiddenReferences.length} forbidden spellings on both surfaces, prose/fenced/punctuation/suffix controls, bare skill names and harmless core/CLI references.`);
}

async function inventoryControls(scratch) {
  assertCoreInventory(coreSkills, coreCommands);
  for (const [skills, commands] of [
    [[], coreCommands], [coreSkills, []],
    [[...coreSkills, "openspec-verify-change"], coreCommands],
    [coreSkills, [...coreCommands, "verify.md"]],
    [[...coreSkills, coreSkills[0]], coreCommands],
    [coreSkills, [...coreCommands, coreCommands[0]]],
    ...coreSkills.map((name) => [coreSkills.filter((skill) => skill !== name), coreCommands]),
    ...coreCommands.map((name) => [coreSkills, coreCommands.filter((command) => command !== name)]),
  ]) assert.throws(() => assertCoreInventory(skills, commands), { code: "ERR_ASSERTION" });

  // Handwritten controls are deliberately separate from the upstream fixture.
  const project = path.join(scratch, "inventory-controls");
  const supportFiles = [".claude/skills/openspec-propose/references/nested/help.txt", ".claude/commands/opsx/support/nested/help.txt"];
  const expected = [...requiredCoreFiles, ...supportFiles].sort();
  const put = async (relative, content = "Use /opsx:propose or openspec new change.\n") => {
    await mkdir(path.dirname(path.join(project, relative)), { recursive: true });
    await writeFile(path.join(project, relative), content);
  };
  try {
    for (const relative of expected) await put(relative);
    const valid = await collectCoreFiles(project);
    assert.deepEqual([...valid.files.keys()].sort(), expected, "recursive scan must include non-Markdown nested support files");
    for (const [relative, content] of valid.files) assertCoreReferences(relative, content);
    for (const relative of supportFiles) {
      await put(relative, "/opsx:verify\n");
      const mutated = await collectCoreFiles(project);
      assert.throws(() => {
        for (const [file, content] of mutated.files) assertCoreReferences(file, content);
      }, (error) => error instanceof assert.AssertionError && error.message.includes(relative) && error.message.includes("/opsx:verify"));
      await put(relative);
    }
    for (const relative of requiredCoreFiles) {
      await rm(path.join(project, relative));
      await assert.rejects(collectCoreFiles(project), { code: "ERR_ASSERTION" });
      await put(relative, " \n");
      await assert.rejects(collectCoreFiles(project), /empty generated file/);
      await rm(path.join(project, relative));
      await mkdir(path.join(project, relative));
      await assert.rejects(collectCoreFiles(project), { code: "ERR_ASSERTION" });
      await rm(path.join(project, relative), { recursive: true });
      await put(relative);
    }
    for (const relative of [".claude/skills/openspec-onboard/SKILL.md", ".claude/commands/opsx/onboard.md", ".claude/commands/extra.md"]) {
      await put(relative);
      await assert.rejects(collectCoreFiles(project), { code: "ERR_ASSERTION" });
      await rm(path.join(project, relative.includes("/skills/") ? ".claude/skills/openspec-onboard" : relative), { recursive: true });
    }
    // Directory junctions avoid requiring Windows file-symlink privileges.
    // This exercises the actual platform, not a simulated native filesystem.
    const target = path.join(scratch, "inventory-link-target");
    await mkdir(target);
    const link = path.join(project, ".claude/skills/openspec-propose/references/unsafe");
    await symlink(target, link, process.platform === "win32" ? "junction" : "dir");
    await assert.rejects(collectCoreFiles(project), /symlink/);
    await rm(link);
    if (process.platform !== "win32") {
      const file = path.join(project, requiredCoreFiles[0]);
      await rm(file);
      await symlink(path.join(project, supportFiles[0]), file);
      await assert.rejects(collectCoreFiles(project), /symlink/);
      await rm(file);
      await put(requiredCoreFiles[0]);
    }
    for (const relative of [".claude/commands/opsx", ".claude/commands", ".claude/skills", ".claude"]) {
      const absolute = path.join(project, relative);
      await rm(absolute, { recursive: true });
      await assert.rejects(collectCoreFiles(project), (error) => error.code === "ENOENT" || (error instanceof assert.AssertionError && error.message.includes("core command namespace inventory")));
      await mkdir(absolute);
      await assert.rejects(collectCoreFiles(project), (error) => error.code === "ERR_ASSERTION" || error.code === "ENOENT");
      await rm(absolute, { recursive: true });
      await writeFile(absolute, "not a directory");
      await assert.rejects(collectCoreFiles(project), /expected a real directory/);
      await rm(absolute);
      await symlink(target, absolute, process.platform === "win32" ? "junction" : "dir");
      await assert.rejects(collectCoreFiles(project), /expected a real directory/);
      await rm(absolute);
      for (const file of expected) await put(file);
    }
    console.log(`PASS: exact inventories; missing/extra/duplicate/empty/non-regular/symlink controls; recursive support-file scans (${process.platform}).`);
  } finally {
    await rm(project, { recursive: true, force: true });
    await rm(path.join(scratch, "inventory-link-target"), { recursive: true, force: true });
  }
}

async function retainLogAndCleanup(logPath, log, disposable) {
  try {
    await writeFile(logPath, JSON.stringify(log, null, 2));
  } finally {
    // Attempt every removal even if one fails; log-write failures cannot skip it.
    const results = await Promise.allSettled(disposable.map((directory) => rm(directory, { recursive: true, force: true })));
    for (const result of results) if (result.status === "rejected") throw result.reason;
  }
}

async function cleanupControls(scratch) {
  const control = path.join(scratch, "cleanup-controls");
  try {
    for (const workFails of [false, true]) for (const logFails of [false, true]) {
      const directory = path.join(control, `work-${workFails}-log-${logFails}`);
      const disposable = ["home", "core-home", "npm-cache"].map((name) => path.join(directory, name));
      for (const target of disposable) {
        await mkdir(target, { recursive: true });
        await writeFile(path.join(target, "synthetic-state"), "scratch only");
      }
      const retained = path.join(directory, "generated.txt");
      await writeFile(retained, "retained fixture");
      const logPath = path.join(directory, "probe-log.json");
      if (logFails) await mkdir(logPath);
      const log = [{ args: ["synthetic-control"], status: workFails ? 1 : 0, stdout: "raw stdout", stderr: "raw stderr", error: "synthetic error" }];
      const failure = new Error("synthetic work failure");
      const exercise = async () => {
        try {
          if (workFails) throw failure;
        } finally {
          await retainLogAndCleanup(logPath, log, disposable);
        }
      };
      if (logFails) await assert.rejects(exercise(), (error) => ["EISDIR", "EPERM", "EACCES"].includes(error.code));
      else if (workFails) await assert.rejects(exercise(), (error) => error === failure);
      else await exercise();
      for (const target of disposable) await assert.rejects(lstat(target), { code: "ENOENT" });
      assert.equal(await readFile(retained, "utf8"), "retained fixture");
      if (!logFails) assert.deepEqual(JSON.parse(await readFile(logPath, "utf8")), log);
    }
    console.log("PASS: cleanup after success, work failure, log-write failure and combined failure; raw logs and fixtures retained when writable.");
  } finally {
    await rm(control, { recursive: true, force: true });
  }
}

async function isolationControls(scratch, env, coreEnv, log) {
  for (const name of ["HOME", "XDG_CONFIG_HOME"]) {
    assert.notEqual(coreEnv[name], env[name], `${name}: fixtures must not share a profile`);
    for (const value of [env[name], coreEnv[name]]) {
      const relative = path.relative(scratch, value);
      assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative), `${name}: must be inside scratch`);
    }
  }
  assert.equal(coreEnv.OPENSPEC_TELEMETRY, "0");
  const contaminants = {
    HERMES_PROFILE: "synthetic-profile", CLAUDE_CONFIG_DIR: "/synthetic/claude", CODEX_HOME: "/synthetic/codex",
    NPM_TOKEN: "synthetic-token", GH_TOKEN: "synthetic-token", AWS_SECRET_ACCESS_KEY: "synthetic-key", OPENAI_API_KEY: "synthetic-key",
    npm_config_registry: "https://registry.invalid", npm_config_userconfig: "/synthetic/.npmrc", NPM_CONFIG_CACHE: "/synthetic/cache",
    NODE_OPTIONS: "--require /synthetic/must-not-load.cjs",
  };
  const source = {
    HOME: "/synthetic/host-home", XDG_CONFIG_HOME: "/synthetic/host-config", OPENSPEC_TELEMETRY: "1",
    USERPROFILE: "C:\\synthetic", APPDATA: "C:\\synthetic\\Roaming", LOCALAPPDATA: "C:\\synthetic\\Local",
    PATH: "/synthetic/bin", TMPDIR: scratch, TMP: scratch, TEMP: scratch,
    SystemRoot: "C:\\Windows", WINDIR: "C:\\Windows", ComSpec: "C:\\Windows\\cmd.exe", PATHEXT: ".EXE;.CMD",
    ...contaminants,
  };
  for (const platform of ["linux", "win32"]) {
    const isolated = executionEnvironment(source, { home: coreEnv.HOME, platform });
    const expected = { HOME: coreEnv.HOME, XDG_CONFIG_HOME: path.join(coreEnv.HOME, ".config"), OPENSPEC_TELEMETRY: "0", PATH: source.PATH, TMPDIR: scratch, TMP: scratch, TEMP: scratch };
    if (platform === "win32") {
      Object.assign(expected, { USERPROFILE: coreEnv.HOME, APPDATA: path.join(coreEnv.HOME, "AppData", "Roaming"), LOCALAPPDATA: path.join(coreEnv.HOME, "AppData", "Local") });
      for (const name of win32Names) expected[name] = source[name];
    }
    assert.deepEqual(isolated, expected, `${platform}: constructor contract (not native execution)`);
  }
  // Only allowlisted real execution paths are used; contaminant values are synthetic.
  const childSource = { ...source };
  for (const name of ["PATH", "TMPDIR", "TMP", "TEMP", ...win32Names]) {
    delete childSource[name];
    if (Object.hasOwn(coreEnv, name)) childSource[name] = coreEnv[name];
  }
  const childEnv = executionEnvironment(childSource, { home: coreEnv.HOME });
  assert.deepEqual(childEnv, coreEnv, "synthetic host contamination must not change the native fixture environment");
  const before = (await readdir(scratch, { recursive: true })).sort();
  const args = ["--input-type=module", "-e", `const module = await import(${JSON.stringify(import.meta.url)}); if (Object.keys(module).join() !== 'executionEnvironment') throw new Error('export contract'); process.stdout.write(JSON.stringify(process.env));`];
  const child = spawnSync(process.execPath, args, { cwd: scratch, env: childEnv, encoding: "utf8", timeout: 10_000, maxBuffer: 1024 * 1024 });
  log.push({ executable: process.execPath, cwd: scratch, home: childEnv.HOME, args, status: child.status, stdout: child.stdout, stderr: child.stderr, error: child.error?.message });
  assert.equal(child.status, 0, `${child.error?.message ?? ""}\n${child.stderr}`);
  const observed = JSON.parse(child.stdout);
  for (const [name, value] of Object.entries(coreEnv)) assert.equal(observed[name], value, `child ${name}`);
  for (const name of Object.keys(contaminants)) assert.equal(Object.hasOwn(observed, name), false, `child must omit ${name}`);
  if (process.platform !== "win32") for (const name of ["USERPROFILE", "APPDATA", "LOCALAPPDATA", ...win32Names]) assert.equal(Object.hasOwn(observed, name), false, `child must omit ${name}`);
  assert.deepEqual((await readdir(scratch, { recursive: true })).sort(), before, "import must not create fixtures or invoke npm");
  console.log(`PASS: synthetic contamination filtered; scratch HOME/XDG and telemetry observed in ${process.platform} child; import has no probe side effects.`);
}

async function main() {
  const scratch = await mkdtemp(path.join(os.tmpdir(), "openspec-compatibility-"));
  const project = path.join(scratch, "fixture");
  const home = path.join(scratch, "home");
  const coreProject = path.join(scratch, "core-fixture");
  const coreHome = path.join(scratch, "core-home");
  const log = [];
  // Allowlisted execution environment; upstream runs with the scratch HOME, no inherited profile.
  const env = executionEnvironment(process.env, { home });
  const coreEnv = executionEnvironment(process.env, { home: coreHome });
  const name = "metadata-fixture-01arz3ndektsv4rrffq69g5fav";
  const changeDir = `openspec/changes/${name}`;
  async function put(relative, content) {
    const target = path.join(project, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  function run(cwd, args, expectedStatus = 0, executionEnv = env) {
    const result = spawnSync("npm", ["exec", "--cache", path.join(scratch, "npm-cache"), "--yes", "--ignore-scripts", `--package=@fission-ai/openspec@${pinned}`, "--", "openspec", ...args], { cwd, env: executionEnv, input: "", stdio: "pipe", encoding: "utf8", timeout: 180_000, maxBuffer: 8 * 1024 * 1024 });
    log.push({ cwd, home: executionEnv.HOME, args, status: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.message });
    assert.equal(result.status, expectedStatus, `${args.join(" ")}: ${result.error?.message ?? ""}\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
  }
  const cli = (cwd, ...args) => run(cwd, args);
  try {
    referenceControls();
    await inventoryControls(scratch);
    await cleanupControls(scratch);
    await mkdir(project, { recursive: true });
    await mkdir(home, { recursive: true });
    await mkdir(coreProject);
    await mkdir(coreHome);
    await isolationControls(scratch, env, coreEnv, log);
    const config = path.join(coreEnv.XDG_CONFIG_HOME, "openspec/config.json");
    await mkdir(path.dirname(config), { recursive: true });
    await writeFile(config, JSON.stringify({ profile: "core", delivery: "both" }));
    assert.deepEqual(await readdir(coreProject), [], "core init must start in an independent empty project");
    assert.equal(run(coreProject, ["--version"], 0, coreEnv).trim(), pinned);
    run(coreProject, ["init", "--tools", "claude", "--profile", "core", "--no-animation"], 0, coreEnv);
    const core = await collectCoreFiles(coreProject);
    const observed = { skills: core.skills, commands: core.commands, files: [...core.files.keys()].sort() };
    await writeFile(path.join(scratch, "core-inventory.json"), JSON.stringify(observed, null, 2));
    for (const [relative, content] of core.files) assertCoreReferences(relative, content);
    for (const relative of [".claude/skills/openspec-propose/SKILL.md", ".claude/commands/opsx/propose.md"]) {
      const original = core.files.get(relative);
      const mutated = `${original}\n\`\`\`text\n/openspec-verify-change\n\`\`\`\n`;
      assert.throws(() => assertCoreReferences(relative, mutated), (error) => error instanceof assert.AssertionError && error.message.includes(relative) && error.message.includes("/openspec-verify-change"));
      assert.equal(await readFile(path.join(coreProject, relative), "utf8"), original, "in-memory negative controls must not mutate generated evidence");
    }
    console.log(`PASS: pinned OpenSpec ${pinned} Claude core/both fixture, exhaustive scan and in-memory generated skill/command mutations. Observed inventory:\n${JSON.stringify(observed, null, 2)}`);
    assert.equal(cli(project, "--version").trim(), pinned);
    // Validate actual artifacts in a copy, without changing their open tasks.
    const actual = path.join(scratch, "repository-copy");
    await mkdir(actual);
    await cp(path.join(root, "openspec"), path.join(actual, "openspec"), { recursive: true });
    cli(actual, "validate", "--all", "--strict", "--json", "--no-interactive");
    await validateMetadata({ root: actual });

    await put("openspec/config.yaml", "schema: spec-driven\n");
    cli(project, "new", "change", name, "--json");
    const artifacts = {
      "proposal.md": header("proposal", "github_issue: https://github.com/example/project/issues/40\n", name) + "# Proposal\n\n## Why\nProve frontmatter interoperability using synthetic records only.\n\n## What Changes\n- Add a new capability and extend an existing capability.\n\n## Capabilities\n\n### New Capabilities\n- `fresh`: Fixture capability.\n\n### Modified Capabilities\n- `existing`: Additional fixture behavior.\n\n## Impact\nScratch files only; no external writes.\n",
      "design.md": header("design", "", name) + "# Design\n\n## Context\nSynthetic compatibility probe.\n\n## Decisions\nKeep identity outside behavior requirements.\n",
      "tasks.md": header("tasks", "", name) + "# Tasks\n\n## 1. Fixture\n- [ ] 1.1 Verify metadata interoperability\n",
      "specs/existing/spec.md": "## ADDED Requirements\n\n### Requirement: Additional behavior\nThe system SHALL retain metadata while extending the capability.\n\n#### Scenario: Extension\n- **WHEN** the extension is requested\n- **THEN** the additional behavior is available\n",
      "specs/fresh/spec.md": "## Purpose\nProvide an isolated fixture response for checking metadata interoperability across native spec creation and archival.\n\n## ADDED Requirements\n\n### Requirement: Fresh behavior\nThe system SHALL provide the new fixture behavior.\n\n#### Scenario: Request\n- **WHEN** the new behavior is requested\n- **THEN** the fixture responds\n",
    };
    const existingHeader = header("spec", "capability: existing\n", name);
    await put("openspec/specs/existing/spec.md", existingHeader + "# Existing\n\n## Purpose\nProvide stable baseline behavior for a synthetic metadata interoperability probe.\n\n## Requirements\n\n### Requirement: Baseline behavior\nThe system SHALL retain its baseline behavior.\n\n#### Scenario: Baseline\n- **WHEN** baseline behavior is requested\n- **THEN** it remains available\n");
    for (const [relative, content] of Object.entries(artifacts)) await put(`${changeDir}/${relative}`, content);
    await validateMetadata({ root: project, requireIssue: true });
    cli(project, "validate", name, "--strict", "--json");
    const deltaPath = `${changeDir}/specs/existing/spec.md`;
    await put(deltaPath, header("delta-spec", "capability: existing\n", name) + artifacts["specs/existing/spec.md"]);
    const rejected = run(project, ["validate", name, "--strict", "--json"], 1);
    assert.match(rejected, /Text above the first/);
    await put(deltaPath, artifacts["specs/existing/spec.md"]);
    const apply = cli(project, "instructions", "apply", "--change", name, "--json");
    const pending = JSON.parse(apply);
    assert.deepEqual(pending.progress, { total: 1, complete: 0, remaining: 1 });
    assert.equal(pending.state, "ready");
    assert.equal(pending.tasks.length, 1);
    assert.equal(pending.tasks[0].description, "1.1 Verify metadata interoperability");
    assert.equal(pending.tasks[0].done, false);
    artifacts["tasks.md"] = artifacts["tasks.md"].replace("- [ ]", "- [x]");
    await put(`${changeDir}/tasks.md`, artifacts["tasks.md"]);
    // This completes only a synthetic task, never a real change task.
    const completed = cli(project, "instructions", "apply", "--change", name, "--json");
    const done = JSON.parse(completed);
    assert.deepEqual(done.progress, { total: 1, complete: 1, remaining: 0 });
    assert.equal(done.state, "all_done");
    assert.equal(done.tasks.length, 1);
    assert.equal(done.tasks[0].done, true);
    cli(project, "archive", name, "--yes", "--json");
    const archives = await readdir(path.join(project, "openspec/changes/archive"));
    assert.equal(archives.length, 1);
    assert.match(archives[0], new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${name}$`));
    for (const [relative, content] of Object.entries(artifacts)) assert.equal(await readFile(path.join(project, "openspec/changes/archive", archives[0], relative), "utf8"), content);
    assert.equal((await readdir(path.join(project, "openspec/changes"))).includes(name), false);
    const existing = await readFile(path.join(project, "openspec/specs/existing/spec.md"), "utf8");
    assert.ok(existing.startsWith(existingHeader), "Upstream must preserve existing current-spec metadata");
    assert.match(existing, /### Requirement: Baseline behavior/);
    assert.match(existing, /### Requirement: Additional behavior/);
    const freshPath = "openspec/specs/fresh/spec.md";
    const fresh = await readFile(path.join(project, freshPath), "utf8");
    assert.match(fresh, /### Requirement: Fresh behavior/);
    assert.doesNotMatch(fresh, /artifact: delta-spec|change:|github_issue:/);
    // Native archive creates a current spec, not project-specific metadata.
    if (!fresh.startsWith("---\n")) {
      await assert.rejects(validateMetadata({ root: project }), /missing YAML frontmatter/);
      await put(freshPath, header("spec", "capability: fresh\n", name) + fresh);
      console.log("New current spec required a project-owned identity header after native spec update.");
    }
    const inventory = await validateMetadata({ root: project, requireIssue: true });
    assert.equal(inventory.files.length, 7);
    cli(project, "validate", "--all", "--strict", "--json", "--no-interactive");
    cli(project, "validate", "--archived", "--json", "--no-interactive");
    console.log("PASS: pinned OpenSpec validation, task discovery, spec updates, byte-preserving archive and post-sync metadata validation.");
  } finally {
    // Retain fixture outputs and evidence, but remove both scratch profiles/cache,
    // including when CLI/assertion failure or raw-log write failure unwinds main.
    await retainLogAndCleanup(path.join(scratch, "probe-log.json"), log, [home, coreHome, path.join(scratch, "npm-cache")]);
    console.log(`Probe log: ${path.join(scratch, "probe-log.json")}`);
  }
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
