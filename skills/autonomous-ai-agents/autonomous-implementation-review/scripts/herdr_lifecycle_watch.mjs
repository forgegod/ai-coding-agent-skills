#!/usr/bin/env node
// Passive Herdr lifecycle watcher. It never sends pane input.
import { execFileSync } from "node:child_process";
import { appendFileSync, closeSync, fsyncSync, openSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const terminalStates = new Set(["idle", "done"]);
const knownStates = new Set(["idle", "done", "working", "blocked", "unknown"]);

/** A failed read that may be retried once. Identity and contract errors are never transient. */
class TransientError extends Error {}

function flags(args, allowed) {
  const values = {};
  for (let index = 0; index < args.length; index++) {
    const key = args[index].slice(2);
    if (!args[index].startsWith("--") || !allowed.includes(key) || values[key] !== undefined || !args[index + 1]) {
      throw new Error(`invalid argument: ${args[index]}`);
    }
    values[key] = args[++index];
  }
  return values;
}

function positiveInteger(value, name, { minimum = 1 } = {}) {
  if (!/^[0-9]+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < minimum) {
    throw new Error(`${name} must be an integer at least ${minimum}`);
  }
  return Number(value);
}

function identifier(value, name) {
  if (typeof value !== "string" || !/^[A-Za-z0-9:_-]+$/.test(value)) throw new Error(`invalid ${name}`);
  return value;
}

export function validate(options) {
  identifier(options.pane, "pane ID");
  identifier(options.workspace, "workspace ID");
  if (!path.isAbsolute(options.receipt ?? "")) throw new Error("receipt must be an absolute path");
  return {
    pane: options.pane,
    workspace: options.workspace,
    receipt: options.receipt,
    intervalMs: options.intervalMs === undefined ? 2000 : positiveInteger(options.intervalMs, "interval-ms", { minimum: 100 }),
    debounceMs: options.debounceMs === undefined ? 2000 : positiveInteger(options.debounceMs, "debounce-ms", { minimum: 0 }),
    deadlineMs: options.deadlineMs === undefined || options.deadlineMs === null ? null : positiveInteger(options.deadlineMs, "deadline-ms"),
  };
}

function parseAgent(output) {
  let data;
  try {
    data = JSON.parse(output);
  } catch {
    throw new TransientError("Herdr returned invalid JSON");
  }
  if (data.error) throw new TransientError(`Herdr error: ${JSON.stringify(data.error)}`);
  const agent = data.result?.agent;
  if (!agent || typeof agent !== "object") throw new TransientError("Herdr returned no agent state");
  return agent;
}

function lifecycleValue(agent, field) {
  if (!Number.isSafeInteger(agent[field]) || agent[field] < 0) throw new Error(`missing ${field}`);
  return agent[field];
}

function inspect(options, run, terminalId = null) {
  let agent;
  try {
    agent = parseAgent(run("herdr", ["agent", "get", options.pane]));
  } catch (error) {
    throw error instanceof TransientError ? error : new TransientError(`Herdr read failed: ${error.message}`);
  }
  if (agent.pane_id !== options.pane || agent.workspace_id !== options.workspace || agent.agent !== "hermes") {
    throw new Error("pane identity changed or is not Hermes");
  }
  if (typeof agent.terminal_id !== "string" || !agent.terminal_id) throw new Error("missing terminal identity");
  if (terminalId && agent.terminal_id !== terminalId) throw new Error("terminal identity changed");
  if (!knownStates.has(agent.agent_status)) throw new Error(`unknown agent state: ${agent.agent_status}`);
  return {
    pane: agent.pane_id,
    workspace: agent.workspace_id,
    terminal: agent.terminal_id,
    status: agent.agent_status,
    stateChangeSeq: lifecycleValue(agent, "state_change_seq"),
    completionSeq: lifecycleValue(agent, "completion_seq"),
  };
}

/** One read. A transient failure is retried once; the second failure is final. */
function sample(options, run, terminalId = null) {
  try {
    return inspect(options, run, terminalId);
  } catch (error) {
    if (!(error instanceof TransientError)) throw error;
    return inspect(options, run, terminalId);
  }
}

function changedBefore(previous, current) {
  return current.stateChangeSeq < previous.stateChangeSeq || current.completionSeq < previous.completionSeq;
}

function terminalOutcome(baseline, current, sawWorking) {
  const advancedState = current.stateChangeSeq > baseline.stateChangeSeq;
  const advancedCompletion = current.completionSeq > baseline.completionSeq;
  if (current.status === "blocked" && advancedState) return "blocked";
  if (!terminalStates.has(current.status)) return null;
  if (!sawWorking) return advancedCompletion ? "inconclusive_fast" : null;
  if (advancedState && advancedCompletion) return "settled";
  return advancedState ? "inconclusive" : null;
}

function sameTerminal(left, right) {
  return left.terminal === right.terminal && left.status === right.status &&
    left.stateChangeSeq === right.stateChangeSeq && left.completionSeq === right.completionSeq;
}

/**
 * Observe one dispatched task without sending any pane input.
 *
 * @param {{pane:string, workspace:string, receipt:string, intervalMs?:number, debounceMs?:number, deadlineMs?:number}} options
 * @param {{run:(bin:string,args:string[])=>string, sleep?:(ms:number)=>Promise<void>, now?:()=>number, record?:(event:object)=>void}} deps
 */
export async function watch(options, deps) {
  const config = validate(options);
  const run = deps.run;
  const sleep = deps.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const now = deps.now ?? Date.now;
  const record = deps.record ?? (() => {});
  const startedAt = now();
  const deadlineAt = config.deadlineMs === null ? null : startedAt + config.deadlineMs;
  const baseline = sample(config, run);
  if (!terminalStates.has(baseline.status)) throw new Error(`watcher requires idle/done baseline, got ${baseline.status}`);
  record({ outcome: "armed", at: startedAt, baseline });
  let sawWorking = false;
  let latest = baseline;
  const timedOut = () => deadlineAt !== null && now() >= deadlineAt;
  const timeoutEvent = () => {
    const event = { outcome: "timed_out", at: now(), baseline, final: latest, sawWorking };
    record(event);
    return event;
  };
  const pause = async milliseconds => {
    if (milliseconds === 0 && deadlineAt === null) return true;
    const remaining = deadlineAt === null ? milliseconds : deadlineAt - now();
    if (remaining <= 0) return false;
    await sleep(Math.min(milliseconds, remaining));
    return !timedOut();
  };

  while (true) {
    if (timedOut()) return timeoutEvent();
    if (!await pause(config.intervalMs)) return timeoutEvent();
    const current = sample(config, run, baseline.terminal);
    if (changedBefore(latest, current)) throw new Error("lifecycle counters moved backwards");
    latest = current;
    if (current.status === "unknown") {
      const event = { outcome: "inconclusive", at: now(), baseline, final: current, sawWorking };
      record(event);
      return event;
    }
    if (current.status === "working" && current.stateChangeSeq > baseline.stateChangeSeq) sawWorking = true;

    const outcome = terminalOutcome(baseline, current, sawWorking);
    if (!outcome) continue;
    if (!await pause(config.debounceMs)) return timeoutEvent();
    const stable = sample(config, run, baseline.terminal);
    if (changedBefore(latest, stable)) throw new Error("lifecycle counters moved backwards during debounce");
    latest = stable;
    if (!sameTerminal(current, stable)) continue;
    const event = { outcome, at: now(), baseline, final: stable, sawWorking };
    record(event);
    return event;
  }
}

function firstEvent(receipt) {
  try {
    const line = readFileSync(receipt, "utf8").split("\n").find(Boolean);
    return line ? JSON.parse(line) : null;
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) return null;
    throw error;
  }
}

/** Block until the watcher recorded `armed` in its receipt. */
export function waitArmed(receipt, timeoutMs = 10000, { sleep, now = Date.now } = {}) {
  if (!path.isAbsolute(receipt ?? "")) throw new Error("receipt must be an absolute path");
  const deadline = now() + positiveInteger(timeoutMs, "timeout-ms", { minimum: 0 });
  const pause = sleep ?? (milliseconds => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds));
  while (true) {
    const event = firstEvent(receipt);
    if (event?.outcome === "armed") return event;
    if (event?.outcome === "monitor_failed") throw new Error(event.error || "monitor_failed");
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error("watcher did not arm before timeout");
    pause(Math.min(200, remaining));
  }
}

function parseWatch(args) {
  const values = flags(args, ["pane", "workspace", "receipt", "interval-ms", "debounce-ms", "deadline-ms"]);
  return validate({
    pane: values.pane,
    workspace: values.workspace,
    receipt: values.receipt,
    intervalMs: values["interval-ms"],
    debounceMs: values["debounce-ms"],
    deadlineMs: values["deadline-ms"],
  });
}

function parseWait(args) {
  const values = flags(args, ["receipt", "timeout-ms"]);
  return { receipt: values.receipt, timeoutMs: values["timeout-ms"] ?? 10000 };
}

export async function main(args, { run = (bin, argv) => execFileSync(bin, argv, { encoding: "utf8", timeout: 15000, stdio: ["ignore", "pipe", "pipe"] }), log = console.log, ...watchDeps } = {}) {
  if (args.includes("--wait-armed")) {
    const waiting = parseWait(args.filter(arg => arg !== "--wait-armed"));
    const event = waitArmed(waiting.receipt, waiting.timeoutMs, watchDeps);
    log(JSON.stringify(event));
    return event;
  }
  const options = parseWatch(args);
  const fd = openSync(options.receipt, "wx", 0o600);
  const record = event => {
    appendFileSync(fd, `${JSON.stringify(event)}\n`);
    fsyncSync(fd);
    if (event.outcome === "armed") log(JSON.stringify(event));
  };
  try {
    const event = await watch(options, { ...watchDeps, run, record });
    log(JSON.stringify(event));
    return event;
  } catch (error) {
    const event = { outcome: "monitor_failed", at: watchDeps.now?.() ?? Date.now(), error: error.message };
    record(event);
    log(JSON.stringify(event));
    throw error;
  } finally {
    closeSync(fd);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => {
    console.error(`herdr-lifecycle-watch: ${error.message}`);
    process.exitCode = 1;
  });
}
