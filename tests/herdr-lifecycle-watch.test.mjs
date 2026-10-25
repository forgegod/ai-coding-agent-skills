import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { main, resumeEvidence, waitArmed, watch } from "../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/herdr_lifecycle_watch.mjs";

// A pending human prompt owns the composer glyph, as Hermes renders it.
const screen = status => `∴ Thought for 3s\n${status === "blocked" ? "╭─ ⚠ Dangerous Command ─────╮" : ""}\n${status === "working" ? "── ⠙ Working… ──" : ""}\n${status === "blocked" ? "⚠" : "☤"} ❯ ${status === "working" ? "type to queue a message for after this turn" : status === "unknown" ? "draft" : ""}\n──────\n☤ sol · 1K/500K · [░░] 1% · ${status === "working" ? "⏱" : "⏲"} 2s`;
const agent = terminal => JSON.stringify({ result: { agent: { pane_id: "w1:p1", workspace_id: "w1", agent: "hermes", terminal_id: terminal, agent_status: "idle", state_change_seq: 10, completion_seq: 5 } } });

function monitor(states, options = {}) {
  const calls = [], events = [];
  let index = 0, time = 0;
  const run = (bin, args) => {
    calls.push([bin, ...args]);
    if (args[1] === "get") return agent("term-1");
    assert.deepEqual(args, ["agent", "read", "w1:p1", "--source", "detection", "--lines", "100"]);
    return screen(states[Math.min(index++, states.length - 1)]);
  };
  return { calls, events, run, deps: { now: () => time, sleep: async ms => { time += ms; }, record: event => events.push(event) },
    watch() { return watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", intervalMs: 100, debounceMs: 100, deadlineMs: 1000, ...options }, { run, ...this.deps }); } };
}

for (const [name, states, outcome] of [
  ["settles with frozen idle metadata after visible working", ["idle", "working", "idle", "idle"], "settled"],
  ["does not mistake stale idle for completion", ["idle"], "timed_out"],
  ["debounces visible idle flicker", ["idle", "working", "idle", "working", "idle", "idle"], "settled"],
  ["reports approval without injecting input", ["idle", "working", "blocked", "blocked"], "blocked"],
  ["reports an unsampled-work approval", ["idle", "blocked", "blocked"], "blocked"],
  ["fails closed on unrecognized UI or a draft", ["idle", "unknown"], "inconclusive"],
]) test(`watcher ${name}`, async () => {
  const f = monitor(states);
  const result = await f.watch();
  assert.equal(result.outcome, outcome);
  assert.equal(f.events[0].outcome, "armed");
  assert.ok(f.calls.every(c => c[0] === "herdr" && c[1] === "agent" && ["get", "read"].includes(c[2])));
});

test("watcher rejects visible busy baseline even though metadata is idle", async () => {
  await assert.rejects(monitor(["working"]).watch(), /requires idle\/done baseline/);
});

test("watcher rejects terminal drift and read failures", async () => {
  const f = monitor(["idle", "working"]);
  let gets = 0;
  await assert.rejects(watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", intervalMs: 100 }, {
    ...f.deps, run: (bin, args) => args[1] === "get" ? agent(++gets > 2 ? "term-2" : "term-1") : f.run(bin, args),
  }), /identity/);
  await assert.rejects(watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl" }, { run() { throw new Error("API unavailable"); } }), /API unavailable/);
});

test("deadline cannot become late settled during debounce", async () => {
  assert.equal((await monitor(["idle", "working", "idle"], { deadlineMs: 250 }).watch()).outcome, "timed_out");
});

test("a slow final read cannot produce settled past the watcher deadline", async () => {
  const f = monitor(["idle", "working", "idle", "idle"]);
  let reads = 0;
  const result = await watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", intervalMs: 100, debounceMs: 100, deadlineMs: 1000 }, {
    ...f.deps, run: (bin, args) => {
      if (args[1] === "read" && ++reads === 4) f.deps.sleep(1000);
      return f.run(bin, args);
    },
  });
  assert.equal(result.outcome, "timed_out");
});

test("reads are bounded by the remaining deadline", async () => {
  const f = monitor(["idle", "working", "idle", "idle"]);
  const timeouts = [];
  await watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", intervalMs: 100, debounceMs: 100, deadlineMs: 1000 }, {
    ...f.deps, run: (bin, args, timeoutMs) => { timeouts.push(timeoutMs); return f.run(bin, args); },
  });
  assert.ok(timeouts.length > 0);
  assert.ok(timeouts.every(value => value > 0 && value <= 1000), JSON.stringify(timeouts));
});

test("CLI records failures and refuses receipt reuse", async t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-cli-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const receipt = path.join(scratch, "watch.jsonl");
  const args = ["--pane", "w1:p1", "--workspace", "w1", "--receipt", receipt];
  const f = monitor(["working"]), output = [];
  await assert.rejects(main(args, { run: f.run, log: line => output.push(JSON.parse(line)) }), /requires idle\/done baseline/);
  assert.deepEqual(output.map(e => e.outcome), ["monitor_failed"]);
  assert.equal(JSON.parse(readFileSync(receipt, "utf8")).outcome, "monitor_failed");
  await assert.rejects(main(args, { run: f.run }), /EEXIST/);
  await assert.rejects(main(["--pane", "w1:p1", "--workspace", "w1"], { run: f.run }), /receipt must be an absolute path/);
});

test("CLI supports read-only inspection for selection and reports pane output source", async () => {
  const f = monitor(["working"]);
  const result = await main(["--inspect", "--pane", "w1:p1", "--workspace", "w1"], { run: f.run, log() {} });
  assert.equal(result.status, "working");
  assert.equal(result.source, "pane-output");
});

test("CLI records armed before terminal outcome", async t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-ready-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const f = monitor(["idle", "working", "idle", "idle"]), output = [];
  const result = await main(["--pane", "w1:p1", "--workspace", "w1", "--receipt", path.join(scratch, "watch.jsonl"), "--interval-ms", "100", "--debounce-ms", "100"], {
    ...f.deps, run: f.run, log: line => output.push(JSON.parse(line)),
  });
  assert.equal(result.outcome, "settled");
  assert.deepEqual(output.map(e => e.outcome), ["armed", "settled"]);
});

test("CLI prints usage instead of failing on --help", async () => {
  const lines = [];
  const result = await main(["--help"], { log: line => lines.push(line) });
  assert.equal(result.outcome, "help");
  assert.match(lines.join("\n"), /--wait-armed/);
  assert.match(lines.join("\n"), /--resume-from/);
});

test("CLI names the owning script when a selection flag is passed here", async () => {
  await assert.rejects(main(["--selection", "/tmp/s.json", "--inspection", "/tmp/i.json"], { log() {} }),
    /--selection belongs to herdr_panes\.py/);
});

test("wait-armed reads durable receipt and fails closed", async t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-wait-armed-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const receipt = path.join(scratch, "watch.jsonl");
  writeFileSync(receipt, JSON.stringify({ outcome: "armed" }) + "\n");
  assert.equal(waitArmed(receipt, 0).outcome, "armed");
  writeFileSync(receipt, JSON.stringify({ outcome: "monitor_failed", error: "pane identity changed" }) + "\n");
  assert.throws(() => waitArmed(receipt, 0), /pane identity changed/);
  assert.throws(() => waitArmed(path.join(scratch, "missing"), 0), /did not arm/);
});

const inconclusive = identity => JSON.stringify({
  outcome: "inconclusive",
  at: 1,
  baseline: { ...identity, status: "working" },
  final: { ...identity, status: "unknown" },
  sawWorking: true,
}) + "\n";

test("resume inherits the earlier terminal identity and working evidence", async t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-resume-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const prior = path.join(scratch, "prior.jsonl");
  writeFileSync(prior, inconclusive({ pane: "w1:p1", workspace: "w1", terminal: "term-1" }));
  const f = monitor(["idle", "idle"]);
  const result = await watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", resumeFrom: prior, intervalMs: 100, debounceMs: 100 }, f.deps
    ? { run: f.run, ...f.deps } : { run: f.run });
  assert.equal(result.outcome, "settled");
  assert.equal(result.sawWorking, true);
});

test("resume refuses a changed terminal", async t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-resume-drift-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const prior = path.join(scratch, "prior.jsonl");
  writeFileSync(prior, inconclusive({ pane: "w1:p1", workspace: "w1", terminal: "term-old" }));
  const f = monitor(["idle"]);
  await assert.rejects(watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", resumeFrom: prior, intervalMs: 100 }, { run: f.run, ...f.deps }), /identity/);
});

test("resume refuses a non-inconclusive prior outcome", t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-resume-settled-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const prior = path.join(scratch, "prior.jsonl");
  writeFileSync(prior, JSON.stringify({ outcome: "settled", at: 1, baseline: { pane: "w1:p1", workspace: "w1", terminal: "term-1" }, final: {}, sawWorking: true }) + "\n");
  assert.throws(() => resumeEvidence(prior), /not resumable/);
});

test("resume refuses a mismatched pane or workspace", async t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-resume-match-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const prior = path.join(scratch, "prior.jsonl");
  writeFileSync(prior, inconclusive({ pane: "w1:p9", workspace: "w1", terminal: "term-1" }));
  const deps = { run: () => agent("term-1"), now: () => 0, sleep: async () => {} };
  await assert.rejects(watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", resumeFrom: prior, intervalMs: 100 }, deps),
    /pane does not match/);
  const other = path.join(scratch, "other.jsonl");
  writeFileSync(other, inconclusive({ pane: "w1:p1", workspace: "w9", terminal: "term-1" }));
  await assert.rejects(watch({ pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", resumeFrom: other, intervalMs: 100 }, deps),
    /workspace does not match/);
});

test("resume evidence requires a complete recorded event", t => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-resume-partial-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const partial = path.join(scratch, "partial.jsonl");
  writeFileSync(partial, '{"outcome":"armed","at":1,"baseline":{}}\n{"outcome":"incon');
  assert.throws(() => resumeEvidence(partial), /truncated/);
  assert.throws(() => resumeEvidence(path.join(scratch, "missing.jsonl")), /does not exist/);
});
