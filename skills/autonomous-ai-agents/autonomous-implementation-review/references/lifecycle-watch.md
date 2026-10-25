# Passive Herdr lifecycle watcher

Load before the role packet. It observes one dispatch, never sends pane input, and never decides that the task succeeded.

## Arm, dispatch, then leave

1. Start one background watcher with a fresh absolute receipt outside the target checkout:

```text
node <this-skill-dir>/scripts/herdr_lifecycle_watch.mjs --pane <pane-id> --workspace <workspace-id> --receipt <fresh-scratch>/lifecycle.jsonl
```

Use `background=true`, `persist_on_release=true`, and `notify=true`. That notification means process exit, not readiness. Do not use a notify pattern or an immediate receipt read: the process exits later, and stdout can stay buffered.

2. In the same turn, wait only for arming. Run this in the foreground, not as a background job:

```text
node <this-skill-dir>/scripts/herdr_lifecycle_watch.mjs --wait-armed --receipt <same-receipt> --timeout-ms 10000
```

Require exit 0 and JSON `outcome` `armed`. The baseline is visibly `idle`, with literal pane, workspace, and terminal IDs and `source: pane-output`. Any other result blocks delivery: stop that background process with `process_manage`, and do not dispatch or start another watcher.

3. Send the role packet once, without `--wait`, then end the turn. Do not poll, run `herdr agent wait`, or inject input. The watcher never runs `agent prompt`, `/new`, `/busy`, `/goal`, or a status question.

4. On the exit notification, read the receipt once with `read_file`; the notification carries the same outcome. If a later turn finds the process still running, leave it.

The default watch has no lifecycle deadline. Add `--deadline-ms <operator-approved-ms>` only for a real task deadline, never as a retry interval.

## Outcomes

It uses `herdr agent get <pane-id>` before and after `agent read <pane-id> --source detection`.
The packaged `herdr-pane-state.mjs` binds literal identities and reads activity
from the current bottom composer/footer. `agent_status`, `state_change_seq`, and
`completion_seq` are not activity evidence: they can remain frozen while Hermes works.
Nor can pane output identify the bound Hermes session. While issue #141194 remains
open, a watcher receipt never authorizes a role handoff; explicit operator approval
of the literal next target pane is the only continuation authority.
`settled` requires observed post-baseline visible `working`, then two matching
visible `idle` samples. Stable `blocked` is not completion. Identity drift or an
API error fails closed; unfamiliar UI is inconclusive. Never use old transcript
`Working`/`∴ Thought for` lines to infer live activity.

The supported English classic CLI has a `☤ ❯` bottom composer and `☤` status footer.
Working needs the busy-queue placeholder plus a live `⏱`/spinner; idle needs an
empty composer and frozen `⏲`. Drafts, queued input and live subagents block
automatic injection. Other skins, locales, TUI layouts, truncation or overlays
require operator recovery, not an automatic fallback to metadata.

| Outcome | Meaning | Action |
| --- | --- | --- |
| `settled` | Working seen, then stable completion. | Verify artifacts. Not success by itself. |
| `blocked` | Stable post-baseline block. | Stop. Use the native approval surface. |
| `timed_out` | Explicit deadline elapsed. | Stop. Do not resend. |
| `inconclusive` | Current output is unrecognized or has ambiguous input. | Stop. |
| `monitor_failed` | Identity or API failure. | Stop. |

A fast task that is never sampled working cannot settle. With frozen metadata,
there is no reliable `inconclusive_fast` counter signal: the watcher stays armed
until visible work, an explicit deadline, or operator stop. Do not resend a packet.

For every non-`settled` outcome, capture `herdr agent get`, `herdr agent read`, and external artifacts. Never inject a status request. Waiting is an external process, so it spends neither executor tokens nor goal turns. A deadline bounds polling and debounce; it cannot become a late `settled`.
