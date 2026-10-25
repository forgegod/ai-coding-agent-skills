import { test } from "node:test";
import assert from "node:assert/strict";

const moduleUrl = new URL("../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/herdr-pane-state.mjs", import.meta.url);
const footer = "☤ sol · 1K/500K · [░░] 1%";
const screen = (body, composer, footerState) => `${body}\n☤ ❯ ${composer}\n────────────────\n${footer} · ${footerState}`;
// Hermes shows a pending human prompt as a glyph in front of the composer.
const promptScreen = glyph => `╭─ ${glyph} Sudo Password Required ─────╮\n${glyph} ❯ \n────────────────\n${footer} · ⏲ 0s`;
// Screens as the Python CLI actually paints them: the panel title is inlined in
// the top rule, and the composer carries the prompt glyph.
const approvalScreen = `╭─ ⚠️  Dangerous Command ─────────────╮\n│ rm -rf build │\n│ 1. Allow once │\n│ 4. Deny │\n╰────────────────────────────╯\n⚠ ❯ \n────────────────\n${footer} · ⏲ 0s`;
const secretScreen = `╭─ 🔑 Skill Setup Required ───────────╮\n│ Enter secret below (hidden) │\n╰────────────────────────────╯\n🔑 ❯ \n────────────────\n${footer} · ⏲ 0s`;
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
});

test("a pending human prompt is blocked, and the composer glyph names which one", async () => {
  const { parsePaneOutput } = await import(moduleUrl);
  // The glyph Hermes puts in front of the composer while it waits on a human.
  const expected = new Map([["🔐", "password-prompt"], ["🔑", "credential-prompt"], ["⚠", "approval"], ["✎", "clarify"], ["?", "clarify"], ["⚙", "connection"]]);
  for (const [glyph, reason] of expected) {
    const result = parsePaneOutput(promptScreen(glyph));
    assert.equal(result.status, "blocked", glyph);
    assert.equal(result.reason, reason, glyph);
  }
  // A prompt blocks even when the modal panel squeezed the footer off screen.
  const noFooter = `╭─ 🔐 Sudo Password Required ─────╮\n🔐 ❯ \n`;
  assert.equal(parsePaneOutput(noFooter).status, "blocked");
  // Transcript text that merely names a prompt is not a pending prompt: the
  // pane is genuinely idle and must stay injectable.
  assert.equal(parsePaneOutput(screen("Sudo Password Required", "", "⏲ 2s")).status, "idle");
});

test("the real approval and secret panels block, whatever their title text", async () => {
  const { parsePaneOutput } = await import(moduleUrl);
  // The Python CLI titles these panels "Dangerous Command" and "Skill Setup
  // Required": matching panel prose missed both and reported a pending
  // approval as idle, which would inject into a pane awaiting a human.
  assert.deepEqual(parsePaneOutput(approvalScreen), { status: "blocked", reason: "approval" });
  assert.deepEqual(parsePaneOutput(secretScreen), { status: "blocked", reason: "credential-prompt" });
});

test("an unreadable pane reports why it is not idle", async () => {
  const { parsePaneOutput } = await import(moduleUrl);
  const reasons = new Map([
    [screen("", "my unsent draft", "⏲ 2s"), "composer-text"],
    [screen("", "Summarize what's in this folder", "⏲ 2s"), "composer-text"],
    [screen("Queue · 1 queued", "", "⏲ 2s"), "queued-input"],
    [screen("Done.", "", ""), "no-activity-marker"],
    ["no composer line at all", "no-composer"],
  ]);
  for (const [output, reason] of reasons) {
    assert.equal(parsePaneOutput(output).reason, reason, output);
  }
  assert.equal(parsePaneOutput(idleScreen).reason, "idle");
  assert.equal(parsePaneOutput(workingScreen).reason, "busy");
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
