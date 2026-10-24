import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installLocalSkills } from "../scripts/install-local-skills.mjs";

const script = fileURLToPath(new URL("../scripts/install-local-skills.mjs", import.meta.url));

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "local-profile-skills-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, "repository");
  const source = path.join(root, "skills", "software-development", "demo");
  const hermesHome = path.join(directory, "hermes");
  await mkdir(path.join(source, "references"), { recursive: true });
  await writeFile(path.join(source, "SKILL.md"), "---\nname: demo\ndescription: Demo workflow.\nversion: 1.0.0\n---\n# Demo\n");
  await writeFile(path.join(source, "references", "guide.md"), "Reference material.\n");
  await mkdir(path.join(hermesHome, "profiles", "named"), { recursive: true });
  await writeFile(path.join(hermesHome, "config.yaml"), "model: {}\n");
  await writeFile(path.join(hermesHome, "profiles", "named", "profile.yaml"), "name: named\n");
  await mkdir(path.join(hermesHome, "profiles", "ignored"));
  return { directory, root, source, hermesHome };
}

async function sourceAndDestinationMatch(source, destination) {
  assert.deepEqual(await readFile(path.join(destination, "SKILL.md")), await readFile(path.join(source, "SKILL.md")));
  assert.deepEqual(await readFile(path.join(destination, "references", "guide.md")), await readFile(path.join(source, "references", "guide.md")));
}

test("installs every complete package into default and recognized named profiles", async (t) => {
  const f = await fixture(t);
  const result = await installLocalSkills({ root: f.root, hermesHome: f.hermesHome });

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

test("limits installation to explicitly selected profiles", async (t) => {
  const f = await fixture(t);
  const result = await installLocalSkills({ root: f.root, hermesHome: f.hermesHome, profiles: ["named"] });

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
    installLocalSkills({ root: f.root, hermesHome: f.hermesHome }),
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

  assert.match(output, /Would install 9 skill packages into default\./);
  assert.match(output, /Would install 9 skill packages into named\./);
  await assert.rejects(stat(path.join(f.hermesHome, "profiles", "named", "skills", "software-development", "demo")));
});
