#!/usr/bin/env node
// One bounded, explicit current-pane handoff. No Git writes or fallback targeting.
import { execFileSync } from "node:child_process";
import { appendFileSync, closeSync, openSync, realpathSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function goal(phase, chg) {
  return `/goal draft Execute only phase ${phase} of ${chg} using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.`;
}

function validate(options) {
  if (!path.isAbsolute(options.repo ?? "")) throw new Error("repo must be an absolute checkout path");
  if (!options.branch || /[\x00-\x20\x7f]/.test(options.branch) || options.branch.startsWith("-")) throw new Error("invalid named target branch");
  if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(options.head ?? "")) throw new Error("head must be a full Git SHA");
  if (!/^[1-9][0-9]*$/.test(options.phase ?? "")) throw new Error("phase must be a positive integer");
  if (!/^docs\/changes\/active\/CHG-[A-Za-z0-9_-]+\.md$/.test(options.chg ?? "")) throw new Error("invalid literal active CHG path");
}

export function handoff(options, { run, record, env = process.env, sessionName = `phase-${options.phase}-${randomUUID()}` }) {
  const timeout = "120000";
  const pane = env.HERDR_PANE_ID;
  const workspace = env.HERDR_WORKSPACE_ID;
  let stage = "preflight";
  let terminal;
  const emit = (extra = {}) => record({ stage, pane, workspace, sessionName, ...extra });
  const cli = (...args) => {
    const output = run("herdr", args);
    // Herdr normally exits nonzero on errors; also reject error envelopes from adapters.
    if (output.trim().startsWith("{")) {
      const data = JSON.parse(output);
      if (data.error) throw new Error(`Herdr error: ${JSON.stringify(data.error)}`);
    }
    return output;
  };
  const agent = (allowed) => {
    const state = JSON.parse(cli("agent", "get", pane)).result?.agent;
    if (!state || state.pane_id !== pane || state.workspace_id !== workspace || state.agent !== "hermes" || !state.terminal_id ||
        (terminal && state.terminal_id !== terminal) || realpathSync(state.foreground_cwd ?? "") !== realpathSync(options.repo)) {
      throw new Error("caller pane identity/cwd changed or is unverified");
    }
    if (!allowed.includes(state.agent_status)) throw new Error(`unsafe caller state: ${state.agent_status}`);
    terminal = state.terminal_id;
    return state;
  };
  const target = () => {
    const git = (...args) => run("git", ["-C", options.repo, ...args]).trim();
    if (git("branch", "--show-current") !== options.branch || git("rev-parse", "HEAD") !== options.head || git("status", "--porcelain=v1")) {
      throw new Error("target is dirty, detached, or changed since selection");
    }
  };
  const read = () => cli("agent", "read", pane, "--source", "recent-unwrapped", "--lines", "100");
  const prompt = (text) => cli("agent", "prompt", pane, text);
  const literal = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ack = (pattern, allowed = ["idle", "done"]) => {
    // Match the ordered acknowledgments after this unique reset, not an older
    // occurrence retained in scrollback. Rust and JS both accept this regex subset.
    cli("pane", "wait-output", pane, "--regex", pattern, "--source", "recent-unwrapped", "--lines", "100", "--timeout", timeout);
    const output = read();
    if (!new RegExp(pattern).test(output)) throw new Error("missing fresh acknowledgment on readback");
    agent(allowed);
    return output;
  };
  try {
    validate(options);
    if (env.HERDR_ENV !== "1" || !workspace || !pane) throw new Error("missing Herdr caller context; never fall back to focus");
    if (!/^[a-zA-Z0-9:_-]+$/.test(pane) || !/^[a-zA-Z0-9:_-]+$/.test(workspace)) throw new Error("invalid caller IDs");
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionName)) throw new Error("invalid session name");
    target();
    const initial = agent(["working"]);
    if (!Number.isSafeInteger(initial.state_change_seq) || !Number.isSafeInteger(initial.completion_seq)) throw new Error("missing caller lifecycle/completion sequence");
    stage = "armed";
    emit({ head: options.head, branch: options.branch, chg: options.chg, phase: options.phase });
    cli("agent", "wait", pane, "--until", "idle", "--until", "done", "--until", "blocked", "--timeout", timeout);
    const settled = agent(["idle", "done"]);
    if (!Number.isSafeInteger(settled.state_change_seq) || settled.state_change_seq <= initial.state_change_seq ||
        !Number.isSafeInteger(settled.completion_seq) || settled.completion_seq <= initial.completion_seq) throw new Error("stale caller settlement");
    target();
    stage = "new-attempted";
    emit();
    prompt(`/new --yes ${sessionName}`);
    const newAck = `New session started: ${sessionName}`;
    ack(literal(newAck));
    stage = "new-accepted";
    emit();
    stage = "queue-attempted";
    emit();
    prompt("/busy queue");
    const queueAck = "Busy input mode set to 'queue'";
    const queuePattern = `${literal(newAck)}[\\s\\S]*${literal(queueAck)}`;
    ack(queuePattern);
    stage = "queue-accepted";
    emit();
    target();
    agent(["idle", "done"]);
    const text = goal(options.phase, options.chg) + ` Target checkout: ${JSON.stringify(options.repo)}; target branch: ${JSON.stringify(options.branch)}; selected HEAD: ${options.head}. Reload the CHG and applicable DOX and revalidate target identity, phase, ownership, and cleanup before reservation or any write; stop if selection is stale. Verify the persisted goal matches this single-phase scope.`;
    stage = "goal-attempted";
    emit({ goal: text });
    // /goal draft calls an auxiliary model before starting a turn. prompt --wait
    // has a five-second activity gate, regardless of its larger timeout.
    prompt(text);
    const goalPattern = `${queuePattern}[\\s\\S]*Goal set \\([0-9]+-turn budget\\): ${literal(text.slice("/goal draft ".length))}`;
    const readback = ack(goalPattern, ["working", "idle", "done", "blocked"]);
    const state = agent(["working", "idle", "done", "blocked"]);
    stage = "goal-accepted";
    emit({ state: state.agent_status, readback });
  } catch (error) {
    emit({ failed: true, error: error.message });
    throw error;
  }
}

export function main(args) {
  const options = {};
  let dispatch = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dispatch") { dispatch = true; continue; }
    const key = args[i].slice(2);
    if (!args[i].startsWith("--") || !["repo", "branch", "head", "chg", "phase", "receipt"].includes(key) || options[key] !== undefined || !args[i + 1]) throw new Error(`invalid argument: ${args[i]}`);
    options[key] = args[++i];
  }
  validate(options);
  if (!path.isAbsolute(options.receipt ?? "")) throw new Error("receipt must be a fresh absolute scratch path");
  const receiptParent = realpathSync(path.dirname(options.receipt));
  const relative = path.relative(realpathSync(options.repo), receiptParent);
  if (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)) throw new Error("receipt must be outside the target checkout");
  if (!dispatch) {
    console.log(JSON.stringify({ mode: "preview", goal: goal(options.phase, options.chg), sequence: ["/new --yes <unique-phase-session-name>", "/busy queue", "/goal draft <designed-single-phase-goal>"], ...options }, null, 2));
    return;
  }
  const fd = openSync(options.receipt, "wx", 0o600);
  try {
    const record = (event) => appendFileSync(fd, JSON.stringify(event) + "\n");
    handoff(options, {
      record,
      run: (bin, argv) => execFileSync(bin, argv, { encoding: "utf8", timeout: 130000, maxBuffer: 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }),
    });
  } finally {
    closeSync(fd);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(`next-handoff: ${error.message}`); process.exitCode = 1; }
}
