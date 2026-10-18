# Target record writes

The orchestrator uses this single recipe for CHG creation/restructuring,
reservation, and completion/archive commits. Design/refactoring decide content;
closeout owns the Git boundary. Load before editing records, not only at commit.
This reference grants no authority. Record creation/restructuring needs explicit
record-edit/commit permission; phase flags authorize only their selected phase.

## Prepare

1. Identify the target checkout/branch and exact changed-path allowlist. Confirm
   the target is on that branch and clean, including index and untracked files:

   ```text
   git -C <target> rev-parse --abbrev-ref HEAD
   git -C <target> status --short --untracked-files=all
   git -C <target> rev-parse HEAD
   ```

   Retain that full HEAD as `<base-sha>`. Use the repository's existing exclusive
   writer mechanism, or an explicit operator-approved single-orchestrator handoff.
   Pause all other writers through readback; if exclusivity is unknown, stop.
   The guard is a snapshot, not a lock or protection against arbitrary external writers.
2. Creation/restructuring is target-only and requires no affected in-progress row
   or outstanding phase worktree (integrated-but-not-retired counts). A reservation
   has exactly the active CHG path; completion normally has that path only. Final
   archival permits the old/new paths plus required index/owner links. Preserve
   review packages at stable review-only paths. Never mix implementation into these
   record batches. Without commit authority, return a proposal without file edits.
3. Edit only the approved records. Use `git-commit-message` to preview the explicit
   batch and repository-compliant message. Its general grouping rules do not merge
   these boundaries. Stage only named paths with `git -C <target> add -- <paths>`.
   Run the record validator and inspect the full staged diff and status again;
   review any validator-generated edits before proceeding. The index must contain
   exactly the allowlist; never unstage unrelated work to make the check pass.

## Commit and read back

Through `terminal`, immediately before commit (repeat `--allow-path` per path):

```text
node <this-skill-dir>/scripts/phase-guard.mjs paths --repo <target> --base <base-sha> --allow-path <path>
```

Retain `contentDigest` from this result as `<reviewed-content-digest>`. It hashes
all indexed path/mode/object tuples, not just filenames. Freeze this index until
commit; losing the snapshot requires a new inspection, not an invented digest.
Use the accepted message file, with hooks enabled and no pathspec:

```text
git -C <target> commit -F <message-file>
git -C <target> rev-parse HEAD
```

Retain that SHA as `<record-sha>` and run the post-commit check with the SAME
allowlist, base, and pre-commit digest:

```text
node <this-skill-dir>/scripts/phase-guard.mjs paths --repo <target> --ref <record-sha> --base <base-sha> --expect-content <reviewed-content-digest> --allow-path <path>
git -C <target> status --short --untracked-files=all
```

Require success and a clean target before the lifecycle-specific row check or
next action. This catches extra/missing paths, same-path hook rewrites, mode
changes, and intervening commits. Do not use `git commit -- <paths>`: it can take
unreviewed working-file content instead of the inspected index. Content identity
and row shape are not proof that the recorded tests/review actually ran.

## Failure and interruption

- Before a commit: preserve index/files, report the failed check, and obtain an
  explicit disposition for unrelated changes. For authorized in-scope edits,
  inspect, revalidate, and preview the new boundary before retrying.
- If a hook/commit fails, inspect HEAD as well as index/files; do not assume no
  commit was made. If a commit exists but readback fails, report its SHA, expected
  base/digest/paths, and actual diff. Do not claim completion, dispatch another
  phase, or remove the worktree. Do not replace the expected digest with the new one.
- A contaminated commit needs an operator-approved recovery decision: normally
  an additive repair and a newly reviewed boundary, never silent amend/reset/rebase
  or discarded work. This is outside ordinary phase-flag authority. The operator
  must reconcile any invalid status/ancestry before the phase protocol resumes.
- After interruption, reuse a proven record commit instead of committing twice.
  If pre-commit evidence is unavailable, explicitly re-review the committed record
  and rerun its validation before accepting it as a new boundary; do not claim
  that a missing pre-hook comparison passed. Phase recovery is in the parent skill.
