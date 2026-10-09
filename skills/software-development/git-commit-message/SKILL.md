---
name: git-commit-message
description: Commit changes in logical topical batches.
argument-hint: "[--tier 1|2|3]"
version: 4.1.0
metadata:
  hermes:
    tags: [git, commit]
---

# Logical Git Commits

## When to Use

Draft a Conventional Commits message from staged changes, or—when the user
explicitly asks—group, stage, and commit a working tree in logical topical
batches. `--tier 1|2|3` overrides the type's default tier.

Do not reorganize the index when the user asks only for a message.

## Procedure

1. Inspect the whole boundary with `terminal`: run `git status --short`,
   `git diff --name-status`, `git diff`, `git diff --staged --name-status`,
   and `git diff --staged`. Include untracked files from `git status`. If every
   view is empty, report "No changes" and stop.
2. Build dependency-aware logical batches before staging:
   - Keep one observable change with its tests, current-state documentation,
     records, and required configuration in the same batch.
   - Keep unrelated topics separate. Do not split a vertical slice merely to
     make smaller commits.
   - A verified implementation may precede a separate documentation/record
     closure batch when that closure requires evidence from the first commit.
   - Treat already-staged paths as one existing batch. Do not unstage or
     repartition them unless the user explicitly asks.
3. When asked only for a message, operate solely on the existing staged batch.
   When asked to stage or commit working-tree changes, stage exactly one planned
   batch with `git add -- <paths>`. Never use `git add -A` unless every changed
   and untracked path belongs to that batch.
4. Choose the type by the staged batch's purpose: `feat` capability, `fix`
   correction, `perf` performance, `refactor` restructuring, `test` tests,
   `build` build tooling, `ci` automation, `revert` reversal, `docs`
   documentation, `style` formatting only, or `chore` maintenance. Security
   corrections use `fix(security)`.
5. For each batch, run `git diff --staged --name-status` and
   `git diff --staged`. Confirm the batch has no unrelated paths and run the
   relevant existing verification command before committing. Never invent a
   verification command or claim it passed when it did not.
6. Write one message using the tiers below. Use `type(scope): summary`; scope is
   a lowercase module name and may be omitted. Use an imperative summary without
   a trailing period. Count the complete subject, including type and scope,
   against the tier limit. Describe only the staged batch; do not invent
   motivation, results, or assistant attribution.
7. Return the message only when asked for a message. When asked to commit, write
   it with `write_file` to a fresh session-scratch file, then run
   `git commit -F <message-file>` through `terminal` with hooks enabled.
8. After every commit, run `git log -1 --format='%h%n%B'` and
   `git status --short`. Verify the recorded message, preserve all remaining
   changes for later planned batches, and repeat from step 3 until every planned
   batch is committed or a command fails.
9. After the final batch, run the required integration verification when the
   repository defines one, then report commit hashes, subjects, verification
   results, and any remaining changes.

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
work. Otherwise the existing index is the commit boundary. Do not unstage
paths, change identity, amend history, bypass hooks, or push. Report failures
instead of bypassing them.
