// Canonical copy; phased-plan-next packages an identical copy for standalone installs.
// Activity is visible UI evidence, not agent_status or lifecycle counters.
import { realpathSync } from "node:fs";

export function parsePaneOutput(raw) {
  const lines = raw.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").trimEnd().split(/\r?\n/);
  const index = lines.findLastIndex(line => /^(?:☤\s+)?❯(?:\s|$)/.test(line));
  if (index < 0) return { status: "unknown" };
  const after = lines.slice(index + 1).filter(line => line.trim() && !/^─+$/.test(line.trim()));
  // Only recognize the live bottom composer/footer, never old transcript examples.
  if (after.length !== 1 || !/^\s*☤ .+ · .+/.test(after[0])) return { status: "unknown" };
  const panel = lines.slice(Math.max(0, index - 8), index).join("\n");
  if (/approval required|sudo password|credential input|confirm reset/i.test(panel)) return { status: "blocked" };
  if (/Queue · [1-9][0-9]* queued|Subagents · [1-9][0-9]* live|↩ resumes when subagent finishes/.test(panel)) return { status: "unknown" };
  const composer = lines[index].replace(/^(?:☤\s+)?❯\s*/, "").trim();
  const busy = /⏱/.test(after[0]) || /^── [\u2800-\u28ff] .+/m.test(panel);
  if (composer === "type to queue a message for after this turn" && busy) return { status: "working" };
  if (composer === "" && !busy && /⏲/.test(after[0])) return { status: "idle" };
  return { status: "unknown" };
}

export function inspectPane(options, run, expectedTerminal = null) {
  for (const key of ["pane", "workspace"]) {
    if (typeof options[key] !== "string" || !/^[A-Za-z0-9:_-]+$/.test(options[key])) throw new Error(`invalid ${key} ID`);
  }
  const get = () => {
    const data = JSON.parse(run("herdr", ["agent", "get", options.pane]));
    if (data.error) throw new Error(`Herdr error: ${JSON.stringify(data.error)}`);
    const a = data.result?.agent;
    if (!a || a.pane_id !== options.pane || a.workspace_id !== options.workspace || a.agent !== "hermes" ||
        typeof a.terminal_id !== "string" || !a.terminal_id || (expectedTerminal && expectedTerminal !== a.terminal_id)) {
      throw new Error("pane/workspace/terminal identity changed or is not Hermes");
    }
    if (options.cwd && realpathSync(a.foreground_cwd ?? "") !== realpathSync(options.cwd)) throw new Error("pane cwd changed or is unverified");
    return a;
  };
  const before = get();
  const output = run("herdr", ["agent", "read", options.pane, "--source", "detection", "--lines", "100"]);
  const after = get();
  if (before.terminal_id !== after.terminal_id) throw new Error("terminal identity changed during output read");
  return { pane: options.pane, workspace: options.workspace, terminal: after.terminal_id,
    source: "pane-output", ...parsePaneOutput(output) };
}

// Synchronous bounded wait for the reset helper. No input, counters, or agent wait.
export function waitForPane(options, run, expectedTerminal, allowed, {
  now = Date.now,
  sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms),
  timeoutMs = 120000,
} = {}) {
  const deadline = now() + timeoutMs;
  while (now() < deadline) {
    const first = inspectPane(options, run, expectedTerminal);
    if (first.status === "blocked" || first.status === "unknown") throw new Error(`unsafe visible pane state: ${first.status}`);
    if (allowed.includes(first.status)) {
      sleep(Math.min(500, Math.max(0, deadline - now())));
      if (now() >= deadline) break;
      const stable = inspectPane(options, run, expectedTerminal);
      if (now() >= deadline) break;
      if (stable.status === first.status) return stable;
      if (stable.status === "blocked" || stable.status === "unknown") throw new Error(`unsafe visible pane state: ${stable.status}`);
    } else sleep(Math.min(200, Math.max(0, deadline - now())));
  }
  throw new Error("visible pane settlement timed out");
}
