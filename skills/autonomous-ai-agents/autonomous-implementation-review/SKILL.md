---
name: autonomous-implementation-review
description: Implement changes with an independent review loop.
version: 0.6.0
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

Run a bounded implementation and independent review loop. The orchestrator
verifies results; the executor implements and then reviews in distinct fresh
sessions with the configured models. Fresh context is role-separated review,
not proof of external independence; high-risk work may need an external reviewer.

## Preconditions and roles

- Read repository DOX, manifests, relevant code/tests, current branches/status,
  acceptance criteria, gates, constraints, and commit authority before dispatch.
- The orchestrator follows `phased-plan-closeout` for all CHG/Git writes in a
  material phase. The executor must not edit or commit the CHG path, stage files,
  commit implementation, integrate branches, or retire worktrees. Reviewers never
  edit. Without reservation authority, stop before mutable phase work.
- Use `application-records` and `phased-plan-design` only for a new or reshaped
  material request. A selected existing phase uses `phased-plan-execution`.
  Non-material work uses its bounded goal, not manufactured CAP/CHG records.
- Give writing agents separate worktrees; prefer one for dependent work. Never
  share branches, output directories, or mutable test services across writers.
- Set finite turn/time/cost budgets. Do not dispatch credentials, destructive
  production work, or unresolved interactive decisions.
- This automated role loop is Herdr-only: require `$HERDR_ENV=1`, then load
  [references/herdr.md](references/herdr.md) before reservation or pane control.
  It owns selection, fresh-session/model switching, delivery, monitoring, and stop
  mechanics; its read-only overview is `scripts/herdr_panes.py`. Never use
  `delegate_task` as the implementation or review executor in that workspace: it
  cannot prove the required session-only `/model` selector. A transport/model
  failure is a blocker, not permission to launch a fallback worker.
- Outside Herdr, stop this loop before reservation; offer the portable phase skills
  under an operator-approved manual workflow, not an invented fallback transport.
  `autonomous_ai_agents.implementer`/`reviewer` are Hermes model keys, not executable
  names. Never shell-execute them, modify global config, or silently substitute.

## Goal and repository truth

For a selected CHG phase, the operator may send this explicitly authorized goal.
Displaying the template grants no authority; read-only assessment is a separate
request with no reservation, implementation, or completion promise.

```text
/goal draft Execute only phase <phase-number> of <active-chg-path> using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.
```

Derive scope, CAPs, gate, and stop condition from the CHG, not another questionnaire
or plan. Inspect `/goal show` if the drafted contract needs checking. A fresh
session reads the target CHG, any linked frozen review receipt, and the current
workspace before acting. Use `session_search` only for a specific missing decision
or claimed check, never `--resume latest` or transcript recency as authority.
Scratch logs, patches, and agent reports are temporary evidence only.

Use `/goal`, not `/loop`: the latter replays a fixed prompt on a cadence and is
only appropriate for bounded external polling. The operator controls `/goal pause`,
`/goal resume`, `/goal clear`, and adds criteria with `/subgoal`.
Hermes automatically compresses active context; at checkpoints inspect `/context`.
For earlier compression, the operator runs `/goal pause`, `/compress here 2`,
inspects `/context`, then `/goal resume` in the orchestrator session. Printing
slash commands does not execute them; do not send this sequence to the executor.
An intentional new goal starts with `/new --yes <goal-name>`, then `/busy queue`,
then the task seeded from repository truth. Resume is not a context reset.

## Procedure

1. For material work, establish the selected phase and reserved workspace through
   closeout. For non-material work, use project-approved isolation and ordinary
   Git policy; skip CHG reservation/completion, but keep the same role separation.
   Give the executor a compact packet: outcome, scope/non-goals, base SHA,
   workspace, paths, gates, constraints, CHG/CAP links, budget, and report format.
   Do not copy full logs, transcripts, or diffs into every packet.
2. Start a fresh outcome-named implementer session, enable `/busy queue`, and
   verify the configured session-only model selection before delivery. Require
   instruction/code inspection, focused regression tests, bounded edits, and
   exact changed paths, commands/results, assumptions, and remaining risks.
3. Wait for the executor to settle through its transport lifecycle, then inspect
   the actual staged/unstaged/untracked diff and rerun relevant checks. Unsupported
   agent claims are not verification. Dispatch failed prerequisites to a fresh
   implementer session before review; the orchestrator does not edit worker code.
4. Freeze the complete candidate. Start a fresh outcome-named reviewer session,
   queue mode and verified reviewer model. Supply base SHA, diff location and
   frozen identity, paths, acceptance criteria, test evidence, and implementation
   report. Hold the candidate unchanged until the read-only verdict returns.
5. Require concrete findings ordered by severity: `path:line`, impact, trigger,
   and minimal correction/reproduction; otherwise explicit `No findings`. Review
   correctness, regressions, security/privacy, data loss/concurrency, contracts,
   and test gaps—not speculative refactors.
6. Reproduce substantive findings. For confirmed fixes, start a fresh implementer
   session in the same worktree, verify queue/model again, and pass the bounded
   finding with the original contract. Rerun gates and review after any reviewed
   content changes. Limit to two fix/review cycles; surface a real third-cycle
   decision instead of silently expanding the loop.
7. When verified/reviewed, the orchestrator follows closeout for material work;
   standalone work follows project Git policy via `git-commit-message`. Do not duplicate the
   commit or merge procedure here. No commit/push/deploy/credential/external-write
   authority is inferred from agent identity, a goal name, or passing tests.
   Push requires separate explicit authorization and remote-ref readback.
8. Continue only unfinished actions inside the selected phase. Once its stop
   condition is proven, report completion; never start another CHG phase without
   a new operator request. If integration is unauthorized, report the exact
   verified candidate and preserve its worktree, not target completion.

## Executor turn-cap recovery

The forced final reply cannot run checks, update the CHG, or resume itself. Read
the report and inspect current workspace/evidence, then dispatch a fresh bounded
session for the exact unfinished action in the existing worktree. A cap is not a
user decision or phase completion. Keep packets to one defect cluster, focused
check, or review rather than raising the cap to hide an oversized task.
For post-completion corrections, the orchestrator reopens through closeout first.

## Pitfalls and verification

- Never reset conflicting CHG changes or review a moving diff. Preserve the
  mismatch and report the blocker; old approval does not cover new content.
- Agent idle/done proves readiness for input, not successful implementation.
- Keep temporary logs in session scratch, but live dirty worktrees outside
  auto-pruned caches. Do not expose secrets or personal browser state to workers.
  Browser tasks need explicit scoped access and verified connection before dispatch.
- Completion requires proven acceptance criteria, actual gate outputs, a frozen
  review verdict with dispositions, and (for CHG work) closeout's target-row/integration proof.
  Report verified results, skipped checks, and remaining blockers separately.