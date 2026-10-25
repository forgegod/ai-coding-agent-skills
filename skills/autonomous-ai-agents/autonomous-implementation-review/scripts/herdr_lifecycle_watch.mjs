#!/usr/bin/env node
// Passive Herdr lifecycle watcher. It never sends pane input.
import { execFileSync } from "node:child_process";
import { appendFileSync, closeSync, fsyncSync, openSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { inspectPane, retryableUnknown } from "./herdr-pane-state.mjs";

const terminalStates = new Set(["idle", "done"]);
const callTimeoutMs = 15000;
const defaultUnknownTolerance = 3;
// herdr_panes.py owns these; naming them here stops cross-script flag guessing.
const foreignFlags = ["--selection", "--inspection", "--validate-selection"];

function usage() {
  return [
    "Usage: herdr_lifecycle_watch.mjs <mode> [options]",
    "",
    "Modes:",
    "  --pane <id> --workspace <id> --receipt <abs-path>  watch one dispatched role (background)",
    "  --inspect --pane <id> --workspace <id>             print one read-only pane inspection",
    "  --wait-armed --receipt <abs-path>                  wait until a watcher records \"armed\"",
    "  --help                                             print this message",
    "",
    "Watch options:",
    "  --interval-ms <n>    poll interval (default 2000, minimum 100)",
    "  --debounce-ms <n>    settle confirmation window (default 2000, minimum 0)",
    "  --deadline-ms <n>    optional lifecycle deadline",
    "  --unknown-tolerance <n>  consecutive unreadable frames tolerated (default 3, minimum 1)",
    "  --resume-from <abs>  resume one inconclusive receipt; binds its pane/terminal identity",
    "",
    "An unreadable frame (a repaint in flight) is retried up to the tolerance and",
    "recorded with its frame excerpt. Ambiguous input stops at once.",
    "herdr_panes.py owns --selection and --inspection. This script never validates a selection.",
  ].join("\n");
}

function flags(args, allowed, booleans = new Set()) {
  const values = {};
  for (let index = 0; index < args.length; index++) {
    const token = args[index];
    if (!token.startsWith("--") || !allowed.includes(token.slice(2)) || values[token.slice(2)] !== undefined) {
      throw new Error(`invalid argument: ${token}`);
    }
    if (booleans.has(token.slice(2))) {
      values[token.slice(2)] = true;
      continue;
    }
    if (!args[index + 1]) throw new Error(`invalid argument: ${token}`);
    values[token.slice(2)] = args[++index];
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
  if (options.resumeFrom !== undefined && options.resumeFrom !== null) {
    if (!path.isAbsolute(options.resumeFrom)) throw new Error("resume-from must be an absolute path");
    if (options.resumeFrom === options.receipt) throw new Error("resume-from and receipt must be different paths");
  }
  return {
    pane: options.pane,
    workspace: options.workspace,
    receipt: options.receipt,
    intervalMs: options.intervalMs === undefined ? 2000 : positiveInteger(options.intervalMs, "interval-ms", { minimum: 100 }),
    debounceMs: options.debounceMs === undefined ? 2000 : positiveInteger(options.debounceMs, "debounce-ms", { minimum: 0 }),
    deadlineMs: options.deadlineMs === undefined || options.deadlineMs === null ? null : positiveInteger(options.deadlineMs, "deadline-ms"),
    unknownTolerance: options.unknownTolerance === undefined
      ? defaultUnknownTolerance
      : positiveInteger(options.unknownTolerance, "unknown-tolerance", { minimum: 1 }),
    resumeFrom: options.resumeFrom ?? null,
  };
}

/**
 * Read the resumable evidence from one earlier watcher receipt.
 *
 * Only an `inconclusive` receipt is resumable: every other outcome already
 * carries a decision. The last complete line is the only trusted event.
 *
 * @param {string} receipt
 * @returns {{pane:string, workspace:string, terminal:string, sawWorking:boolean}}
 */
export function resumeEvidence(receipt) {
  let text;
  try {
    text = readFileSync(receipt, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") throw new Error("resume receipt does not exist");
    throw error;
  }
  const lines = text.split("\n").filter(Boolean);
  if (!lines.length) throw new Error("resume receipt has no recorded event");
  let event;
  try {
    event = JSON.parse(lines[lines.length - 1]);
  } catch {
    throw new Error("resume receipt is truncated");
  }
  if (event?.outcome !== "inconclusive") throw new Error("resume receipt outcome is not resumable");
  const identity = event.final ?? event.baseline;
  if (!identity || typeof identity.terminal !== "string" || !identity.terminal) {
    throw new Error("resume receipt has no terminal identity");
  }
  return {
    pane: identity.pane,
    workspace: identity.workspace,
    terminal: identity.terminal,
    sawWorking: event.sawWorking === true,
  };
}

/**
 * Observe one dispatched task without sending any pane input.
 *
 * An unreadable frame (reason classified as retryable) is tolerated for
 * `unknownTolerance` consecutive samples and recorded as an `unreadable` event
 * with its frame excerpt. Ambiguous input stops at once, and a streak that
 * reaches the tolerance stops, so an unfamiliar pane still fails closed.
 *
 * @param {{pane:string, workspace:string, receipt:string, intervalMs?:number, debounceMs?:number, deadlineMs?:number, unknownTolerance?:number, resumeFrom?:string|null}} options
 * @param {{run:(bin:string,args:string[],timeoutMs?:number)=>string, sleep?:(ms:number)=>Promise<void>, now?:()=>number, record?:(event:object)=>void}} deps
 */
export async function watch(options, deps) {
  const config = validate(options);
  const run = deps.run;
  const sleep = deps.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const now = deps.now ?? Date.now;
  const record = deps.record ?? (() => {});
  const startedAt = now();
  const deadlineAt = config.deadlineMs === null ? null : startedAt + config.deadlineMs;
  // Never outlive the operator's deadline by more than one read.
  const budget = () => deadlineAt === null
    ? callTimeoutMs
    : Math.max(1, Math.min(callTimeoutMs, deadlineAt - now()));
  const prior = config.resumeFrom === null ? null : resumeEvidence(config.resumeFrom);
  if (prior && prior.pane !== config.pane) throw new Error("resume receipt pane does not match --pane");
  if (prior && prior.workspace !== config.workspace) throw new Error("resume receipt workspace does not match --workspace");
  if (deadlineAt !== null && now() >= deadlineAt) {
    const event = { outcome: "timed_out", at: now(), baseline: null, final: null, sawWorking: false };
    record(event);
    return event;
  }
  // A resumed watch keeps the earlier terminal identity, so a recycled pane fails closed.
  const baseline = inspectPane(config, run, prior ? prior.terminal : null, budget());
  if (!prior && !terminalStates.has(baseline.status)) {
    throw new Error(`watcher requires idle/done baseline, got ${baseline.status}`);
  }
  record({ outcome: "armed", at: startedAt, baseline, resumed: prior !== null });
  // A resumed watch inherits the earlier working evidence; a fresh watch must observe it.
  let sawWorking = prior ? (baseline.status === "working" || prior.sawWorking) : false;
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

  let unknownStreak = 0;
  const inconclusive = sample => {
    const event = { outcome: "inconclusive", at: now(), baseline, final: sample, sawWorking, consecutiveUnknown: unknownStreak };
    record(event);
    return event;
  };

  while (true) {
    if (timedOut()) return timeoutEvent();
    if (!await pause(config.intervalMs)) return timeoutEvent();
    const current = inspectPane(config, run, baseline.terminal, budget());
    latest = current;
    if (timedOut()) return timeoutEvent();
    if (current.status === "unknown") {
      // A repaint in flight can hide the composer and footer rows for
      // milliseconds. Aborting on one such frame discards a healthy role, so an
      // unreadable frame is retried up to the tolerance while its excerpt is
      // recorded. Ambiguous input stops at once: a readable screen whose
      // composer may hold operator text can never be proven safe. A streak that
      // reaches the tolerance stops too, so a genuinely unfamiliar pane fails
      // closed instead of being watched forever.
      if (!retryableUnknown(current.reason)) {
        unknownStreak = 1;
        return inconclusive(current);
      }
      unknownStreak += 1;
      if (unknownStreak >= config.unknownTolerance) return inconclusive(current);
      record({ outcome: "unreadable", at: now(), final: current, sawWorking, consecutiveUnknown: unknownStreak });
      continue;
    }
    unknownStreak = 0;
    if (current.status === "working") sawWorking = true;

    const outcome = current.status === "blocked" ? "blocked" : terminalStates.has(current.status) && sawWorking ? "settled" : null;
    if (!outcome) continue;
    if (!await pause(config.debounceMs)) return timeoutEvent();
    const stable = inspectPane(config, run, baseline.terminal, budget());
    latest = stable;
    if (timedOut()) return timeoutEvent();
    if (current.status !== stable.status) continue;
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
  const values = flags(args, ["pane", "workspace", "receipt", "interval-ms", "debounce-ms", "deadline-ms", "unknown-tolerance", "resume-from"]);
  return validate({
    pane: values.pane,
    workspace: values.workspace,
    receipt: values.receipt,
    intervalMs: values["interval-ms"],
    debounceMs: values["debounce-ms"],
    deadlineMs: values["deadline-ms"],
    unknownTolerance: values["unknown-tolerance"],
    resumeFrom: values["resume-from"],
  });
}

function parseWait(args) {
  const values = flags(args, ["receipt", "timeout-ms"]);
  return { receipt: values.receipt, timeoutMs: values["timeout-ms"] ?? 10000 };
}

export async function main(args, { run = (bin, argv, timeoutMs = callTimeoutMs) => execFileSync(bin, argv, { encoding: "utf8", timeout: timeoutMs, stdio: ["ignore", "pipe", "pipe"] }), log = console.log, ...watchDeps } = {}) {
  if (args.includes("--help")) {
    log(usage());
    return { outcome: "help" };
  }
  const foreign = args.find(arg => foreignFlags.includes(arg));
  if (foreign) {
    throw new Error(`${foreign} belongs to herdr_panes.py; this script never validates a selection`);
  }
  if (args.includes("--inspect")) {
    const options = flags(args.filter(arg => arg !== "--inspect"), ["pane", "workspace"]);
    const result = inspectPane(options, run);
    log(JSON.stringify(result));
    return result;
  }
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
