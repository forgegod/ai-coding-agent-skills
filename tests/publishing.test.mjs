import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { buildWellKnownSkills } from "../scripts/build-well-known-skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Pages artifact includes the hidden well-known endpoint", async (t) => {
  const workflow = parse(await readFile(path.join(root, ".github/workflows/publish-skills.yml"), "utf8"));
  const archive = workflow.jobs.build.steps.find((step) => step.name === "Archive complete site");
  assert.ok(archive, "explicit archive step must preserve dot-directories");
  const scratch = await mkdtemp(path.join(os.tmpdir(), "skills-pages-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  await buildWellKnownSkills({ root, output: path.join(scratch, "dist") });
  execFileSync("sh", ["-c", archive.run], { cwd: scratch, env: { ...process.env, RUNNER_TEMP: scratch } });
  const inventory = execFileSync("tar", ["-tf", path.join(scratch, "artifact.tar")], { encoding: "utf8" });
  assert.match(inventory, /\.well-known\/skills\/index\.json/);
  assert.doesNotMatch(inventory, /(?:^|\/)AGENTS\.md$/m);
});
