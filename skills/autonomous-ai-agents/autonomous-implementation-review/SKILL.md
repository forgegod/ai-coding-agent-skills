---
name: autonomous-implementation-review
description: Implement changes with an independent review loop.
version: 0.16.1
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

One authorized OpenSpec change, one named task group per worker; no GitHub writes.

## Portable core

For outcome packets and review, follow
[references/portable-core.md](references/portable-core.md) and
`references/openspec.md`, without Hermes or Herdr. Use
[references/worker-handoff.md](references/worker-handoff.md) for artifact-first
handoffs. Dispatch requires a selected qualified adapter; core checks do not
qualify clients. Replacement readiness precedes legacy retirement; no fallback.

## Legacy host execution

This retained recipe does not govern the portable core or qualify terminal routes.

## Preconditions and roles

- Read the contributor contract, the selected `openspec/changes/<name>/` artifacts,
  code/tests, branch/status, gates and authority. Load `references/openspec.md`
  before dispatch. A planning-only request stops after proposal/spec/design/tasks;
  do not dispatch implementation.
- Require explicit execution authority before step 1. The orchestrator is the sole
  Git and `tasks.md` writer through `openspec-delivery`. The executor
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

## Legacy goal and repository truth

Under adopted short-invocation policy, `/openspec-next` or `/openspec-delivery <name>`
selects one approved group. Local workspace/bootstrap, task updates and previewed
commits exclude push/PR/merge; restrictions win.

Optional persisted-goal launch (display alone grants no authority):

```text
/goal draft /openspec-delivery <name>
```

`/goal draft` starts execution; inspect `/goal show`. Resume from repository truth.

Use `/goal`, not `/loop`. The operator controls pause/resume/clear and `/subgoal`.
Compression is automatic; for earlier compression the operator runs `/goal pause`,
`/compress here 2`, inspects `/context`, then `/goal resume`.
Printed commands do not execute.

Stop discovery once authority, ownership, bootstrap and gates resolve.
Reuse valid evidence; batch independent lookups.

## Procedure (legacy host execution only)

1. Confirm recovery and an isolated checkout through `openspec-delivery`.
   Do not start a second writer for the same change.
2. Through the Herdr recipe, start a fresh outcome-named implementer session with
   accepted `/busy queue`, configured model and a visible `Agent Running` readback.
   Send outcome, scope/non-goals, workspace/base, paths, links, gates, constraints
   and budget; require focused tests, paths/results/risks and a report with links.
3. On watcher `settled`, inspect the candidate and run relevant checks; lifecycle is
   not success. Under `lifecycle-watch.md`, one `inconclusive` receipt may be resumed
   once with `--resume-from`; the role stays incomplete until it settles. Worker
   caps use turn-cap recovery below; other non-`settled` outcomes stop.
   Reviewer/correction needs fresh approval; never inject
   status/reset/goal. Dispatch failed prerequisites to a fresh implementer session;
   the orchestrator does not edit worker code.
4. Freeze the clean committed candidate through the integration skill. Dispatch a
   fresh reviewer role through Herdr with base/digest, paths/diff, acceptance
   criteria, gate evidence and implementation report. Keep the candidate frozen.
5. Apply the candidate review criteria in `references/portable-core.md`; require
   actionable findings or `No findings`.
6. Reproduce findings; send confirmed fixes to a fresh implementer role in the same
   checkout with the original contract. Changed content requires renewed gates and
   review. Limit to two fix/review cycles; a third needs operator direction.
7. Delivery owns publication/completion; commits use `git-commit-message` under
   project policy. Identity/tests grant no writes. Push/PR/merge need separate
   authority and remote-ref readback; otherwise preserve/report the candidate.
8. Continue only unfinished work in the named task group. Stop after that group or a
   real blocker; no next change without a new request.

## Executor turn-cap recovery

`Iteration budget exhausted` is incomplete. The worker stops; it never self-continues or
switches role.
The orchestrator alone decides through delivery's `workerContinuationDecision`
before every cap handoff: once per native task in the existing checkout.
Never split, relabel or change sessions to reset it; a second cap stops.
Preserve identity, budget, review and native-input gates; follow
`references/portable-core.md`. Legacy handoff approvals still apply.

## Pitfalls and verification

- Conflicting checkout changes block; preserve them, never reset or choose a merge side.
- Require acceptance evidence, actual gates and frozen review. Report verified
  results, skips and blockers separately; integration/documentation need separate authority.
