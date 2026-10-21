---
name: phased-plan-execution
description: Execute one CAP/CHG phase without competing status writers.
version: 1.5.1
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, execution, product, capability, change-records]
    related_skills: [application-records, phased-plan-closeout, phased-plan-overview, phased-plan-refactoring]
---

# Phased Plan Execution

Execute one material phase. The CHG phase table owns progress; CAPs own behaviour.
No parallel tracker or non-material lifecycle.

## Procedure

1. Require an explicit request to execute the selected phase; a design handoff or
   approved plan is not sufficient. Read CHG, CAPs, DOX, gate, target identity/status
   and ownership; batch independent reads, never consent-dependent actions.
2. The orchestrator owns reservation and Git/CHG writes through `phased-plan-closeout`.
   The executor must not edit or commit the CHG path, stage, commit, integrate or
   remove worktrees. Without a permitted reservation, stop before mutable work.
3. In the reserved worktree, inspect package exports, build scripts, runtime pins
   and CI order. Derive installation/generated-output prerequisites from the project,
   not another checkout's caches. Run bootstrap separately from the unchanged phase gate;
   retain exit statuses/failures and honor stop rules before repairs. Inspect code,
   usages and tests, then implement only the selected slice. Verification-only phases
   need no invented edits or empty commits. For a visual handoff, load
   `capability-wireframes`; keep proposals in the CHG review package and regenerate
   canonical HTML/PNG, manifest, and CAP links with the changed interaction.
4. Run every named gate and required independent review on the frozen candidate,
   including untracked source, using closeout's review-boundary recipe. Report
   commands/results, checkout, base/digest, environment, logs, skips and retries.
   Evidence is not a second phase table; reuse valid results, not unverified claims.
5. Fix confirmed findings in the same worktree; changed content requires renewed
   checks/review. Report new scope/prerequisites before implementing; the orchestrator
   uses `phased-plan-refactoring` only at a verified boundary.
6. Hand candidate and evidence to closeout. Never mark done or start a later phase.

## Pitfalls

- CHG/status conflicts block; preserve them, never reset, overwrite or choose sides.
- A cap is not completion. Resume the unfinished action in the existing reserved
  worktree, not a competing implementation.
- Post-completion corrections require orchestrator reopening; old evidence covers
  only its frozen revision.

## Verification

Named gates and review must pass; only closeout proves target completion.
Until then the target row remains in progress.