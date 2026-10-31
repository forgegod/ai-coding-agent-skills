import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installLocalSkills } from "../scripts/install-local-skills.mjs";
import { loadHubLock, recordLocalInstall } from "../scripts/hermes-skill-provenance.mjs";

const script = fileURLToPath(new URL("../scripts/install-local-skills.mjs", import.meta.url));

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "local-profile-skills-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, "repository");
  const source = path.join(root, "skills", "software-development", "demo");
  const hermesHome = path.join(directory, "hermes");
  const userHome = path.join(directory, "user");
  await mkdir(path.join(source, "references"), { recursive: true });
  await writeFile(path.join(source, "SKILL.md"), "---\nname: demo\ndescription: Demo workflow.\nversion: 1.0.0\n---\n# Demo\n");
  await writeFile(path.join(source, "references", "guide.md"), "Reference material.\n");
  await mkdir(path.join(hermesHome, "profiles", "named"), { recursive: true });
  await writeFile(path.join(hermesHome, "config.yaml"), "model: {}\n");
  await writeFile(path.join(hermesHome, "profiles", "named", "profile.yaml"), "name: named\n");
  await mkdir(path.join(hermesHome, "profiles", "ignored"));
  await mkdir(userHome);
  return { directory, root, source, hermesHome, userHome };
}

function installOptions(f, overrides = {}) {
  return { root: f.root, hermesHome: f.hermesHome, userHome: f.userHome, ...overrides };
}

async function sourceAndDestinationMatch(source, destination) {
  assert.deepEqual(await readFile(path.join(destination, "SKILL.md")), await readFile(path.join(source, "SKILL.md")));
  assert.deepEqual(await readFile(path.join(destination, "references", "guide.md")), await readFile(path.join(source, "references", "guide.md")));
}

test("installs every complete package into default and recognized named profiles", async (t) => {
  const f = await fixture(t);
  const result = await installLocalSkills(installOptions(f));

  assert.deepEqual(result.profiles.map((profile) => profile.name), ["default", "named"]);
  assert.equal(result.copied, 2);
  for (const profile of ["default", "named"]) {
    await sourceAndDestinationMatch(
      f.source,
      path.join(f.hermesHome, ...(profile === "default" ? [] : ["profiles", profile]), "skills", "software-development", "demo"),
    );
  }
  await assert.rejects(stat(path.join(f.hermesHome, "profiles", "ignored", "skills")));
});

test("installs complete packages into existing global Claude Code and Codex directories", async (t) => {
  const f = await fixture(t);
  await mkdir(path.join(f.userHome, ".claude"));
  await mkdir(path.join(f.userHome, ".codex"));

  const result = await installLocalSkills(installOptions(f));

  assert.deepEqual(result.clients.map((client) => client.name), ["claude-code", "codex"]);
  for (const destination of [path.join(f.userHome, ".claude", "skills", "demo"), path.join(f.userHome, ".agents", "skills", "demo")]) {
    await sourceAndDestinationMatch(f.source, destination);
  }
  await assert.rejects(stat(path.join(f.root, ".claude", "skills")));
  await assert.rejects(stat(path.join(f.root, ".agents", "skills")));
});

test("omits absent native clients without creating their configuration directories", async (t) => {
  const f = await fixture(t);

  const result = await installLocalSkills(installOptions(f));

  assert.deepEqual(result.clients, []);
  await assert.rejects(stat(path.join(f.userHome, ".claude")));
  await assert.rejects(stat(path.join(f.userHome, ".agents")));
});

test("limits native installation to an explicitly selected detected client", async (t) => {
  const f = await fixture(t);
  await mkdir(path.join(f.userHome, ".claude"));
  await mkdir(path.join(f.userHome, ".codex"));

  const result = await installLocalSkills(installOptions(f, { clients: ["codex"] }));

  assert.deepEqual(result.profiles, []);
  assert.deepEqual(result.clients.map((client) => client.name), ["codex"]);
  await sourceAndDestinationMatch(f.source, path.join(f.userHome, ".agents", "skills", "demo"));
  await assert.rejects(stat(path.join(f.userHome, ".claude", "skills", "demo")));
  await assert.rejects(stat(path.join(f.hermesHome, "skills", "software-development", "demo")));
});

test("preflights a native client collision before changing Hermes profiles", async (t) => {
  const f = await fixture(t);
  const collision = path.join(f.userHome, ".claude", "skills", "demo");
  await mkdir(collision, { recursive: true });
  await writeFile(path.join(collision, "SKILL.md"), "Operator edits.\n");

  await assert.rejects(installLocalSkills(installOptions(f)), /claude-code: demo/);

  assert.equal(await readFile(path.join(collision, "SKILL.md"), "utf8"), "Operator edits.\n");
  await assert.rejects(stat(path.join(f.hermesHome, "skills", "software-development", "demo")));
});

test("native client dry runs write nothing and explicit updates preserve full backups", async (t) => {
  const f = await fixture(t);
  await mkdir(path.join(f.userHome, ".claude"));
  const options = installOptions(f, { clients: ["claude-code"] });
  const destination = path.join(f.userHome, ".claude", "skills", "demo");

  const preview = await installLocalSkills({ ...options, dryRun: true });
  assert.equal(preview.copied, 0);
  await assert.rejects(stat(destination));

  await installLocalSkills(options);
  await writeFile(path.join(destination, "references", "guide.md"), "Local edits.\n");
  await writeFile(path.join(destination, "obsolete.md"), "Removed upstream.\n");
  const result = await installLocalSkills({ ...options, update: true });

  assert.equal(result.installed, 0);
  assert.equal(result.updated, 1);
  assert.equal(result.backups.length, 1);
  await sourceAndDestinationMatch(f.source, destination);
  assert.equal(await readFile(path.join(result.backups[0].path, "references", "guide.md"), "utf8"), "Local edits.\n");
  assert.equal(await readFile(path.join(result.backups[0].path, "obsolete.md"), "utf8"), "Removed upstream.\n");
});

test("purges only the seven historical packages with explicit authority and preserves their backup", async (t) => {
  const f = await fixture(t);
  const historical = [
    "application-records",
    "phased-plan-closeout",
    "phased-plan-design",
    "phased-plan-execution",
    "phased-plan-next",
    "phased-plan-overview",
    "phased-plan-refactoring",
  ];
  const skills = path.join(f.hermesHome, "skills", "software-development");
  for (const name of historical) {
    const directory = path.join(skills, name);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "SKILL.md"), `---\nname: ${name}\ndescription: Historical workflow.\nversion: 1.0.0\n---\n# Historical\n`);
  }
  await writeFile(path.join(skills, "phased-plan-next", "local-notes.md"), "Preserve local edits.\n");
  const unrelated = path.join(f.hermesHome, "skills", "software-development", "personal-workflow");
  await mkdir(unrelated);
  await writeFile(path.join(unrelated, "SKILL.md"), "Personal skill.\n");
  const registration = {
    source: "well-known",
    identifier: "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/phased-plan-next",
    install_path: "software-development/phased-plan-next",
  };
  await mkdir(path.join(f.hermesHome, "skills", ".hub"), { recursive: true });
  await writeFile(path.join(f.hermesHome, "skills", ".hub", "lock.json"), JSON.stringify({ version: 1, installed: { "phased-plan-next": registration } }));
  const options = installOptions(f, { profiles: ["default"] });

  await installLocalSkills(options);
  for (const name of historical) await stat(path.join(skills, name));

  const preview = await installLocalSkills({ ...options, update: true, purge: true, dryRun: true });
  assert.equal(preview.purged, 0);
  assert.deepEqual(preview.purgePlan.map((entry) => entry.legacy.name), historical);
  for (const name of historical) await stat(path.join(skills, name));

  const result = await installLocalSkills({ ...options, update: true, purge: true });

  assert.equal(result.purged, historical.length);
  assert.deepEqual(result.purgePlan.map((entry) => entry.legacy.name), historical);
  for (const name of historical) await assert.rejects(stat(path.join(skills, name)));
  assert.equal(await readFile(path.join(unrelated, "SKILL.md"), "utf8"), "Personal skill.\n");
  const packageBackup = result.backups.find((backup) => backup.skill === "phased-plan-next" && backup.target === "default");
  assert.equal(await readFile(path.join(packageBackup.path, "local-notes.md"), "utf8"), "Preserve local edits.\n");
  const registrationBackup = result.backups.find((backup) => backup.kind === "retired-registration" && backup.skill === "phased-plan-next");
  assert.deepEqual(JSON.parse(await readFile(registrationBackup.path, "utf8")), registration);
  const lock = JSON.parse(await readFile(path.join(f.hermesHome, "skills", ".hub", "lock.json"), "utf8"));
  assert.equal(lock.installed["phased-plan-next"], undefined);
});

test("purge refuses a historical package with another Hermes source registration", async (t) => {
  const f = await fixture(t);
  const destination = path.join(f.hermesHome, "skills", "software-development", "phased-plan-next");
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "SKILL.md"), "Historical package.\n");
  await mkdir(path.join(f.hermesHome, "skills", ".hub"), { recursive: true });
  await writeFile(path.join(f.hermesHome, "skills", ".hub", "lock.json"), JSON.stringify({
    version: 1,
    installed: { "phased-plan-next": { source: "github", identifier: "other/project", install_path: "software-development/phased-plan-next" } },
  }));

  await assert.rejects(installLocalSkills(installOptions(f, { profiles: ["default"], purge: true })), /Conflicting Hermes hub registration/);

  await stat(destination);
});

test("purge uses a flat native client path and leaves no Hermes registration", async (t) => {
  const f = await fixture(t);
  await mkdir(path.join(f.userHome, ".claude"));
  const destination = path.join(f.userHome, ".claude", "skills", "phased-plan-next");
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "SKILL.md"), "Historical package.\n");
  await writeFile(path.join(destination, "local-notes.md"), "Preserve native edits.\n");

  const result = await installLocalSkills(installOptions(f, { clients: ["claude-code"], purge: true }));

  assert.equal(result.purged, 1);
  await assert.rejects(stat(destination));
  const backup = result.backups.find((entry) => entry.kind === "retired-package");
  assert.equal(await readFile(path.join(backup.path, "local-notes.md"), "utf8"), "Preserve native edits.\n");
  assert.equal(result.backups.some((entry) => entry.kind === "retired-registration"), false);
  await assert.rejects(stat(path.join(f.userHome, ".claude", "skills", ".hub")));
});

test("limits installation to explicitly selected profiles", async (t) => {
  const f = await fixture(t);
  const result = await installLocalSkills(installOptions(f, { profiles: ["named"] }));

  assert.deepEqual(result.profiles.map((profile) => profile.name), ["named"]);
  assert.equal(result.copied, 1);
  await sourceAndDestinationMatch(f.source, path.join(f.hermesHome, "profiles", "named", "skills", "software-development", "demo"));
  await assert.rejects(stat(path.join(f.hermesHome, "skills", "software-development", "demo")));
});

test("preflights collisions across every selected profile before copying", async (t) => {
  const f = await fixture(t);
  const existing = path.join(f.hermesHome, "skills", "software-development", "demo");
  await mkdir(existing, { recursive: true });
  await writeFile(path.join(existing, "SKILL.md"), "Operator edits.\n");

  await assert.rejects(
    installLocalSkills(installOptions(f)),
    /Refusing to overwrite existing skill packages:[\s\S]*default: software-development\/demo/,
  );
  assert.equal(await readFile(path.join(existing, "SKILL.md"), "utf8"), "Operator edits.\n");
  await assert.rejects(stat(path.join(f.hermesHome, "profiles", "named", "skills", "software-development", "demo")));
});

test("CLI accepts repeated --profile arguments and reports a dry run", async (t) => {
  const f = await fixture(t);
  const output = execFileSync(
    process.execPath,
    [script, "--hermes-home", f.hermesHome, "--profile", "default", "--profile", "named", "--dry-run"],
    { cwd: f.root, encoding: "utf8" },
  );

  assert.match(output, /Would install 5 skill packages into default\./);
  assert.match(output, /Would install 5 skill packages into named\./);
  await assert.rejects(stat(path.join(f.hermesHome, "profiles", "named", "skills", "software-development", "demo")));
});

test("CLI installs only a selected detected native client", async (t) => {
  const f = await fixture(t);
  await mkdir(path.join(f.userHome, ".codex"));
  const output = execFileSync(
    process.execPath,
    [script, "--hermes-home", f.hermesHome, "--user-home", f.userHome, "--client", "codex", "--dry-run"],
    { cwd: f.root, encoding: "utf8" },
  );

  assert.match(output, /Would install 5 skill packages into codex\./);
  await assert.rejects(stat(path.join(f.userHome, ".agents", "skills", "demo")));
  await assert.rejects(stat(path.join(f.hermesHome, "skills", "software-development", "demo")));
});

test("update replaces complete packages, backs up local edits, and installs missing skills", async (t) => {
  const f = await fixture(t);
  await installLocalSkills(installOptions(f, { profiles: ["default"] }));
  const destination = path.join(f.hermesHome, "skills", "software-development", "demo");
  await writeFile(path.join(destination, "references", "guide.md"), "Local edits.\n");
  await writeFile(path.join(destination, "obsolete.md"), "Removed upstream.\n");
  const unrelated = path.join(f.hermesHome, "skills", "personal");
  await mkdir(unrelated);
  await writeFile(path.join(unrelated, "SKILL.md"), "Unrelated user skill.\n");

  const result = await installLocalSkills(installOptions(f, { update: true }));
  assert.equal(result.installed, 1);
  assert.equal(result.updated, 1);
  assert.equal(result.copied, 2);
  assert.equal(result.backups.length, 1);
  await sourceAndDestinationMatch(f.source, destination);
  await sourceAndDestinationMatch(f.source, path.join(f.hermesHome, "profiles", "named", "skills", "software-development", "demo"));
  await assert.rejects(stat(path.join(destination, "obsolete.md")));
  assert.equal(await readFile(path.join(result.backups[0].path, "references", "guide.md"), "utf8"), "Local edits.\n");
  assert.equal(await readFile(path.join(result.backups[0].path, "obsolete.md"), "utf8"), "Removed upstream.\n");
  assert.equal(await readFile(path.join(unrelated, "SKILL.md"), "utf8"), "Unrelated user skill.\n");
});

test("CLI update supports dry-run and updates all five complete packages in selected scratch profiles", async (t) => {
  const f = await fixture(t);
  const args = [script, "--hermes-home", f.hermesHome, "--profile", "default", "--profile", "named"];
  execFileSync(process.execPath, args, { encoding: "utf8" });
  for (const home of [f.hermesHome, path.join(f.hermesHome, "profiles", "named")]) {
    const obsolete = path.join(home, "skills/software-development/git-commit-message/scripts");
    await mkdir(obsolete, { recursive: true });
    await writeFile(path.join(obsolete, "handoff.mjs"), "Obsolete dispatch helper.\n");
    await writeFile(path.join(obsolete, "herdr-pane-state.mjs"), "Obsolete pane monitor.\n");
  }
  const before = await readdir(f.hermesHome);
  const preview = execFileSync(process.execPath, [...args, "--update", "--dry-run"], { encoding: "utf8" });
  assert.match(preview, /Would install 0 and update 5 skill packages in default/);
  assert.match(preview, /Would install 0 and update 5 skill packages in named/);
  assert.deepEqual(await readdir(f.hermesHome), before);
  const output = execFileSync(process.execPath, [...args, "--update"], { encoding: "utf8" });
  assert.match(output, /Installed 0 and updated 5 skill packages in default/);
  assert.match(output, /Installed 0 and updated 5 skill packages in named/);
  assert.match(output, /Backup:/);
  for (const home of [f.hermesHome, path.join(f.hermesHome, "profiles", "named")]) {
    const sourceDir = fileURLToPath(new URL("../skills/software-development/git-commit-message/", import.meta.url));
    const destination = path.join(home, "skills/software-development/git-commit-message");
    assert.deepEqual(await readFile(path.join(destination, "SKILL.md")), await readFile(path.join(sourceDir, "SKILL.md")));
    assert.equal(await stat(path.join(destination, "scripts")).then(() => true, () => false), false);
    assert.ok((await readdir(home)).every((name) => !name.startsWith(".skills-staging-")));
  }
});

test("update preflights symlink destinations and backup parents before changing any profile", async (t) => {
  for (const relative of ["skills", "skills/software-development", "skills/software-development/demo", ".skills-backups", "skills/.hub"]) {
    await t.test(relative, async (t) => {
      const f = await fixture(t);
      const outside = path.join(f.directory, "outside");
      await mkdir(outside);
      const link = path.join(f.hermesHome, relative);
      await mkdir(path.dirname(link), { recursive: true });
      await symlink(outside, link);
      if (relative === ".skills-backups") {
        const destination = path.join(f.hermesHome, "skills/software-development/demo");
        await mkdir(destination, { recursive: true });
        await writeFile(path.join(destination, "SKILL.md"), "Local copy");
      }
      await assert.rejects(installLocalSkills(installOptions(f, { update: true })), /symlink/);
      assert.deepEqual(await readdir(outside), []);
      await assert.rejects(stat(path.join(f.hermesHome, "profiles/named/skills")));
    });
  }
});

test("installer refuses destinations overlapping canonical skill source", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.root, "config.yaml"), "model: {}\n");
  const before = await readFile(path.join(f.source, "SKILL.md"));
  await assert.rejects(installLocalSkills(installOptions(f, { hermesHome: f.root, update: true })), /overlap/);
  assert.deepEqual(await readFile(path.join(f.source, "SKILL.md")), before);
});

test("local installs register the public update source and the exact installed hash without scanner claims", async (t) => {
  const f = await fixture(t);
  await installLocalSkills(installOptions(f));
  for (const home of [f.hermesHome, path.join(f.hermesHome, "profiles", "named")]) {
    const lock = JSON.parse(await readFile(path.join(home, "skills/.hub/lock.json"), "utf8"));
    const entry = lock.installed.demo;
    assert.equal(lock.version, 1);
    assert.equal(entry.source, "well-known");
    assert.equal(entry.identifier, "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/demo");
    assert.equal(entry.install_path, "software-development/demo");
    assert.deepEqual(entry.files, ["references/guide.md", "SKILL.md"]);
    assert.equal(entry.trust_level, "community");
    assert.equal(entry.scan_verdict, "unscanned");
    assert.deepEqual(entry.scan_provenance, {});
    assert.equal(entry.metadata.install_method, "local-checkout");
    assert.equal(entry.metadata.source_revision, undefined);
    const actualHash = execFileSync("python3", ["-c", "import hashlib,pathlib,sys; p=pathlib.Path(sys.argv[1]); h=hashlib.sha256(); [(h.update(f.relative_to(p).as_posix().encode()+b'\\0'),h.update(f.read_bytes())) for f in sorted(p.rglob('*'),key=lambda f:f.relative_to(p).as_posix()) if f.is_file()]; print('sha256:'+h.hexdigest()[:16])", path.join(home, "skills", entry.install_path)], { encoding: "utf8" }).trim();
    assert.equal(entry.content_hash, actualHash);
  }
});

test("updates refresh provenance, preserve unrelated entries, and dry-run leaves the lock unchanged", async (t) => {
  const f = await fixture(t);
  const options = installOptions(f, { profiles: ["default"] });
  await installLocalSkills(options);
  const file = path.join(f.hermesHome, "skills/.hub/lock.json");
  const old = JSON.parse(await readFile(file, "utf8"));
  const originalHash = old.installed.demo.content_hash;
  old.installed.personal = { source: "github", identifier: "someone/else/personal", install_path: "personal" };
  old.installed.demo.scan_verdict = "safe";
  old.installed.demo.scan_provenance = { scanner_version: "previous-scanner" };
  old.installed.demo.metadata.source_revision = "old-upstream-revision";
  await writeFile(file, JSON.stringify(old));
  await writeFile(path.join(f.source, "references/guide.md"), "New source bytes.\n");
  await installLocalSkills({ ...options, update: true, dryRun: true });
  assert.equal(await readFile(file, "utf8"), JSON.stringify(old));
  await installLocalSkills({ ...options, update: true });
  const updated = JSON.parse(await readFile(file, "utf8"));
  assert.deepEqual(updated.installed.personal, old.installed.personal);
  assert.notEqual(updated.installed.demo.content_hash, originalHash);
  assert.equal(updated.installed.demo.scan_verdict, "unscanned");
  assert.deepEqual(updated.installed.demo.scan_provenance, {});
  assert.equal(updated.installed.demo.metadata.source_revision, undefined);
  assert.equal(updated.installed.demo.installed_at, old.installed.demo.installed_at);
});

test("malformed, unsupported and conflicting hub records fail before any profile is changed", async (t) => {
  for (const [name, raw] of [
    ["malformed", "not json"],
    ["unsupported", JSON.stringify({ version: 2, installed: {} })],
    ["other source", JSON.stringify({ version: 1, installed: { demo: { source: "github", identifier: "another/repo/demo", install_path: "software-development/demo" } } })],
    ["other path", JSON.stringify({ version: 1, installed: { demo: { source: "well-known", identifier: "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/demo", install_path: "other/demo" } } })],
  ]) await t.test(name, async (t) => {
    const f = await fixture(t);
    const directory = path.join(f.hermesHome, "profiles/named/skills/.hub");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "lock.json"), raw);
    await assert.rejects(installLocalSkills(installOptions(f, { update: true })), /hub lock|hub registration/);
    await assert.rejects(stat(path.join(f.hermesHome, "skills")));
    assert.equal(await readFile(path.join(directory, "lock.json"), "utf8"), raw);
  });
});

test("hub lock symlinks are refused without modifying their target", async (t) => {
  const f = await fixture(t);
  const target = path.join(f.directory, "external-lock.json");
  await writeFile(target, '{"version":1,"installed":{}}');
  await mkdir(path.join(f.hermesHome, "skills/.hub"), { recursive: true });
  await symlink(target, path.join(f.hermesHome, "skills/.hub/lock.json"));
  await assert.rejects(installLocalSkills(installOptions(f)), /symlink/);
  assert.equal(await readFile(target, "utf8"), '{"version":1,"installed":{}}');
});

test("registration refuses a hub lock changed by another writer", async (t) => {
  const f = await fixture(t);
  const result = await installLocalSkills(installOptions(f, { profiles: ["default"] }));
  const lock = await loadHubLock(f.hermesHome);
  const changed = JSON.stringify({ ...lock.data, external_writer: true });
  await writeFile(lock.file, changed);
  await assert.rejects(recordLocalInstall(lock, result.packages[0], f.source), /lock changed/);
  assert.equal(await readFile(lock.file, "utf8"), changed);
});
