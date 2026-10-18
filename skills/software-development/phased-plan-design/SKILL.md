---
name: phased-plan-design
description: Design restart-safe CAP/CHG phases with explicit gates.
version: 1.4.0
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
5. Validate and commit/read back the planned record through that recipe before
   handing it to `phased-plan-execution`. The orchestrator follows
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
integration-policy conflicts before handing off for execution.
Keep one unfenced canonical phase table; put illustrative tables in code fences
so closeout's parser cannot mistake examples for competing progress authority.