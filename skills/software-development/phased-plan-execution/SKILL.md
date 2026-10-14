---
name: phased-plan-execution
description: Use when executing one CAP/CHG-backed phase and keeping the active change record synchronized with verified work.
version: 1.1.2
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, execution, product, capability, change-records]
    related_skills: [application-records, phased-plan-overview, phased-plan-refactoring]
---

# Phased Plan Execution

## Purpose

Execute one verified phase at a time. For material work, the active CHG is the
only execution plan: its CHG phase table is the durable progress surface across
agent sessions, commits, and handoffs.

## Preconditions

- The operator selected an active `docs/changes/active/CHG-*.md`, or
  `phased-plan-overview` identified it as the record to resume.
- The request, affected CAPs, relevant DOX chain, and CHG phase table are read.
- The selected phase has an executable verification gate.
- Repository status is known before edits; unrelated working-tree changes remain
  outside the phase scope.

If the request is not material, follow its repository plan instead. Do not force
a CHG lifecycle onto a refactor with no observable outcome.

## Procedure

1. Re-read repository status and the selected CHG. Confirm that its status is
   active, affected CAP IDs exist, and only the selected phase is or will become
   `in-progress`.
2. Mark the selected phase `in-progress` in the CHG before implementation. Do not
   start the next phase opportunistically. A worktree copy is only a candidate;
   the integration commit must carry that exact table transition to the target ref.
3. Read definitions, usages, local contracts, and focused tests before editing.
   Implement the phase's complete vertical slice: behaviour, CAP delta, and
   executable evidence belong together when the outcome is material.
   For visual work, read both product/change DOX and the wireframe child if present.
   Keep proposals in the CHG review package. Use `capability-wireframes` for the
   visual handoff of new and existing CAPs: update canonical generator definitions,
   regenerate HTML, render PNG, and synchronize CAP/manifest/index links.
4. Classify a new finding immediately. Add required-now work to this phase or add
   a prerequisite phase before changing source. Route an independent scope split
   through `phased-plan-refactoring`. If a post-gate correction or review finding
   changes a row already marked done, restore that row to `in-progress` before
   editing; its former gate/review evidence applies only to the older frozen diff.
   Do not preserve actionable work only in chat, temporary files, or a
   profile-private plan.
5. Run the phase gate. It includes the affected tests and every project check the
   phase names. Fix resolvable failures before proceeding.
   A visual handoff gate includes generation, rendering, and visual inspection;
   record validation alone cannot prove current renders or honest surface metadata.
6. After the gate passes and any required independent review approves the same
   frozen diff, update the CHG row to `done (<evidence>)`. Update the CAP in the
   same reviewed slice whenever current behaviour changed. Do not mark a row done
   because edits merely look complete. A later correction invalidates that done
   status until the current diff reruns the gate and required review. Keep the
   replacement row and its evidence in the integration diff; do not append a
   conflicting progress note separately.
7. Review the phase-only diff, create the repository's required checkpoint, and
   verify the checkpoint according to local Git policy. Keep generated verification
   byproducts out of the reviewed scope. The integration commit must contain the
   exact phase-table transition. Before removing a dedicated worktree or starting
   the next phase, use `terminal` to inspect `git show <commit>:<chg-path>` and
   confirm the target ref has that row and no contradictory current-state prose.
8. If phases remain, leave all later rows `pending` and return to the CHG on the
   next execution cycle. When the final gate passes, set the CHG status `done`,
   move it to `docs/changes/archive/`, refresh the change index, and hand control
   to `phased-plan-overview` rather than guessing the next request.
   Before closure, confirm human-facing CAPs have current canonical HTML/PNG and
   other CAPs honestly declare `Primary surface: none`. Retain any review package
   at `docs/changes/reviews/CHG-<number>/` as a frozen review-only receipt; repair
   owner links rather than moving its assets into active/archive or the product
   tree. Apply the same retention rule to cancelled changes without claiming
   implementation; removing an owner also removes its package.

## Worktree synchronization

- The CHG in the target ref is the progress authority. An uncommitted worktree
  change, scratch patch, review transcript, or agent report is evidence only.
- Integrate the selected row's `in-progress` or `done` state with the code and
  tests it describes. If project policy requires separate commits, they must be
  adjacent and the target-ref readback must show the completed transition before
  worktree removal or further phase selection.
- If a merged implementation lacks its matching phase state, stop. Reconcile the
  target CHG before more work; never compensate by appending a narrative claim
  that a different worktree had the correct status.

## CAP/CHG invariants

- The CAP is the present-tense, falsifiable behaviour contract; code and tests
  decide any conflict.
- The CHG is progress authority only. It records request, scope, phases, gates,
  and evidence; it is not a feature specification after closure.
- One active material request has one mutable progress authority. A ticket,
  checklist, private plan, or prior commit cannot replace it.
- A phase changes from `pending` to `in-progress` to `done (<evidence>)` only in
  that order unless post-gate work invalidates its evidence; then restore that
  exact row to `in-progress` before correcting it. Keep one phase in progress at
  a time.
- The phase table is authoritative. Execution notes and review receipts must
  agree with it; narrative prose cannot leave a done row overridden by an
  informal “still in progress” claim.
- Worktree lifecycle does not synchronize the record. The integration commit,
  verified from the target ref, is the only durable phase transition.
- Close and archive only after the CAP, record validator, affected tests, and
  required repository integration gate agree on the implemented state.

## Verification

For each phase, record the exact passed command or durable evidence in the CHG.
Before closing, run the record validation command, affected behaviour tests, and
the repository-wide gate. Confirm the archived CHG is no longer in
`docs/changes/active/` and the CAP describes the resulting current behaviour.
For a worktree execution, also read the committed target-ref CHG before removing
the worktree or reporting the next phase.
