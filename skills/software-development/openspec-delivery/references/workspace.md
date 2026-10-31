# Automatic workspace lifecycle

Load before setup, bootstrap, integrated verification or retirement. Use the
host's `terminal` tool for commands, resolving scripts from this loaded package.
The helper is read-only. It returns exact argument arrays, not authority, locks,
remote truth, test results or proof of ownership. Keep operator-serialized starts.

## Prepare or reuse

1. Read root/owning contracts, native artifacts, target policy, `git status --short`,
   current branch/full HEAD, `git worktree list --porcelain`, and local/remote refs.
   When invoked inside the worker, derive a retained source/primary checkout from
   that inventory; do not pass the worker as its own creation/retirement source.
   Pin repository, selected full name, plan/base SHA, target branch and authority.
   Check actual remote heads before publication; cached remote refs alone are not
   remote proof. A remote error is not absence. Confirm one orchestrator, no worker
   still editing, and an approved plan before implementation, not before drafting.
2. For an authorized new proposal: generate the full name once, then prepare its
   checkout before `openspec new change`. No proposal files are needed by this
   helper. Native OpenSpec still scaffolds inside that workspace. This is selected
   project policy, not a patched adapter or another propose skill.
3. Through `terminal`, substitute literal values in:

   ```text
   node <this-skill-dir>/scripts/change-workspace.mjs prepare --repo <canonical-source-root> --change <full-name> --base <full-base-sha>
   ```

   The default destination is the sibling `<source-directory>--<full-name>`; no
   operator path entry is needed. Optional `--workspace <absolute-path>` selects
   another absent path with an existing canonical parent, outside all checkouts
   and auto-pruned scratch/cache trees. Optional `--branch <confirmed-legacy-branch>`
   preserves an existing project mapping; never invent one to evade a collision.
   New branches are `change/<full-name>`. Source and worker planning-directory
   ancestors must be regular directories, not symlinks. A registered worktree is reused,
   never reset. An unregistered existing branch, stale base, locked/prunable tree,
   symlink, occupied path, or primary checkout used as the worker blocks creation.
4. For `action: create`, recheck the base/ownership immediately before executing
   exactly the returned `argv` with an argument-array subprocess, no shell eval or
   string join. Only execute under the invocation's setup authority. A failure
   means inspect actual refs/registration before retrying; never invent a suffix.
   Worktree creation can run Git post-checkout hooks: inspect the configured
   hooks path and require the project's trust/approval before execution. A preview
   is not a sandbox and never silently disables project hooks. Read back any
   hook-created changes as well as the branch/registration.
   For `reuse`, inspect reported HEAD/dirty state and existing artifacts first.
   Dirty work is not discarded: resume only if its owner/scope and interrupted
   step are verified; otherwise stop. Bootstrap residue is not implementation.
5. Read back before editing/dispatch:

   ```text
   node <this-skill-dir>/scripts/change-workspace.mjs locate --repo <canonical-source-root> --change <full-name> --base <full-base-sha>
   ```

   Repeat any confirmed `--branch`/`--workspace` selectors. Verify branch, base,
   HEAD, canonical root and common Git directory. The selected change must exist
   there before implementation. Committed plans must be reachable in that branch;
   a clean base that lacks the selected plan is not a ready implementation tree.
   Never silently copy a dirty proposal or cherry-pick it across checkouts. A
   draft trapped in another tree needs a bounded preservation/transfer decision.

## Bootstrap without an operator checklist

Read the project manifest, lockfiles, version pins, exported scripts, container
recipes and CI. Execute the existing documented reproducible bootstrap in the
workspace automatically under local execution authority. For example, use the
project's lockfile installation only when that is its established recipe. Do
not invent scripts, share a mutable dependency directory, copy secrets, import a
real agent profile or relax a dependency/ADR decision. An install script is code:
respect host approval, network and project trust controls. If a bootstrap would
change tracked inputs, need new credentials/system installation, or leave its
established recipe, stop with that specific decision. Preserve gate failures.
Record bootstrap commands/environment/results separately from acceptance gates.

A common Git directory is shared across worktrees: refs, objects and config are
not isolated. Ports, databases, build outputs and caches may also be shared;
isolate mutable resources per change. An independent clone is supported by the
candidate/evidence guard but is not a linked worktree and cannot use this
creation/retirement helper; inspect its own refs/base/plan and follow project
clone policy. Do not force common-directory constraints into cross-clone review.
Concurrent agent sessions also need distinct host session/profile identities;
worktrees do not isolate those identities. Never copy credentials to simulate it.

## Integration and closure workspaces

Reuse the implementation branch through review. Do not reset/rebase it after
merge. To run integrated gates, create a separate temporary detached worktree
at the exact read-back target SHA using `git worktree add --detach -- <path> <sha>`
after the same canonical absent-path and ownership checks. Record full HEAD and
verify it again after the gates. This tree is read-only for product inputs.

For record-only closure, derive `closure/<full-name>` from the verified target,
not a stale implementation branch. Read existing closure PRs/refs first and
resume one confirmed path. Use `prepare ... --base <verified-target-sha>
--branch closure/<full-name> --workspace <sibling-closure-path>` from that clean,
verified checkout. This is the same change, not a new identity. Add only the
receipt/evidence and byte-identical archive movement; never fold product fixes
or current-spec sync into the record-only closure. Before retiring this closure
worktree, invoke the helper from a retained clean checkout, not the tree being
removed. Keep its recorded original base and confirmed branch selector.

## Retire only after verified closure

`finish` includes clean-worktree retirement unless the operator says to retain
it. Branch deletion remains excluded. First read back the actual implementation
merge, closure merge, containing target, receipt/archive and issue state. The
helper's target ancestry check cannot establish any of these external facts.

1. Stop writers/services. Preserve required evidence outside generated/ignored
   outputs; inspect `git status --short --ignored` and submodule status. A clean
   tracked diff alone does not account for ignored valuable files or nested repos.
   Unknown/valuable ignored files block removal; dependencies may be regenerated
   only after they are identified as disposable. Never use `--force`.
2. Through `terminal`:

   ```text
   node <this-skill-dir>/scripts/change-workspace.mjs retire --repo <retained-clean-root> --change <full-name> --base <original-base-sha> --head <captured-worktree-head> --target <read-back-containing-closure-sha>
   ```

   Supply the confirmed closure `--branch`/`--workspace` when retiring that tree.
   Require clean source and worker, exact HEAD, and worker ancestry in the actual
   containing closure revision. Execute returned `argv` without modification;
   no force, ref deletion, primary checkout removal or broad prune.
3. Read `git worktree list --porcelain`, retained refs, filesystem absence and
   retained-checkout status. Report removals and retained branch names separately.
   A detached verification tree is removed without force only after the same
   ignored-file/evidence checks, clean exact SHA readback and ownership proof;
   verify its absence too. Its registration is not inferred from a branch name.
4. If already absent, inspect registration and recoverable refs/evidence; report
   cleanup already complete. Do not create a replacement to make `locate` pass.
   A failed cleanup leaves accepted source evidence valid but cleanup pending.
