# Phase recovery and identity

Load on interruption, an existing reservation/completion, or uncertain ownership;
never treat recovery as a fresh reservation. Preserve all changes on failure.

Classify the phase lifecycle before choosing a command. An aggregate CHG status
of `in-progress` does not reserve a phase; use its phase rows. Reuse the captured
full target SHA and worktree inventory. Substitute literal values and shell-quote
arguments in the recipes below; do not pass placeholder tokens to tools.

Guard commit arguments require captured full commit SHAs, never `HEAD`, branch
names, or abbreviated SHAs. An invalid argument is an invocation error, not
evidence of corrupt history or missing ownership; correct that read-only call
using the captured identity, without weakening or bypassing the guard.

A checkout conversion (`eol=crlf`, `text`) is not a candidate change: Git
stores the normalized blob and considers the working tree clean, so the guard
fingerprints the clean-filter blob. If a candidate fails the allowlist only on a
file Git reports clean, do not edit that file, its `.gitattributes` rule, the
repository line-ending config, or the allowlist to force approval. A candidate
that edits `.gitattributes` changes how every other file normalizes, so it is
refused by design and needs an explicit recovery decision.

## In-progress phase

On the recorded target branch, through `terminal`, get the latest first-parent
CHG-changing commit:

```text
git -C <target> log -1 --first-parent --format=%H <target-head-sha> -- <chg-path>
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

1. Verify the actual completion commit with `row --expect done --evidence-commit`
   and the record-write recipe before cleanup. Pass its full SHA as `--ref`, not
   the current target tip if later commits exist. Recover the reservation using
   the first-parent log above at `<implementation-sha>` and the old active CHG
   path; verify the CHG-only reservation transition. Do not compare the completed
   target blob to the reserved blob. Overview reads recorded gates, not reruns.
2. Derive the complete branch ref from that reservation, not a folder name or a
   wildcard listing. Through `terminal`, use this exact lookup and ancestry check:

   ```text
   git -C <target> show-ref --verify --hash refs/heads/phase/<CHG-filename-without-.md>/<number>/<reservation-sha>
   git -C <target> merge-base --is-ancestor <implementation-sha> <target-head-sha>
   ```

   Require lookup success and a branch tip equal to the full implementation SHA;
   require ancestry exit 0. An empty successful `for-each-ref` wildcard listing
   proves neither absence nor ownership: `*` does not span nested ref components.
   Do not substitute reflogs for the exact ref. If listing for diagnostics, use
   a literal ref prefix and `%(refname)%09%(objectname)` (`%x09` is log syntax).
3. Classify registration from the captured inventory, or through `terminal` if
   missing or stale:

   ```text
   git -C <target> worktree list --porcelain
   ```

   Check all non-target entries: the exact branch or a reservation descendant
   needs investigation. Detached, locked, prunable, competing or unresolved entries
   never establish completed removal. Do not infer ownership from names.

- Registered worktree: use `locate` to verify exclusive reservation ownership,
  including CHG history/index/working-file checks. Require clean status,
  implementation integration and target completion before authorized removal
  without force. Overview reports cleanup-only recovery and stops.
- Already removed: the verified exact branch tip is the integrated implementation
  and registration is absent with no unresolved competing owner. Do not run `locate`
  to prove absence; it requires one registered worker and correctly fails on zero.
  Report cleanup already complete; overview may select the first pending phase.
- Missing exact ref, failed query, mismatched tip, incomplete completion evidence
  or ambiguous ownership requires an operator handoff. Keep these failure reasons
  distinct; do not recreate refs/worktrees, adopt another checkout or broaden scans.
- Never reopen a phase just to finish cleanup or make another completion commit.

Post-completion implementation corrections require an explicit reopening of an
active phase through reservation; archives are never reopened implicitly. Old
review/gate evidence covers only its original frozen revision.
