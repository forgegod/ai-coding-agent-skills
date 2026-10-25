# Herdr executor transport

Load before pane control in `$HERDR_ENV=1`; it owns selection, delivery and
lifecycle, not scope or authority. Load
[environment-passthrough.md](environment-passthrough.md) only for child-tool
Herdr context.
Require Herdr, Python 3, and a live Hermes executor with the configured model keys.

## Select and claim

Before reservation or any mutating pane command (including rename, `/new`,
`/busy`, or `/model`), require explicit operator selection. A timed-out,
cancelled, skipped, unanswered, or undelivered form is a blocker. A sole candidate,
an existing `exec` name, or broad autonomous authority never supplies consent.

1. Require `$HERDR_WORKSPACE_ID` and the actual orchestrator pane ID; do not infer
   it from focus. Capture JSON to a fresh session-scratch path through `terminal`:

   ```sh
   herdr pane list --workspace "$HERDR_WORKSPACE_ID" > <scratch>/panes.json
   ```

   Inspect it with `read_file`, then run the read-only overview through `terminal`:

   ```sh
   python3 <this-skill-dir>/scripts/herdr_panes.py --workspace "$HERDR_WORKSPACE_ID" --orchestrator <pane-id> < <scratch>/panes.json
   ```

2. Show the overview. An explicit launch pane ID may be used directly; otherwise
   `clarify` lists up to four idle/done, non-orchestrator Hermes panes with pane ID,
   label, state and cwd. Other accepts a literal pane ID. No answer stops.
3. Capture fresh pane JSON and use `write_file` for actual selection evidence:
   `{"source":"launch","pane_id":"<literal-id>"}` or
   `{"source":"clarify","outcome":"submitted","status":"answered","pane_id":"<literal-id>"}`.
   Validate through `terminal` with `--selection <scratch>/selection.json`; require
   exit 0 before control and reject stale/busy, foreign, duplicate, missing or
   unknown panes. Evidence is not future liveness: retain the result and recheck
   state. Offer one corrective form only; otherwise block.
4. Claim only the selected live agent with `herdr agent rename <pane-id> exec`
   (or use `exec` on an explicitly approved new agent start). If occupied, try
   `exec2`, then `exec3`; do not take over another pane. Read back the agent's
   `name`, not its display `label`, from fresh JSON. It is temporary ownership,
   cleared when the agent exits. Continue controlling by pane ID.

Keep the fixed topology: this pane is orchestrator, the selected pane executor.
Never reset, rename, or control the orchestrator as a worker. Plain-text composer
examples such as `Try "explain this codebase"` may be stripped italic placeholders,
not drafts; neither a capture nor `agent_status` proves an empty buffer. Never
clear an apparent draft; choose another pane or ask if input state is ambiguous.

## Deliver each role

Use `terminal` with `herdr agent prompt <pane-id> "<text>"`, properly quoting text
as data. This sends bracketed paste, when enabled, followed by Enter in order;
it does not depend on focus or label. Success proves delivery, not acceptance.
Do not use `send-keys` to type or submit normal task text. Reserve
`herdr agent send-keys <pane-id> <key>...` for explicitly authorized interactive
controls; never use keys to bypass a blocked prompt or overwrite input.

For each implement, review, or correction role, from a verified idle/done session:

1. Send `/new --yes <goal-name>` without `--wait`; `--yes` bypasses reset
   confirmation. Use an outcome name such as `review-source-identity`.
2. Read back acceptance and idle, unambiguous input. Do not reset a blocked or
   working session.
3. Send `/busy queue` without `--wait` and read back acceptance before model/task
   delivery. Accidental follow-up input then queues instead of redirecting work.
4. Send `/model <configured-key>` without `--wait`; read back Hermes acceptance.
   Local slash commands may not enter `working`. Never add `--global`, modify
   config, interpolate the selector into a shell command, or silently substitute
   an unavailable model. Report rejection and ask for a usable key.
5. Load [lifecycle-watch.md](lifecycle-watch.md). Its foreground `--wait-armed`
   command must exit 0 before the role packet; otherwise stop the background
   watcher and do not send it.
6. Send the compact role packet once, without `--wait`, then end the turn. Review
   is read-only; the implementer does not stage, commit, or change the CHG path.
   Do not run `herdr agent wait` or inject another prompt while the watcher runs.
7. After the watcher exits, apply its one receipt. `settled` permits factual
   verification; every other outcome stops without pane input.

Do not install `herdr integration install hermes` for routine monitoring. That
integration supplies a resumable session ID for server-restart recovery; Herdr's
own screen detection supplies working/idle/blocked. Installation changes the
profile and needs operator approval and restart.

## Explicit stop requests

An operator stop request pauses the orchestrator goal first: ask the operator to
run `/goal pause` in that session; printing the command does not execute it.
Do not dispatch another packet. After the executor settles, prompt it with
`/stop` if its Hermes background processes must stop. `/stop` is not an immediate
foreground-turn interrupt and under `/busy queue` is a later queued turn. Read
back the resulting pane/state before claiming a stop. Do not substitute `ctrl+c`.

## Verification

Record selected pane/workspace ID, claimed live agent name, each role session
name, accepted queue/model selections, wait outcomes, inspected reports, and
failure/replacement decisions. Herdr transport evidence is not code approval.
