import { test } from "node:test";
import assert from "node:assert/strict";

const moduleUrl = new URL("../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/herdr-pane-state.mjs", import.meta.url);
const footer = "☤ sol · 1K/500K · [░░] 1%";
const screen = (body, composer, footerState) => `${body}\n☤ ❯ ${composer}\n────────────────\n${footer} · ${footerState}`;
const namedPromptScreen = (body, composer, footerState) => `${body}\nan arbitrary session title ❯${composer ? ` ${composer}` : ""}\n────────────────\n${footer} · ${footerState}`;

// Captured classic CLI shape, not a transcript-wide keyword match.
export const workingScreen = screen("── ⠹ Working… · 58s ──", "type to queue a message for after this turn", "⏱ 58s");
export const idleScreen = screen("∴ Thought for 3s\nDone.", "", "⏲ 0s");

test("pane text, not stale metadata or old thought text, determines activity", async () => {
  const { parsePaneOutput } = await import(moduleUrl);
  assert.equal(parsePaneOutput(workingScreen).status, "working");
  assert.equal(parsePaneOutput(idleScreen).status, "idle");
  assert.equal(parsePaneOutput(namedPromptScreen("Done.", "", "⏲ 0s")).status, "idle");
  assert.equal(parsePaneOutput(namedPromptScreen("Done.", "type to queue a message for after this turn", "⏲ 0s · ctrl+c stop")).status, "working");
  assert.equal(parsePaneOutput(screen("── ⠙ 💻 herdr agent get · 28s ──", "type to queue a message for after this turn", "⏱ 28s")).status, "working");
  assert.equal(parsePaneOutput(screen("Done.", "type to queue a message for after this turn", "⏲ 0s")).status, "idle");
  assert.equal(parsePaneOutput(screen("∴ Thought for 3s", "type to queue a message for after this turn", "")).status, "unknown");
  assert.equal(parsePaneOutput(`\u001b[32m${workingScreen}\u001b[0m`).status, "working");
});

test("drafts, approvals, queued input and unfamiliar output never authorize injection", async () => {
  const { parsePaneOutput } = await import(moduleUrl);
  for (const output of [screen("", "my unsent draft", "⏲ 2s"), `${idleScreen}\nunknown overlay`, "Working\n∴ Thought for 3s", screen("", "", ""), screen("Queue · 1 queued", "", "⏲ 2s")]) {
    assert.equal(parsePaneOutput(output).status, "unknown", output);
  }
  assert.equal(parsePaneOutput(screen("⚠ approval required", "", "⏲ 2s")).status, "blocked");
});

test("inspection binds output to unchanged literal identities while ignoring lifecycle counters", async () => {
  const { inspectPane } = await import(moduleUrl);
  let gets = 0;
  const calls = [];
  const run = (bin, args) => {
    calls.push([bin, ...args]);
    if (args[1] === "read") return workingScreen;
    gets++;
    return JSON.stringify({ result: { agent: { pane_id: "w1:p1", workspace_id: "w1", terminal_id: "term1", agent: "hermes", agent_status: "idle" } } });
  };
  const result = inspectPane({ pane: "w1:p1", workspace: "w1" }, run);
  assert.equal(result.status, "working");
  assert.equal(result.source, "pane-output");
  assert.equal(gets, 2);
  assert.deepEqual(calls[1], ["herdr", "agent", "read", "w1:p1", "--source", "detection", "--lines", "100"]);
  assert.throws(() => inspectPane({ pane: "w1:p1", workspace: "w2" }, run), /identity/);
  let count = 0;
  assert.throws(() => inspectPane({ pane: "w1:p1", workspace: "w1" }, (bin, args) => {
    const output = run(bin, args);
    if (args[1] !== "get" || ++count === 1) return output;
    return output.replace("term1", "term2");
  }), /identity/);
});
