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

Require exit 0 and JSON `outcome` `armed`. The baseline is `idle` or `done`, with literal pane, workspace, and terminal IDs plus `state_change_seq` and `completion_seq`. Any other result blocks delivery: stop that background process with `process_manage`, and do not dispatch or start another watcher.

3. Send the role packet once, without `--wait`, then end the turn. Do not poll, run `herdr agent wait`, or inject input. The watcher never runs `agent prompt`, `/new`, `/busy`, `/goal`, or a status question.

4. On the exit notification, read the receipt once with `read_file`; the notification carries the same outcome. If a later turn finds the process still running, leave it.

The default watch has no lifecycle deadline. Add `--deadline-ms <operator-approved-ms>` only for a real task deadline, never as a retry interval.

## Outcomes

It calls only `herdr agent get <pane-id>`. `settled` requires observed post-baseline `working`, then stable `idle`/`done` with advanced state and completion sequences. Stable later `blocked` is not completion. A second matching read rejects flicker. Pane, workspace, terminal, or agent-identity drift, a missing terminal ID, unknown state, any counter regression, or an API error fails closed. One transient read is retried; the second fails closed.

| Outcome | Meaning | Action |
| --- | --- | --- |
| `settled` | Working seen, then stable completion. | Verify artifacts. Not success by itself. |
| `blocked` | Stable post-baseline block. | Stop. Use the native approval surface. |
| `timed_out` | Explicit deadline elapsed. | Stop. Do not resend. |
| `inconclusive_fast` | Completion advanced without witnessed working. | Record read-only evidence and stop. |
| `inconclusive` | Working ended without a completion advance, or state is unknown. | Stop. |
| `monitor_failed` | Identity, API, or counter failure. | Stop. |

For every non-`settled` outcome, capture `herdr agent get`, `herdr agent read`, and external artifacts. Never inject a status request. Waiting is an external process, so it spends neither executor tokens nor goal turns. A deadline bounds polling and debounce; it cannot become a late `settled`.
