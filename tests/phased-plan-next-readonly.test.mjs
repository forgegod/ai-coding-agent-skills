import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const next = new URL("../skills/software-development/phased-plan-next/", import.meta.url);
const auto = new URL("../skills/autonomous-ai-agents/autonomous-implementation-review/", import.meta.url);
const text = async (file, root = next) => (await readFile(new URL(file, root), "utf8")).replace(/\s+/g, " ");

test("next only presents a goal for operator submission after bounded overview selection", async () => {
  const source = await text("SKILL.md");
  assert.match(source, /read-only/i);
  assert.match(source, /selection procedure, decision table/);
  assert.match(source, /ownership\/cleanup rules, and stopping rule/);
  assert.match(source, /print exactly one/);
  assert.match(source, /active-chg-path/);
  assert.match(source, /does not override another record's reservation/);
  assert.match(source, /Several independent records are choices/);
  assert.match(source, /Only the operator sending/);
  assert.match(source, /invoking this skill does not authorize execution/i);
  assert.match(source, /Do not reset sessions, submit prompts, change queue mode, or monitor panes/);
  assert.match(source, /transport checks.*execution/is);
  assert.doesNotMatch(source, /handoff\.mjs|herdr-pane-state|--dispatch|--wait-armed|persist_on_release|herdr agent|\/new --yes|\/busy queue/);
});

test("next package has no dispatch or pane-monitoring helpers", async () => {
  assert.deepEqual(await readdir(next), ["SKILL.md"]);
});

test("next retains repository blockers without requiring Herdr to display a goal", async () => {
  const source = await text("SKILL.md");
  for (const boundary of [/dirty\/detached/, /invalid records/, /conflicting ownership/, /cleanup-only/, /no active CHG/i]) {
    assert.match(source, boundary);
  }
  assert.match(source, /Missing Herdr context does not block goal presentation/);
  assert.match(source, /no launch command.*blocker/i);
});

test("autonomous review owns role handoff to a different explicitly selected pane", async () => {
  const source = await text("SKILL.md", auto);
  const transport = await text("references/herdr.md", auto);
  assert.match(source, /different Herdr pane/);
  assert.match(source, /this pane remains the orchestrator/);
  assert.match(transport, /Require `HERDR_ENV=1`, `HERDR_WORKSPACE_ID`, and `HERDR_PANE_ID`/);
  assert.match(transport, /executor pane ID must differ from `HERDR_PANE_ID`/);
  assert.match(transport, /Never reset, rename, or control the orchestrator as a worker/);
  assert.match(transport, /re-inspect before each injection/);
  assert.match(transport, /\/new --yes[\s\S]*\/busy queue[\s\S]*\/model/);
  assert.match(transport, /herdr agent prompt <pane-id>/);
  assert.match(transport, /lifecycle-watch\.md/);
});
