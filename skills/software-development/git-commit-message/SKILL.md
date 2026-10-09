---
name: git-commit-message
description: Draft tiered commit messages from staged Git changes.
argument-hint: "[--tier 1|2|3]"
version: 4.0.0
metadata:
  hermes:
    tags: [git, commit]
---

# Staged Git Commit

## When to Use

Generate a Conventional Commits message for staged changes, or commit them
when the user asks. `--tier 1|2|3` overrides the type's default tier.

## Procedure

1. Use `terminal` in the target repository to run `git diff --staged --name-status`
   and `git diff --staged`. If there are no staged changes, report
   "No staged changes" and stop.
2. Choose the type by the staged change's purpose:
   `feat` capability, `fix` correction, `perf` performance,
   `refactor` restructuring, `test` tests, `build` build tooling,
   `ci` automation, `revert` reversal, `docs` documentation,
   `style` formatting only, `chore` maintenance.
   Security corrections use `fix(security)`.
3. Write one message using the tier below. Use `type(scope): summary`;
   scope is a lowercase module name and may be omitted. Use an imperative
   summary without a trailing period. Count the entire subject, including
   type and scope, against the tier's limit. Describe only staged changes;
   do not invent motivation, results, or assistant attribution.
4. Return the message only when asked for a message. When asked to commit,
   write that message with `write_file` to a fresh file in the session's
   scratch directory, then use `terminal` to run `git commit -F <message-file>`.
5. After committing, use `terminal` to run `git log -1 --format='%h%n%B'`
   and `git status --short`. Verify the recorded message and report the
   commit hash and any remaining changes.

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

The index is the commit boundary. Do not stage, unstage, split batches,
change identity, amend history, or push. Keep hooks enabled; report failures
instead of bypassing them.
