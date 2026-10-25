// Activity is visible UI evidence, not agent_status or lifecycle counters.

export function parsePaneOutput(raw) {
  const lines = raw.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").trimEnd().split(/\r?\n/);
  const composerText = line => {
    const match = line.match(/^(?:☤\s+)?❯(?:\s(.*))?$/) ?? line.match(/^.+\s❯(?:\s(.*))?$/);
    return match ? (match[1] ?? "").trim() : null;
  };
  const index = lines.findLastIndex(line => composerText(line) !== null);
  if (index < 0) return { status: "unknown" };
  const after = lines.slice(index + 1).filter(line => line.trim() && !/^─+$/.test(line.trim()));
  // Only recognize the live bottom composer/footer, never old transcript examples.
  if (after.length !== 1 || !/^\s*☤ .+ · .+/.test(after[0])) return { status: "unknown" };
  const panel = lines.slice(Math.max(0, index - 8), index).join("\n");
  if (/approval required|sudo password|credential input|confirm reset/i.test(panel)) return { status: "blocked" };
  if (/Queue · [1-9][0-9]* queued|Subagents · [1-9][0-9]* live|↩ resumes when subagent finishes/.test(panel)) return { status: "unknown" };
  const composer = composerText(lines[index]);
  const busy = /⏱|\bctrl\+c\s+stop\b|⌃c\s+stop/i.test(after[0]) || /^── [\u2800-\u28ff] .+/m.test(panel);
  if (composer === "type to queue a message for after this turn" && busy) return { status: "working" };
  // Hermes can retain the queue placeholder after a completed turn. A frozen
  // footer still proves the composer is empty; arbitrary draft text stays unknown.
  if ((composer === "" || composer === "type to queue a message for after this turn") && !busy && /⏲/.test(after[0])) return { status: "idle" };
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
    return a;
  };
  const before = get();
  const output = run("herdr", ["agent", "read", options.pane, "--source", "detection", "--lines", "100"]);
  const after = get();
  if (before.terminal_id !== after.terminal_id) throw new Error("terminal identity changed during output read");
  return { pane: options.pane, workspace: options.workspace, terminal: after.terminal_id,
    source: "pane-output", ...parsePaneOutput(output) };
}
