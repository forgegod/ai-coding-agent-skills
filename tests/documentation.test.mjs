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
  assert.match(section, /openspec-development/);
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
  assert.match(guide, /openspec-development:openspec-delivery/);
  assert.match(guide, /No agents, hooks, MCP servers/);
});

test("all launch examples carry the same bounded operator authorization", async () => {
  const files = [readme,
    fileURLToPath(new URL("../skills/autonomous-ai-agents/autonomous-implementation-review/SKILL.md", import.meta.url))];
  const prompts = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const promptsInFile = [...source.matchAll(/^\s*(\/goal draft \/openspec-delivery .+)$/gm)].map((match) => match[1]);
    assert.equal(promptsInFile.length, 1, file);
    const prompt = promptsInFile[0];
    assert.match(prompt, /openspec-delivery/);
    assert.equal(prompt, "/goal draft /openspec-delivery <name>");
    assert.match(source, /short-invocation policy/);
    prompts.push(prompt);
  }
  assert.ok(prompts.every((prompt) => prompt === prompts[0]), "launch contract drift");
});

test("normal installer loop documents all generic software-development skills", async () => {
  const source = await readFile(readme, "utf8");
  const loop = source.match(/^for skill in (.+); do$/m)?.[1]?.split(/\s+/);
  assert.ok(loop, "document a normal installer loop");
  assert.equal(loop.length, 4);
  assert.deepEqual(loop, ["openspec-delivery", "openspec-next", "git-commit-message", "capability-wireframes"]);
  assert.match(source, /four-package example/);
  assert.match(source, /collection of \*\*five\*\* categorized Agent Skills packages/);
  assert.doesNotMatch(source, /phased-plan-next/);
});

test("OpenSpec installation and orchestration use the explicitly selected workflow", async () => {
  const source = await readFile(readme, "utf8");
  assert.equal(source.includes("hermes -p hermes-dev skills install \"well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/openspec-delivery\" --category software-development"), true, "document the independent OpenSpec Hermes install route");
  const marketplace = JSON.parse(await readFile(new URL("../.claude-plugin/marketplace.json", import.meta.url), "utf8"));
  const orchestration = marketplace.plugins.find(({ name }) => name === "autonomous-orchestration");
  for (const workflow of ["openspec-development"]) assert.equal(orchestration.description.includes(workflow), true, workflow);
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
  assert.match(source, /--skill openspec-delivery --agent claude-code/);
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
  assert.match(source, /\/goal draft \/openspec-delivery <name>/);
  assert.match(source, /push\/PR\/merge are not/);
  assert.match(source, /supports Herdr only/);
  assert.match(source, /operator sends `\/goal pause`/i);
  assert.match(source, /docs\/openspec-workflow\.md/);
  assert.doesNotMatch(source, /phased-plan-/);
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
  for (const pattern of [/tasks\.md/, /post-merge|integrated/, /documentation/, /parallel/i, /openspec-propose/, /field-notes/, /(?:pull request|PR).*SHA/i, /\/openspec-delivery/, /risk-focused/, /does not\s+establish ISO/, /independent review/]) assert.match(workflow, pattern);
});

test("lifecycle Mermaid separates operator decisions from automatic workspace and delivery work", async () => {
  const workflow = await readFile(new URL("../docs/openspec-workflow.md", import.meta.url), "utf8");
  const section = workflow.split("## Lifecycle picture\n")[1]?.split("\n## Identity and path conventions")[0];
  assert.ok(section, "keep the lifecycle section discoverable");
  assert.doesNotMatch(section, /```text/);
  const diagram = section.match(/```mermaid\n([\s\S]*?)\n```/)?.[1];
  assert.ok(diagram, "publish a Mermaid lifecycle diagram");
  assert.match(diagram, /^flowchart TB/m);
  const operator = diagram.match(/subgraph operator\["Operator actions"\]([\s\S]*?)\n  end/)?.[1];
  const automatic = diagram.match(/subgraph agent\["Agent work - automatic within authority"\]([\s\S]*?)\n  end/)?.[1];
  assert.ok(operator && automatic, "ownership must not rely on colors alone");
  for (const action of [/openspec-propose/, /Approve/, /openspec-next/, /openspec-delivery finish/]) assert.match(operator, action);
  assert.doesNotMatch(operator, /worktree|checkout|bootstrap/i);
  for (const action of [/worktree/, /bootstrap/, /Implement/, /Independent review via \/autonomous-implementation-review/, /receipt/, /archive/, /retire clean/]) assert.match(automatic, action);
  assert.match(diagram, /implement --> review --> groups/);
  assert.match(diagram, /groups -->\|[^\n]*\| next/);
  assert.match(diagram, /groups -->\|[^\n]*\| finish/);
  assert.match(diagram, /finish --> publish --> reviewWait/);
  assert.match(diagram, /reviewWait -->\|Yes: merge the same SHA\| verify --> closure --> cleanup --> done/);
  assert.match(diagram, /Not yet: typical wait/);
  assert.match(diagram, /Same finish, later/);
  assert.match(diagram, /That PR block is cleared/);
  assert.doesNotMatch(diagram, /If human review or permission is needed/);
  assert.match(section, /not a lifecycle phase/i);
  assert.match(section, /operator does not create/i);
  assert.match(section, /closing keyword/i);
  assert.match(section, /next push does not close/i);
  assert.match(section, /Fixes #<issue>/);
  assert.match(section, /default branch/i);
  for (const boundary of [/When the operator acts/, /one task group/, /human PR approvals/, /host\/tool permission/, /resume the interrupted step/]) assert.match(section, boundary);
});

test("change naming is automatic project policy, not a second identity or installed adapter fork", async () => {
  const root = new URL("../", import.meta.url);
  const contract = await readFile(new URL("AGENTS.md", root), "utf8");
  const workflow = await readFile(new URL("docs/openspec-workflow.md", root), "utf8");
  assert.match(contract, /before.*openspec new change/i);
  assert.match(contract, /change-name\.mjs/);
  for (const pattern of [/\/openspec-propose add-dark-mode/, /<slug>-<ulid>/, /change\/<full-name>/, /automatically/, /ambiguous/i, /existing.*names/i, /not.*stock OpenSpec/i]) assert.match(workflow, pattern);
  for (const relative of ["docs/openspec-workflow.md", "skills/software-development/AGENTS.md", "skills/software-development/openspec-delivery/SKILL.md", "skills/software-development/openspec-delivery/references/ticket.md", "skills/software-development/openspec-delivery/references/guard.md"]) {
    const source = await readFile(new URL(relative, root), "utf8");
    assert.doesNotMatch(source, /Do not generate a ULID\.|Do not add a ULID\./, relative);
  }
});
