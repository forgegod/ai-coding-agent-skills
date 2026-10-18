---
name: phased-plan-closeout
description: Reserve and close CHG phases through one Git writer.
argument-hint: "[--reserve | --commit-ff]"
version: 0.6.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, closeout, git, worktrees, change-records]
    related_skills: [git-commit-message, phased-plan-execution, phased-plan-overview]
---

# Phased Plan Closeout

The orchestrator is the sole Git/CHG writer for a worktree phase. This skill owns
reservation, implementation commits, integration, completion, and cleanup; other
skills do not repeat its protocol. Executors implement only; reviewers are read-only.
For any target record edit, including design/refactoring outside an execution
phase, first load [references/record-writes.md](references/record-writes.md).
It owns the shared commit, content/allowlist readback, and failure-recovery recipe.

## Preconditions and authority

- Read the selected CHG, DOX, repository gates, and integration policy. Record one
  literal CHG path, numeric phase ID, target checkout/branch, dedicated
  worktree/branch, reservation SHA, and reviewed implementation boundary.
- `--reserve` authorizes the selected reservation commit and worktree creation. `--commit-ff`
  authorizes the reviewed implementation and target completion commits, not a
  missing reservation. Explicit goal-scoped authority may cover both stages.
  These flags permit applying the required commit previews without another
  confirmation; neither authorizes a push, plan restructuring, unrelated paths,
  or bypassed checks. Displaying a launch template does not grant authority.
- This route requires direct target record commits and fast-forward integration.
  If project policy forbids either, stop for an approved alternative workflow;
  do not improvise a rebase, squash, cherry-pick, or merge commit.
- Require Git and Node 22+ for `scripts/phase-guard.mjs`. It is read-only, emits
  JSON, and exits nonzero on failure. It validates topology/table cells, not test
  success, review quality, narrative consistency, or authorization.
- `row --repo` must name the target checkout containing the checked commit.
  Records need exactly one unfenced canonical `# | Phase | Status | Verification
  gate` table with numeric IDs and plain status cells. Ambiguous tables fail
  closed; fence examples rather than guessing which table is authoritative.

## 1. Reserve before dispatch

1. Use the record-write recipe to establish a clean target and exclusive ownership.
   Require no other in-progress phase on that target or outstanding phase worktree.
   Only the executor writes implementation files; pause it before review/Git work.
2. Change the selected pending row to `in-progress` and required CHG metadata.
   Reopening a completed active phase uses the same step before correction work.
   Keep other rows and evidence unchanged; do not reopen archives implicitly.
3. Commit through the record-write recipe with exactly `<chg-path>` allowed;
   require its post-commit path, parent, content-digest, and clean-target checks.
4. Capture the full reservation SHA. Through `terminal`, prove its selected row:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs row --repo <target> --ref <reservation-sha> --chg <chg-path> --phase <number> --expect in-progress
   ```

5. For this newly made reservation, choose an absent absolute worktree path outside
   existing checkouts and auto-pruned caches, with an existing canonical parent.
   Obtain the exact creation arguments through `terminal`:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs create-preview --target <target> --target-branch <target-branch> --reservation <reservation-sha> --chg <chg-path> --phase <number> --worktree <absolute-worktree-path>
   ```

   This read-only preview checks clean target HEAD at the reservation and refuses
   branch/path collisions or competing workers. Its branch is
   `phase/<CHG-filename-without-.md>/<phase-number>/<full-reservation-sha>`.
   With reservation authority and exclusive ownership still valid, execute exactly
   the returned JSON `argv` through `terminal`, quoting each argument for the shell
   (never blindly join/eval JSON). Do not append flags or invent a branch suffix.
   The preview neither creates a worktree nor grants permission or a lock. After
   creation, verify `locate` before dispatch. On interruption use Recovery first;
   a successful preview alone is not permission to replace a missing worktree.

## 2. Freeze, commit, and integrate

1. Require gates and review on the same frozen diff, including staged/unstaged
   and untracked implementation files. Exclude the CHG path. The orchestrator
   previews, stages, checks, and commits that implementation in the worktree;
   hooks that change content invalidate the freeze and require review again.
2. Capture exact target HEAD and reviewed worktree HEAD. Immediately before
   integration, through `terminal`, run:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs preflight --target <target> --worktree <worktree> --target-branch <target-branch> --worktree-branch <worktree-branch> --target-head <target-head-sha> --worktree-head <reviewed-sha> --reservation <reservation-sha> --chg <chg-path> --phase <number>
   ```

   This requires clean, correctly branched checkouts in the same repository,
   reservation ancestry, identical reservation/target/worktree CHG blobs, no CHG
   edits anywhere in worktree history, and fast-forward topology. Never substitute
   an empty working-file diff for this test. On failure, preserve all changes and
   report both blob SHAs where available; do not reset or resolve a merge side.
3. With those SHAs still current and writers excluded, use
   `git -C <target> merge --ff-only <reviewed-sha>`. A moving/divergent target is a
   blocker, not permission to rebase. Rerun the full phase gate on the target.
   Failure leaves the row in progress and the worktree intact; correction and
   renewed review are needed before retrying. Already integrated code is not
   replayed after interruption; verify ancestry and rerun the target gate instead.

## 3. Complete and retire

1. After the integrated gate passes, set only the selected row to
   `done (<command> exit 0 @ <implementation-sha>)`, plus required CHG metadata.
   Use the exact reviewed worktree HEAD passed to preflight, including all fixup
   commits, never a stale ancestor or the completion commit itself. Completion's
   sole parent must be that tip; intervening writes require a new verified boundary.
   Multiple actual gate commands may be joined with `;`; escape table pipes.
   No current narrative may contradict the table; historical evidence may remain.
2. For the final verified phase, archive the CHG and repair index/owner links in
   this same record boundary. Preserve review packages at their stable review-only
   paths. Declare the exact old/new CHG and required record/index path allowlist;
   otherwise allow only the active CHG. No implementation belongs in this batch.
3. Use the record-write recipe with that allowlist and the reviewed tip as base.
   After its post-commit checks, read back the current (archive if moved) row:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs row --repo <target> --ref <completion-sha> --chg <current-chg-path> --phase <number> --expect done --evidence-commit <implementation-sha>
   ```

4. Require the completion to be contained in the target branch, target/worktree
   statuses clean, and implementation reachable from target. Only then run
   `git -C <target> worktree remove <worktree-path>` without force; verify its
   removal from `git worktree list --porcelain`. Do not remove the primary checkout
   or delete a branch with unclear ownership. A retry after completion performs
   verified cleanup only, not another status commit.
5. Report commit IDs, checks, and blockers. Use `phased-plan-overview` on the target
   for one next-goal prompt; print `/goal clear` before it. Do not execute it or
   push without separate explicit authority.

## Recovery and identity

- On the recorded target branch, for an in-progress row get the latest first-parent
  CHG-changing commit with `git -C <target> log -1 --first-parent --format=%H HEAD -- <chg-path>`.
  That must be a CHG-only pending/done → in-progress reservation, not a later
  metadata edit. Verify it with `row`, then locate its worktree:

  ```text
  node <this-skill-dir>/scripts/phase-guard.mjs locate --repo <target> --reservation <reservation-sha> --chg <reservation-chg-path> --phase <number>
  ```

  `locate` checks the transition, then requires exactly one registered non-target
  descendant (or exact named branch) and the reservation-derived branch name.
  Detached, locked, prunable, competing, unborn/unknown-HEAD, or CHG-modifying worktrees fail closed;
  unfinished implementation edits are preserved and may resume. Preflight repeats
  identity checks but additionally requires both checkouts completely clean.
- Zero candidates is not permission to create another worktree. If interrupted
  between reservation and creation, or transferring to another machine, obtain an
  explicit operator handoff after inspecting branch refs and the original machine.
  Legacy differently named branches also need an explicit migration decision;
  do not rename, prune, or adopt them automatically.
- If code is already integrated, verify the same reviewed tip and rerun the target
  gate; do not replay commits. Fixes go through a fresh executor/review in the
  existing worktree. Target advancement/divergence remains a blocker.
- If the selected row is done, verify the actual completion commit with `row`
  and the record recipe before cleanup. Recover its reservation using the same
  first-parent log command at `<implementation-sha>` and the old active CHG path,
  then `locate`. Do not compare the completed target blob to the reserved blob.
  If the worktree was already removed, prove its named branch tip is the integrated
  implementation and its registration absent; report cleanup already complete.
  Otherwise require clean status and remove without force. Never reopen a phase
  merely to finish cleanup. Missing evidence or ambiguous ownership needs a handoff.

## Verification

Both committed row checks, preflight, integrated gate, record validation, actual
commit allowlists, and cleanup must pass. The helper is a snapshot check, not a
lock or proof that a recorded command ran; the orchestrator verifies that evidence.