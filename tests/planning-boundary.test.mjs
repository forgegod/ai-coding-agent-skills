import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const skills = new URL("../skills/", import.meta.url);
async function source(name, category = "software-development") {
  return (await readFile(new URL(`${category}/${name}/SKILL.md`, skills), "utf8"))
    .replace(/\s+/g, " ");
}

// These are instruction-contract regressions, not proof of an LLM's obedience.
// Guard the producer's stopping rule and the consumers' permission checks.
test("design stops at the plan, including when phase 1 is specification or tests", async () => {
  const text = await source("phased-plan-design");
  assert.match(text, /## Scope and stopping rule/);
  assert.match(text, /Invoking `phased-plan-design` authorizes planning only/);
  assert.match(text, /Do not reserve a phase, create an execution worktree, dispatch an executor, or write implementation\/regression tests/);
  assert.match(text, /Phase 1 is execution even when named specification, evidence, tests, or design/);
  assert.match(text, /Leave a new CHG `planned` with every phase `pending`/);
  assert.match(text, /Report the plan or proposal, validation result, and unresolved decisions, then stop/);
  assert.doesNotMatch(text, /before handing it to `phased-plan-execution`/);
});

test("design keeps plan approval and execution authority separate", async () => {
  const text = await source("phased-plan-design");
  assert.match(text, /Do not bundle record-edit\/commit consent with reservation or implementation/);
  assert.match(text, /Plan approval or permission to commit the record is not permission to execute/);
  assert.match(text, /A later planning-only instruction narrows an earlier general implementation request/);
  assert.match(text, /Only an explicit request to also execute a named phase permits a separate execution handoff/);
  assert.match(text, /not merely loading related skills/);
});

test("record routing and refactoring do not auto-start a phase", async () => {
  assert.match(await source("application-records"), /Routing to a skill is not execution authority/);
  assert.match(await source("phased-plan-refactoring"), /Stop after the revised plan; verified record readback does not authorize execution/);
});

test("execution entry points reject planning-only authority", async () => {
  assert.match(await source("phased-plan-execution"), /Require an explicit request to execute the selected phase; a design handoff or approved plan is not sufficient/);
  assert.match(await source("phased-plan-closeout"), /When loaded by design\/refactoring for record writes, do not enter reservation or phase execution/);
  assert.match(await source("autonomous-implementation-review", "autonomous-ai-agents"), /A planning-only request stops after design; do not reserve or dispatch phase 1/);
});

test("overview, commit, and wireframe skills retain their narrower boundaries", async () => {
  assert.match(await source("phased-plan-overview"), /This skill is read-only/);
  assert.match(await source("phased-plan-overview"), /prints no launch command/);
  assert.doesNotMatch(await source("phased-plan-overview"), /\/goal draft/);
  assert.match(await source("git-commit-message"), /A request to commit is not acceptance of a plan the user has not seen/);
  assert.match(await source("capability-wireframes"), /Keep pre-implementation visual work in the CHG review package/);
});
