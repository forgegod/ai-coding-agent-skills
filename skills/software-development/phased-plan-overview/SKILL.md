---
name: phased-plan-overview
description: Select a resumable CAP/CHG phase from the target branch.
version: 1.4.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, overview, product, change-records]
    related_skills: [application-records, autonomous-implementation-review, phased-plan-execution, phased-plan-refactoring, phased-plan-closeout]
---

# Phased Plan Overview

Provide a restart-safe view of material work from the selected target branch.
Active `docs/changes/active/CHG-*.md` records—not chat, worktree copies, commit
recency, or private plans—select resumable work. This skill is read-only.

## Scope and stopping rule

This is selection, not execution or a retrospective audit. Read the recorded gate;
do not certify it again. Do not rerun implementation tests, lint, builds, or visual gates
unless the operator explicitly requests verification or project DOX requires them.
Do not scan archives or upstream assessments unless the selected record's dependency
or cleanup evidence requires a specific file.
Do not search host directories or inspect Herdr/Hermes source to establish command
support. Do not install, repair, fetch, or change records.

Stop gathering evidence once target identity, record selection, phase, ownership/cleanup,
record validation, and transport status are resolved. A blocker is a final result,
not an invitation to expand the investigation. Reuse evidence already gathered in
this run; repeat only a failed/incomplete check or one invalidated by changed state.

## Procedure

1. **Snapshot once.** Through `terminal`, batch `git status --porcelain=v1`,
   `git branch --show-current`, `git rev-parse HEAD`, and
   `git worktree list --porcelain` in the target checkout. Use the operator's target;
   otherwise use the current named branch. A detached checkout without a target
   or a dirty target prevents a launch, not a read-only assessment.
   Read the applicable DOX chain, `docs/changes/README.md`, and each active CHG
   from that branch (use `git show <target-ref>:<path>` if the checkout differs).
   Capture status, CAPs, phase table, dependencies, gate, and explicit blockers.
2. **Validate records once.** Run the repository's record validator once and check:
   active is not done; CAP IDs exist; at most one phase row across active records
   is `in-progress`; done evidence is not contradicted by current-state prose.
   Historical evidence for earlier completed phases is allowed, not a contradiction.
   No need to read product implementation or audit old review/test receipts.
3. **Choose the record before deep recovery.** An operator selection wins; a
   single active CHG is unambiguous. Neither overrides an existing reservation or
   outstanding cleanup in another record. Otherwise apply only an explicit
   dependency/order rule. If several independent records remain, report choices
   and stop. Do not infer priority from filenames or timestamps.
4. **Resolve only the relevant ownership/cleanup case** using the decision table.
   Load `phased-plan-closeout` only when reservation or completion recovery is needed;
   its Git identity guards remain authoritative. Never create or remove a worktree.
5. **Resolve transport once.** `$HERDR_ENV=1` and a non-empty `$HERDR_WORKSPACE_ID`
   identify the supported environment for this handoff; inspect only those named
   variables through `terminal`. Otherwise report the transport blocker with the
   selected phase. An installed binary alone is not proof of an active Herdr session.
   Executor selection, model setup, and live pane checks belong to execution.

## Decision table

| Target state | Result / additional evidence |
| --- | --- |
| More than one in-progress row, another record's reservation/cleanup, contradictory current-state prose, committed or dirty worktree CHG change, or unclear ownership | Block; preserve work and report the exact conflict. |
| One in-progress row | Treat an `in-progress` target row as the reserved phase. Use closeout's recovery rules and `locate` guard before resuming; never guess a worktree from its name or create a competing writer. |
| No in-progress row; earlier done phase | Check the latest completed phase's completion/evidence/reservation and registered worktrees under closeout's recovery rules. Do not re-audit all completed phases. |
| Completion verified; dedicated worktree still registered | Report closeout/cleanup as the next action, not implementation of a later phase. |
| No in-progress row; cleanup proved complete | Select the first pending row of the chosen CHG. With no prior completed phase, require no outstanding phase worktree. |
| All rows done in an active record | Report closure inconsistency; never replay implementation from an archive. |

For a known worktree, compare its committed CHG blob with the target/reservation
and inspect history, index, and working files; an empty `git diff` is insufficient.
For an already removed completed worktree, prove the exact reservation-derived
branch tip is the integrated implementation and its registration is absent.
A merged leftover branch ref alone is not outstanding cleanup. `locate` requires
a registered worktree: zero matches is expected only after removal has been proved
by completion, branch-tip/ancestry, and registration evidence. Zero matches for an
in-progress reservation remains a blocker. Do not scan sibling folders to guess identity.

## Final answer

Lead with the selected CHG and phase, or the blocker/choices. Give target branch/SHA,
CAPs, selected gate, validation result, and one sentence about ownership/cleanup.
Do not repeat the full phase table, command transcript, or historical audit unless asked.

For a selected implementation phase with no blocker in the supported Herdr
environment, print exactly one command and do not dispatch it. Only the operator
sending it grants the listed authority:

   ```text
   /goal draft Execute only phase <phase-number> of <active-chg-path> using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.
   ```

The orchestrator follows `phased-plan-closeout`; the executor must not edit or
commit the CHG path. Cleanup-only recovery gets no new-phase launch command.
With no active CHG, a material request routes to `application-records` then
`phased-plan-design`; non-material work does not create a CHG.

## Verification

A fresh agent can identify the target branch, selected CHG and phase, gate, CAPs,
and blocker without profile state. It changes no source and prints no launch
command for an ambiguous record.