---
name: phased-plan-closeout
description: Close a verified CHG phase and hand off the next goal.
version: 0.1.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, closeout, git, worktrees, change-records]
    related_skills: [git-commit-message, phased-plan-execution, phased-plan-overview]
---

# Phased Plan Closeout

Close one already verified CHG phase without guessing an integration route or
silently committing unrelated work. It commits and removes a dedicated worktree
only when the operator or governing goal explicitly authorizes commit; it never
pushes without separate authorization.

## When to Use

- A selected CHG phase passed its named gate and independent review.
- Its approved phase diff is ready in a dedicated worktree.
- The operator asks to close and commit that phase, or the active goal grants
  goal-scoped finalization authority.

Do not use for an unreviewed diff, a phase with failed or skipped required gates,
an ambiguous target branch, a working tree with unrelated changes, or to begin a
later phase.

## Prerequisites

- Read the selected CHG, applicable DOX chain, and the final review result.
- Know the primary checkout, dedicated worktree, worktree branch, target branch,
  CHG path, and selected phase number.
- Confirm explicit commit authority. A request to inspect or prepare closeout is
  not commit authority; `push` requires separate explicit authorization.
- Confirm the project permits an `--ff-only` integration. If it requires a pull
  request, rebase, squash merge, or another integration system, use that project
  contract instead and stop rather than improvising.

## Procedure

1. Freeze the accepted boundary.
   - With `terminal`, inspect `git status --short`, `git diff --check`, the full
     worktree diff, and the selected CHG row.
   - Confirm the named phase gate passed on this frozen diff and the final
     independent review has no unresolved findings.
   - Completion: one reviewed phase boundary is identified; unrelated changes are
     explicitly excluded.

2. Verify the commit boundary.
   - Use `git-commit-message` to produce the primary dependency-aware batch and
     preview. Commit exactly that primary batch only when current request or goal
     grants commit authority.
   - Include the selected CHG row, implementation, tests, and current-state
     records needed by that phase. Do not split the phase merely to make a smaller
     commit. Do not use `git add -A` unless every changed path belongs to it.
   - Completion: the committed batch matches the reviewed phase diff and
     `git log -1 --format='%h%n%B'` plus `git status --short` confirm it.

3. Integrate safely.
   - From the primary checkout, run `git rev-parse --abbrev-ref HEAD` and require
     that it equals the recorded target branch. Require `git status --short` to be
     empty before integration; do not risk fast-forwarding a different branch or
     carrying unrelated primary-checkout changes through the closeout.
   - Fast-forward only when the project permits it:

     ```text
     git merge --ff-only <worktree-branch>
     ```

   - If fast-forward cannot integrate the approved commit, stop and follow the
     repository's declared integration workflow. Never create an unreviewed merge
     commit or rebase as a closeout shortcut.
   - Re-run the selected phase gate in the integration checkout.
   - Completion: the target branch contains the approved commit and its phase gate
     still passes.

4. Read back repository truth and remove the worktree.
   - With `terminal`, inspect:

     ```text
     git show <commit>:<chg-path>
     ```

   - Confirm the target-ref CHG has the selected row as `done (<evidence>)` and no
     contradictory current-state prose. Then remove only the clean dedicated tree:

     ```text
     git worktree remove <worktree-path>
     ```

   - Do not force removal, remove the primary checkout, or delete a branch with
     unclear ownership. Report any mismatch or removal failure as a blocker.
   - Completion: target-ref readback proves the transition and the dedicated
     worktree is gone.

5. Hand off the next bounded action.
   - Use `phased-plan-overview` from the integrated target branch. It selects the
     next unambiguous CHG phase from repository truth or reports ambiguity.
   - If it selects a phase, report these operator commands without executing them:

     ```text
     /goal clear
     /goal draft Execute only phase <selected phase number or name> of <selected active CHG path> using autonomous-implementation-review and phased-plan-execution. Stop when the selected phase is verified, reviewed, and recorded as `done`; do not start another phase.
     ```

   - Completion: the prior goal is explicitly terminal and the next action is one
     bounded prompt or an evidenced ambiguity.

## Pitfalls

- A passing worktree test is not an integrated phase. The target ref and its CHG
  row must be read back before worktree removal.
- `git-commit-message` still requires its preview. Goal-scoped finalization
  authority permits applying that primary preview; it does not authorize a push.
- Never use this skill to bypass an unresolved review finding or a project-specific
  merge policy.
- Do not auto-run the next prompt. Phase selection and its new goal remain an
  explicit operator action.

## Verification

Before reporting closeout complete, verify the selected phase gate in the target
checkout, `git log -1`, `git status --short`, target-ref CHG readback, and
successful dedicated-worktree removal. Report the next literal `/goal draft`
prompt or the blocker that prevents selection.
