---
name: autonomous-implementation-review
description: Implement changes with an independent review loop.
version: 0.3.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [multi-agent, implementation, code-review, worktrees, verification]
    config:
      - key: autonomous_ai_agents.reviewer
        description: Hermes `/model` selector used for the review phase.
        default: grok
        prompt: Reviewer model key
      - key: autonomous_ai_agents.implementer
        description: Hermes `/model` selector used for implementation work.
        default: astra
        prompt: Implementer model key
---

# Autonomous Implementation Review

Run a bounded implementation-and-review loop with explicit roles. The executor starts a fresh, goal-named Hermes session for each phase, implements with the configured implementer model, then the orchestrator starts a second fresh session in that same executor process and switches it to the configured reviewer model for a read-only review phase. Hermes remains the coordinator and verifies every claimed result itself.

The `autonomous_ai_agents.implementer` and `autonomous_ai_agents.reviewer` values are Hermes `/model` selectors, not executable names, Herdr agent kinds, pane names, or shell arguments. When controlling an idle Hermes session, send `/model <configured-key>` through that session before the role prompt, then read back the resulting model status. Keep the change session-scoped: never add `--global`, edit config, or interpolate the value into a shell command. If the selector is unavailable, report the actual `/model` failure and ask for a usable selector; do not substitute one silently.

## When to Use

- A code change benefits from an independent review before integration.
- Work can be expressed as a bounded acceptance criterion with relevant tests.
- Parallel subtasks are independent enough for separate worktrees.
- The user requests an implementer/reviewer agent workflow.

Do not use this for a trivial one-file edit, credentials, destructive production work, or any task that requires an interactive user decision before implementation.

## Prerequisites

- Establish the repository root, current branch, clean/unrelated changes, and project instructions before dispatch.
- Read applicable `AGENTS.md`, contribution guidance, manifests, and relevant source/tests before assigning work.
- For each Hermes role session, confirm the configured `/model` selector is accepted in that session. A model alias is valid only when Hermes accepts it; do not probe it with `command -v` or treat it as a shell command.
- Give each editing agent its own git worktree. A reviewer uses a read-only checkout or the completed implementation worktree and must not modify files.
- Set a finite turn, time, and cost budget appropriate to the task.
- For a material change in a CAP/CHG repository, load `application-records`, then use `phased-plan-design` to create or revise the active CHG before autonomous work and `phased-plan-execution` to execute the selected phase. The tracked CHG phase table is the only mutable progress authority.

### Goal lifecycle and repository truth

- Use `/goal` for the orchestrator's implementation-review work. Its judge re-evaluates the explicit outcome, verification, constraints, boundaries, and stop condition after every turn, then continues only while the goal remains unproven. Do not use `/loop` for this workflow: `/loop` replays a fixed prompt on a cadence and does not maintain this completion contract, so it can re-fire stale work after a verified checkpoint. Reserve `/loop` for bounded external polling such as CI status.
- Hermes automatically compresses active conversations when its configured context threshold is reached (50% by default). Goal state persists independently of the active transcript. For material work, the CHG and any committed review receipt provide fresh-session context; do not create a profile-local continuation document.
- At each verified phase boundary, use `/context` to inspect the orchestrator's active-context headroom. Update the selected CHG with the phase state and concise verification evidence as `phased-plan-execution` requires. When a project needs a review receipt, retain a frozen, review-only artifact under `docs/changes/reviews/CHG-<number>/`; it is evidence, not a second plan.
- When an active CHG exists, derive the outcome, scope, phase gate, and next phase from that record. A fresh session must read the CHG, any linked committed review receipt, and the current workspace before acting. Scratch logs, patches, and agent reports are temporary evidence only and never the sole resumption source.
- When an operator wants to compact earlier, they—not the running agent—run this sequence in the **orchestrator** session: `/goal pause`, `/compress here 2`, inspect `/context`, then `/goal resume`. Pausing stops automatic continuation without clearing the goal; compression reduces active context while preserving goal state and session history. Do not send these commands to `exec`; executor sessions are already reset for each role phase. An assistant response containing slash-command text does not execute those commands in its own session.
- An operator starts a new orchestrator session only at an intentional goal boundary: pause or clear the old goal, use `/new --yes <next-goal-name>` to bypass the reset confirmation, then send `/busy queue` before seeding it from the selected CHG and setting the next `/goal`. Queue mode prevents a follow-up message from redirecting active goal work. Use `session_search` only to retrieve a specific prior decision or claim, then verify it against the repository; do not use `/resume` to make an overloaded orchestrator session small.
- Keep role prompts compact: pass the task packet, paths, commit IDs, and acceptance criteria. Let agents inspect the working tree and reports themselves; never paste full diffs, test logs, or prior transcripts into every phase.

### Goal-scoped finalization authority

- A terminal goal closes its implementation worktree automatically when the request or project policy grants goal-scoped finalization authority. `commit` authorizes integration and a commit; `push` is separate authority and must be explicit. Do not infer either from a goal name, executor identity, or a passing test.
- Record that authority in the goal packet. If it is absent, complete verification and review but leave the worktree intact and report the exact ready-to-commit boundary; do not treat a manual closeout as silently authorized.
- Finalization is part of the goal, not an operator cleanup chore: after the verified gate and review approve the same frozen diff, integrate the phase, commit it through `git-commit-message`, verify the commit, and remove the dedicated worktree. A terminal goal must not remain active solely because its verified changes are still stranded in a worktree.

### Executor turn-cap recovery

- Treat executor turn or tool-call exhaustion as a terminal lifecycle event, not as an executor-controlled pause. Its forced final reply cannot run checks, update the CHG, or send itself a generic “continue as planned” prompt.
- The orchestrator must read that report, inspect the current diff and verification state, and dispatch a fresh, goal-named executor session for the exact unfinished bounded action. A turn cap is not a user decision or a completed checkpoint.
- Keep each executor packet below the configured cap: one defect cluster, one focused verification rerun, one phase gate, or one review. Split dependent work at a verified boundary rather than merely raising the cap and producing a larger unreviewed diff.
- If a correction occurs after a phase row was marked done or after its frozen review, restore that row to `in-progress` before further correction work. The prior gate and review apply only to their exact freeze; do not leave a done table row and append contradictory narrative progress elsewhere.
- Continue automatically after cap recovery unless a real external dependency, explicit operator pause, or unresolved decision blocks the next bounded action.

### Herdr session selection

When `$HERDR_ENV=1`, inspect the current workspace before controlling any pane. Require `$HERDR_WORKSPACE_ID`; if it is absent, do not fall back to a UI-focused pane. With `terminal`, run the bundled read-only parser:

```sh
set -o pipefail
herdr pane list --workspace "$HERDR_WORKSPACE_ID" | python3 <this-skill-dir>/scripts/herdr_panes.py --workspace "$HERDR_WORKSPACE_ID"
```

Show the grouped tab/pane overview to the operator and require them to select one coding-session candidate by **pane ID** before prompt delivery or model switching. A pane label is display metadata, not a reliable `herdr agent` target. The parser considers a pane a coding-session candidate only when the JSON has a non-empty `agent` field; `agent_status: unknown` without `agent` is not a coding agent.

Use `clarify` to present executor selection as one single-select form, never as a prose request. Include up to four eligible candidates—non-orchestrator panes whose recognized agent is idle or done—as choices, with the preferred idle pane first. Each choice names the pane ID, label when present, agent kind, state, and cwd. The form automatically includes an Other free-text row; invite the operator to enter a different pane ID there.

After a form response, re-run the overview parser and validate the chosen or typed pane ID against fresh JSON: it must still exist in the current workspace, not be the orchestrator, have a recognized coding agent, and be idle or done. A label, agent kind, prose description, or a currently working/blocked/unknown pane is not a valid selection. If validation fails, show the current overview and present one corrective `clarify` form; do not send the raw response to Herdr. If no eligible candidate exists, state the blocker and do not offer an unsafe selection.

Use the fixed two-pane topology: the pane where this skill runs is the **orchestrator** and one explicitly selected coding-agent pane is the **executor**. Never rename or control the orchestrator as an executor.

After the operator selects the executor pane, claim that live agent with the short Herdr name `exec` before any model or task prompt:

- For an existing selected agent, run `herdr agent rename <pane-id> exec`. For a newly started agent, pass `exec` to `herdr agent start` rather than renaming afterward.
- Re-run `herdr pane list --workspace "$HERDR_WORKSPACE_ID"` and confirm that the selected pane's agent `name` is `exec` before treating the pane as ours. The overview parser's `label` is separate display metadata and may remain a generated value such as `a2` after `herdr agent rename`; it is not the ownership marker. If Herdr refuses the name because it is already in use, use `exec2`, then `exec3`; never take over an unselected pane.
- `exec` is a live ownership marker, not persistent project state. Herdr clears it when the agent exits; continue to use the pane ID for control.

Do not infer a draft from plain terminal text. Hermes' Ink UI renders its idle-and-empty composer examples such as `Try "explain this codebase"` as an italic placeholder only when the real buffer is empty. ANSI formatting may help identify that placeholder, but an unstyled/stripped terminal capture cannot prove it is not user text. For an existing session, rely on the live Herdr state and never overwrite an apparent draft; offer a different pane or ask the operator when the input state is ambiguous.

### Herdr prompt delivery

For a normal role prompt or Hermes slash command, use `herdr agent prompt <pane-id> "<text>"`. This is the submission primitive: Herdr writes the text using the pane's live bracketed-paste mode, when enabled, followed by an encoded Enter as one ordered submission. It does not rely on terminal focus, pane labels, or a model simulating individual keystrokes.

A successful `agent prompt` only proves that Herdr wrote the text and Enter; it does not prove Hermes accepted the command or started the requested turn. For a task prompt, use `--wait` only when its lifecycle semantics are appropriate, then inspect the resulting state and pane report. For local slash commands such as `/new` and `/model`, send without `--wait`: they can complete without producing the `working` transition that `--wait` expects.

After every `/new --yes` accepted in an executor pane, send `/busy queue` and confirm it before selecting the model or delivering the role task. Queue mode keeps later messages as distinct follow-up turns instead of redirecting active work; it prevents an accidental operator message from interrupting the executor.

Use `herdr agent send-keys <pane-id> <key>...` only for deliberate interactive controls, such as `esc` or `ctrl+c`. It sends logical key presses after validating every key token. Do not use `send-keys` to type or submit normal task text; that bypasses `agent prompt`'s ordered bracketed-paste-and-Enter delivery. A blocked agent rejects `agent prompt` before any input is sent, so inspect the blocked UI and surface the decision instead of trying key sequences.

### Herdr lifecycle monitoring

After dispatching a role task, monitor the selected executor through Herdr's lifecycle API rather than repeatedly inspecting its terminal output or workspace changes to infer progress. With `terminal`, wait on the selected pane ID (not its label or current focus):

```sh
herdr agent wait <pane-id> --until idle --until done --until blocked --timeout <time-budget-ms>
```

`idle` and `done` both mean the executor can accept input. On either state, read the agent's report and inspect the actual workspace, diff, and checks before starting the next phase. On `blocked`, use `herdr agent get <pane-id>` and `herdr agent read <pane-id>` to inspect the request, then surface the decision to the operator; never answer it or send speculative input. A timeout is ambiguous: inspect the agent state and output before deciding whether the task was delivered, still running, or needs recovery; never send the same prompt again solely because the wait timed out.

Do not install or depend on `herdr integration install hermes` for lifecycle monitoring. The Hermes integration reports a resumable session ID for server-restart recovery; Herdr derives Hermes `working`, `idle`, and `blocked` from its own screen detection. Installing it changes the selected Hermes profile and requires a restart, so treat it as explicit operator-approved recovery setup, not a routine prerequisite.

Before sending a role task to the selected idle Hermes pane:

1. Start a fresh session with `/new --yes <goal-name>` through `herdr agent prompt <pane-id> ...` without `--wait`. `--yes` bypasses Hermes' reset confirmation, so it is required for unattended role dispatch. Use a short, compelling, outcome-oriented name such as `implement-profile-binding`, `review-profile-binding`, or `fix-resume-refusal`; never use a generic phase label alone.
2. Read the pane and confirm the new session was accepted and the input is idle. Do not reset a blocked, working, or input-ambiguous session.
3. Send `/busy queue` through `herdr agent prompt <pane-id> ...` without `--wait`, then read the pane and confirm it was accepted. This must happen before model selection or task delivery so accidental follow-up input queues instead of redirecting the role task.
4. Send `/model <configured-key>` through `herdr agent prompt <pane-id> ...` without `--wait`. Slash commands may complete locally without producing the `working` state that `--wait` requires.
5. Read the pane and confirm Hermes accepted the requested selector; do not send a task if it is rejected, blocked, or remains ambiguous.
6. Send the role task only after that confirmation. Do not use `/model --global`.

### Explicit stop requests

Only an operator's explicit request may stop autonomous work. First send `/goal pause` to the orchestrator so it cannot dispatch another phase. Then, after the executor settles, prompt the selected executor with `/stop` through `herdr agent prompt <pane-id> "/stop"` when its background processes must be stopped. `/stop` stops Hermes background processes; it does not prove that a currently running foreground role turn was interrupted. With `/busy queue` active, a stop prompt is a queued follow-up, not an interruption. Read the pane and agent state after it runs; do not substitute `ctrl+c` or claim a stop completed without that evidence.

### Local Browser Access

- For an interactive local-browser task, run `/browser connect` in the Hermes Agent CLI to connect it to a live local browser through CDP; confirm the connection with `/browser status` before assigning browser-dependent work.
- Treat browser access as a scoped capability: use a separate browser profile or a clean browser state for autonomous work, never expose an operator's authenticated personal browser session without explicit approval.
- A connected browser does not remove normal safety constraints. Keep login, payment, account, and irreversible external actions under the operator's approval policy.

## Starting the Orchestrator Goal

Use this only after the skill is installed and visible as `/autonomous-implementation-review`. For a selected material phase, use Hermes' `/goal draft` to expand a concise operator request into the persisted completion contract; it starts the first turn immediately. The agent must load this skill and `phased-plan-execution`, then read the selected CHG, linked CAPs, and applicable DOX before dispatching any executor:

```text
/goal draft Execute phase <number or name> of docs/changes/active/CHG-<number>.md using autonomous-implementation-review and phased-plan-execution.
```

The CHG supplies the outcome, boundaries, selected phase, and verification gate. Add only constraints that are not already recorded. Use `/goal show` to inspect the drafted contract; pause or clear it if it materially misstates the CHG. Do not replace this goal with `/loop`: a loop repeats its prompt on a schedule and is suitable for external polling, not an acceptance-criteria-driven coding workflow. Do not run `/goal` and `/loop` for the same task. Use `/goal pause`, `/goal resume`, and `/goal clear` to control the objective; add newly discovered acceptance criteria with `/subgoal <criterion>` rather than replacing the goal.

For non-material standalone work, use `/goal draft <concise objective>` with its explicit verification and constraints. Do not create a profile-local continuation document. If an adopting project requires a durable standalone artifact, use only its documented repository-tracked location.

## Procedure

1. Derive the task contract.
   - For a selected CHG phase, read the outcome, scope, non-goals, acceptance criteria, relevant paths, required verification, and constraints from the CHG and its applicable CAP/DOX chain. Ask the operator only for an unresolved decision, missing CHG selection, or additional constraint; do not require a second questionnaire or create a parallel plan.
   - For standalone work, establish those facts in the goal contract before dispatch. Do not persist them in profile scratch.
   - Record the starting branch, `git status --short`, and merge base. Preserve unrelated changes.
   - Completion: another agent could implement the task without guessing the target or permitted side effects.

2. Choose the execution shape.
   - Use one implementer worktree for dependent changes.
   - Split only genuinely independent work into separate worktrees; assign non-overlapping paths and integration ownership.
   - Budget every executor packet below its configured turn/tool-call cap. Reserve separate packets for a material review finding, final verification, and review rather than combining them into one cap-prone run.
   - Use `delegate_task` for bounded research or code-reading subtasks. Use a provider CLI through `terminal` only after verifying its current CLI and authentication. Use a background process only for a long bounded job that needs live monitoring.
   - Completion: every agent has an explicit role, workspace, budget, and output contract.

3. Dispatch the implementer.
   - Start a fresh executor session named for the implementation outcome, then set its configured session-only implementer `/model` selector and verify both operations before the task prompt. Do not reset or model-switch a working, blocked, or input-ambiguous session.
   - Tell the configured implementer to inspect repository instructions first; change only the agreed scope; add or update focused tests; run the specified checks; and report exact changed paths, commands, outputs, assumptions, and unresolved risks.
   - Do not ask it to commit, push, deploy, change credentials, or overwrite unrelated work unless the user explicitly requested that action.
   - In Herdr, dispatch without `--wait`, then use `herdr agent wait <pane-id> --until idle --until done --until blocked --timeout <time-budget-ms>` as the completion gate. Do not poll terminal text, diffs, or workspace state to decide that the executor has settled.
   - Completion: the implementation workspace contains the intended diff and the agent has reported its verification evidence.

4. Recover repository context when roles change.
   - In a new Hermes session, read the selected CHG, linked CAP/DOX chain, committed review receipts, current status, and current diff. These are the authority for scope, phase, and evidence.
   - Use `session_search` only to locate a specific prior decision or claimed check when repository evidence is incomplete. Treat a recovered transcript as evidence, not authority; inspect the current workspace and diff before relying on it.
   - Use `hermes --resume <session-id-or-title>` only when deliberately continuing that conversation; resuming changes the active context and can restore its working directory.
   - Completion: the repository establishes the phase scope, current evidence, next action, and any blocker without a profile-local document.

5. Verify implementation evidence before review.
   - Inspect `git diff` and `git status` yourself. Read changed source and tests, trace affected call paths, and rerun the relevant tests or build commands when feasible.
   - Reject claims unsupported by tool output. Fix a failed prerequisite or test before asking for review.
   - Completion: Hermes can state what changed and which acceptance criteria remain unproven.

6. Run the executor review phase.
   - Wait for the implementation workspace to reach a stable checkpoint. In Herdr, use the executor lifecycle wait and handle `blocked` or timeout as specified above; do not infer readiness from a quiet pane. Start a fresh executor session named for the review outcome, then switch it to the configured session-only reviewer `/model` selector and verify both operations before the review packet.
   - The orchestrator must send the complete review packet again: task outcome, base commit, final diff, changed-path list, test evidence, and implementation report. A fresh session has no access to the implementation conversation.
   - The executor must remain read-only for this phase: inspect the task packet, base commit, final diff, changed-path list, and test evidence; do not edit files.
   - Require findings ordered by severity, each with file and line, concrete failure mode, and a minimal reproduction or reason. Require an explicit `no findings` verdict when none qualify.
   - Ask it to check correctness, regressions, edge cases, security/privacy, concurrency/data loss, project contracts, test gaps, and documentation obligations. Do not request vague style feedback.
   - Completion: the reviewer-model phase returns a bounded, actionable report tied to the actual diff.

7. Triage and iterate.
   - Reproduce or inspect every substantive finding. Before fixing a confirmed defect, start a fresh executor session named for the correction, switch `exec` to the configured implementer `/model` selector, and verify both operations; send the confirmed finding plus task packet, then fix it in the same worktree. Dismiss unsupported findings with evidence.
   - Rerun focused verification after each fix. Request a final reviewer-model phase only when the diff materially changed after review.
   - Limit review/fix passes to two by default. Escalate to the user with the evidence if a third pass is needed or requirements conflict.
   - Completion: every finding is fixed, explicitly declined with evidence, or surfaced as a user decision.

8. Close out a verified checkpoint or terminal goal.
   - Recheck the final diff, current status, applicable documentation contracts, and the exact required test/lint/build commands. Update the CHG with the phase transition and concise evidence as `phased-plan-execution` requires. Retain a committed review-only receipt only when the project needs one; keep logs and patches outside the repository as temporary evidence.
   - After the verified phase gate and review approve the same frozen diff, apply goal-scoped finalization authority immediately. Inspect the primary checkout and worktree diff together, preserve unrelated primary changes, integrate only the approved phase boundary, and rerun the phase gate in the integration checkout before committing.
   - Use `git-commit-message` to preview the exact batch, stage only its paths, run hooks, and verify `git log -1` plus `git status --short`. When finalization authority covers the batch, do not stop for a manual closeout confirmation after the preview. Push only when the goal or project policy explicitly authorizes push; read back the remote tracking ref before reporting success.
   - After integration and the verified commit, close the dedicated worktree with `git worktree remove <path>`. Never force removal over uncommitted work, remove the primary checkout, or delete a branch with unclear ownership. Report a failed removal as a blocker rather than leaving a terminal goal deceptively complete.
   - Completion: the checkpoint is verified and the CHG identifies its next action; for an authorized terminal goal, the approved diff is committed, any authorized push is verified, and the dedicated worktree is removed.

9. Rotate orchestration context when needed.
   - At every checkpoint, inspect `/context`. `/goal resume` continues the same objective and does not reclaim context; it must never be selected as a context-reset mechanism.
   - Rely on Hermes automatic compression for an unattended goal. If earlier compression is needed, stop normal work and instruct the operator to run `/goal pause`, `/compress here 2`, inspect `/context`, then `/goal resume` in the orchestrator session. Do not route this context rotation through an executor session or claim that the orchestrator can execute its own slash commands.
   - Start `/new --yes <goal-named-next-phase>` only when the operator deliberately ends the old orchestrator goal; send `/busy queue`, read the selected CHG and committed evidence, and explicitly set the next goal in that fresh session. Do not resume an overloaded session.
   - Completion: the orchestrator has continued through automatic or operator-triggered compression with enough headroom for one bounded next phase, or an intentional new goal has started in a goal-named session from repository truth.

10. Continue toward the goal.
   - Unless the operator explicitly stops, pauses, narrows scope, or a real blocker requires their decision, immediately select and dispatch the next planned bounded phase after a verified review/commit checkpoint. After executor cap exhaustion, first reconcile the CHG phase row and current verification state, then dispatch the exact unfinished bounded action in a fresh executor session. Do not leave a finished worker idle merely to report normal progress.
   - When the selected goal itself reaches its terminal outcome, execute Step 8 and report terminal completion. Do not re-dispatch the completed phase, repeat a stale goal prompt, or advance to a later CHG phase without a new operator request.
   - Honor explicit standing authorization for approved commit proposals, but still follow repository commit policy and never invent permission for an unreviewed batch.
   - Continue until every requested record is complete, cancelled, blocked on a real dependency, or requires an operator decision. Report only terminal completion or an actionable blocker.
   - Completion: the next implementation or review worker is actively running, or the loop has an evidenced terminal state.

## Prompt Contracts

### Implementer contract

Include these requirements in the implementation task:

- Read repository-local instructions before editing.
- When the task names a CHG phase, follow `phased-plan-execution`: keep that CHG's phase table synchronized and do not create a separate progress tracker.
- Inspect existing code and tests before choosing an API or architecture.
- Keep the diff minimal and preserve unrelated changes.
- Add or update regression coverage for behaviour changes.
- Run the named verification commands and include their exit status/output summary.
- Do not commit, push, deploy, access secrets, or mutate external state unless explicitly authorized.
- Return changed paths, test evidence, decisions, and remaining risks.

### Reviewer contract

Include these requirements in the review task:

- Review the supplied diff against the task packet and repository contracts; do not edit files.
- Report only defects that are introduced or made visible by the change, not speculative refactors.
- For each finding provide severity, `path:line`, impact, trigger, and recommended correction.
- Inspect tests for false confidence and missing boundary cases.
- End with either a numbered findings list or `No findings`.

## Worktree and Isolation Rules

- Create worktrees from the recorded base and give each a descriptive, unique path outside the primary checkout when possible.
- Never let two writing agents share a checkout, branch, generated-output directory, or mutable test service.
- Keep agent logs and temporary material under the active Hermes scratch directory; do not place them in the repository unless they are deliberate project artifacts.
- Review only after the implementer has stopped or reached a stable checkpoint; do not review a moving diff.
- Before integrating parallel work, inspect diffs together and run integration verification from one designated workspace.

## Pitfalls

- A fresh `/new` session reduces carry-over context but does not make the executor independent. This is a role-separated self-review; Hermes must still verify it, and high-risk changes may require an external reviewer.
- Do not expect an executor that hit its turn/tool-call cap to resume itself. Its final response is evidence for the orchestrator; start a fresh bounded executor session after inspecting the report, diff, CHG row, and failed or skipped verification.
- Do not use `/loop` for implementation and review work. It is cadence-driven prompt replay, which can repeat stale work and lacks `/goal`'s outcome, verification, constraints, boundaries, and stop-condition contract. Use it only for bounded external polling. `/goal resume` keeps the same objective and does not free context; use automatic compression or the documented pause/compress/resume sequence instead. The orchestrator cannot execute its own slash commands. After every goal-named `/new --yes`, send `/busy queue` before any model, goal, or task prompt so accidental follow-up messages queue rather than redirecting work.
- Do not describe `/stop` as an immediate executor interrupt. It stops Hermes background processes and, under `/busy queue`, runs only as a later queued turn. An explicit operator stop request pauses the goal first, then prompts `/stop` and verifies the settled pane state.
- Do not use `--resume latest` as context recovery. It may select an unrelated terminal-aware or globally recent session; read the selected CHG and inspect the current checkout first.
- Agent completion is not verification. Inspect the diff and execute checks yourself.
- More parallelism often creates merge conflicts and diluted ownership. Prefer one implementer unless tasks are demonstrably disjoint.
- The executor performs both roles sequentially in distinct goal-named sessions: begin a fresh session before every model switch, use the reviewer model only for a read-only review phase, and start another fresh implementer session only for confirmed fixes.
- Do not pass `.env`, credentials, production tokens, or unredacted private data into agent prompts or logs.
- Avoid generic `review this` prompts. A reviewer needs the acceptance criteria, comparison base, and evidence to detect real regressions.
- Do not silently replace the configured reviewer or implementer model selector. If `/model <key>` fails, preserve the failure evidence and ask the operator for a replacement key.
- Do not use `agent_status` as proof that an input buffer is empty. In particular, a plain-text `Try "…"` line can be an Ink placeholder after styles are stripped; never clear or submit it as if it were disposable user text.
- Herdr's `idle` or `done` state proves only that its lifecycle monitor settled. It does not prove an individual turn completed the requested work or that the work is correct; read the report and verify the workspace and checks. Hermes' optional Herdr integration supplies session-resume identity, not lifecycle reports.
- Do not auto-adopt a Herdr pane from its label, current UI focus, or workspace order. In the two-pane topology, show the overview, use the interactive `clarify` form for an explicit executor pane-ID choice, validate it against fresh state, and rename only that selected live agent to `exec` (or its collision suffix).

## Verification

Before reporting a task done, confirm all of the following:

- The `exec` session has a recorded goal name, accepted `/busy queue`, and accepted the configured session-only implementer selector before edits, plus a fresh recorded review goal name, `/busy queue`, and reviewer selector before every read-only review phase; any reset/queue/selector failure or user-approved replacement is recorded.
- When running inside Herdr, the current-workspace pane overview was shown, the operator selected the executor through a `clarify` form or its validated Other pane ID, and its read-back label is `exec` or its verified collision suffix.
- When running inside Herdr, every dispatched role task reached a recorded `idle`, `done`, `blocked`, or timeout outcome through `herdr agent wait` on the selected pane ID; each blocked or timeout outcome was inspected before any follow-up input.
- Repository instructions and starting state were recorded before edits.
- The final diff matches the agreed scope and preserves unrelated user changes.
- Relevant tests, lint, type checks, and build commands were actually run or named as blockers.
- Review findings have concrete dispositions with evidence.
- Every material multi-phase checkpoint updates the CHG with the phase transition and concise evidence; any review receipt is committed, frozen, and review-only. A fresh session can resume from repository truth without a profile-local continuation file.
- When goal-scoped finalization authority exists, the integrated primary checkout has the verified commit, `git log -1` and `git status --short` were read back, any authorized push matches its remote tracking ref, and `git worktree remove <path>` closed the dedicated worktree.
- No unapproved external side effect, commit, push, deployment, or credential change occurred.
- The final summary separates verified results, skipped checks, and remaining risks.
