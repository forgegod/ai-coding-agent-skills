import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { main, waitArmed, watch } from "../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/herdr_lifecycle_watch.mjs";

const s = (status, stateChangeSeq, completionSeq, terminal = "term-1") => ({
  pane_id: "w1:p1",
  workspace_id: "w1",
  agent: "hermes",
  terminal_id: terminal,
  agent_status: status,
  state_change_seq: stateChangeSeq,
  completion_seq: completionSeq,
});

function monitor(states, options = {}) {
  const calls = [];
  const events = [];
  let index = 0;
  let time = 0;
  const run = (bin, args) => {
    calls.push([bin, ...args]);
    assert.deepEqual(args, ["agent", "get", "w1:p1"]);
    return JSON.stringify({ result: { agent: states[Math.min(index++, states.length - 1)] } });
  };
  return {
    calls,
    events,
    watch: () => watch(
      { pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", intervalMs: 100, debounceMs: 100, ...options },
      { run, record: event => events.push(event), now: () => time, sleep: async ms => { time += ms; } },
    ),
  };
}

const outcomes = [
  {
    name: "settles only after working, advanced completion, and stable readback",
    states: [s("idle", 10, 5), s("working", 11, 5), s("idle", 12, 6), s("idle", 12, 6)],
    outcome: "settled",
    sawWorking: true,
    events: ["armed", "settled"],
  },
  {
    name: "reports a fast unwitnessed completion without injecting input",
    states: [s("idle", 10, 5), s("done", 10, 6), s("done", 10, 6)],
    outcome: "inconclusive_fast",
    sawWorking: false,
  },
  {
    name: "rejects a stale idle as a deadline, not a settlement",
    states: [s("idle", 10, 5)],
    options: { deadlineMs: 200 },
    outcome: "timed_out",
    final: { stateChangeSeq: 10, completionSeq: 5 },
  },
  {
    name: "debounces idle and working flicker before settling",
    states: [s("idle", 10, 5), s("working", 11, 5), s("idle", 12, 6), s("working", 13, 6), s("idle", 14, 7), s("idle", 14, 7)],
    outcome: "settled",
    final: { stateChangeSeq: 14 },
    calls: 6,
  },
  {
    name: "reports a stable block without claiming completion",
    states: [s("idle", 10, 5), s("working", 11, 5), s("blocked", 12, 5), s("blocked", 12, 5)],
    outcome: "blocked",
    final: { completionSeq: 5 },
  },
  {
    name: "reports a post-baseline block even when working was not sampled",
    states: [s("idle", 10, 5), s("blocked", 12, 5), s("blocked", 12, 5)],
    outcome: "blocked",
  },
  {
    name: "treats a zero debounce as an immediate stable read",
    states: [s("idle", 10, 5), s("working", 11, 5), s("idle", 12, 6), s("idle", 12, 6)],
    options: { debounceMs: 0 },
    outcome: "settled",
  },
  {
    name: "stops as inconclusive when observed work ends without completion",
    states: [s("idle", 10, 5), s("working", 11, 5), s("idle", 12, 5), s("idle", 12, 5)],
    outcome: "inconclusive",
  },
  {
    name: "stops as inconclusive on an unknown state",
    states: [s("idle", 10, 5), s("unknown", 11, 5)],
    outcome: "inconclusive",
  },
  {
    name: "honours an explicit deadline before debounce can settle",
    states: [s("idle", 10, 5), s("working", 11, 5), s("idle", 12, 6)],
    options: { deadlineMs: 250 },
    outcome: "timed_out",
    sawWorking: true,
  },
];

for (const scenario of outcomes) {
  test(`watcher ${scenario.name}`, async () => {
    const f = monitor(scenario.states, scenario.options);
    const result = await f.watch();
    assert.equal(result.outcome, scenario.outcome);
    if (scenario.sawWorking !== undefined) assert.equal(result.sawWorking, scenario.sawWorking);
    for (const field of ["stateChangeSeq", "completionSeq"]) {
      if (scenario.final?.[field] !== undefined) assert.equal(result.final[field], scenario.final[field]);
    }
    if (scenario.events) assert.deepEqual(f.events.map(event => event.outcome), scenario.events);
    if (scenario.calls) assert.equal(f.calls.length, scenario.calls);
    assert.ok(f.calls.every(call => call[0] === "herdr" && call[1] === "agent" && call[2] === "get"));
  });
}

test("watcher fails closed on a counter regression, an active baseline, and terminal drift", async () => {
  await assert.rejects(monitor([s("idle", 10, 5), s("working", 15, 5), s("idle", 12, 6)]).watch(), /counters moved backwards/);
  await assert.rejects(monitor([s("working", 10, 5)]).watch(), /requires idle\/done baseline/);
  await assert.rejects(monitor([s("idle", 10, 5), s("working", 11, 5, "term-2")]).watch(), /terminal identity changed/);
});

test("a transient read is retried once; identity drift is not", async () => {
  let time = 0;
  let reads = 0;
  const transient = await watch(
    { pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", intervalMs: 100, deadlineMs: 100 },
    {
      now: () => time,
      sleep: async ms => { time += ms; },
      run: () => {
        if (reads++ === 0) throw new Error("temporary herdr failure");
        return JSON.stringify({ result: { agent: s("idle", 10, 5) } });
      },
    },
  );
  assert.equal(transient.outcome, "timed_out");
  assert.equal(reads, 2);

  let identityReads = 0;
  await assert.rejects(watch(
    { pane: "w1:p1", workspace: "w1", receipt: "/receipt.jsonl", intervalMs: 100 },
    {
      sleep: async () => {},
      run: () => JSON.stringify({ result: { agent: s(identityReads++ === 0 ? "idle" : "working", 10 + identityReads, 5, identityReads === 1 ? "term-1" : "term-2") } }),
    },
  ), /terminal identity changed/);
  assert.equal(identityReads, 2);
});

test("CLI records the terminal outcome and fails closed", async (t) => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-cli-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const receipt = path.join(scratch, "watch.jsonl");
  const args = ["--pane", "w1:p1", "--workspace", "w1", "--receipt", receipt];
  const busy = () => JSON.stringify({ result: { agent: s("working", 10, 5) } });
  const output = [];
  await assert.rejects(main(args, { run: busy, log: line => output.push(JSON.parse(line)) }), /requires idle\/done baseline/);
  assert.deepEqual(output.map(event => event.outcome), ["monitor_failed"]);
  assert.deepEqual(
    readFileSync(receipt, "utf8").trim().split("\n").map(JSON.parse).map(event => event.outcome),
    ["monitor_failed"],
  );
  await assert.rejects(main(args, { run: busy }), /EEXIST/);
  await assert.rejects(main(["--pane", "w1:p1", "--workspace", "w1"], { run: busy }), /receipt must be an absolute path/);
  await assert.rejects(main(["--wait-armed", "--pane", "w1:p1", "--receipt", receipt]), /invalid argument/);
});

test("CLI records armed before its terminal outcome", async (t) => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-lifecycle-ready-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const receipt = path.join(scratch, "watch.jsonl");
  let time = 0;
  const output = [];
  const result = await main(
    ["--pane", "w1:p1", "--workspace", "w1", "--receipt", receipt, "--interval-ms", "100", "--deadline-ms", "100"],
    {
      run: () => JSON.stringify({ result: { agent: s("idle", 10, 5) } }),
      now: () => time,
      sleep: async ms => { time += ms; },
      log: line => output.push(JSON.parse(line)),
    },
  );
  assert.equal(result.outcome, "timed_out");
  assert.deepEqual(output.map(event => event.outcome), ["armed", "timed_out"]);
  assert.deepEqual(
    readFileSync(receipt, "utf8").trim().split("\n").map(JSON.parse).map(event => event.outcome),
    ["armed", "timed_out"],
  );
});

test("wait-armed reads a durable receipt and fails closed", async (t) => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), "herdr-wait-armed-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const receipt = path.join(scratch, "watch.jsonl");
  writeFileSync(receipt, `${JSON.stringify({ outcome: "armed" })}\n`);
  assert.equal((await main(["--wait-armed", "--receipt", receipt, "--timeout-ms", "0"], { log() {} })).outcome, "armed");
  writeFileSync(receipt, `${JSON.stringify({ outcome: "monitor_failed", error: "pane identity changed" })}\n`);
  assert.throws(() => waitArmed(receipt, 0), /pane identity changed/);
  assert.throws(() => waitArmed(path.join(scratch, "missing.jsonl"), 0), /did not arm/);
});
