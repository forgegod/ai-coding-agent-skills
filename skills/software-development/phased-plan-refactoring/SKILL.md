---
name: phased-plan-refactoring
description: Resequence active CAP/CHG work at verified boundaries.
version: 1.4.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, refactoring, product, capability, change-records]
    related_skills: [application-records, phased-plan-design, phased-plan-overview, phased-plan-closeout]
---

# Phased Plan Refactoring

Restructure active material work without losing its progress truth. Change a CHG
only at a verified boundary and only from its target branch; a worktree copy is
never a second status writer.

## Procedure

1. Read the DOX chain, change README, affected CAPs, active CHGs, inbound links,
   target status, and all implementation-worktree diffs. Before any record edit,
   the orchestrator loads `phased-plan-closeout` and `references/record-writes.md`.
   Require explicit restructuring/commit authority and no affected in-progress
   row or outstanding phase worktree, including integrated-but-not-retired ones.
   Otherwise return an unwritten proposal, never edit an executor's CHG copy.
2. Build dependencies from explicit prerequisites, phase gates, and shared CAP
   ownership—not filenames, dates, or topic similarity.
3. At a verified target-branch boundary, resequence the existing CHG or create a
   new active CHG for an independently verifiable request. Preserve each moved
   goal, gate, and evidence exactly once; use a new stable ID only for a new
   material request.
4. Update source/new CHGs, index, CAP links, and review-package ownership in one
   target-only record batch through that recipe's allowlist, content readback,
   and validation checks. Remove moved rows from the source; never duplicate
   live phase rows or mutable review packages.
5. Run record/document checks, then use `phased-plan-overview` to select the next
   phase. The orchestrator follows `phased-plan-closeout`; the executor must not
   edit or commit the CHG path. Resume execution only after verified record readback.

## Rules

- One material request has one progress authority: one active CHG and one
  target-branch status writer.
- Dependencies are explicit and minimal; do not repeat transitive dependencies.
- Do not split atomic behaviour/test/CAP work or turn an archive receipt into an
  active plan.

## Verification

Confirm each active CHG has valid lifecycle state, no duplicated/dropped phase,
valid CAP IDs and links, at most one in-progress row, and no worktree CHG diff.
Run the repository record and document checks before execution resumes.