import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const script = path.join(root, "scripts/validate-openspec-metadata.mjs");
const change = "example-01arz3ndektsv4rrffq69g5fav";
const proposalPath = `openspec/changes/${change}/proposal.md`;
const header = (artifact, extra = "") => `---\nmetadata_version: 1\nartifact: ${artifact}\n${artifact === "spec" ? "" : `change: ${change}\n`}${extra}---\n`;
const proposal = header("proposal", "github_issue: https://github.com/example/project/issues/40\n") + "# Proposal\n\n## Why\nA synthetic fixture.\n";
function invoke(repo, ...args) {
  return spawnSync(process.execPath, [script, "--root", repo, ...args], { encoding: "utf8" });
}
async function fixture(t) {
  const repo = await mkdtemp(path.join(os.tmpdir(), "openspec-metadata-"));
  t.after(() => rm(repo, { recursive: true, force: true }));
  const files = {
    [proposalPath]: proposal,
    [`openspec/changes/${change}/design.md`]: header("design") + "# Design\nA fixture.\n",
    [`openspec/changes/${change}/tasks.md`]: header("tasks") + "# Tasks\n- [ ] 1.1 Verify\n",
    [`openspec/changes/${change}/specs/nested/example/spec.md`]: "## ADDED Requirements\n",
    "openspec/specs/nested/example/spec.md": header("spec", "capability: nested/example\n") + "# Example\n",
  };
  for (const [relative, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(repo, relative)), { recursive: true });
    await writeFile(path.join(repo, relative), content);
  }
  return { repo, files };
}

test("repository native artifacts follow the metadata contract", () => {
  const result = invoke(root);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).files.length > 0);
});

test("metadata checker validates every native artifact without writes", async (t) => {
  const { repo, files } = await fixture(t);
  const result = invoke(repo, "--require-issue");
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.ok, true);
  assert.equal(output.files.length, Object.keys(files).length);
  for (const [relative, content] of Object.entries(files)) assert.equal(await readFile(path.join(repo, relative), "utf8"), content);
});

test("draft issue null is explicit and approval readiness requires a real URL shape", async (t) => {
  const { repo } = await fixture(t);
  await writeFile(path.join(repo, proposalPath), proposal.replace("https://github.com/example/project/issues/40", "null"));
  assert.equal(invoke(repo).status, 0);
  const pending = invoke(repo, "--require-issue");
  assert.equal(pending.status, 1);
  assert.match(pending.stderr, /github_issue.*required/);
});

test("archive moves retain exact identity and remain indexed at their new paths", async (t) => {
  const { repo, files } = await fixture(t);
  await writeFile(path.join(repo, proposalPath), proposal.replace("https://github.com/example/project/issues/40", "null"));
  const archived = `openspec/changes/archive/2026-10-30-${change}`;
  await mkdir(path.join(repo, "openspec/changes/archive"));
  await rename(path.join(repo, `openspec/changes/${change}`), path.join(repo, archived));
  const result = invoke(repo, "--require-issue");
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.files.length, Object.keys(files).length);
  assert.ok(output.files.includes(`${archived}/proposal.md`));
  await writeFile(path.join(repo, archived, "proposal.md"), proposal.replace(`change: ${change}`, `change: 2026-10-30-${change}`));
  assert.equal(invoke(repo).status, 1);
});

test("native artifacts directly under archive are invalid layouts, not a change named archive", async (t) => {
  const { repo } = await fixture(t);
  await mkdir(path.join(repo, "openspec/changes/archive"), { recursive: true });
  const stray = {
    "proposal.md": header("proposal", "github_issue: null\n") + "# Proposal\nA stray archive-root artifact.\n",
    "design.md": header("design") + "# Design\nA stray archive-root artifact.\n",
    "tasks.md": header("tasks") + "# Tasks\n- [ ] 1.1 Stray\n",
  };
  for (const [name, content] of Object.entries(stray)) {
    const target = path.join(repo, "openspec/changes/archive", name);
    await writeFile(target, content);
    const result = invoke(repo);
    assert.equal(result.status, 1, `${name} directly under archive must not be accepted`);
    assert.match(result.stderr, /archive\/[a-z]+\.md.*(?:archive layout|dated change)/, result.stderr);
    await rm(target);
  }
  // Supporting Markdown outside native artifact paths is not governed by this schema.
  const nested = path.join(repo, "openspec/changes/archive/2026-10-30-other-change/notes/proposal.md");
  await mkdir(path.dirname(nested), { recursive: true });
  await writeFile(nested, stray["proposal.md"]);
  const deep = invoke(repo);
  assert.equal(deep.status, 0, deep.stderr);
  // A dated archive entry that is a file rather than a directory is malformed too.
  await rm(path.join(repo, "openspec/changes/archive"), { recursive: true, force: true });
  await mkdir(path.join(repo, "openspec/changes/archive"));
  await writeFile(path.join(repo, "openspec/changes/archive/2026-10-30-stray"), "not a directory\n");
  const truncated = invoke(repo);
  assert.equal(truncated.status, 1);
  assert.match(truncated.stderr, /archive layout/);
});

test("one change identity may exist in exactly one active or dated archive location", async (t) => {
  const { repo } = await fixture(t);
  const archive = "openspec/changes/archive";
  await mkdir(path.join(repo, archive), { recursive: true });
  // Same identity active and archived is ambiguous, so both are refused.
  await cp(path.join(repo, `openspec/changes/${change}`), path.join(repo, archive, `2026-10-30-${change}`), { recursive: true });
  let result = invoke(repo);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate change identity/);
  // Two dated archives of the same identity are refused as well.
  await rm(path.join(repo, `openspec/changes/${change}`), { recursive: true });
  await cp(path.join(repo, archive, `2026-10-30-${change}`), path.join(repo, archive, `2026-10-29-${change}`), { recursive: true });
  result = invoke(repo);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate change identity/);
  await rm(path.join(repo, archive, `2026-10-29-${change}`), { recursive: true });
  // Empty duplicate directories still claim the identity, so they are refused too.
  await mkdir(path.join(repo, `openspec/changes/${change}`));
  result = invoke(repo);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate change identity/);
  await rm(path.join(repo, `openspec/changes/${change}`), { recursive: true });
  await mkdir(path.join(repo, archive, `2026-10-28-${change}`));
  result = invoke(repo);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate change identity/);
  await rm(path.join(repo, archive, `2026-10-28-${change}`), { recursive: true });
  assert.equal(invoke(repo, "--require-issue").status, 0, "a single dated archive move remains valid");
});

test("legacy unsuffixed change names stay valid while active and after an archive move", async (t) => {
  const { repo } = await fixture(t);
  const legacy = "legacy-change";
  const legacyHeader = (artifact, extra = "") => `---\nmetadata_version: 1\nartifact: ${artifact}\n${artifact === "spec" ? "" : `change: ${legacy}\n`}${extra}---\n`;
  const legacyDir = `openspec/changes/${legacy}`;
  await mkdir(path.join(repo, legacyDir, "specs/legacy"), { recursive: true });
  await writeFile(path.join(repo, legacyDir, "proposal.md"), legacyHeader("proposal", "github_issue: https://github.com/example/project/issues/41\n") + "# Proposal\nLegacy name.\n");
  await writeFile(path.join(repo, legacyDir, "design.md"), legacyHeader("design") + "# Design\nLegacy.\n");
  await writeFile(path.join(repo, legacyDir, "tasks.md"), legacyHeader("tasks") + "# Tasks\n- [ ] 1.1 Legacy\n");
  await writeFile(path.join(repo, legacyDir, "specs/legacy/spec.md"), "## ADDED Requirements\n");
  assert.equal(invoke(repo, "--require-issue").status, 0);
  await mkdir(path.join(repo, "openspec/changes/archive"), { recursive: true });
  await rename(path.join(repo, legacyDir), path.join(repo, "openspec/changes/archive/2026-10-30-legacy-change"));
  const archived = invoke(repo, "--require-issue");
  assert.equal(archived.status, 0, archived.stderr);
  assert.ok(JSON.parse(archived.stdout).files.includes("openspec/changes/archive/2026-10-30-legacy-change/proposal.md"));
});

test("opt-in upstream probe gives npm only an allowlisted execution environment", async () => {
  const { executionEnvironment } = await import("./openspec-cli-compatibility.mjs");
  const home = path.join(os.tmpdir(), "probe-home");
  const inherited = {
    PATH: "/usr/local/bin:/usr/bin", TMPDIR: "/tmp", TMP: "/tmp", TEMP: "/tmp",
    SystemRoot: "C:\\Windows", WINDIR: "C:\\Windows", ComSpec: "C:\\Windows\\cmd.exe", PATHEXT: ".EXE;.CMD",
    USERPROFILE: "C:\\Users\\probe", APPDATA: "C:\\Users\\probe\\AppData\\Roaming", LOCALAPPDATA: "C:\\Users\\probe\\AppData\\Local",
    NPM_TOKEN: "secret", GH_TOKEN: "secret", AWS_SECRET_ACCESS_KEY: "secret", OPENAI_API_KEY: "secret",
    npm_config_registry: "https://registry.evil.test", npm_config_userconfig: "/home/real/.npmrc",
    NODE_OPTIONS: "--require /tmp/payload.mjs", HERMES_PROFILE: "default",
  };
  const posixNames = ["HOME", "XDG_CONFIG_HOME", "OPENSPEC_TELEMETRY", "PATH", "TMPDIR", "TMP", "TEMP"];
  const win32Names = ["SystemRoot", "WINDIR", "ComSpec", "PATHEXT", "USERPROFILE", "APPDATA", "LOCALAPPDATA"];
  const posix = executionEnvironment(inherited, { home, platform: "linux" });
  assert.deepEqual(Object.keys(posix).sort(), posixNames.slice().sort());
  assert.equal(posix.HOME, home);
  assert.equal(posix.XDG_CONFIG_HOME, path.join(home, ".config"));
  assert.equal(posix.OPENSPEC_TELEMETRY, "0");
  assert.equal(posix.PATH, inherited.PATH);
  const windows = executionEnvironment(inherited, { home, platform: "win32" });
  assert.deepEqual(Object.keys(windows).sort(), [...posixNames, ...win32Names].sort(), "Windows needs only its own platform execution variables");
  assert.equal(windows.USERPROFILE, home, "Windows user profile must stay in scratch");
  assert.equal(windows.APPDATA, path.join(home, "AppData", "Roaming"));
  assert.equal(windows.LOCALAPPDATA, path.join(home, "AppData", "Local"));
  for (const secret of ["NPM_TOKEN", "GH_TOKEN", "AWS_SECRET_ACCESS_KEY", "OPENAI_API_KEY", "npm_config_registry", "npm_config_userconfig", "NODE_OPTIONS", "HERMES_PROFILE"]) {
    assert.equal(secret in posix, false, `${secret} must not reach the npm child`);
    assert.equal(secret in windows, false, `${secret} must not reach the npm child`);
  }
  const minimal = executionEnvironment({ PATH: "/bin" }, { home, platform: "linux" });
  assert.deepEqual(Object.keys(minimal).sort(), ["HOME", "OPENSPEC_TELEMETRY", "PATH", "XDG_CONFIG_HOME"]);
});

test("checker fails closed on empty sources, symlinks, invalid UTF-8 and malformed paths", async (t) => {
  const { repo } = await fixture(t);
  await writeFile(path.join(repo, proposalPath), Buffer.concat([Buffer.from(proposal), Buffer.from([0xff])]));
  assert.equal(invoke(repo).status, 1, "Invalid UTF-8 must not be replaced silently");
  await rm(path.join(repo, proposalPath));
  await writeFile(path.join(repo, "outside.md"), proposal);
  await symlink(path.join(repo, "outside.md"), path.join(repo, proposalPath));
  assert.equal(invoke(repo).status, 1);
  await rm(path.join(repo, proposalPath));
  await rename(path.join(repo, `openspec/changes/${change}`), path.join(repo, "openspec/changes/Bad Name"));
  assert.equal(invoke(repo).status, 1);
  await rm(path.join(repo, "openspec"), { recursive: true });
  await mkdir(path.join(repo, "openspec"));
  assert.equal(invoke(repo).status, 1, "Empty inventory is not successful validation");
  await rm(path.join(repo, "openspec"), { recursive: true });
  assert.equal(invoke(repo).status, 1);
});

test("delta specs keep native syntax because upstream strict validation rejects frontmatter", async (t) => {
  const { repo } = await fixture(t);
  const relative = `openspec/changes/${change}/specs/nested/example/spec.md`;
  await writeFile(path.join(repo, relative), header("delta-spec", "capability: nested/example\n") + "## ADDED Requirements\n");
  const result = invoke(repo);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /delta spec.*frontmatter/);
});

test("CLI rejects duplicate options and missing values", async (t) => {
  const { repo } = await fixture(t);
  for (const args of [["--root", repo], ["--require-issue", "--require-issue"], ["--root"], ["--unknown"], ["--root", "--require-issue"]]) {
    assert.equal(invoke(repo, ...args).status, 1, args.join(" "));
  }
});

test("metadata schema rejects drift, PRs, malformed issue URLs and ambiguous YAML", async (t) => {
  const { repo } = await fixture(t);
  const mutations = [
    proposal.replace("metadata_version: 1", 'metadata_version: "1"'),
    proposal.replace("metadata_version: 1", "metadata_version: 2"),
    proposal.replace("artifact: proposal", "artifact: design"),
    proposal.replace(`change: ${change}`, "change: other"),
    proposal.replace("artifact: proposal", "artifact: proposal\nstatus: done"),
    proposal.replace("artifact: proposal", "artifact: proposal\ngithub_prs: []"),
    proposal.replace("artifact: proposal", "artifact: proposal\nartifact: design"),
    proposal.replace("artifact: proposal", "artifact: &value proposal\nextra: *value"),
    proposal.replace("artifact: proposal", "artifact: ["),
    proposal.replace(/github_issue: .+\n/, ""),
    ...["40", "[]", "false", "https://github.com/example/project/pull/40", "http://github.com/example/project/issues/40", "https://github.com/example/project/issues/0", "https://github.com/example/project/issues/40#comment", "https://github.com/example/project/issues/40?x=y", "https://github.com/example/project/../issues/40", "https://github.com.evil.test/example/project/issues/40"].map((url) => proposal.replace(/github_issue: .+/, `github_issue: ${url}`)),
    "---\n- not-a-mapping\n---\n# Proposal\n",
    proposal.replace(/^---\n/, ""),
    proposal.replace(/---\n# Proposal[\s\S]*/, "---\n"),
  ];
  for (const source of mutations) {
    await writeFile(path.join(repo, proposalPath), source);
    const result = invoke(repo);
    assert.equal(result.status, 1, `Unexpected acceptance: ${source}`);
    assert.match(result.stderr, /proposal\.md/);
  }
  await writeFile(path.join(repo, proposalPath), proposal);
  const currentSpec = "openspec/specs/nested/example/spec.md";
  for (const extra of [`change: ${change}\n`, "github_issue: null\n", "capability: wrong\n"]) {
    await writeFile(path.join(repo, currentSpec), header("spec", `capability: nested/example\n${extra}`) + "# Spec\n");
    assert.equal(invoke(repo).status, 1, extra);
  }
});
