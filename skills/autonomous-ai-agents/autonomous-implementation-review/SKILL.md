---
name: autonomous-implementation-review
description: Implement changes with an independent review loop.
version: 0.17.0
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

Follow [references/portable-core.md](references/portable-core.md),
[references/terminal-adapters.md](references/terminal-adapters.md),
[references/profile-preparation.md](references/profile-preparation.md) and
`references/openspec.md`, without Hermes or Herdr. Use
[references/worker-handoff.md](references/worker-handoff.md). Dispatch uses a
qualified adapter; replacement readiness precedes retirement; no fallback.

## Legacy host execution

`replacementReadiness` is satisfied. `resolveLegacyRouteRequest` stops
`code-tab-phase-roles` and `herdr-pane-dispatch` with `status: "retired-route"`,
without fallback or `.claude/agents` edits. `HERDR_ENV` selects no role transport;
[references/herdr.md](references/herdr.md) and `references/lifecycle-watch.md`
govern only the Herdr interaction fallback.

## Preconditions and roles

- Read the contributor contract, `openspec/changes/<name>/` artifacts,
  code/tests, branch/status, gates and authority. Load `references/openspec.md`
  before dispatch. A planning-only request stops after proposal/spec/design/tasks;
  do not dispatch implementation.
- Require explicit execution authority before step 1. The orchestrator is the sole
  Git and `tasks.md` writer through `openspec-delivery`. The executor
  must not edit `tasks.md`, stage, commit, integrate, or retire checkouts.
  Reviewers are read-only.
- Dispatch roles via an explicitly selected qualified terminal adapter
  (`hermes`, `claude-code`, `codex`, `grok-build`) in `references/terminal-adapters.md`.
  One client may run all roles sequentially in fresh sessions without distinct
  models unless `requireDistinctModels: true`. No implicit consent, `delegate_task`,
  subagent, or multiplexer fallback. `code-tab-phase-roles` (`references/claude-code-roles.md`)
  and Herdr pane dispatch stop at `resolveLegacyRouteRequest` (`retired-route`).
- Model keys are session selectors, not executables; never shell-execute them or edit global config.
- Isolate writers/services; use finite budgets; no secrets or destructive tasks.
- Compare installed skill version to source once; source edits do not update profiles.

## Goal and repository truth

Under short-invocation policy, `/openspec-next` or `/openspec-delivery <name>`
selects one approved group. Local setup/commits exclude push/PR/merge; restrictions win.

Optional persisted-goal launch (display grants no authority):

```text
/goal draft /openspec-delivery <name>
```

`/goal draft` starts execution; inspect `/goal show`. Resume from repository truth.

Use `/goal`, not `/loop`. The operator controls pause/resume/clear and `/subgoal`.
For earlier compression the operator runs `/goal pause`, `/compress here 2`,
`/context`, then `/goal resume`. Printed commands do not execute.

Stop discovery once authority, ownership, bootstrap and gates resolve.
Reuse valid evidence; batch independent lookups.

## Procedure

1. Confirm recovery and an isolated checkout through `openspec-delivery`.
   Do not start a second writer for the same change.
2. Via `references/terminal-adapters.md` (`references/profile-preparation.md` for
   `hermes`), bind role config (`resolveRoleConfiguration`), prepare non-argv
   transport (`preparePromptTransport`), and launch a fresh implementer session
   (`superviseWorkerLaunch`, `createAttempt`) with outcome, scope/non-goals,
   workspace/base, paths, gates and budget; require focused tests and a report.
3. Admit worker output via `readHandoff` (`references/worker-handoff.md`).
   On human-input waits, `exposeOperatorInteraction` exposes the same session
   natively or via a fresh Herdr fallback pane (`references/herdr.md`,
   `references/lifecycle-watch.md`, `--resume-from` once on `inconclusive`). Worker
   caps use turn-cap recovery below; other incomplete outcomes stop.
   Dispatch failed prerequisites to a fresh implementer session;
   the orchestrator does not edit worker code.
4. Freeze the clean committed candidate via `openspec-delivery`. Dispatch a
   fresh read-only reviewer via the selected qualified terminal adapter with
   base/digest, paths/diff, acceptance, gate evidence and implementation report.
5. Apply candidate review criteria in `references/portable-core.md`; require
   actionable findings or literal `Verdict: No findings` with empty findings and
   empty coverage limitations.
6. Reproduce findings; send confirmed fixes to a fresh implementer role in the
   checkout with the original contract. Changed content needs renewed gates and
   review. Limit to eight fix/review cycles (two for already-frozen legacy work).
7. Delivery owns publication/completion; commits use `git-commit-message`.
   Identity/tests grant no writes. Push/PR/merge need separate authority and
   remote-ref readback; otherwise preserve/report the candidate.
8. Continue only unfinished work in the named task group. Stop after that group or
   a real blocker; no next change without a new request.

## Executor turn-cap recovery

`Iteration budget exhausted` is incomplete. The worker stops; it never self-continues or
switches role.
The orchestrator alone decides via delivery's `workerContinuationDecision`
before every cap handoff: once per native task in the existing checkout.
Never split, relabel or change sessions to reset it; a second cap stops.
Preserve identity, budget, review and native-input gates; follow
`references/portable-core.md`. Legacy handoff approvals still apply.

## Pitfalls and verification

- Conflicting checkout changes block; preserve them, never reset or pick a side.
- Require acceptance evidence, actual gates and frozen review. Report verified
  results, skips and blockers separately; integration/docs need separate authority.
