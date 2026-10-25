import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const packages = {
  "autonomous-implementation-review": "autonomous-ai-agents/autonomous-implementation-review",
  "application-records": "software-development/application-records",
  "capability-wireframes": "software-development/capability-wireframes",
  "git-commit-message": "software-development/git-commit-message",
  "phased-plan-design": "software-development/phased-plan-design",
  "phased-plan-execution": "software-development/phased-plan-execution",
  "phased-plan-closeout": "software-development/phased-plan-closeout",
  "phased-plan-overview": "software-development/phased-plan-overview",
  "phased-plan-next": "software-development/phased-plan-next",
  "phased-plan-refactoring": "software-development/phased-plan-refactoring",
};
const names = Object.keys(packages);

async function setup(t) {
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const helper = readme.match(/```sh\n(# Native installation helper\n[\s\S]*?)\n```/)?.[1];
  assert.ok(helper, "README must provide an executable native installation helper");
  const scratch = await mkdtemp(path.join(os.tmpdir(), "native-skill-install-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  await cp(path.join(root, "skills"), path.join(scratch, "ai-coding-agent-skills-review", "skills"), { recursive: true });
  const home = path.join(scratch, "home");
  await mkdir(home);
  return { readme, helper, scratch, home, env: { ...process.env, HOME: home, PI_CODING_AGENT_DIR: "" } };
}

test("documented recipes copy ten complete packages to all four native user locations", async (t) => {
  const f = await setup(t);
  for (const [heading, directory] of [["Claude Code", ".claude/skills"], ["Codex", ".agents/skills"], ["Kilo", ".kilo/skills"], ["Pi", ".pi/agent/skills"]]) {
    const section = f.readme.split(`### ${heading}\n`)[1]?.split(/\n### |\n## /)[0];
    assert.ok(section, `missing ${heading} installation section`);
    const command = section.match(/```sh\n([\s\S]*?)\n```/)?.[1];
    assert.ok(command, `missing ${heading} executable recipe`);
    execFileSync("sh", ["-c", f.helper + "\n" + command], { cwd: f.scratch, env: f.env });
    const destination = path.join(f.home, directory);
    assert.deepEqual((await readdir(destination)).sort(), [...names].sort());
    for (const name of names) {
      assert.deepEqual(await readFile(path.join(destination, name, "SKILL.md")), await readFile(path.join(root, "skills", packages[name], "SKILL.md")));
    }
    for (const [name, file] of [["autonomous-implementation-review", "references/environment-passthrough.md"], ["autonomous-implementation-review", "references/herdr.md"], ["autonomous-implementation-review", "references/lifecycle-watch.md"], ["autonomous-implementation-review", "scripts/herdr_lifecycle_watch.mjs"], ["phased-plan-closeout", "scripts/phase-guard.mjs"], ["phased-plan-closeout", "references/record-writes.md"], ["phased-plan-next", "scripts/handoff.mjs"]]) {
      assert.deepEqual(await readFile(path.join(destination, name, file)), await readFile(path.join(root, "skills", packages[name], file)));
    }
  }
});

test("native helper refuses collisions before copying any other skill", async (t) => {
  const f = await setup(t);
  const destination = path.join(f.home, ".agents/skills");
  const existing = path.join(destination, "phased-plan-refactoring");
  await mkdir(existing, { recursive: true });
  await writeFile(path.join(existing, "SKILL.md"), "Operator edits.\n");
  assert.throws(() => execFileSync("sh", ["-c", f.helper + '\ninstall_reviewed_skills "$HOME/.agents/skills"'], { cwd: f.scratch, env: f.env, stdio: "pipe" }));
  assert.deepEqual(await readdir(destination), ["phased-plan-refactoring"]);
  assert.equal(await readFile(path.join(existing, "SKILL.md"), "utf8"), "Operator edits.\n");
});

test("native instructions retain support-file and host-tool caveats", async () => {
  const source = await readFile(path.join(root, "README.md"), "utf8");
  assert.match(source, /native installs do not run the Hermes security scanner/i);
  assert.match(source, /Hermes-specific tool names/);
  assert.match(source, /\.claude\/skills/);
  assert.match(source, /\.agents\/skills/);
  assert.match(source, /\.kilo\/skills/);
  assert.match(source, /\.kilocode\/skills/);
  assert.match(source, /\.pi\/agent\/skills/);

  assert.match(source, /code\.claude\.com\/docs\/en\/skills/);
  assert.match(source, /learn\.chatgpt\.com\/docs\/build-skills/);
  assert.match(source, /Kilo-Org\/kilocode/);
  assert.match(source, /earendil-works\/pi/);
});
