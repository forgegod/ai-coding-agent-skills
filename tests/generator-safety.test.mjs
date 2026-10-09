import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildWellKnownSkills } from "../scripts/build-well-known-skills.mjs";

async function fixture(t, source = "---\nname: demo\ndescription: Demo workflow.\nversion: 1.0.0\n---\n# Demo\n") {
  const root = await mkdtemp(path.join(os.tmpdir(), "skills-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, "skills", "coding", "demo");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "SKILL.md"), source);
  return { root, directory, output: path.join(root, "dist") };
}

test("build parses folded YAML descriptions", async (t) => {
  const f = await fixture(t, "---\nname: demo\ndescription: >-\n  Review code: preserve\n  explicit boundaries.\nversion: 1.0.0\n---\n# Demo\n");
  const result = await buildWellKnownSkills(f);
  assert.equal(result.skills[0].description, "Review code: preserve explicit boundaries.");
});

test("invalid metadata cannot replace a previously built endpoint", async (t) => {
  const f = await fixture(t);
  await buildWellKnownSkills(f);
  const indexPath = path.join(f.output, ".well-known", "skills", "index.json");
  const before = await readFile(indexPath, "utf8");
  for (const fields of [
    "name: demo\ndescription: 123\nversion: 1.0.0",
    "name: demo\ndescription: Demo workflow.",
    "name: demo\ndescription: Demo workflow.\nversion: invalid",
    "name: demo\nname: other\ndescription: Demo workflow.\nversion: 1.0.0",
  ]) {
    await writeFile(path.join(f.directory, "SKILL.md"), `---\n${fields}\n---\n# Demo\n`);
    await assert.rejects(buildWellKnownSkills(f));
    assert.equal(await readFile(indexPath, "utf8"), before);
  }
});

test("symlinks cannot publish files from outside the skill tree", async (t) => {
  for (const target of ["SKILL.md", "templates"]) {
    const f = await fixture(t);
    const outside = path.join(f.root, "outside");
    await mkdir(outside);
    if (target === "SKILL.md") {
      await writeFile(path.join(outside, target), await readFile(path.join(f.directory, target)));
      await rm(path.join(f.directory, target));
      await symlink(path.join(outside, target), path.join(f.directory, target));
    } else {
      await writeFile(path.join(outside, "private.txt"), "Must not publish.\n");
      await symlink(outside, path.join(f.directory, target));
    }
    await assert.rejects(buildWellKnownSkills(f), /symlink|regular/);
  }
});

test("build refuses an output directory overlapping canonical skill source", async (t) => {
  const f = await fixture(t);
  const source = await readFile(path.join(f.directory, "SKILL.md"), "utf8");
  for (const output of [f.root, path.join(f.root, "skills"), f.directory]) {
    await assert.rejects(buildWellKnownSkills({ root: f.root, output }), /overlap/);
    assert.equal(await readFile(path.join(f.directory, "SKILL.md"), "utf8"), source);
  }
});

test("support packages reject hidden, control, credential, and URL-unsafe paths", async (t) => {
  const f = await fixture(t);
  const support = path.join(f.directory, "templates");
  await mkdir(support);
  for (const name of [".env", "AGENTS.md", "secret.pem", "escape%2f.txt", "bad\\name.txt"]) {
    const file = path.join(support, name);
    await writeFile(file, "Not for publication.\n");
    await assert.rejects(buildWellKnownSkills(f), /unsafe|forbidden/);
    await rm(file);
  }
});

test("site root links the discovery index and disables Jekyll", async (t) => {
  const f = await fixture(t);
  await buildWellKnownSkills(f);
  assert.match(await readFile(path.join(f.output, "index.html"), "utf8"), /href="\.well-known\/skills\/index\.json"/);
  assert.equal(await readFile(path.join(f.output, ".nojekyll"), "utf8"), "");
});
