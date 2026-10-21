# Herdr executor transport

Load this reference before controlling a pane when `$HERDR_ENV=1`. The parent
skill owns task scope and review; this reference owns selection, delivery, and
lifecycle checks. It grants no commit, credential, installation, or stop authority.
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

2. Show the overview. An explicit executor pane ID supplied by the operator in
   this launch may be used directly; otherwise use `clarify` with up to four eligible
   Hermes panes (idle/done, not the orchestrator). Each choice names pane ID,
   label, state, and cwd; Other accepts a literal pane ID. No answer means stop.
3. Capture fresh pane JSON after selection. Use `write_file` for selection evidence:
   `{"source":"launch","pane_id":"<literal-id>"}` for an explicit launch choice,
   or `{"source":"clarify","outcome":"submitted","status":"answered","pane_id":"<literal-id>"}`
   reflecting the actual form result. Never invent a launch choice after timeout.
   Validate through `terminal` by adding `--selection <scratch>/selection.json` to
   the overview command. Require exit 0 before control; reject stale/busy, foreign,
   duplicate, missing, or unknown panes. The helper checks supplied evidence, not
   its authenticity or future liveness: retain the operator message/form result
   and recheck state before control. On an invalid answered choice,
   offer one corrective form; timeout or absent candidates ends in a blocker.
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
5. Send the compact role packet without `--wait`. Review is read-only; the
   implementer does not stage, commit, or change the CHG path.
6. Wait through the lifecycle API, using the selected ID:

   ```text
   herdr agent wait <pane-id> --until idle --until done --until blocked --timeout <time-budget-ms>
   ```

   Herdr timeout is milliseconds; `terminal.timeout` is seconds. For example,
   use Herdr `--timeout 240000` with `terminal(timeout=300)`. For longer waits,
   run one tracked background wait and consume its result via `process_manage`;
   never substitute sleeps, pane captures, or concurrent waits.

`idle`/`done` permit reading the report and verifying the actual diff/checks;
they do not prove task completion. On `blocked`, inspect with `herdr agent get`
and `herdr agent read`, then surface the decision; do not answer speculatively.
On timeout, inspect state and report before another action; do not resend a task
merely because the wait expired. Do not poll terminal text or file changes to
infer executor completion.

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
