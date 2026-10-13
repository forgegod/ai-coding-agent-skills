import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const readme = fileURLToPath(new URL("../README.md", import.meta.url));
const autonomousResearch = fileURLToPath(new URL("../docs/research/hermes-autonomous-goal-workflow.md", import.meta.url));

test("normal installer loop documents all generic software-development skills", async () => {
  const source = await readFile(readme, "utf8");
  const loop = source.match(/^for skill in (.+); do$/m)?.[1]?.split(/\s+/);
  assert.ok(loop, "document a normal installer loop");
  assert.equal(loop.length, 7);
  assert.deepEqual(loop, ["application-records", "capability-wireframes", "git-commit-message", "phased-plan-design", "phased-plan-execution", "phased-plan-overview", "phased-plan-refactoring"]);
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
  assert.match(source, /\/goal draft Execute phase <number or name> of docs\/changes\/active\/CHG-<number>\.md using autonomous-implementation-review and phased-plan-execution/);
  assert.match(source, /The operator supplies only the CHG and phase/);
  assert.match(source, /`\/phased-plan-overview` first/);
  assert.match(source, /returns the exact command below for the operator to send/);
  assert.match(source, /\[Hermes workflow research record\]\(docs\/research\/hermes-autonomous-goal-workflow\.md\)/);
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

test("autonomous workflow research separates shipped Hermes features from proposals", async () => {
  const source = await readFile(autonomousResearch, "utf8");
  assert.match(source, /\/goal draft <objective>/);
  assert.match(source, /read-only launch helper/);
  assert.match(source, /Custom Slash Commands \/ Shortcuts proposal #25335/);
  assert.match(source, /Kanban RFC #16102/);
  assert.match(source, /Pulse handoff proposal #31016/);
  assert.match(source, /Mission \/ Project SSOT proposal #48011/);
  assert.match(source, /sole mutable authority/);
  assert.match(source, /never the only resumption source/);
});
