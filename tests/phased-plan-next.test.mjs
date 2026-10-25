import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const skill = new URL("../skills/software-development/phased-plan-next/SKILL.md", import.meta.url);

test("next selects through overview and owns only the explicit current-pane handoff", async () => {
  const source = await readFile(skill, "utf8");
  for (const pattern of [
    /phased-plan-overview/, /selection.*decision table/is,
    /explicit.*invocation/is, /does not authorize/i,
    /HERDR_ENV/, /HERDR_WORKSPACE_ID/, /HERDR_PANE_ID/,
    /never.*focus/i, /cleanup-only/i, /outside Herdr/i,
    /\/new --yes[\s\S]*\/busy queue[\s\S]*\/goal draft/,
    /persist_on_release/, /do not.*wait.*own.*turn/is,
    /scheduled.*not.*delivered/is, /scripts\/handoff\.mjs/,
    /--wait-armed/, /Background-start acknowledgment is not receipt creation/,
  ]) assert.match(source, pattern);
});

async function fixture(t) {
  const helper = await import("../skills/software-development/phased-plan-next/scripts/handoff.mjs");
  const repo = mkdtempSync(path.join(os.tmpdir(), "next handoff-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
  git("init", "-b", "main");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "--allow-empty", "-m", "initial");
  const options = { repo, branch: "main", head: git("rev-parse", "HEAD"), chg: "docs/changes/active/CHG-001-demo.md", phase: "2" };
  const env = { HERDR_ENV: "1", HERDR_WORKSPACE_ID: "w1", HERDR_PANE_ID: "w1:p1" };
  const calls = [], events = [];
  // English CLI literals: Hermes locales/en.yaml (cli.session.new_session_titled,
  // cli.commands.shared.set_saved + busy.label, gateway.goal.set).
  // /new retains scrollback; rendering and auxiliary goal drafting are asynchronous.
  let state = "working", seq = 10, pending = "";
  let screen = "✓ Busy input mode set to 'queue' (saved to config)\n⊙ Goal set (10-turn budget): an old goal";
  const visible = status => `── ${status === "working" ? "⠙ Working…" : "Done"}\n☤ ❯ ${status === "working" ? "type to queue a message for after this turn" : ""}\n────\n☤ sol · 1K/500K · [░] 1% · ${status === "working" ? "⏱" : "⏲"} 2s`;
  let detection = null, samples = 0, clock = 0;
  const run = (bin, args) => {
    calls.push([bin, ...args]);
    if (bin === "git") return execFileSync(bin, args, { encoding: "utf8" });
    if (args[0] === "agent" && args[1] === "get") return JSON.stringify({ result: { agent: {
      pane_id: "w1:p1", workspace_id: "w1", agent: "hermes", terminal_id: "term1",
      foreground_cwd: repo, agent_status: state, state_change_seq: seq, completion_seq: seq,
    } } });
    if (args[0] === "agent" && args[1] === "wait") { state = "idle"; seq++; return "{}"; }
    if (args[0] === "agent" && args[1] === "prompt") {
      if (args[3].startsWith("/new --yes ")) screen += `\n(^_^)v New session started: ${args[3].slice(11)}`;
      else if (args[3] === "/busy queue") pending = "\n✓ Busy input mode set to 'queue' (saved to config)";
      else {
        if (args.includes("--wait")) throw new Error("agent_prompt_stalled: drafting took over five seconds");
        pending = "\n⊙ Goal set (10-turn budget): " + args[3].slice("/goal draft ".length);
      }
      return "{}";
    }
    if (args[0] === "agent" && args[1] === "read") {
      if (!args.includes("detection")) return screen;
      return detection ?? visible(samples++ === 0 ? "working" : "idle");
    }
    if (args[0] === "pane" && args[1] === "wait-output") {
      const matches = () => args.includes("--regex") ? new RegExp(args[args.indexOf("--regex") + 1]).test(screen) : screen.includes(args[args.indexOf("--match") + 1]);
      if (!matches()) {
        screen += pending;
        if (pending.includes("Goal set")) { state = "working"; seq++; }
        pending = "";
      }
      if (!matches()) throw new Error("output timeout");
      return "{}";
    }
    throw new Error(`Unexpected command: ${bin} ${args.join(" ")}`);
  };
  return {
    helper, options, env, calls, events, run, git,
    setState: value => { state = value; },
    setDetection: value => { detection = value; },
    deps: { run, env, record: (event) => events.push(event), sessionName: "phase-2-fixture", now: () => clock, sleep: ms => { clock += ms; } },
  };
}

test("handoff waits for this turn, then sends new, queue and canonical goal in order", async (t) => {
  const f = await fixture(t);
  f.helper.handoff(f.options, f.deps);
  const prompts = f.calls.filter((c) => c[0] === "herdr" && c[2] === "prompt");
  assert.equal(prompts.length, 3);
  assert.ok(prompts.every((c) => c[3] === "w1:p1"));
  assert.equal(prompts[0][4], "/new --yes phase-2-fixture");
  assert.equal(prompts[1][4], "/busy queue");
  const overview = await readFile(new URL("../skills/software-development/phased-plan-overview/SKILL.md", import.meta.url), "utf8");
  const canonical = overview.match(/^\s*(\/goal draft Execute only phase .+)$/m)[1]
    .replace("<phase-number>", "2").replace("<active-chg-path>", f.options.chg);
  assert.ok(prompts[2][4].startsWith(canonical));
  assert.ok(f.calls.slice(0, f.calls.indexOf(prompts[0])).filter(c => c.includes("detection")).length >= 3, "must observe working then stable visible idle before reset");
  assert.equal(f.calls.some(c => c[2] === "wait"), false);
  assert.deepEqual(prompts[2].slice(5), [], "goal drafting must not use prompt's five-second activity gate");
  assert.equal(f.events.at(-1).stage, "goal-accepted");
  assert.match(f.events.at(-1).readback, /Goal set \(10-turn budget\): Execute only phase 2/);
});

test("handoff accepts a visibly active caller when Herdr reports tool work as idle", async (t) => {
  const f = await fixture(t);
  f.setState("idle");

  f.helper.handoff(f.options, f.deps);

  const prompts = f.calls.filter((c) => c[0] === "herdr" && c[2] === "prompt");
  assert.equal(prompts.length, 3);
  assert.equal(f.calls.some((c) => c[0] === "herdr" && c[2] === "wait"), false);
  assert.ok(f.calls.some((c) => c[0] === "herdr" && c[2] === "read" && c.includes("detection")));
  assert.equal(f.events.at(-1).stage, "goal-accepted");
});

test("historical thought activity never authorizes a reset", async (t) => {
  const f = await fixture(t);
  f.setState("idle");
  f.setDetection("**Selecting the next phase**\n∴ Thought for 3s\n☤ ❯ type to queue a message for after this turn");

  assert.throws(() => f.helper.handoff(f.options, f.deps));
  assert.equal(f.calls.filter((c) => c[0] === "herdr" && c[2] === "prompt").length, 0);
});

test("continuously visible working with stale idle metadata cannot reset the live turn", async t => {
  const f = await fixture(t);
  f.setState("idle");
  f.setDetection("── ⠙ Working…\n☤ ❯ type to queue a message for after this turn\n────\n☤ sol · 1K/500K · [░] 1% · ⏱ 2s");
  assert.throws(() => f.helper.handoff(f.options, f.deps), /timed out/);
  assert.equal(f.calls.some(c => c[2] === "prompt"), false);
});

test("missing caller context is recorded and cannot send to the focused pane", async (t) => {
  const f = await fixture(t);
  delete f.env.HERDR_PANE_ID;
  assert.throws(() => f.helper.handoff(f.options, f.deps), /missing Herdr caller context/);
  assert.equal(f.calls.length, 0);
  assert.equal(f.events.at(-1)?.failed, true);
});

test("unsafe caller states, identity drift, stale settlement and setup failures stop without retry", async (t) => {
  const cases = [
    ["foreign workspace", (s) => ({ ...s, workspace_id: "w2" }), 0],
    ["foreign pane", (s) => ({ ...s, pane_id: "w1:p2" }), 0],
    ["non-Hermes", (s) => ({ ...s, agent: "codex" }), 0],
    ["stale idle", (s) => ({ ...s, agent_status: "idle" }), 0],

    ["terminal changed", (s, n) => n > 1 ? { ...s, terminal_id: "replaced" } : s, 0],
    ["cwd changed", (s) => ({ ...s, foreground_cwd: os.tmpdir() }), 0],
  ];
  for (const [name, transform, expectedPrompts] of cases) await t.test(name, async (t) => {
    const f = await fixture(t);
    let gets = 0;
    const run = (bin, args) => {
      if (name === "stale idle" && bin === "herdr" && args[1] === "read" && args.includes("detection")) return "idle prompt";
      const result = f.run(bin, args);
      if (bin === "herdr" && args[1] === "get") {
        const value = JSON.parse(result);
        value.result.agent = transform(value.result.agent, ++gets);
        return JSON.stringify(value);
      }
      return result;
    };
    assert.throws(() => f.helper.handoff(f.options, { ...f.deps, run }));
    assert.equal(f.calls.filter((c) => c[2] === "prompt").length, expectedPrompts);
    assert.equal(f.events.at(-1).failed, true);
  });
  for (const [failure, expectedPrompts] of [["new-readback", 1], ["queue-readback", 2], ["goal-timeout", 3], ["goal-readback", 3]]) await t.test(failure, async (t) => {
    const f = await fixture(t);
    const run = (bin, args) => {
      const result = f.run(bin, args);
      if (bin !== "herdr") return result;
      if (failure === "new-readback" && args[1] === "read" && !args.includes("detection")) return "unrecognized UI";
      if (failure === "queue-readback" && args[1] === "read" && !args.includes("detection")) return result.replaceAll("Busy input mode set to 'queue'", "busy mode rejected");
      if (failure === "goal-timeout" && args[1] === "prompt" && args[3].startsWith("/goal")) throw new Error("timeout after delivery");
      if (failure === "goal-readback" && args[1] === "read") return result.replaceAll("Goal set", "Goal rejected");
      return result;
    };
    assert.throws(() => f.helper.handoff(f.options, { ...f.deps, run }));
    assert.equal(f.calls.filter((c) => c[2] === "prompt").length, expectedPrompts);
    assert.equal(f.events.at(-1).failed, true);
  });
});

test("target mutation between selection and dispatch refuses reset", async (t) => {
  const f = await fixture(t);
  writeFileSync(path.join(f.options.repo, "untracked.txt"), "user work");
  assert.throws(() => f.helper.handoff(f.options, f.deps), /target is dirty/);
  assert.equal(f.calls.some((c) => c[2] === "prompt"), false);
});

test("preview has no side effects, CLI refuses receipt reuse and source-tree receipts", async (t) => {
  const f = await fixture(t);
  const scratch = mkdtempSync(path.join(os.tmpdir(), "next-receipt-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const receipt = path.join(scratch, "handoff.jsonl");
  const script = new URL("../skills/software-development/phased-plan-next/scripts/handoff.mjs", import.meta.url);
  const args = Object.entries({ ...f.options, receipt }).flatMap(([key, value]) => [`--${key}`, value]);
  const preview = JSON.parse(execFileSync(process.execPath, [script.pathname, ...args], { encoding: "utf8" }));
  assert.equal(preview.mode, "preview");
  assert.equal(existsSync(receipt), false);
  writeFileSync(receipt, "existing receipt");
  assert.throws(() => execFileSync(process.execPath, [script.pathname, ...args, "--dispatch"], { stdio: "pipe" }), /EEXIST/);
  assert.equal(readFileSync(receipt, "utf8"), "existing receipt");
  assert.throws(() => f.helper.main([...args.slice(0, -2), "--receipt", path.join(f.options.repo, "receipt.jsonl")]), /outside the target/);
});

test("wait-armed reads a durable armed receipt and treats a missing file as not armed", async t => {
  const helper = await import("../skills/software-development/phased-plan-next/scripts/handoff.mjs");
  const scratch = mkdtempSync(path.join(os.tmpdir(), "next-wait-armed-"));
  t.after(() => rmSync(scratch, { recursive: true, force: true }));
  const receipt = path.join(scratch, "handoff.jsonl");
  writeFileSync(receipt, JSON.stringify({ stage: "armed", failed: false }) + "\n");
  assert.equal(helper.waitArmed(receipt, 0).stage, "armed");
  writeFileSync(receipt, JSON.stringify({ stage: "preflight", failed: true, error: "unsafe visible caller state: idle" }) + "\n");
  assert.throws(() => helper.waitArmed(receipt, 0), /unsafe visible caller state/);
  assert.throws(() => helper.waitArmed(path.join(scratch, "missing.jsonl"), 0), /did not arm/);
  writeFileSync(receipt, JSON.stringify({ stage: "armed" }) + "\n");
  const script = new URL("../skills/software-development/phased-plan-next/scripts/handoff.mjs", import.meta.url);
  assert.equal(JSON.parse(execFileSync(process.execPath, [script.pathname, "--wait-armed", "--receipt", receipt, "--timeout-ms", "0"], { encoding: "utf8" })).stage, "armed");
  writeFileSync(receipt, JSON.stringify({ stage: "preflight", failed: true, error: "unsafe visible caller state: idle" }) + "\n");
  assert.throws(() => execFileSync(process.execPath, [script.pathname, "--wait-armed", "--receipt", receipt, "--timeout-ms", "0"], { encoding: "utf8", stdio: "pipe" }), /unsafe visible caller state/);
});
