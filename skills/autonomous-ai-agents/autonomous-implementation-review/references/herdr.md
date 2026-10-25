# Herdr executor transport

Load before pane control in `$HERDR_ENV=1`; it owns selection, delivery and lifecycle,
not scope/authority. Load [environment-passthrough.md](environment-passthrough.md)
only for child-tool context. Require Herdr, Node 22+, Python 3 and a live executor.
Use packaged `herdr-pane-state.mjs`, not `agent_status`/lifecycle counters; metadata
still binds pane/workspace/terminal IDs, not the Hermes session. See Hermes issue
[#141194](https://github.com/NousResearch/hermes-agent/issues/141194).

## Select and claim

Before reservation or any mutating pane command (including rename, `/new`,
`/busy`, or `/model`), require explicit operator selection. A timed-out,
cancelled, skipped, unanswered, or undelivered form is a blocker. A sole candidate,
an existing `exec` name, or broad autonomous authority never supplies consent.

1. Require `HERDR_ENV=1`, `HERDR_WORKSPACE_ID`, and `HERDR_PANE_ID` through
   `terminal`. The executor pane ID must differ from `HERDR_PANE_ID`; missing
   caller identity blocks control, never infer it from focus. Capture JSON:

   ```sh
   herdr pane list --workspace "$HERDR_WORKSPACE_ID" > <scratch>/panes.json
   ```

   Inspect it with `read_file`, then run the read-only overview through `terminal`:

   ```sh
   python3 <this-skill-dir>/scripts/herdr_panes.py --workspace "$HERDR_WORKSPACE_ID" --orchestrator "$HERDR_PANE_ID" < <scratch>/panes.json
   ```

2. Show the overview. An explicit launch pane ID may be used directly; otherwise
   `clarify` lists up to four non-orchestrator Hermes panes with pane ID,
   label, reported state and cwd; availability is unverified. Other accepts a
   literal pane ID. No answer stops.
3. Capture fresh pane JSON and use `write_file` for actual selection evidence:
   `{"source":"launch","pane_id":"<literal-id>"}` or
   `{"source":"clarify","outcome":"submitted","status":"answered","pane_id":"<literal-id>"}`.
   Through `terminal`, inspect the selected literal pane:

   ```sh
   node <this-skill-dir>/scripts/herdr_lifecycle_watch.mjs --inspect --pane <pane-id> --workspace "$HERDR_WORKSPACE_ID" > <scratch>/inspection.json
   ```

   Validate the selection helper with `--selection <scratch>/selection.json
   --inspection <scratch>/inspection.json`. Require exit 0 and matching visible
   `idle` before control; reject drafts, dialogs, unknown output and identity drift;
   re-inspect before each injection. Output only rejects unsafe visible input and
   never proves the bound session or authorizes a handoff. Offer one corrective form;
   otherwise block.
4. Claim only the selected live agent with `herdr agent rename <pane-id> exec`
   (or use `exec` on an explicitly approved new agent start). If occupied, try
   `exec2`, then `exec3`; do not take over another pane. Read back the agent's
   `name`, not its display `label`, from fresh JSON. It is temporary ownership,
   cleared when the agent exits. Continue controlling by pane ID.

Fixed topology: this pane is orchestrator, selected pane executor. Never reset,
rename, or control the orchestrator as a worker. A capture or `agent_status` cannot
prove empty input; never clear an apparent draft—choose another pane or ask.

## Deliver each role

Use `terminal` with `herdr agent prompt <pane-id> "<text>"`, properly quoting text
as data. This sends bracketed paste, when enabled, followed by Enter in order;
it does not depend on focus or label. Success proves delivery, not acceptance.
Do not use `send-keys` to type or submit normal task text. Reserve
`herdr agent send-keys <pane-id> <key>...` for explicitly authorized interactive
controls; never use keys to bypass a blocked prompt or overwrite input.

While issue #141194 remains open, explicit per-handoff operator approval is the only handoff authority.
Before every role, `clarify` needs fresh submitted approval naming
literal pane ID and goal. It permits only the following setup and one packet; different
pane/goal, no answer or other outcome stops/reselects. Idle/selection/session/watcher
evidence never replaces approval.

For each approved role, from a verified visible idle session:

1. Send `/new --yes <goal-name>` without `--wait`; `--yes` bypasses reset
   confirmation. Use an outcome name such as `review-source-identity`.
2. Read back acceptance and visible idle, unambiguous input. Do not reset a blocked or
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
   verification, not the next handoff; every other outcome stops without pane input.

Do not install `herdr integration install hermes` for monitoring. It only adds
server-restart recovery; it cannot repair stale screen detection or session binding.
Installation changes the profile and needs operator approval/restart.

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
