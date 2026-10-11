---
name: autonomous-implementation-review
description: Implement changes with an independent review loop.
version: 0.2.0
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

- A code change benefits from an independent review before handoff.
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

### Context budget and durable handoff

- `/loop` repeats work in the current session. `/loop pause` and `/loop resume` change only the loop state; they do **not** clear, compress, or replace its conversation context. Do not use a resumed loop as a context-reset mechanism.
- Hermes automatically compresses active conversations when its configured context threshold is reached (50% by default). An active `/loop` survives that compaction and follows the compressed session lineage. This is the normal unattended context-control mechanism for the orchestrator; keep compression enabled and keep the handoff record current so its summary has grounded evidence to preserve.
- At each verified phase boundary, use `/context` to inspect the orchestrator's active-context headroom. Before the next packet would crowd out the current task, write or update an operator-approved durable handoff record. Reuse the task's existing progress artifact when it has one; otherwise choose an explicit scratch handoff file outside the repository.
- The handoff record must contain the goal and constraints; workspace and base commit; exact changed paths; verification commands and outcomes; review findings and dispositions; the next bounded phase; and unresolved decisions or risks. Store references to diffs, logs, and reports rather than copying their full contents into the next prompt.
- When an operator wants to compact earlier, they—not the running agent—run this sequence in the **orchestrator** session: `/loop pause`, `/compress here 2`, inspect `/context`, then `/loop resume`. Compression reduces that session's active context while preserving loop state and session history; it is not deletion and is not a substitute for a handoff record. Do not send these commands to `exec`; executor sessions are already reset for each role phase. An assistant response containing slash-command text does not execute those commands in its own session.
- An operator starts a new orchestrator session only at an intentional loop boundary: pause or stop the old loop after recording the handoff, use `/new <next-goal-name>`, seed it with the compact task packet and handoff-record path, then explicitly start the next loop there. Use `session_search` only to retrieve a specific prior decision or claim, then verify it against the workspace; do not use `/resume` or `/loop resume` to make an overloaded orchestrator session small.
- Keep role prompts compact: pass the task packet, paths, commit IDs, and acceptance criteria. Let agents inspect the working tree and reports themselves; never paste full diffs, test logs, or prior transcripts into every phase.

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

Before sending a role task to the selected idle Hermes pane:

1. Start a fresh session with `/new <goal-name>` through `herdr agent prompt <pane-id> ...` without `--wait`. Use a short, compelling, outcome-oriented name such as `implement-profile-binding`, `review-profile-binding`, or `fix-resume-refusal`; never use a generic phase label alone.
2. Read the pane and confirm the new session was accepted and the input is idle. Do not reset a blocked, working, or input-ambiguous session.
3. Send `/model <configured-key>` through `herdr agent prompt <pane-id> ...` without `--wait`. Slash commands may complete locally without producing the `working` state that `--wait` requires.
4. Read the pane and confirm Hermes accepted the requested selector; do not send a task if it is rejected, blocked, or remains ambiguous.
5. Send the role task only after that confirmation. Do not use `/model --global`.

### Local Browser Access

- For an interactive local-browser task, run `/browser connect` in the Hermes Agent CLI to connect it to a live local browser through CDP; confirm the connection with `/browser status` before assigning browser-dependent work.
- Treat browser access as a scoped capability: use a separate browser profile or a clean browser state for autonomous work, never expose an operator's authenticated personal browser session without explicit approval.
- A connected browser does not remove normal safety constraints. Keep login, payment, account, and irreversible external actions under the operator's approval policy.

## Starting the Orchestrator Loop

Use this only after the skill is installed and visible as `/autonomous-implementation-review`. In the **orchestrator** session, start a self-paced loop with a compact, stable continuation prompt:

```text
/loop /autonomous-implementation-review Continue <task name> from <handoff-record path>. Read the handoff record and current workspace before acting. Execute one bounded implementation, verification, review, or confirmed-fix phase; update the handoff record with evidence; preserve unrelated changes; do not commit, push, deploy, or access secrets. End with LOOP_COMPLETE only when every acceptance criterion is verified or a real user decision blocks progress. --until every acceptance criterion is verified or a real user decision is required
```

Omit the interval for self-paced work: Hermes starts at its configured floor and backs off only when replies stop changing. Use a fixed interval only when waiting on an external event, for example `5m` before the skill command while polling CI.

For a single coding objective, prefer `/goal` instead of `/loop`: it is judge-driven rather than timer-driven. Do not run an active `/goal` and this loop for the same implementation task; an active goal owns the session and defers loop wakeups.

Before starting, give the first skill invocation or handoff record a complete task packet: outcome, scope and non-goals, acceptance criteria, workspace/base, required checks, constraints, and the handoff-record location. The loop prompt stays short on later ticks because the record and workspace are the source of detail.

## Procedure

1. Define the task packet.
   - State the user outcome, scope, non-goals, acceptance criteria, relevant paths, required verification, and constraints such as no commits or no network writes.
   - Record the starting branch, `git status --short`, and merge base. Preserve unrelated changes.
   - Completion: another agent could implement the task without guessing the target or permitted side effects.

2. Choose the execution shape.
   - Use one implementer worktree for dependent changes.
   - Split only genuinely independent work into separate worktrees; assign non-overlapping paths and integration ownership.
   - Use `delegate_task` for bounded research or code-reading subtasks. Use a provider CLI through `terminal` only after verifying its current CLI and authentication. Use a background process only for a long bounded job that needs live monitoring.
   - Completion: every agent has an explicit role, workspace, budget, and output contract.

3. Dispatch the implementer.
   - Start a fresh executor session named for the implementation outcome, then set its configured session-only implementer `/model` selector and verify both operations before the task prompt. Do not reset or model-switch a working, blocked, or input-ambiguous session.
   - Tell the configured implementer to inspect repository instructions first; change only the agreed scope; add or update focused tests; run the specified checks; and report exact changed paths, commands, outputs, assumptions, and unresolved risks.
   - Do not ask it to commit, push, deploy, change credentials, or overwrite unrelated work unless the user explicitly requested that action.
   - Completion: the implementation workspace contains the intended diff and the agent has reported its verification evidence.

4. Recover prior-session context when roles change.
   - In a new Hermes session, use `session_search` to locate the prior coding or review session by its task, repository, distinctive changed paths, or reported verification. Read only the matching prior session or relevant turns; do not assume the immediately previous global session belongs to this task.
   - Use the recovered transcript to reconstruct the task packet, stated constraints, claimed checks, decisions, and unresolved risks. Treat it as evidence, not authority: inspect the current workspace and diff before relying on it.
   - Prefer `session_search` for inspection. Use `hermes --resume <session-id-or-title>` only when deliberately continuing that conversation; resuming changes the active context and can restore its working directory.
   - Completion: the handoff has enough grounded context to review the actual current diff without rediscovering the task from scratch.

5. Verify implementation evidence before review.
   - Inspect `git diff` and `git status` yourself. Read changed source and tests, trace affected call paths, and rerun the relevant tests or build commands when feasible.
   - Reject claims unsupported by tool output. Fix a failed prerequisite or test before asking for review.
   - Completion: Hermes can state what changed and which acceptance criteria remain unproven.

6. Run the executor review phase.
   - Wait for the implementation workspace to reach a stable checkpoint. Start a fresh executor session named for the review outcome, then switch it to the configured session-only reviewer `/model` selector and verify both operations before the review packet.
   - The orchestrator must send the complete review packet again: task outcome, base commit, final diff, changed-path list, test evidence, and implementation report. A fresh session has no access to the implementation conversation.
   - The executor must remain read-only for this phase: inspect the task packet, base commit, final diff, changed-path list, and test evidence; do not edit files.
   - Require findings ordered by severity, each with file and line, concrete failure mode, and a minimal reproduction or reason. Require an explicit `no findings` verdict when none qualify.
   - Ask it to check correctness, regressions, edge cases, security/privacy, concurrency/data loss, project contracts, test gaps, and documentation obligations. Do not request vague style feedback.
   - Completion: the reviewer-model phase returns a bounded, actionable report tied to the actual diff.

7. Triage and iterate.
   - Reproduce or inspect every substantive finding. Before fixing a confirmed defect, start a fresh executor session named for the correction, switch `exec` to the configured implementer `/model` selector, and verify both operations; send the confirmed finding plus task packet, then fix it in the same worktree. Dismiss unsupported findings with evidence.
   - Rerun focused verification after each fix. Request a final reviewer-model phase only when the diff materially changed after review.
   - Limit the loop to two review/fix passes by default. Escalate to the user with the evidence if a third pass is needed or requirements conflict.
   - Completion: every finding is fixed, explicitly declined with evidence, or surfaced as a user decision.

8. Close out a verified checkpoint.
   - Recheck the final diff, current status, applicable documentation contracts, and the exact required test/lint/build commands.
   - Update the durable handoff record with reviewer findings and dispositions, commands run with outcomes, the current commit/diff reference, the next bounded phase, and remaining risks. Keep large evidence at stable paths and record pointers rather than embedding it.
   - Completion: the checkpoint is verified, its handoff record is sufficient for a fresh session, its next action is explicit, and any blocker is named plainly.

9. Rotate orchestration context when needed.
   - At every checkpoint, inspect `/context`. `/loop resume` only restarts its scheduler and retains the same conversation; it must never be selected to reclaim context.
   - Rely on Hermes automatic compression for an unattended loop. If earlier compression is needed, stop normal work and instruct the operator to run `/loop pause`, `/compress here 2`, inspect `/context`, then `/loop resume` in the orchestrator session. Do not route this context rotation through an executor session or claim that the orchestrator can execute its own slash commands.
   - Start `/new <goal-named-next-phase>` only when the operator deliberately ends the old orchestrator loop; seed it from the durable handoff record and explicitly create the next loop in that fresh session. Do not resume an overloaded session.
   - Completion: the orchestrator has continued through automatic or operator-triggered compression with enough headroom for one bounded next phase, or an intentional new loop has started in a goal-named session from the verified handoff record.

10. Continue the execution loop.
   - Unless the operator explicitly stops, pauses, narrows scope, or a real blocker requires their decision, immediately select and dispatch the next planned bounded phase after a verified review/commit checkpoint. Do not leave a finished worker idle merely to report normal progress.
   - Honor explicit standing authorization for approved commit proposals, but still follow repository commit policy and never invent permission for an unreviewed batch.
   - Continue until every requested record is complete, cancelled, blocked on a real dependency, or requires an operator decision. Report only terminal completion or an actionable blocker.
   - Completion: the next implementation or review worker is actively running, or the loop has an evidenced terminal state.

## Prompt Contracts

### Implementer contract

Include these requirements in the implementation task:

- Read repository-local instructions before editing.
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
- `/loop resume` resumes its existing loop in the same orchestrator context; it does not free context. Automatic compression is the normal unattended path. An operator may pause, compress, inspect, and resume earlier; the orchestrator cannot execute its own slash commands. Use a goal-named `/new` session only for an intentional new orchestrator loop seeded from a durable handoff record.
- Do not use `--resume latest` as a review handoff. It may select an unrelated terminal-aware or globally recent session; search by task evidence, then inspect the current checkout.
- Agent completion is not verification. Inspect the diff and execute checks yourself.
- More parallelism often creates merge conflicts and diluted ownership. Prefer one implementer unless tasks are demonstrably disjoint.
- The executor performs both roles sequentially in distinct goal-named sessions: begin a fresh session before every model switch, use the reviewer model only for a read-only review phase, and start another fresh implementer session only for confirmed fixes.
- Do not pass `.env`, credentials, production tokens, or unredacted private data into agent prompts or logs.
- Avoid generic `review this` prompts. A reviewer needs the acceptance criteria, comparison base, and evidence to detect real regressions.
- Do not silently replace the configured reviewer or implementer model selector. If `/model <key>` fails, preserve the failure evidence and ask the operator for a replacement key.
- Do not use `agent_status` as proof that an input buffer is empty. In particular, a plain-text `Try "…"` line can be an Ink placeholder after styles are stripped; never clear or submit it as if it were disposable user text.
- Do not auto-adopt a Herdr pane from its label, current UI focus, or workspace order. In the two-pane topology, show the overview, use the interactive `clarify` form for an explicit executor pane-ID choice, validate it against fresh state, and rename only that selected live agent to `exec` (or its collision suffix).

## Verification

Before reporting a task done, confirm all of the following:

- The `exec` session has a recorded goal name and accepted the configured session-only implementer selector before edits, plus a fresh recorded review goal name and reviewer selector before every read-only review phase; any reset/selector failure or user-approved replacement is recorded.
- When running inside Herdr, the current-workspace pane overview was shown, the operator selected the executor through a `clarify` form or its validated Other pane ID, and its read-back label is `exec` or its verified collision suffix.
- Repository instructions and starting state were recorded before edits.
- The final diff matches the agreed scope and preserves unrelated user changes.
- Relevant tests, lint, type checks, and build commands were actually run or named as blockers.
- Review findings have concrete dispositions with evidence.
- Every multi-phase checkpoint has a handoff record with the current workspace/base, exact evidence references, and the next bounded phase; the orchestrator can resume its loop after compression or start an intentional new loop without replaying the complete transcript.
- No unapproved external side effect, commit, push, deployment, or credential change occurred.
- The final summary separates verified results, skipped checks, and remaining risks.
