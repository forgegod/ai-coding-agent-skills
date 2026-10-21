---
name: autonomous-implementation-review
description: Implement changes with an independent review loop.
version: 0.8.1
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

Use fresh role sessions; the orchestrator verifies results. Role separation is not
external independence; high-risk work may need external review.

## Preconditions and roles

- Read DOX, manifests, code/tests, branch/status, criteria, gates and authority.
  Existing phases use `phased-plan-execution`; new/reshaped material work uses
  `application-records`/`phased-plan-design`. No records for non-material work.
  A planning-only request stops after design; do not reserve or dispatch phase 1.
  Require explicit phase-execution authority before step 1.
- The orchestrator follows `phased-plan-closeout` for CHG/Git writes. The executor
  must not edit or commit the CHG path, stage, commit, integrate, or retire worktrees.
  Reviewers are read-only. Missing reservation authority blocks mutable phase work.
- This automated role loop is Herdr-only. Require `$HERDR_ENV=1` and load
  [references/herdr.md](references/herdr.md) before reservation or pane control.
  It owns selection, role setup, delivery, waits and stops. No implicit pane consent,
  `delegate_task` role substitute, or fallback worker.
  Outside Herdr, stop and offer an operator-approved manual phase workflow.
- Configured implementer/reviewer values are session-only Hermes model keys,
  not executables. Transport/model failure blocks: never shell-execute keys,
  change global config or silently substitute a model.
- Isolate writing agents' worktrees, branches, outputs and mutable services;
  prefer one worker for dependent work. Set finite turn/time/cost budgets.
  No secrets, destructive production tasks, or unresolved interactive decisions.
  Browser work needs explicit scoped access and verified connection, not personal
  browser state. Scratch holds temporary logs; dirty worktrees stay outside caches.
- If a source checkout is in use, compare installed skill version with source once;
  report drift. Source edits do not update installed skills or authorize installation.

## Goal and repository truth

Operator launch (display alone grants no authority; assessment is read-only):

```text
/goal draft Execute only phase <phase-number> of <active-chg-path> using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.
```

`/goal draft` starts execution; the operator inspects `/goal show`. Resume from
CHG/workspace truth, using `session_search` only for missing evidence, not scratch plans.

Use `/goal`, not `/loop`. The operator controls pause/resume/clear and `/subgoal`.
Compression is automatic; for earlier compression the operator runs `/goal pause`,
`/compress here 2`, inspects `/context`, then `/goal resume` in the orchestrator.
Printed commands do not execute; resume does not reset context.

Stop discovery once scope, authority, executor, ownership, bootstrap and gates
are resolved. Reuse evidence unless invalidated; batch independent lookups.

## Procedure

1. Reserve through closeout; standalone work uses project isolation/Git policy.
2. Through the Herdr recipe, start a fresh outcome-named implementer session,
   accepted `/busy queue` and configured model. Send a compact packet: outcome,
   scope/non-goals, workspace/base, paths, CHG/CAP links, gates, constraints, budget
   and report format. Require focused tests and paths/results/risks; link
   logs/diffs instead of repeatedly copying them.
3. After lifecycle settlement, inspect staged/unstaged/untracked content and verify
   relevant checks; idle/done is not success. Dispatch failed prerequisites to a fresh
   implementer session; the orchestrator does not edit worker code.
4. Use closeout's review-boundary recipe to freeze the full candidate. Dispatch a
   fresh reviewer role through Herdr with base/digest, paths/diff, acceptance
   criteria, gate evidence and implementation report. Keep the candidate frozen.
5. Require severity-ordered findings with `path:line`, impact, trigger and minimal
   correction/reproduction, or `No findings`. Review correctness, regressions,
   security/privacy, data loss/concurrency, contracts and test gaps, not refactors.
6. Reproduce findings; send confirmed fixes to a fresh implementer role in the same
   worktree with the original contract. Changed content requires renewed gates and
   review. Limit to two fix/review cycles; a third needs operator direction.
7. Closeout owns CHG integration/completion; standalone commits use project policy
   and `git-commit-message`. Neither agent identity nor green tests grant writes.
   Push needs separate authorization and remote-ref readback. Without integration
   authority, preserve/report the candidate, not target completion.
8. Continue only unfinished work in the selected phase. Stop after verified
   completion/cleanup or a real blocker; no next phase without a new request.

## Executor turn-cap recovery

The forced final reply cannot run checks, update the CHG, or resume itself. Inspect
its report and workspace, then dispatch a fresh bounded session for the exact
unfinished action in the existing worktree. A cap is not completion or a user
decision. Split oversized packets, not raise caps. Post-completion corrections
require reopening through closeout first.

## Pitfalls and verification

- Conflicting CHG changes block; preserve them, never reset or choose a merge side.
- Completion needs acceptance evidence, actual gates, frozen review/dispositions
  and closeout's target/cleanup proof. Separate verified results, skips and blockers.