import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildWellKnownSkills } from "../scripts/build-well-known-skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedSkillNames = [
  "application-records",
  "autonomous-implementation-review",
  "capability-wireframes",
  "git-commit-message",
  "phased-plan-closeout",
  "phased-plan-design",
  "phased-plan-execution",
  "phased-plan-next",
  "phased-plan-overview",
  "phased-plan-refactoring",
];

function frontmatterField(source, name) {
  return source.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? null;
}

test("well-known build publishes every skill and all advertised files", async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), "ai-blueprint-well-known-"));
  try {
    const result = await buildWellKnownSkills({ root, output });
    assert.deepEqual(result.skills.map((skill) => skill.name), expectedSkillNames);

    const endpoint = path.join(output, ".well-known", "skills");
    const index = JSON.parse(await readFile(path.join(endpoint, "index.json"), "utf8"));
    assert.deepEqual(index.skills, result.skills);

    for (const skill of index.skills) {
      assert.ok(skill.description, `${skill.name} has no public description`);
      assert.ok(skill.files.includes("SKILL.md"), `${skill.name} omits SKILL.md`);
      for (const file of skill.files) {
        const info = await stat(path.join(endpoint, skill.name, file));
        assert.ok(info.isFile(), `${skill.name} advertises a missing ${file}`);
      }
      const source = await readFile(path.join(endpoint, skill.name, "SKILL.md"), "utf8");
      assert.equal(frontmatterField(source, "name"), skill.name);
      assert.equal(frontmatterField(source, "description"), skill.description);
    }

    const autonomous = index.skills.find((skill) => skill.name === "autonomous-implementation-review");
    assert.deepEqual(autonomous?.files, ["references/environment-passthrough.md", "references/herdr.md", "references/lifecycle-watch.md", "scripts/herdr_lifecycle_watch.mjs", "scripts/herdr_panes.py", "SKILL.md"]);
    const closeout = index.skills.find((skill) => skill.name === "phased-plan-closeout");
    assert.deepEqual(closeout?.files, ["references/record-writes.md", "references/recovery.md", "references/review-boundary.md", "scripts/phase-guard.mjs", "SKILL.md"]);
    const next = index.skills.find((skill) => skill.name === "phased-plan-next");
    assert.deepEqual(next?.files, ["scripts/handoff.mjs", "SKILL.md"]);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
