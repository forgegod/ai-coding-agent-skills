import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const readme = fileURLToPath(new URL("../README.md", import.meta.url));

test("Claude instructions lead with native GUI installation and cite primary sources", async () => {
  const source = await readFile(readme, "utf8");
  const section = source.split("## Install with Claude Desktop\n")[1]?.split("\n## ")[0];
  assert.ok(section, "README needs a simple Claude Desktop installation entry point");
  assert.match(section, /Customize.*Plugins/);
  assert.match(section, /Add marketplace/);
  assert.match(section, /forgegod\/ai-coding-agent-skills/);
  assert.match(section, /software-development/);
  assert.match(section, /autonomous-orchestration/);
  assert.match(section, /docs\/claude-installation\.md/);
  assert.match(source, /Advanced: native directory installation/);
  const guide = await readFile(new URL("../docs/claude-installation.md", import.meta.url), "utf8");
  for (const url of ["https://claude.com/docs/plugins/overview", "https://support.claude.com/en/articles/12512180-use-skills-in-claude", "https://support.claude.com/en/articles/12512198-creating-custom-skills", "https://code.claude.com/docs/en/plugins/manifest-reference", "https://code.claude.com/docs/en/plugins/marketplace-reference"]) {
    assert.ok(guide.includes(url), `missing primary source ${url}`);
  }
  assert.match(guide, /Upload plugin/);
  assert.match(guide, /Upload a skill/);
  assert.match(guide, /not.*Hermes scanner approval/i);
  assert.match(guide, /Desktop UI upload\s+have not been verified/);
  assert.match(guide, /2\.1\.273/);
  assert.match(guide, /software-development:application-records/);
  assert.match(guide, /No agents, hooks, MCP servers/);
});

test("all launch examples carry the same bounded operator authorization", async () => {
  const files = [readme,
    fileURLToPath(new URL("../skills/autonomous-ai-agents/autonomous-implementation-review/SKILL.md", import.meta.url)),
    fileURLToPath(new URL("../skills/software-development/phased-plan-next/SKILL.md", import.meta.url))];
  const prompts = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const promptsInFile = [...source.matchAll(/^\s*(\/goal draft Execute only phase .+)$/gm)].map((match) => match[1]);
    assert.equal(promptsInFile.length, 1, file);
    const prompt = promptsInFile[0];
    assert.match(prompt, /phased-plan-closeout/);
    assert.match(prompt, /I authorize the orchestrator/);
    for (const action of [/reserve/, /commit/, /fast-forward/, /clean dedicated worktree/, /after verification/, /do not push or start another phase/]) assert.match(prompt, action);
    prompts.push(prompt);
  }
  assert.ok(prompts.every((prompt) => prompt === prompts[0]), "launch contract drift");
});

test("normal installer loop documents all generic software-development skills", async () => {
  const source = await readFile(readme, "utf8");
  const loop = source.match(/^for skill in (.+); do$/m)?.[1]?.split(/\s+/);
  assert.ok(loop, "document a normal installer loop");
  assert.equal(loop.length, 9);
  assert.deepEqual(loop, ["application-records", "capability-wireframes", "git-commit-message", "phased-plan-design", "phased-plan-execution", "phased-plan-closeout", "phased-plan-overview", "phased-plan-next", "phased-plan-refactoring"]);
  assert.match(source, /nine-package example/);
  assert.match(source, /collection of \*\*eleven\*\* categorized Agent Skills packages/);
  assert.match(source, /`phased-plan-next` is read-only and included in the generic loop/);
  assert.doesNotMatch(source, /phased-plan-next.*can reset/i);
});

test("OpenSpec installation and orchestration use the explicitly selected workflow", async () => {
  const source = await readFile(readme, "utf8");
  assert.equal(source.includes("hermes -p hermes-dev skills install \"well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/openspec-change-integration\" --category software-development"), true, "document the independent OpenSpec Hermes install route");
  const marketplace = JSON.parse(await readFile(new URL("../.claude-plugin/marketplace.json", import.meta.url), "utf8"));
  const orchestration = marketplace.plugins.find(({ name }) => name === "autonomous-orchestration");
  for (const workflow of ["software-development", "openspec-development"]) assert.equal(orchestration.description.includes(workflow), true, workflow);
  assert.equal(orchestration.description.includes("requires the general skills"), false);
  const guide = await readFile(new URL("../docs/claude-installation.md", import.meta.url), "utf8");
  assert.equal(/general-skill prerequisites/.test(guide), false, "role prerequisites must follow workflow selection");
});

test("local installation docs distinguish source, migration, profile scope, and scanning", async () => {
  const source = await readFile(readme, "utf8");
  const section = source.split("### Copy every local package to Hermes profiles\n")[1]?.split("### Run the autonomous implementation-review goal")[0];
  assert.ok(section);
  assert.match(section, /#### Choose where updates come from/);
  assert.match(section, /#### Migrate existing local copies to internet updates/);
  assert.match(section, /npm run install:local -- --update --profile hermes-dev --dry-run/);
  assert.match(section, /npm run install:local -- --update --profile hermes-dev\n/);
  assert.match(section, /hermes -p hermes-dev skills update\n/);
  assert.match(section, /all recognized profiles, not just the active profile/);
  assert.match(section, /--hermes-home/);
  assert.match(section, /skills\/\.hub\/lock\.json/);
  assert.match(section, /unscanned/);
  assert.match(section, /\.skills-backups/);
  assert.match(section, /content hashes, not version ordering/);
  assert.match(section, /does not publish/);
  assert.match(section, /no registration-only mode/i);
  assert.match(section, /test:local-update/);
});

test("directory-discovery instructions separate installation telemetry from authenticated submission", async () => {
  const source = await readFile(readme, "utf8");
  assert.match(source, /## Discovery on skill directories/);
  assert.match(source, /npx skills add forgegod\/ai-coding-agent-skills --list/);
  assert.match(source, /--skill application-records --agent claude-code/);
  assert.match(source, /anonymous installation telemetry/);
  assert.match(source, /DISABLE_TELEMETRY=1/);
  assert.match(source, /https:\/\/skillsllm\.com\/submit/);
  assert.match(source, /GitHub OAuth/);
  assert.match(source, /FAQ.*root.*SKILL\.md/is);
  assert.match(source, /dummy root skill/);
  assert.match(source, /https:\/\/skills\.sh\/docs\/faq/);
});

test("autonomous goal documentation distinguishes orchestration from polling", async () => {
  const source = await readFile(readme, "utf8");
  assert.match(source, /### Run the autonomous implementation-review goal/);
  assert.match(source, /#### Choose the progress authority first/);
  assert.match(source, /#### Start a selected CHG phase/);
  assert.match(source, /\/goal draft Execute only phase <phase-number> of <active-chg-path>/);
  assert.match(source, /Stop after verified target completion and cleanup; do not push or start another phase/);
  assert.match(source, /The operator fills the numeric phase ID/);
  assert.match(source, /supports Herdr only/);
  assert.match(source, /operator sends `\/goal pause`/i);
  assert.match(source, /prints no launch command/);
  assert.match(source, /\/phased-plan-next <active-chg-path>/);
  assert.match(source, /returns the exact bounded command below for the operator to send/);
  assert.match(source, /docs\/openspec-workflow\.md/);
  assert.match(source, /phased-plan-design/);
  assert.match(source, /phased-plan-execution/);
  assert.match(source, /#### Start bounded standalone work/);
  assert.match(source, /#### What persists across sessions and machines/);
  assert.match(source, /Scratch logs, patches, and agent reports are temporary evidence only/);
  assert.match(source, /#### Fresh-session busy-input protection/);
  assert.match(source, /#### Stop an execution deliberately/);
  assert.match(source, /\/busy queue/);
  assert.match(source, /\/stop` is not an immediate foreground-turn/);
  assert.match(source, /Operator commands, not an agent response/);
  assert.match(source, /Do not use `\/loop` for implementation and review/);
  assert.match(source, /Reserve `\/loop` for bounded external polling/);
  assert.match(source, /automatically compresses the orchestrator context.*50% by default/is);
  assert.match(source, /operator—not the\s+running agent/is);
  assert.match(source, /An agent printing a slash command does not execute it/i);
  assert.doesNotMatch(source, /durable handoff record|<handoff-record path>|scratch handoff/i);
});

test("operational documentation has no research dependencies or adoption-history claims", async () => {
  for (const relative of ["README.md", "AGENTS.md", "docs/openspec-workflow.md", "docs/claude-installation.md", "openspec/config.yaml", "scripts/AGENTS.md", "skills/AGENTS.md", "skills/software-development/AGENTS.md", "skills/autonomous-ai-agents/AGENTS.md", "skills/software-development/git-commit-message/references/openspec.md", "skills/software-development/capability-wireframes/references/openspec.md", "skills/autonomous-ai-agents/autonomous-implementation-review/references/openspec.md"]) {
    const source = await readFile(new URL(`../${relative}`, import.meta.url), "utf8");
    assert.equal(/docs\/research\/|openspec-adoption\.md|adoption branch|predates|subsequently authorized|previous adoption/i.test(source), false, relative);
  }
  for (const relative of ["docs/research", "docs/openspec-adoption.md"]) {
    assert.equal(await stat(new URL(`../${relative}`, import.meta.url)).then(() => true, (error) => { if (error.code !== "ENOENT") throw error; return false; }), false, relative);
  }
  const workflow = await readFile(new URL("../docs/openspec-workflow.md", import.meta.url), "utf8");
  for (const pattern of [/explicit\s+project\s+selection/i, /installation.*does not/i, /tasks\.md/, /post-merge/, /CAP\/CHG/]) assert.match(workflow, pattern);
});
