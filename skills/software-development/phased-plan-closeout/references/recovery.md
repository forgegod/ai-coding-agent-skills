# Phase recovery and identity

Load on interruption, an existing reservation/completion, or uncertain ownership;
never treat recovery as a fresh reservation. Preserve all changes on failure.

## In-progress phase

On the recorded target branch, through `terminal`, get the latest first-parent
CHG-changing commit:

```text
git -C <target> log -1 --first-parent --format=%H HEAD -- <chg-path>
```

It must be a CHG-only pending/done → in-progress reservation, not a later metadata
edit. Verify with the main skill's `row` command, then locate the worktree:

```text
node <this-skill-dir>/scripts/phase-guard.mjs locate --repo <target> --reservation <reservation-sha> --chg <reservation-chg-path> --phase <number>
```

`locate` verifies the transition and exactly one registered non-target descendant
(or exact named branch) with the reservation-derived branch name. Detached, locked,
prunable, competing, unborn/unknown-HEAD, or CHG-modifying worktrees fail closed.
Unfinished implementation edits are preserved and may resume; preflight additionally
requires both checkouts completely clean.

Zero candidates does not authorize another worktree. After interruption between
reservation and creation, or transfer to another machine, obtain an explicit
operator handoff after inspecting branch refs and the original machine. Legacy
branch names also require a migration decision; do not rename, prune, or adopt
them automatically. A successful create-preview is not recovery authority.

## Already integrated

Verify the same reviewed tip's ancestry and rerun the target gate; do not replay
commits. Fixes use a fresh executor/review in the existing worktree. A changed or
divergent target is a blocker, not permission to rebase or choose a merge side.

## Already completed

Verify the actual completion commit with `row --expect done --evidence-commit`
and the record-write recipe before cleanup. Recover the reservation using the
first-parent log above at `<implementation-sha>` and the old active CHG path,
then `locate`. Do not compare the completed target blob to the reserved blob.

- Registered worktree: require clean status, integrated implementation, and target
  completion, then remove without force under the main cleanup procedure.
- Already removed: prove the exact reservation-named branch tip is the integrated
  implementation and registration is absent. Report cleanup already complete.
- Never reopen a phase just to finish cleanup or make another completion commit.
  Missing evidence or ambiguous ownership requires an operator handoff.

Post-completion implementation corrections require an explicit reopening of an
active phase through reservation; archives are never reopened implicitly. Old
review/gate evidence covers only its original frozen revision.
