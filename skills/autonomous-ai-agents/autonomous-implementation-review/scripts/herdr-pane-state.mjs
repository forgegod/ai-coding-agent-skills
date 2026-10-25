// Activity is visible UI evidence, not agent_status or lifecycle counters.

// Hermes draws a dedicated glyph in front of the composer while it waits on a
// human: the padlock for a masked password, the key for a masked credential,
// the warning sign for an approval or confirmation, the pencil or question mark
// for a clarify question, and the gear for a connection prompt. The glyphs are
// identical in every locale, unlike the translated panel titles, so they are
// the stable signal for a pane that is blocked on the operator.
const BLOCKED_COMPOSER = new Map([
  ["🔐", "password-prompt"],
  ["🔑", "credential-prompt"],
  ["⚠", "approval"],
  ["✎", "clarify"],
  ["?", "clarify"],
  ["⚙", "connection"],
]);

export function parsePaneOutput(raw) {
  const lines = raw.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").trimEnd().split(/\r?\n/);
  const composerText = line => {
    const match = line.match(/^(?:☤\s+)?❯(?:\s(.*))?$/) ?? line.match(/^.+\s❯(?:\s(.*))?$/);
    return match ? (match[1] ?? "").trim() : null;
  };
  const index = lines.findLastIndex(line => composerText(line) !== null);
  if (index < 0) return { status: "unknown", reason: "no-composer" };
  // A pending prompt owns the composer glyph, so read it before the footer:
  // a modal panel can squeeze the footer off the visible screen.
  const blocked = BLOCKED_COMPOSER.get([...lines[index]][0]);
  if (blocked) return { status: "blocked", reason: blocked };
  const after = lines.slice(index + 1).filter(line => line.trim() && !/^─+$/.test(line.trim()));
  // Only recognize the live bottom composer/footer, never old transcript examples.
  if (after.length !== 1 || !/^\s*☤ .+ · .+/.test(after[0])) return { status: "unknown", reason: "no-footer" };
  const panel = lines.slice(Math.max(0, index - 8), index).join("\n");
  if (/Queue · [1-9][0-9]* queued|Subagents · [1-9][0-9]* live|↩ resumes when subagent finishes/.test(panel)) return { status: "unknown", reason: "queued-input" };
  const composer = composerText(lines[index]);
  const busy = /⏱|\bctrl\+c\s+stop\b|⌃c\s+stop/i.test(after[0]) || /^── [\u2800-\u28ff] .+/m.test(panel);
  if (composer === "type to queue a message for after this turn" && busy) return { status: "working", reason: "busy" };
  // Hermes can retain the queue placeholder after a completed turn. A frozen
  // footer still proves the composer is empty; arbitrary draft text stays unknown.
  if ((composer === "" || composer === "type to queue a message for after this turn") && !busy && /⏲/.test(after[0])) return { status: "idle", reason: "idle" };
  // Visible composer text is a draft (or a Hermes example prompt), not idle.
  if (composer !== "" && composer !== "type to queue a message for after this turn") return { status: "unknown", reason: "composer-text" };
  return { status: "unknown", reason: "no-activity-marker" };
}

export function inspectPane(options, run, expectedTerminal = null, timeoutMs = undefined) {
  for (const key of ["pane", "workspace"]) {
    if (typeof options[key] !== "string" || !/^[A-Za-z0-9:_-]+$/.test(options[key])) throw new Error(`invalid ${key} ID`);
  }
  const get = () => {
    const data = JSON.parse(run("herdr", ["agent", "get", options.pane], timeoutMs));
    if (data.error) throw new Error(`Herdr error: ${JSON.stringify(data.error)}`);
    const a = data.result?.agent;
    if (!a || a.pane_id !== options.pane || a.workspace_id !== options.workspace || a.agent !== "hermes" ||
        typeof a.terminal_id !== "string" || !a.terminal_id || (expectedTerminal && expectedTerminal !== a.terminal_id)) {
      throw new Error("pane/workspace/terminal identity changed or is not Hermes");
    }
    return a;
  };
  const before = get();
  const output = run("herdr", ["agent", "read", options.pane, "--source", "detection", "--lines", "100"], timeoutMs);
  const after = get();
  if (before.terminal_id !== after.terminal_id) throw new Error("terminal identity changed during output read");
  return { pane: options.pane, workspace: options.workspace, terminal: after.terminal_id,
    source: "pane-output", ...parsePaneOutput(output) };
}
