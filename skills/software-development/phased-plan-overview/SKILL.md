---
name: phased-plan-overview
description: Select a resumable CAP/CHG phase from the target branch.
version: 1.3.0
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

## Procedure

1. Read the applicable DOX chain, `docs/changes/README.md`, and each active CHG
   from the target branch. Capture status, CAPs, phase table, dependencies, gate,
   and any explicit blocker.
2. Validate structural drift: active is not done; CAP IDs exist; at most one row
   is `in-progress`; done evidence is not contradicted by current prose. Use the
   repository validator for structural confirmation.
3. Treat an `in-progress` target row as the reserved phase. Use closeout's recovery
   rules and `locate` guard before resuming; never guess a worktree from its name
   or create a competing writer. With zero in-progress rows and cleanup complete,
   select the first pending row. More than one in-progress row, contradictory
   current-state prose, a committed or dirty
   worktree CHG change, or unclear worktree ownership is a blocker. Report it;
   do not repair it, select worktree status, or launch another worker. For a known
   worktree, compare its committed CHG blob with the target/reservation and inspect
   its history, index, and working files; an empty `git diff` is insufficient.
   Historical evidence for earlier completed phases is allowed, not a contradiction.
4. Select only an operator-chosen record or one made unambiguous by an explicit
   dependency/order rule. If several independent records are pending, present
   choices. Do not infer priority from filenames or timestamps.
5. For a selected phase in the supported Herdr environment, print exactly one
   command and do not dispatch it. Only the operator sending it grants the listed
   authority; otherwise report a read-only assessment or the transport blocker:

   ```text
   /goal draft Execute only phase <phase-number> of <active-chg-path> using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.
   ```

## Selection rules

- The orchestrator follows `phased-plan-closeout`; the executor must not edit or
  commit the CHG path. After verified completion but interrupted cleanup, resume
  closeout rather than selecting a later phase or replaying implementation.
- An active record with no in-progress row and no outstanding cleanup resumes at
  its first pending phase.
- A completed record belongs in `docs/changes/archive/`; only verified cleanup
  may resume, never implementation from that archive.
- A material request with no active CHG routes to `application-records` then
  `phased-plan-design`; non-material work does not create a CHG.

## Verification

A fresh agent can identify the target branch, selected CHG and phase, gate, CAPs,
and blocker without profile state. It changes no source and prints no launch
command for an ambiguous record.