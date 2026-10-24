#!/usr/bin/env node
// Opt-in live compatibility probe. Never touches real Hermes profiles.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installLocalSkills } from "../scripts/install-local-skills.mjs";
import { localContentHash } from "../scripts/hermes-skill-provenance.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const scratch = await mkdtemp(path.join(os.tmpdir(), "hermes-local-update-"));
let success = false;
try {
  const source = path.join(scratch, "checkout");
  const home = path.join(scratch, "home", ".hermes");
  await cp(path.join(root, "skills"), path.join(source, "skills"), { recursive: true });
  await mkdir(home, { recursive: true });
  await writeFile(path.join(home, "config.yaml"), "model: {}\n");
  await writeFile(path.join(home, ".no-bundled-skills"), "");
  const relative = "software-development/application-records";
  const sourceSkill = path.join(source, "skills", relative, "SKILL.md");
  const marker = `\n<!-- local installer integration probe ${randomUUID()} -->\n`;
  await writeFile(sourceSkill, await readFile(sourceSkill, "utf8") + marker);
  const result = await installLocalSkills({ root: source, hermesHome: home, profiles: ["default"] });
  const lockPath = path.join(home, "skills", ".hub", "lock.json");
  const before = JSON.parse(await readFile(lockPath, "utf8"));
  assert.equal(Object.keys(before.installed).length, result.packages.length);
  for (const skill of result.packages) {
    const entry = before.installed[skill.name];
    assert.equal(entry.content_hash, await localContentHash(path.join(home, "skills", entry.install_path), entry.files));
  }
  // Keep the account HOME for dependency-runtime discovery; only HERMES_HOME
  // selects skill/profile data. Changing HOME can bootstrap a second runtime.
  const env = { ...process.env, HERMES_HOME: home, NO_COLOR: "1" };
  delete env.HERMES_PROFILE;
  const update = () => execFileSync("hermes", ["skills", "update", "application-records"], {
    cwd: scratch, env, encoding: "utf8", timeout: 180000, maxBuffer: 4 * 1024 * 1024,
  });
  const installed = path.join(home, "skills", relative, "SKILL.md");
  const baseline = await readFile(installed, "utf8");
  const edited = baseline + "\nOperator edits after installation.\n";
  await writeFile(installed, edited);
  const skipped = update();
  assert.match(skipped, /you have local edits/);
  assert.equal(await readFile(installed, "utf8"), edited);
  await writeFile(installed, baseline);
  const output = update();
  const after = JSON.parse(await readFile(lockPath, "utf8"));
  const entry = after.installed["application-records"];
  assert.match(output, /Updated 1 skill/);
  assert.equal(entry.identifier, before.installed["application-records"].identifier);
  assert.equal(entry.install_path, relative);
  assert.equal(entry.scan_verdict, "safe");
  assert.notEqual(entry.metadata.install_method, "local-checkout");
  assert.notEqual(entry.content_hash, before.installed["application-records"].content_hash);
  assert.equal(entry.content_hash, await localContentHash(path.join(home, "skills", relative), entry.files));
  assert.ok(!(await readFile(installed, "utf8")).includes(marker.trim()));
  console.log(output);
  console.log(`Verified ${result.packages.length} local registrations; real hermes skills update fetched application-records from its public endpoint, preserved its category, ran scanning, and protected post-install local edits.`);
  success = true;
} finally {
  if (success) await rm(scratch, { recursive: true, force: true });
  else console.error(`Failed probe retained for inspection: ${scratch}`);
}
