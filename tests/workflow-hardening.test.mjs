import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = relative => readFile(new URL(`../skills/${relative}`, import.meta.url), "utf8");

test("transport requires consent before mutation and documents safe lifecycle units", async () => {
  const s = await read("autonomous-ai-agents/autonomous-implementation-review/references/herdr.md");
  const watcher = await read("autonomous-ai-agents/autonomous-implementation-review/references/lifecycle-watch.md");
  assert.match(s, /Before reservation or any mutating pane command/);
  assert.match(s, /timed.out.*cancelled.*unanswered/is);
  assert.match(s, /sole candidate.*exec.*never.*consent/is);
  assert.match(s, /--orchestrator/);
  assert.match(s, /--selection/);
  assert.doesNotMatch(s, /\| python3/);
  assert.match(s, /lifecycle-watch\.md/);
  assert.match(watcher, /herdr_lifecycle_watch\.mjs/);
  assert.match(s, /--wait-armed/);
  assert.match(s, /end the turn/);
  assert.match(watcher, /--wait-armed/);
  assert.match(watcher, /notify=true/);
  assert.match(watcher, /end the turn/);
  assert.match(watcher, /inconclusive_fast/);
  assert.match(watcher, /--resume-from/);
  assert.match(watcher, /never runs[\s\S]*agent prompt/);
  assert.match(s, /issue #141194/i);
  assert.match(s, /per-handoff operator approval/i);
  assert.match(s, /only handoff authority/i);
  assert.match(watcher, /watcher receipt never authorizes a role handoff/i);
  const orchestration = await read("autonomous-ai-agents/autonomous-implementation-review/SKILL.md");
  assert.match(orchestration, /Iteration budget exhausted/);
  assert.match(orchestration, /never self-continues or\s+switches role/is);
});

test("execution bounds discovery and separates repository-derived bootstrap from gates", async () => {
  const execution = await read("software-development/phased-plan-execution/SKILL.md");
  const orchestration = await read("autonomous-ai-agents/autonomous-implementation-review/SKILL.md");
  assert.match(execution, /package exports.*CI/s);
  assert.match(execution, /bootstrap.*separately.*gate/s);
  assert.match(orchestration, /Stop discovery once/);
  assert.match(orchestration, /Reuse.*evidence/);
  assert.match(orchestration, /installed.*version.*source/s);
});

test("closeout checks candidate identity and factual record claims before commit", async () => {
  const s = await read("software-development/phased-plan-closeout/SKILL.md");
  const records = await read("software-development/phased-plan-closeout/references/record-writes.md");
  const boundary = await read("software-development/phased-plan-closeout/references/review-boundary.md");
  assert.match(s, /references\/review-boundary\.md/);
  for (const state of ["worktree", "index", "commit"]) assert.ok(boundary.includes(`--boundary ${state}`));
  assert.match(boundary, /before any.*index write/);
  assert.match(records, /factual review/);
  assert.match(records, /cleanup.*not.*happened/s);
  assert.match(records, /failed attempts/);
  assert.match(records, /Structural validation.*not.*truth/s);
  assert.match(s, /Do not rerun.*gate.*unchanged/s);
});
