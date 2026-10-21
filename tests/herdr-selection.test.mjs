import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const helper = fileURLToPath(new URL("../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/herdr_panes.py", import.meta.url));
const pane = (id, extra = {}) => ({ pane_id: id, workspace_id: "w1", tab_id: "t1", agent: "hermes", agent_status: "idle", ...extra });
async function run(t, panes, selection) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "herdr-selection-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const args = [helper, "--workspace", "w1", "--orchestrator", "w1:p1"];
  if (selection !== undefined) {
    const file = path.join(dir, "selection.json");
    await writeFile(file, JSON.stringify(selection));
    args.push("--selection", file);
  }
  return spawnSync("python3", args, { input: JSON.stringify({ result: { panes } }), encoding: "utf8" });
}
const answered = { source: "clarify", outcome: "submitted", status: "answered", pane_id: "w1:p2" };

test("overview excludes the orchestrator and busy or unknown agents from eligible candidates", async t => {
  const r = await run(t, [pane("w1:p1"), pane("w1:p2"), pane("w1:p3", { agent_status: "working" }), pane("w1:p4", { agent: "" })]);
  assert.equal(r.status, 0, r.stderr);
  const candidates = r.stdout.split("Eligible executor candidates")[1];
  assert.ok(candidates, r.stdout);
  assert.match(candidates, /w1:p2/);
  assert.doesNotMatch(candidates, /w1:p1|w1:p3|w1:p4/);
});

test("answered selection and explicit launch pane both validate without controlling Herdr", async t => {
  for (const selection of [answered, { source: "launch", pane_id: "w1:p2" }]) {
    const r = await run(t, [pane("w1:p1"), pane("w1:p2")], selection);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).pane_id, "w1:p2");
  }
});

for (const outcome of ["timed_out", "cancelled", "undelivered"]) {
  test(`selection ${outcome} refuses even the sole idle agent already named exec`, async t => {
    const r = await run(t, [pane("w1:p1"), pane("w1:p2", { name: "exec" })], { ...answered, outcome });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /explicit answered selection/);
  });
}
for (const [name, panes, selection] of [
  ["unanswered", [pane("w1:p2")], { ...answered, status: "unanswered" }],
  ["implicit source", [pane("w1:p2")], { ...answered, source: "sole-candidate" }],
  ["orchestrator", [pane("w1:p1")], { ...answered, pane_id: "w1:p1" }],
  ["busy", [pane("w1:p2", { agent_status: "working" })], answered],
  ["missing", [], answered],
  ["duplicate", [pane("w1:p2"), pane("w1:p2")], answered],
  ["wrong workspace", [pane("w1:p2", { workspace_id: "w2" })], answered],
  ["missing workspace", [pane("w1:p2", { workspace_id: "" })], answered],
  ["unknown agent", [pane("w1:p2", { agent: "mystery" })], answered],
  ["normalized ID", [pane("w1:p2")], { ...answered, pane_id: " w1:p2 " }],
]) {
  test(`selection refuses ${name}`, async t => {
    const inventory = panes.some(p => p.pane_id === "w1:p1") ? panes : [pane("w1:p1"), ...panes];
    const r = await run(t, inventory, selection);
    assert.notEqual(r.status, 0);
    assert.doesNotMatch(r.stderr, /unrecognized arguments|Traceback/);
  });
}

test("selection requires a known orchestrator identity rather than an arbitrary exclusion", async t => {
  const r = await run(t, [pane("w1:p2")], answered);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /orchestrator/);
});
