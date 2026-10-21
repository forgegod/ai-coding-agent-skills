import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = p => readFile(new URL(`../skills/${p}`, import.meta.url), "utf8");
const auto = "autonomous-ai-agents/autonomous-implementation-review/";
const close = "software-development/phased-plan-closeout/";
const execution = "software-development/phased-plan-execution/SKILL.md";

// Requirement-location map: moving conditional guidance must not silently drop it.
const obligations = [
  ["explicit consent before mutation", auto + "references/herdr.md", /Before reservation or any mutating pane command/],
  ["timeout is not consent", auto + "references/herdr.md", /timed-out[\s\S]*never supplies consent/],
  ["fresh session, queue and model", auto + "references/herdr.md", /\/new --yes[\s\S]*\/busy queue[\s\S]*\/model/],
  ["lifecycle monitoring", auto + "references/herdr.md", /herdr agent wait/],
  ["Herdr only, no fallback worker", auto + "SKILL.md", /automated role loop is Herdr-only[\s\S]*delegate_task/],
  ["forced-final recovery", auto + "SKILL.md", /forced final reply cannot run checks, update the CHG, or resume itself/],
  ["bounded fix cycles", auto + "SKILL.md", /two fix\/review cycles/],
  ["secrets and browser isolation", auto + "SKILL.md", /secrets[\s\S]*browser/],
  ["bootstrap separate from gates", execution, /bootstrap separately[\s\S]*phase gate/],
  ["visual handoff", execution, /capability-wireframes[\s\S]*canonical HTML\/PNG/],
  ["frozen candidate through commit", close + "references/review-boundary.md", /--boundary worktree[\s\S]*--boundary index[\s\S]*--boundary commit/],
  ["same digest across hooks", close + "references/record-writes.md", /SAME[\s\S]*pre-commit digest/],
  ["factual completion review", close + "references/record-writes.md", /factual review[\s\S]*cleanup[\s\S]*not yet/],
  ["FF-only with target gate", close + "SKILL.md", /merge --ff-only[\s\S]*phase gate on the target/],
  ["sole-parent completion", close + "SKILL.md", /sole parent[\s\S]*tip/],
  ["no missing-worktree auto-replacement", close + "references/recovery.md", /Zero candidates does not authorize another worktree/],
  ["no replay after integration", close + "references/recovery.md", /do not replay[\s\S]*commits/],
  ["completed cleanup identity", close + "references/recovery.md", /branch tip[\s\S]*registration is absent/],
  ["reopen before corrections", close + "references/recovery.md", /corrections require an explicit reopening/],
];
for (const [name, file, pattern] of obligations) {
  test(`retained workflow obligation: ${name}`, async () => assert.match(await read(file), pattern));
}

test("routine entry points shrink without loading recovery on a fresh phase", async () => {
  const main = await Promise.all([auto + "SKILL.md", close + "SKILL.md", execution].map(read));
  assert.ok(main.reduce((n, s) => n + s.length, 0) < 17000, "normal three-skill entry budget");
  assert.match(main[1], /interruption[\s\S]*references\/recovery\.md/);
  assert.match(main[1], /Batch independent[\s\S]*Never batch across/);
  assert.match(main[1], /record-only[\s\S]*not another product gate/);
});
