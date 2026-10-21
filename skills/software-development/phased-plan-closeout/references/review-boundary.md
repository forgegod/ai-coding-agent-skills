# Reviewed implementation boundary

The orchestrator owns these checks; the executor never stages or commits. Use
`terminal` for the commands below. This extends the existing phase guard, not a
second Git workflow. Stop other writers before capturing a boundary.

## Freeze before review

1. Inspect the full tracked diff and every untracked source file. Record the
   current worktree HEAD as `<base-sha>` and the exact changed-path allowlist.
   Exclude the CHG path; ignored build output is not implementation evidence.
2. Capture a read-only fingerprint, repeating `--allow-path` for each path:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs candidate --repo <worktree> --base <base-sha> --boundary worktree --allow-path <path>
   ```

   Save `contentDigest` as `<reviewed-digest>` with the base, paths, gate outputs,
   and reviewer packet. The digest includes the entire candidate tree's path,
   mode and blob tuples: staged/unstaged changes, deletions, and untracked files.
   It does not write Git objects or the index. Reviewers must inspect content,
   not treat a matching fingerprint as approval.
3. Run the named gates and obtain read-only review on that frozen candidate.
   Recheck the same command with `--expect-content <reviewed-digest>` after checks
   and review. Any drift invalidates approval; preserve it and re-review.

## Preview, stage, and verify

1. Present exact paths and the full commit message before any Git index write,
   including `git mv`. Autonomous authority removes the extra confirmation wait,
   not the preview. Keep the frozen candidate unchanged while staging named paths.
2. Verify the staged candidate against the SAME digest, base and allowlist:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs candidate --repo <worktree> --base <base-sha> --boundary index --expect-content <reviewed-digest> --allow-path <path>
   ```

   This also requires the working candidate to match the index: unstaged edits or
   omitted untracked files cannot disappear from review. Inspect the staged diff.
3. Commit with the previewed message and hooks enabled, then verify the new HEAD:

   ```text
   node <this-skill-dir>/scripts/phase-guard.mjs candidate --repo <worktree> --base <base-sha> --boundary commit --ref <implementation-sha> --expect-content <reviewed-digest> --allow-path <path>
   ```

   Require a clean checkout, exact content and a sole parent equal to the review
   base. A same-path hook rewrite is not covered by approval. Preserve a failed
   commit/readback and obtain an operator-approved recovery; never adopt its new
   digest, silently amend, or reset. Only then proceed to closeout preflight.

## Limits

- The check is a snapshot, not a lock, consent verifier, or proof tests ran.
- Raw bytes are hashed without filters; Git EOL/clean-filter or executable-mode
  transformations that change the staged representation fail closed. Do not
  disable filters or alter project config to bypass a mismatch; establish an
  explicitly reviewed canonical representation with the operator instead.
- Symlink targets are hashed without following them. Symlink parents, unsupported
  file types, unresolved indexes and submodules refuse this automated boundary.
  Ignored untracked files are excluded; never hide unique source/evidence there.
- Verification-only phases may have no implementation diff. Review the clean
  existing HEAD, use it as the verified tip in preflight/completion, and do not
  create a token edit or empty commit to satisfy this recipe.
