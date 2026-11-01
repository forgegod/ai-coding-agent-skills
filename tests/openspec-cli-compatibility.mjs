// Opt-in real upstream probe. All CLI writes stay in a disposable project/HOME.
// The child environment is an allowlist, not a sandbox: it prevents accidental inheritance of
// credentials and npm configuration, and does not restrict filesystem or network access.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
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

async function main() {
  const scratch = await mkdtemp(path.join(os.tmpdir(), "openspec-compatibility-"));
  const project = path.join(scratch, "fixture");
  const home = path.join(scratch, "home");
  const log = [];
  // Allowlisted execution environment; upstream runs with the scratch HOME, no inherited profile.
  const env = executionEnvironment(process.env, { home });
  const name = "metadata-fixture-01arz3ndektsv4rrffq69g5fav";
  const changeDir = `openspec/changes/${name}`;
  async function put(relative, content) {
    const target = path.join(project, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  function run(cwd, args, expectedStatus = 0) {
    const result = spawnSync("npm", ["exec", "--cache", path.join(scratch, "npm-cache"), "--yes", "--ignore-scripts", `--package=@fission-ai/openspec@${pinned}`, "--", "openspec", ...args], { cwd, env, encoding: "utf8", timeout: 180_000, maxBuffer: 8 * 1024 * 1024 });
    log.push({ args, status: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.message });
    assert.equal(result.status, expectedStatus, `${args.join(" ")}: ${result.error?.message ?? ""}\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
  }
  const cli = (cwd, ...args) => run(cwd, args);
  try {
    await mkdir(project, { recursive: true });
    await mkdir(home, { recursive: true });
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
    await writeFile(path.join(scratch, "probe-log.json"), JSON.stringify(log, null, 2));
    console.log(`Probe log: ${path.join(scratch, "probe-log.json")}`);
    // Retain fixture outputs and evidence, but remove the scratch profile/cache.
    await rm(home, { recursive: true, force: true });
    await rm(path.join(scratch, "npm-cache"), { recursive: true, force: true });
  }
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
