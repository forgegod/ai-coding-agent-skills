---
name: phased-plan-next
description: Select the next phase and present its bounded goal.
version: 0.3.0
author: Raphael (forgegod), Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [planning, next, change-records]
    related_skills: [phased-plan-overview, autonomous-implementation-review, phased-plan-execution, phased-plan-closeout]
---

# Phased Plan Next

Select the next resumable CHG phase using `phased-plan-overview`, then present its
bounded goal for the operator to send. This skill is read-only: it neither starts
the phase nor controls a Herdr pane.

## When to use and authority

Use on `/phased-plan-next` or a request for the next goal to proceed. Invoking
this skill does not authorize execution, reservation, Git writes, or pane control.
Only the operator sending the displayed goal grants its listed single-phase
authority, subject to project policy. A printed goal is not a submitted goal.

## Prerequisites

- Load `phased-plan-overview`; reuse its selection procedure, decision table,
  bounded discovery, record validator, ownership/cleanup rules, and stopping rule.
  Do not copy or weaken repository selection or recovery checks.
- Follow overview's repository-selection steps; defer its transport checks to
  execution. Missing Herdr context does not block goal presentation. No Herdr CLI,
  caller identity, live-pane inspection, or background helper is needed here.

## Procedure

1. Run overview's selection once. Retain target checkout, named branch and full
   SHA, selected active CHG path/phase, CAPs, gate, validator result, and recovery
   evidence. Do not rerun implementation gates. Ambiguity, invalid records,
   dirty/detached target, conflicting ownership, or cleanup-only recovery means
   report the exact next action and stop. With no active CHG, report overview's
   design route; do not invent a goal.
2. For an unblocked implementation phase, print exactly one canonical goal below,
   replacing the phase number and literal active CHG path. Present the retained
   target/selection evidence alongside it; do not submit or schedule the command.
3. Stop after presentation. Do not reset sessions, submit prompts, change queue
   mode, or monitor panes. The operator decides when and where to send the goal.

## Canonical goal

```text
/goal draft Execute only phase <phase-number> of <active-chg-path> using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.
```

After the operator sends the goal, `autonomous-implementation-review` keeps that
session as orchestrator and hands implementer/reviewer roles to an explicitly
selected different Herdr pane. It owns transport preflight, role setup and passive
executor monitoring; none belongs to next. The orchestrator follows
`phased-plan-closeout`; the executor must not edit or commit the CHG path.

## Pitfalls

- Selection evidence is not a reservation. Execution must reload the CHG/DOX and
  revalidate target identity, phase, ownership and cleanup before any write.
- Cleanup-only recovery gets no new-phase goal; report closeout's next action.
- Printing a goal does not prove acceptance, implementation or completion.

## Verification

Report CHG/phase, target branch/SHA, CAPs, gate, validation and ownership result,
then the single goal for operator submission or exact blocker. Emit no launch command
when a repository blocker, ambiguity or cleanup-only action remains. Verify the
displayed goal matches the selected CHG/phase. No records, Git state, sessions,
panes or preferences change, and no transport receipt is created.
