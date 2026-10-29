---
name: openspec-change-integration
description: Review and integrate explicitly selected OpenSpec changes.
version: 0.1.1
author: Raphael (forgegod), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [OpenSpec, Git, Review, Evidence]
    related_skills: [git-commit-message, capability-wireframes, autonomous-implementation-review]
---

# OpenSpec change integration

Preserve a reviewed committed candidate and truthful post-merge evidence for one
OpenSpec change in a project that explicitly selects this workflow. This is an
orchestrator procedure, not a scheduler, distributed lock, approval service or
GitHub API client, and installing OpenSpec or this package never selects it.

## When to Use

- The project's contributor contract explicitly selects OpenSpec and this
  integration boundary for the selected change; selection is per project and per
  scope, never implied by installation or by a neighbouring repository.
- An operator authorizes bounded implementation, review, integration or recovery.
- Do not use to migrate a project merely because OpenSpec is installed. Do not run
  CAP/CHG phase skills beside OpenSpec for the same scope.
- A planning-only request ends at proposal/spec/design/tasks; approved planning
  does not authorize implementation, commits, issue writes or publication.

## Prerequisites

- Node 22+ and Git for the packaged read-only `scripts/change-guard.mjs` helper.
- A separately reviewed OpenSpec CLI/native workflow installation; this package
  does not install it or assert host execution support.
- Explicit project policy naming target, required gates, approval/ownership,
  evidence retention and source/deployment completion boundaries.
- For collaborative work: real issue, full change ULID, attributable approved plan
  commit/digest, one accountable operator and one designated orchestrator.
  Offline local bootstrap may record a pending issue, never invented remote state.

## Authority and writers

The orchestrator is the sole Git and task-progress writer for this change.
Implementers edit implementation/tests and report results; reviewers are read-only.
The stock OpenSpec apply action normally updates tasks: mediate that behavior in
its handoff so it cannot compete with the designated writer. A checked task means
implementation progress, not merge, deployment or acceptance.

Use operator-serialized starts/handoffs per change. Read issue assignment,
activation and PR state before shared writes and read the exact target after them.
Assignees, comments and refs detect observed conflicts; they are not a lock.
Missing authority, ambiguous ownership or unknown write outcomes block mutations.
A selection snapshot never grants permission for a later action.

## Procedure

1. Read the contributor contract and selected native change artifacts. Confirm
   explicit authority, approved scope, dependencies, risk and gates. Do not invent
   CAP records or a second phase table. The native `tasks.md` is the task authority.
2. Check recovery first: use `references/recovery.md` for dirty/unowned work,
   competing activation, an existing PR, an uncertain API outcome or a prior merge.
   Preserve work; do not start another executor or replay merged implementation.
3. Use a separate clone/worktree and isolated mutable test resources per change.
   Independent changes may run concurrently; dependent execution waits for accepted
   integrated prerequisite evidence. One implementation writer per change initially.
4. Prepare native proposal/spec/design/tasks and obtain approval bound to an
   immutable plan commit and digest. Only checkbox progress edits preserve that
   digest; scope, acceptance, gates and dependencies changing require reapproval.
   Only the orchestrator may create commits, with explicit local commit authority.
5. Implement only the authorized change/task group. Retain actual gate output and
   report failed prerequisites. If role orchestration is explicitly requested,
   load `autonomous-implementation-review` and its OpenSpec reference; unsupported
   hosts stop rather than inventing model/session commands.
6. Freeze a clean committed candidate. Use `references/guard.md` for candidate
   and review checks. Independently review its exact full SHA, delta specs,
   implementation, executable evidence and current-behavior changes. Review is a
   gate within this change, not a new change for every comment. Allow at most two
   correction/re-review cycles; then stop for operator disposition. A changed
   candidate invalidates review; confirmed defects are not silently waived.
7. Before publication/integration, load `references/integration.md`. Re-read actual
   target, assignment, activation, required checks and protections. Refresh shared
   capability specs against current target and explicitly reconcile semantic
   overlap. Include implemented behavior/specs/visuals in the implementation PR;
   a clean Git merge alone is not compatibility proof.
8. Publish/integrate only with separately explicit authority and protected PRs.
   Required up-to-date combined checks or a correctly configured merge queue are
   project prerequisites, not supplied by this skill. The initial guard requires
   reviewed candidate ancestry: squash/rebase integration is unsupported, not a
   reason to weaken checks or silently change repository settings.
9. Read back the real integrated commit and containing target. Execute the actual
   required gates on a named integrated/containing revision and retain output.
   Failure blocks completion and requires an explicit repair/revert decision.
10. Only after successful integrated verification, prepare an append-only truthful
    receipt and record-only archive PR. Use the receipt check and independently
    review factual claims. Do not reapply deltas already incorporated in current
    specs; reconcile differing current specs explicitly. An archive requiring new
    current-spec changes needs renewed verification, not a record-only exception.
11. Verify the closure merge and cleanup by exact readback. Close the issue only
    when its declared source/deployment acceptance boundary is satisfied. Evidence
    publication ends here: no extra PR solely attesting the previous receipt PR,
    no next change, automatic release or implied cleanup authority.

## Pitfalls

- Plan digests and JSON validate structure, not human approval or test truth.
  The helper does not authenticate a reviewer, execute gates or inspect GitHub.
- The helper fails closed on planning bytes that are not UTF-8, on replace refs,
  graft files and similar Git topology rewriting, and on task syntax it cannot
  classify unambiguously; fix the input instead of relaxing the check.
- OpenSpec verification is not a substitute for executable project gates,
  independent review or protected integration. Config guidance is not enforcement.
- Do not commit prospective merge results or put closing keywords on an
  intermediate implementation PR when later acceptance is still required.
- Preserve exact IDs, failures and rejected candidates. Never repair a malformed
  ULID, rename a conflicting run, unassign an operator or discard dirty work.
- A shared-profile package must not update/remove its installed copy while
  operating in a project. Source adoption is not installed-profile permission.

## Verification

Report the actual candidate/plan digest, independent review and executed gate
references. After authorized integration, report verified target SHA, post-merge
receipt/archive, the receipt file's SHA-256 and closure readbacks separately. A
local `ok: true` means only that the helper's structural checks passed; incomplete
or unperformed remote steps remain explicitly pending. Stop at the operator's
authorized boundary.
