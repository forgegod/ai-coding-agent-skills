---
name: phased-plan-closeout
description: Reserve and close CHG phases through one Git writer.
argument-hint: "[--reserve | --commit-ff]"
version: 0.8.2
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, closeout, git, worktrees, change-records]
    related_skills: [git-commit-message, phased-plan-execution, phased-plan-overview]
---

# Phased Plan Closeout

The orchestrator is the sole Git/CHG writer; executors implement, reviewers read only.

Load at the relevant boundary:
- Before any target record edit (including design/refactoring):
  [record writes](references/record-writes.md) for preview, factual review and readback.
- Before implementation review: [review boundary](references/review-boundary.md)
  for candidate/index/commit identity.
- On interruption, an existing reservation/completion, or unclear ownership:
  [recovery](references/recovery.md) before any mutation. Never create a replacement
  worktree or reopen an archive merely because discovery is incomplete.

## Preconditions and authority

- When loaded by design/refactoring for record writes, do not enter reservation
  or phase execution without separate explicit authority.
- Read CHG/DOX, gates and integration policy. Record literal CHG path, numeric phase,
  target/worktree paths/branches, reservation SHA and reviewed boundary.
- `--reserve` authorizes reservation/worktree creation; `--commit-ff` authorizes
  reviewed implementation/completion commits, not a missing reservation. An explicit
  goal may cover both. Preview remains required, without another confirmation.
  No push, restructuring, unrelated-path or check-bypass authority; templates grant none.
- Require direct target record commits and fast-forward integration. If forbidden,
  stop for an approved workflow; no improvised rebase, squash, cherry-pick or merge commit.
- Git/Node 22+ run read-only JSON `scripts/phase-guard.mjs`; nonzero is failure.
  It proves structure, not permission/tests/truth. `row --repo` names the target
  containing the commit. Require one unfenced `# | Phase | Status | Verification gate`
  table, numeric IDs/plain statuses. Fence examples; ambiguity blocks.
- Batch independent status, branch, HEAD and worktree-inventory reads in one
  `terminal` call. Never batch across consent, review or commit dependencies.
  Reuse valid discovery; guards still run fresh immediately before their mutations.

## 1. Reserve before dispatch

1. Establish a clean target, exclusive writer ownership, and no other in-progress
   phase or outstanding phase worktree. Pause the executor before review/Git work.
2. Set only the selected pending row to `in-progress` plus required metadata.
   An explicitly reopened active phase uses the same transition; preserve other rows.
3. Use the record-write recipe with exactly `<chg-path>` allowed; require its
   path/parent/content readback and clean target. Capture the full reservation SHA.
4. Through `terminal`, prove the committed row:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs row --repo <target> --ref <reservation-sha> --chg <chg-path> --phase <number> --expect in-progress
   ```

5. For this new reservation only, choose an absent absolute worktree path outside
   checkouts/auto-pruned caches with an existing canonical parent. Through `terminal`:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs create-preview --target <target> --target-branch <target-branch> --reservation <reservation-sha> --chg <chg-path> --phase <number> --worktree <absolute-worktree-path>
   ```

   Preview requires clean target HEAD at reservation, no collisions/competing workers;
   branch:
   `phase/<CHG-filename-without-.md>/<phase-number>/<full-reservation-sha>`.
   With authority/ownership valid, execute exactly its JSON `argv` through `terminal`:
   quote arguments; no blind join/eval, extra flags or invented suffixes.
   Preview grants no lock/permission and creates nothing. Verify before dispatch:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs locate --repo <target> --reservation <reservation-sha> --chg <chg-path> --phase <number>
   ```

## 2. Freeze, commit, and integrate

1. Follow the review-boundary recipe: freeze all source, including untracked files,
   excluding CHG. Preview before staging; verify index/commit against the SAME
   reviewed digest. Hook rewrites invalidate approval.
2. Capture target/reviewed HEADs. Immediately before integration, through `terminal`:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs preflight --target <target> --worktree <worktree> --target-branch <target-branch> --worktree-branch <worktree-branch> --target-head <target-head-sha> --worktree-head <reviewed-sha> --reservation <reservation-sha> --chg <chg-path> --phase <number>
   ```

   Proves clean/correct branches, shared repository/reservation ancestry,
   identical reservation/target/worktree CHG blobs, no worker-history CHG edits and
   FF topology. Empty diff is insufficient. Preserve failures; report blob SHAs,
   never reset or select a merge side.
3. With those SHAs still current and writers excluded, use
   `git -C <target> merge --ff-only <reviewed-sha>`. A moving/divergent target is a
   blocker, not permission to rebase. Rerun the full phase gate on the target.
   Failure leaves the row in progress/worktree intact for correction and renewed
   review. For already-integrated recovery, use the recovery reference; do not replay.

   Do not rerun a gate on unchanged content/environment merely for progress updates.
   Checkpoints: frozen candidate, integrated target, and fixes. Final record-only
   edits need validation/factual review, not another product gate unless DOX requires it.

## 3. Complete and retire

1. After target gates pass, set only the selected row to
   `done (<command> exit 0 @ <implementation-sha>)` plus required metadata. Use the
   reviewed preflight tip including fixups; completion's sole parent must be that tip.
   Intervening writes require a new verified boundary. Join commands with `;`, escape
   table pipes. Reconcile current narrative; retain historical evidence.
2. Only for the final verified phase, archive and repair index/owner links in this
   record batch. Keep review packages at stable review-only paths. Allow exactly
   old/new CHG and required record/index paths; otherwise only the active CHG.
   No implementation edits. Apply the record-write recipe's separate factual review,
   commit and readback: earlier implementation approval does not cover new prose.
3. Through `terminal`, verify the committed current (archive if moved) row:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs row --repo <target> --ref <completion-sha> --chg <current-chg-path> --phase <number> --expect done --evidence-commit <implementation-sha>
   ```

4. Require completion on target, both checkouts clean and implementation reachable.
   Run `git -C <target> worktree remove <worktree-path>` without force; verify absence
   in `git worktree list --porcelain`. Never remove the primary checkout or delete
   an ambiguously owned branch. A completed-phase retry performs verified cleanup
   only, not another status commit.
5. Report commits/checks/cleanup and stop. Only if requested, use `phased-plan-overview`
   for a next-goal prompt preceded by `/goal clear`; no active CHG means no prompt.
   Printing does not clear a goal. No push/next phase under this authority. Cached
   `origin/*` is not live remote proof; report no push from action history.

## Verification

Require committed row checks, preflight, target gate, record validation,
commit allowlists/content and cleanup. Guards are snapshots, not execution evidence.