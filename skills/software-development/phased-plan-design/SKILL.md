---
name: phased-plan-design
description: Design CAP/CHG plans without starting execution.
version: 1.5.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [planning, product, capability, change-records]
    related_skills: [application-records, phased-plan-execution, phased-plan-closeout, phased-plan-refactoring]
---

# Phased Plan Design

Design restart-safe phases for a material request. The active CHG is the plan;
the CAP is current behaviour. Do not create a private plan that duplicates phase
state.

## Scope and stopping rule

Invoking `phased-plan-design` authorizes planning only, not phase execution.
A later planning-only instruction narrows an earlier general implementation request.
Read source, tests, and contracts as needed to ground the plan; write only authorized
planning records, indexes, and review-only design artifacts. Do not reserve a phase,
create an execution worktree, dispatch an executor, or write implementation/regression
tests. Phase 1 is execution even when named specification, evidence, tests, or design.
Describe its work and verification commands in the plan; do not perform them here.

Plan approval or permission to commit the record is not permission to execute.
Do not bundle record-edit/commit consent with reservation or implementation.
If permission is missing, ask only about the planning artifact or return an unwritten
proposal; do not make "plan and implement" the recommended default.
Only an explicit request to also execute a named phase permits a separate execution
handoff after planning, not merely loading related skills or completing prerequisites.
That handoff still requires the execution/closeout authority and checks.

## Procedure

1. Read the DOX chain, product/change documentation, affected CAPs, and active
   CHGs. Resolve an unclear outcome before creating a record.
2. Before any record edit, the orchestrator loads `phased-plan-closeout` and its
   `references/record-writes.md` recipe for target-only creation/restructuring.
   Require explicit record-edit/commit authority and no outstanding affected phase
   worktree. Otherwise return an unwritten proposal. For a new CHG use the direct
   request, affected CAP IDs, `planned` status, and pending rows. Preserve existing
   phase evidence; route resequencing to `phased-plan-refactoring`, never reset
   all rows of an existing record to pending.
3. Make each row a vertical slice with an observable result, owned boundary, and
   executable gate. Its visual handoff names CAPs, generator/render commands,
   HTML/PNG links, and behaviour tests; proposals stay in the CHG review package.
4. Include a final integration phase that proves CAP/current state, record check,
   affected tests, project gate, and canonical visuals where required. Only it
   archives the CHG.
5. Validate and, when authorized, commit/read back the planned record through that
   recipe. Leave a new CHG `planned` with every phase `pending`. Report the plan or
   proposal, validation result, and unresolved decisions, then stop. Execution is
   a separate authorized action through `phased-plan-execution`, not the next step
   of design. The orchestrator follows
   `phased-plan-closeout`; the executor must not edit or commit the CHG path.
   Do not copy the Git protocol into product CHGs; record only project-specific
   outcomes, dependencies, gates, and evidence.

Use a table such as:

```markdown
| # | Phase | Status | Verification gate |
| --- | --- | --- | --- |
| 1 | Specify behaviour and evidence | pending | CAP and focused test change reviewed |
| 2 | Implement the vertical slice | pending | Targeted test command exits 0 |
| 3 | Integrate current-state records | pending | Project record and test gates exit 0 |
```

## Rules

- Keep one target-branch phase in progress at a time.
- A CHG states progress; it does not replace architecture, security, privacy, or
  deployment contracts.
- Do not split an atomic behaviour/test/CAP slice just to shorten a file. Use
  `phased-plan-refactoring` for genuinely independent requests or sequencing.

## Verification

Run the repository record validator. Confirm every phase row has a numbered
section, executable gate, and no competing progress plan. Resolve repository
integration-policy conflicts before calling the plan ready. Confirm that no phase
was started and no product source, regression tests, or current-state CAP claims
were changed to implement the proposal. State any authorized record commit separately
from implementation; a plan or proposal is a complete result for a planning request.
Keep one unfenced canonical phase table; put illustrative tables in code fences
so closeout's parser cannot mistake examples for competing progress authority.