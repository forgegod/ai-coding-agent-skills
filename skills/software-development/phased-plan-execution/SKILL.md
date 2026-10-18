---
name: phased-plan-execution
description: Execute one CAP/CHG phase without competing status writers.
version: 1.3.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, execution, product, capability, change-records]
    related_skills: [application-records, phased-plan-closeout, phased-plan-overview, phased-plan-refactoring]
---

# Phased Plan Execution

Execute one selected material phase. The CHG phase table is progress authority;
CAPs describe current behaviour. Do not create a parallel tracker or apply this
lifecycle to non-material work.

## Procedure

1. Read the selected active CHG, affected CAPs, DOX chain, phase gate, target
   branch, and Git status. Resolve ambiguous ownership before implementation.
2. The orchestrator follows `phased-plan-closeout` for reservation and all Git/CHG
   writes. The executor must not edit or commit the CHG path, stage files, commit
   implementation, integrate branches, or remove worktrees. If commit authority
   or repository policy prevents reservation, stop before mutable phase work.
3. In the reserved worktree, inspect definitions, usages, and tests; implement
   the complete behaviour/test/CAP slice. For a visual handoff, load
   `capability-wireframes`; keep proposals in the CHG review package and regenerate
   canonical HTML/PNG, manifest, and CAP links with the changed interaction.
4. Run every named phase gate and required independent review against one frozen
   diff, including untracked source files. Record exact commands and real outcomes
   in the report; a report is evidence, not a second phase table.
5. Fix confirmed review findings in the same worktree; any changed reviewed
   content invalidates its approval and requires renewed checks/review. Report
   new scope or prerequisites to the orchestrator before implementing them.
   It uses `phased-plan-refactoring` only at a verified boundary.
6. Hand the frozen diff and gate/review evidence to the orchestrator for closeout.
   Do not mark the phase done or start a later phase from the worktree.

## Pitfalls

- A CHG diff or conflicting status is a blocker. Preserve it; never reset,
  overwrite, or choose a merge side to make closeout pass.
- A turn/tool cap does not finish a phase. Resume the exact unfinished action
  in the existing reserved worktree, not a fresh competing implementation.
- A post-completion correction needs an orchestrator-owned reopening before
  edits; prior evidence covers only its original frozen revision.

## Verification

The slice passes its named gates and required review. Only closeout proves target
integration and completion; until then the target row remains in progress.