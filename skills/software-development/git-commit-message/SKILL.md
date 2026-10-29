---
name: git-commit-message
description: Preview batches; autonomous commits skip confirmation.
argument-hint: "[--tier 1|2|3]"
version: 4.6.0
metadata:
  hermes:
    tags: [git, commit]
---

# Logical Git Commits

## When to Use

Draft a Conventional Commits message from staged changes, or—when the user
explicitly asks—group, stage, and commit a working tree in logical topical
batches. `--tier 1|2|3` overrides the type's default tier.

Do not reorganize the index when the user asks only for a message. In normal
operation, do not stage or commit a suggested plan until the user applies its
preview or returns changes. Autonomous mode changes that confirmation gate,
not the required preview or verification.

## Scope selection

When the adopting project's policy explicitly selects OpenSpec for this work,
read [references/openspec.md](references/openspec.md) before step 2 and keep the
preview, acceptance, and verification rules below. The orchestrator is then the
sole writable owner of batch boundaries through `openspec-change-integration`.
Without that explicit policy, the CHG exception in step 2 is the only
integration route.

## Procedure

1. Inspect the whole boundary with `terminal`: run `git status --short`,
   `git diff --name-status`, `git diff`, `git diff --staged --name-status`,
   and `git diff --staged`. Include untracked files from `git status`. If every
   view is empty, report "No changes" and stop.
2. Build dependency-aware logical batches before staging:
   - For CHG creation/restructuring or phase execution, `phased-plan-closeout`
     controls the explicit record/implementation batches and their path allowlists.
     Do not combine its record-only target commits with implementation or assign
     Git writes to an executor. This exception precedes the general grouping rule.
   - For explicitly OpenSpec-managed scope, `openspec-change-integration` owns
     the batches and their path allowlists; follow
     [references/openspec.md](references/openspec.md). Do not create a CHG
     record, phase table, or phase-guard check for that scope.
   - Otherwise keep one observable change with its tests, current-state CAP/docs,
     and required configuration in the same batch; exclude CHG lifecycle records.
   - Keep unrelated topics separate. Do not split a vertical slice merely to
     make smaller commits.
   - A verified implementation may precede a separate documentation/record
     closure batch when that closure requires evidence from the first commit.
   - Treat already-staged paths as one existing batch. Do not unstage or
     repartition them unless the user explicitly asks.
3. Draft one message per batch from that batch's paths only. Choose the type
   by purpose: `feat` capability, `fix` correction, `perf` performance,
   `refactor` restructuring, `test` tests, `build` build tooling, `ci`
   automation, `revert` reversal, `docs` documentation, `style` formatting
   only, or `chore` maintenance. Security corrections use `fix(security)`.
   Use the tiers below. Do not invent motivation, results, or assistant
   attribution. Repository commit-message rules override the default format here.
4. When asked only for a message, return the existing staged batch's message
   and stop. Do not stage, and do not ask to apply it.
5. When recommending batches to stage or commit, follow Preview. In normal
   operation, present a preview and stop before any `git add` or `git commit`.
   A request to commit is not acceptance of a plan the user has not seen. A
   user-supplied message and path list is already an accepted plan: use it,
   and do not replace it. In explicitly enabled autonomous mode, present the
   preview in the execution report and continue without waiting for a separate
   confirmation.
6. After acceptance, stage exactly one accepted batch with
   `git add -- <paths>`. Never use `git add -A` unless every changed and
   untracked path belongs to that batch.
7. Run `git diff --staged --name-status` and `git diff --staged`. Commit only
   if the staged paths and content match the accepted batch. Run the relevant
   existing verification command before committing. Never invent a
   verification command or claim it passed when it did not. If the staged
   result does not match the accepted batch, stop and present a new preview;
   do not commit it.
8. Write the accepted message with `write_file` to a fresh session-scratch
   file, then run `git commit -F <message-file>` through `terminal` with hooks
   enabled. Do not rewrite the accepted message at commit time.
9. After every commit, run `git log -1 --format='%h%n%B'` and
   `git status --short`. Verify the recorded message matches the accepted
   message, preserve remaining changes for later accepted batches, and repeat
   from step 6 until every accepted batch is committed or a command fails.
   Do not re-preview between batches of an already accepted plan.
10. After the final batch, run the required integration verification when the
    repository defines one, then report commit hashes, subjects, verification
    results, and any remaining changes.

## Preview

Always prepare a preview. Autonomous mode is enabled only when the active
agent environment or governing instructions explicitly say it may commit
without user confirmation; never infer it from an agent's name, identity, or
general ability to act autonomously.

In normal operation, present a preview and stop in that same turn. The turn
that presents a preview does no `git add` and no `git commit`.

In explicitly enabled autonomous mode, include the preview immediately before
staging and committing in the same execution report. A request to commit is
authorization to apply that preview; do not wait for a separate confirmation.

For each batch, in commit order, show the number, paths, tier, and full
message. Name every changed path left out, and why. State that nothing has
been staged or committed.

In normal operation, wait until the user applies the preview or returns
changes. In explicitly enabled autonomous mode, continue after recording the
preview.

- In normal operation, apply uses the preview exactly. Apply means an explicit
  acceptance, such as "apply" or "commit these". In explicitly enabled
  autonomous mode, the request to commit applies the preview exactly.
- Changes replace only the edited part: message text, path groups, order, or
  drops. A message-only edit that keeps the same path groups is the accepted
  plan. If path groups, order, or included paths change, show the revised
  preview and wait again.
- Applying a subset commits only those batches, in order, and leaves the rest
  unstaged.
- Stop or reject means do not stage or commit.

## Tiers

### Tier 1 — feat, fix, perf

Subject: at most 50 characters. Body: lead with the user-facing reason,
briefly explain the change, state its impact, and list affected staged paths.

```text
fix(auth): reject expired tokens

Prevent expired credentials from granting access.
Check token expiry before authorizing requests.

Impact: expired tokens are rejected.

Affected files/components:
- src/auth.py
```

### Tier 2 — refactor, test, build, ci, revert

Subject: at most 72 characters. Body: 1–2 sentences of what and why,
then `Files: <affected staged paths>`.

### Tier 3 — docs, style, chore

Subject: at most 72 characters. No body unless brief context is useful.

## Boundaries

Stage, split, and commit batches only when the user explicitly asks for that
work and the plan is accepted: either they supplied the message and paths,
they apply a preview or return changes to it, or explicitly enabled autonomous
mode treats the request to commit as acceptance. Otherwise the existing index
is the commit boundary. Do not unstage paths, change identity, amend history,
bypass hooks, or push. Report failures instead of bypassing them. Outside
explicitly enabled autonomous mode, a preview is not permission to commit.
