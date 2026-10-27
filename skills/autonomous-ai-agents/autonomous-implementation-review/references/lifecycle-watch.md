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
The setup `/status` readback belongs to herdr.md step 4, before arming; while this
watcher runs it stays forbidden.

4. On the exit notification, read the receipt once with `read_file`. The last JSON object is the verdict; earlier `unreadable` lines are samples and can precede `settled`. If the watcher ended `inconclusive`, the role may still be running. Run one fresh `--inspect` and compare its literal pane, workspace, and terminal IDs with the receipt's `final` identity. A verdict that followed `unreadable` events means frames could not be parsed, not that the pane looked unfamiliar: the recorded excerpt shows what was on screen. Only when all three match and the status is `working` may you resume:

```text
node <this-skill-dir>/scripts/herdr_lifecycle_watch.mjs --pane <pane-id> --workspace <workspace-id> --receipt <new-fresh-scratch>/lifecycle.jsonl --resume-from <prior-receipt-path>
```

`--resume-from` takes the earlier receipt path. The watcher reads that receipt itself, inherits its terminal identity and observed `working` evidence, and re-checks every sample against the same terminal. It never trusts a fresh `--inspect` alone: identity drift, a changed terminal, or a non-`inconclusive` prior outcome fails closed. Use a new receipt path; the resumed watcher writes a new receipt and never overwrites the prior one. Resume only once per `inconclusive` receipt. Do not review, close out, or send a status prompt while a role is unresolved.

The default watch has no lifecycle deadline. Add `--deadline-ms <operator-approved-ms>` only for a real task deadline, never as a retry interval. Reads are bounded by the remaining deadline, so a stalled Herdr call cannot turn into a late outcome.

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

The supported English CLI has either a `☤ ❯` composer or a named-session prompt
ending in `❯`, plus a `☤` status footer. Working needs the busy-queue placeholder
plus a live `⏱`/spinner or `ctrl+c stop` hint; idle needs an empty composer and
frozen `⏲` without that stop hint. Drafts, queued input and live subagents block
automatic injection. Other skins, locales, TUI layouts, truncation or overlays
require operator recovery, not an automatic fallback to metadata.

An `unknown` status carries a `reason` in two classes, and the watcher treats them
differently. `composer-text` and `queued-input` are readable screens whose input is
ambiguous: they stop the watch at once, because no observation can prove such a
pane safe to inject into. `no-composer`, `no-footer` and `no-activity-marker` mean
the frame itself could not be read. A repaint in flight hides the composer and
footer rows for milliseconds, so one such sample is not evidence of an unfamiliar
UI: the watcher tolerates `--unknown-tolerance <n>` consecutive unreadable frames
(default 3, minimum 1), records each as an `unreadable` event, and resets the
streak on the next recognized sample. A streak that reaches the tolerance still
stops the watch, so an unrecognized pane cannot be monitored forever.

Every recorded unreadable sample keeps a bounded `frame` excerpt, at most six
control-free lines. The pane repaints within milliseconds, so a later `agent read`
cannot reproduce the frame: without that excerpt a receipt asserts a state no
surviving evidence supports. Receipts are created mode 0600, and the excerpt is the
same visible tail the operator already sees.

A pending human prompt is detected by the glyph Hermes puts in front of the
composer, not by panel prose. The glyphs are the same in every locale, while the
panel titles are translated: `🔐` password, `🔑` credential, `⚠` approval,
`✎`/`?` clarify, `⚙` connection. A `blocked` status carries the matching
`reason`: `password-prompt`, `credential-prompt`, `approval`, `clarify` or
`connection`. Prose in the transcript that merely names a prompt is not a
pending prompt and must stay injectable.

| Outcome | Meaning | Action |
| --- | --- | --- |
| `settled` | Working seen, then stable completion. | Verify artifacts. Not success by itself. |
| `blocked` | Stable post-baseline block. | Stop. Use the native approval surface. |
| `timed_out` | Explicit deadline elapsed. | Stop. Do not resend. |
| `inconclusive` | Ambiguous input, or unreadable frames past the tolerance. | Stop, or resume once with `--resume-from`. |
| `monitor_failed` | Identity or API failure. | Stop. |

A fast task that is never sampled working cannot settle. With frozen metadata,
there is no reliable `inconclusive_fast` counter signal: the watcher stays armed
until visible work, an explicit deadline, or operator stop. Do not resend a packet.

A resumed watch inherits the earlier working evidence, so it can settle without
re-observing `working` in its own samples; it still requires the same terminal
and two matching stable terminal samples. It sends no input and starts no new
role. A later `inconclusive` is not success, and the same receipt cannot be
resumed twice. A role switch still needs the orchestrator's separate, explicitly
approved handoff after factual verification.

For every non-`settled` outcome, read the recorded events first: a transient unreadable frame is already preserved there with its excerpt, and a later `agent read` cannot reproduce it. Then capture `herdr agent get`, `herdr agent read`, and external artifacts. Never inject a status request while watching. Waiting is an external process, so it spends neither executor tokens nor goal turns. A deadline bounds polling and debounce; it cannot become a late `settled`.
