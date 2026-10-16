---
name: phased-plan-overview
description: Use when inspecting active CAP/CHG-backed work and selecting a repository-tracked change record to resume, inspect, or close.
version: 1.0.5
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, overview, product, change-records]
    related_skills: [application-records, autonomous-implementation-review, phased-plan-execution, phased-plan-refactoring]
---

# Phased Plan Overview

## Purpose

Provide a restart-safe view of material work from repository truth. Active
`docs/changes/active/CHG-*.md` records—not chat history, commit recency, tracker
status, or private plans—state what can be resumed. Once an operator has selected
an executable phase, provide the literal `/goal draft` command that launches the
autonomous implementation-review workflow; do not run it yourself.

## Procedure

1. Read the applicable `AGENTS.md` chain and `docs/changes/README.md`.
2. Enumerate `docs/changes/active/CHG-*.md` and read each record's identity,
   status, external request, impacts, phase table, and any explicit dependency.
3. For every active CHG, report: status, affected CAPs, the one in-progress phase
   or first pending phase, its verification gate, and any explicit blocker.
4. Validate obvious drift before acting: an active record is not `done`, named
   CAPs exist, the phase table has no more than one `in-progress` row, and the
   latest execution/review evidence does not contradict a done row. One
   `in-progress` row selects that phase. Zero `in-progress` rows with a pending
   phase is a normal verified-boundary state; select the first pending phase.
   More than one `in-progress` row is ambiguous. Use the repository record
   validator for structural confirmation. If prose says a done phase needs more
   corrections, gate work, or review, report the record as ambiguous rather than
   treating that prose as a second progress authority. An unintegrated worktree,
   scratch patch, or agent report cannot record a durable transition or completion.
   When it differs from the target ref, report it as an uncommitted candidate, but
   select only the target ref's existing `in-progress` phase or first pending phase.
5. Resume only the CHG chosen by the operator or unambiguously identified by an
   explicit dependency/order rule. State the exact selected CHG path and phase,
   then print this ready-to-send command with those literal values:

   ```text
   /goal draft Execute only phase <selected phase number or name> of <selected active CHG path> using autonomous-implementation-review and phased-plan-execution. Stop when the selected phase is verified, reviewed, and recorded as `done`; do not start another phase.
   ```

   Do not add a second checklist, private continuation file, or copied phase
   details. The next `/goal draft` turn reads the CHG and creates the completion
   contract; this overview turn remains read-only and must not dispatch work.
6. Inspect a blocked or ambiguous record without changing it. State that
   `phased-plan-execution` must reconcile the phase table before the change can
   resume; do not print a launch command for the ambiguous record. If no active CHG
   exists, report that no material work is scheduled; do not synthesize work from
   archives or old commits. Do not print a launch command until an operator has
   selected a phase or an explicit dependency/order rule makes selection
   unambiguous.

## Selection rules

- An explicit dependency or an existing in-progress phase wins over filename,
  modification time, creation date, and ticket priority.
- An active CHG with no `in-progress` row resumes at its first pending phase; this
  is the normal boundary after a verified phase and before the next execution starts.
- If several independent CHGs are pending and the repository does not define a
  priority rule, present them as choices. Do not invent an order.
- A completed record belongs in `docs/changes/archive/`. It can be inspected as a
  receipt but cannot be resumed as active progress.
- A material request with no active CHG routes to `application-records` and then
  `phased-plan-design`; a refactor with no material outcome does not.
- The phase table is the sole mutable progress authority. A later correction after
  done evidence must be returned to `in-progress` by `phased-plan-execution`;
  overview reports the inconsistency but never repairs or silently chooses a
  narrative phase.

## Verification

The overview is correct when a fresh agent can identify the selected CHG, its
next phase, the phase gate, affected CAPs, and any blocker without relying on
memory. A verified-boundary CHG with zero `in-progress` rows selects its first
pending phase. It makes no source or status change until `phased-plan-execution`
starts the selected phase. When a phase is selected, its result includes exactly
one literal `/goal draft` command naming that CHG path, phase, and terminal stop
condition; it does not execute the command or create a profile-local continuation
document.
