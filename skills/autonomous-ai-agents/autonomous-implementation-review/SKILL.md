---
name: autonomous-implementation-review
description: Implement changes with an independent review loop.
version: 0.13.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [multi-agent, implementation, code-review, worktrees, verification]
    config:
      - key: autonomous_ai_agents.reviewer
        description: Hermes `/model` selector used for the review phase.
        default: grok
        prompt: Reviewer model key
      - key: autonomous_ai_agents.implementer
        description: Hermes `/model` selector used for implementation work.
        default: astra
        prompt: Implementer model key
---

# Autonomous Implementation Review

High-risk work needs external review. The unit is one authorized OpenSpec change
and one named task group. This skill does not specify the change and does not
write GitHub state.

## Preconditions and roles

- Read the contributor contract, the selected `openspec/changes/<name>/` artifacts,
  code/tests, branch/status, gates and authority. Load `references/openspec.md`
  before dispatch. A planning-only request stops after proposal/spec/design/tasks;
  do not dispatch implementation.
- Require explicit execution authority before step 1. The orchestrator is the sole
  Git and `tasks.md` writer through `openspec-change-integration`. The executor
  must not edit `tasks.md`, stage, commit, integrate, or retire checkouts.
  Reviewers are read-only.
- This automated role loop is Herdr-only. Require `$HERDR_ENV=1` and load
  [references/herdr.md](references/herdr.md) before pane control.
  Use an explicitly selected different Herdr pane; this pane remains the orchestrator.
  Issue #141194 blocks handoff proof. Until closed, only operator approval of pane
  authorizes next packet.
  No implicit consent or `delegate_task` fallback.
  Outside Herdr, stop unless the operator sent `code-tab-phase-roles`; then load
  `references/claude-code-roles.md`. Do not mix that token with Herdr.
- Model keys are session selectors, not executables. A rejected key blocks;
  never shell-execute it or edit global config.
- Isolate writers and mutable services; use finite budgets. No secrets, destructive
  tasks or unresolved choices; browser access must be scoped.
- For a source checkout, compare installed skill version once and report drift;
  source edits neither update installed skills nor authorize installation.

## Goal and repository truth

Operator launch (display alone grants no authority; assessment is read-only):

```text
/goal draft Execute only the authorized task group of openspec/changes/<name> using autonomous-implementation-review and openspec-change-integration. I authorize the orchestrator to use an isolated checkout, commit the reviewed implementation, and update that change's tasks.md after checking evidence. Stop after the named task group; do not push, open a pull request, merge, or start another change.
```

`/goal draft` starts execution; the operator inspects `/goal show`. Resume from
real state; use `session_search` only for missing evidence, not scratch plans.

Use `/goal`, not `/loop`. The operator controls pause/resume/clear and `/subgoal`.
Compression is automatic; for earlier compression the operator runs `/goal pause`,
`/compress here 2`, inspects `/context`, then `/goal resume`.
Printed commands do not execute.

Stop discovery once scope, authority, executor, ownership, bootstrap and gates
resolve. Reuse valid evidence; batch independent lookups.

## Procedure

1. Confirm recovery and an isolated checkout through `openspec-change-integration`.
   Do not start a second writer for the same change.
2. Through the Herdr recipe, start a fresh outcome-named implementer session with
   accepted `/busy queue`, configured model and a visible `Agent Running` readback.
   Send outcome, scope/non-goals, workspace/base, paths, links, gates, constraints
   and budget; require focused tests, paths/results/risks and a report with links.
3. On watcher `settled`, inspect the candidate and run relevant checks; lifecycle is
   not success. Under `lifecycle-watch.md`, one `inconclusive` receipt may be resumed
   once with `--resume-from`; the role stays incomplete until it settles. Otherwise
   non-`settled` stops. Reviewer/correction needs fresh approval; never inject
   status/reset/goal. Dispatch failed prerequisites to a fresh implementer session;
   the orchestrator does not edit worker code.
4. Freeze the clean committed candidate through the integration skill. Dispatch a
   fresh reviewer role through Herdr with base/digest, paths/diff, acceptance
   criteria, gate evidence and implementation report. Keep the candidate frozen.
5. Require severity-ordered findings with `path:line`, impact, trigger and minimal
   correction/reproduction, or `No findings`. Review correctness, regressions,
   security/privacy, data loss/concurrency, contracts and test gaps, not refactors.
6. Reproduce findings; send confirmed fixes to a fresh implementer role in the same
   checkout with the original contract. Changed content requires renewed gates and
   review. Limit to two fix/review cycles; a third needs operator direction.
7. The integration skill owns publication and completion evidence. Standalone commits
   use project policy and `git-commit-message`. Neither agent identity nor green tests
   grant writes. Push, pull requests and merge need separate authorization and
   remote-ref readback. Without that authority, preserve and report the candidate.
8. Continue only unfinished work in the named task group. Stop after that group or a
   real blocker; no next change without a new request.

## Executor turn-cap recovery

`Iteration budget exhausted` means the role did not finish. The
implementer/reviewer only returns factual state; it never self-continues or
switches role. The orchestrator inspects report and workspace, then alone decides
whether to stop or dispatch a fresh bounded, same-role packet for the exact
unfinished action in the existing checkout. A cap is not completion or authority:
split oversized packets, not raise caps.

## Pitfalls and verification

- Conflicting checkout changes block; preserve them, never reset or choose a merge side.
- This loop is done only with acceptance evidence, actual gates and frozen review.
  Integration and documentation writes are separate authority. Separate verified
  results, skips and blockers.
