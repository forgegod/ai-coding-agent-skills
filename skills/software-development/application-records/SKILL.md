---
name: application-records
description: Maintain CAP/CHG records for material product changes.
version: 1.8.2
author: Hermes contributors
license: MIT
metadata:
  hermes:
    tags: [product, capability, change-records, documentation]
    related_skills: [capability-wireframes, phased-plan-closeout, phased-plan-design, phased-plan-execution, phased-plan-overview, phased-plan-next, phased-plan-refactoring]
---

# Application Records

## Overview

Keep three distinct truths: an external request explains why work is wanted; a
capability record (CAP) describes shipped behaviour; and an active change record
(CHG) carries implementation progress. Code and executable tests remain the final
proof of behaviour.

This skill defines the portable canonical layout:

- `docs/product/capabilities/CAP-*.md` for current behaviour;
- `docs/changes/active/CHG-*.md` for active progress;
- `docs/changes/archive/CHG-*.md` for completed implementation receipts; and
- `docs/changes/reviews/CHG-<number>/` for optional review packages, never a second progress authority.

Projects adopting this skill use these names and paths. Their contributor
instructions supply product-specific policy, tests, and validation commands.
This skill decides when those records apply and what each record means. The
`phased-plan-*` skills own CHG phase design and every lifecycle transition.

## When to Use

- A request adds, removes, fixes, or changes material user-visible behaviour.
- A permission, privacy, data-handling, or operator-visible outcome changes.
- An agent needs to determine whether a material request needs a new or affected
  CAP/CHG record.
- A durable choice must be classified as capability-local or cross-cutting.

Do not use for a refactor, formatting change, dependency update, or internal
hardening that preserves observable behaviour. Do not use a CAP or CHG to
replace architecture, privacy, security, or deployment documentation.

## Authoritative Surfaces

Read these before changing a record:

| Need | Read |
| --- | --- |
| Repository-wide obligations | The target repository's root contributor instructions and applicable child contracts. |
| Current capability contract | `docs/product/README.md` and affected `docs/product/capabilities/CAP-*.md`. |
| Change-progress lifecycle | `docs/changes/README.md` and affected `docs/changes/{active,archive}/CHG-*.md`. |
| Durable cross-cutting decision | `docs/architecture.md`, `docs/privacy.md`, `docs/design-decisions.md`, and equivalent local contracts. |

## Phase-skill routing

For a material change, the active CHG phase table is the execution plan. This
skill does not change phase state, archive a CHG, or prescribe phase lifecycle
steps. Hand that work to the packaged phase skills instead of creating a private
plan that duplicates CHG progress:

- `phased-plan-design` creates or reshapes the CHG phase table before work.
- `phased-plan-overview` finds active CHGs and identifies the selected record to
  resume without relying on commit recency or chat memory.
- `phased-plan-next` uses that selection and, only on explicit operator invocation,
  submits the bounded goal into a fresh session in the current Herdr pane.
- `phased-plan-execution` implements and verifies one selected phase.
- `phased-plan-closeout` owns the orchestrator's authorized Git/CHG writes and
  worktree lifecycle, plus the next bounded goal prompt.
- `phased-plan-refactoring` splits or resequences active CHGs only at verified
  boundaries while preserving one progress authority per request.

Routing to a skill is not execution authority. For a planning-only request, stop
after design; the implementation/CAP-update steps below apply only to authorized
implementation. Creating or approving a CHG does not start its first phase.

For a non-material refactor, use the adopting repository's ordinary planning
convention. Do not create CAP/CHG churn simply because the work has phases.

## Procedure

1. **Classify the request.**
   - If it is vague or blocked by unresolved decisions, use Wayfinder only to
     resolve the decision frontier. The tracker map remains discovery material.
   - If it changes material behaviour, identify affected CAP IDs and create or
     resume one CHG record before implementation. Use `phased-plan-design` for
     a new CHG or `phased-plan-overview` to select an existing one.
   - If it preserves observable behaviour, state that no CAP/CHG change is
     needed and proceed under the applicable implementation contract.

2. **Establish the record boundary.**
   - Follow `docs/changes/README.md`'s canonical shape and lifecycle.
   - Link the external ticket or write `Direct operator request: <verbatim request>`
     when no ticket exists. Never invent a ticket ID.
   - Hand a new or reshaped CHG to `phased-plan-design`; hand an existing active
     CHG to `phased-plan-overview`. Those skills select phases and maintain the
     phase table; do not set a phase to `in-progress` here.
   - Before choosing a visual destination, read both product and change DOX and
     the wireframe child if present. Keep pending proposal assets and design notes
     in `docs/changes/reviews/CHG-<number>/`, not beside active/archive records.
     Link its `README.md` from the owner; the README declares `**Status:** review-only`
     and links the artifacts. Do not allocate a future CAP ID or add a proposal
     to the product manifest. Follow `docs/changes/README.md` for package lifecycle.

3. **Make current behaviour explicit.**
   - Add or amend the affected CAP in the same vertical slice as implementation
     and behaviour tests.
   - State only present-tense, falsifiable outcomes. Link architecture and
     privacy/security contracts instead of copying their rules.
   - If code/tests contradict the CAP, fix the code or CAP before
     completion; do not leave an ambiguous claim.
   - Every CAP declares `**Primary surface:** human` or `none`. For new or existing
     human-facing CAPs, load `capability-wireframes` and update the canonical
     generator, regenerate HTML, render PNG, and synchronize manifest/index/CAP
     links in the same slice as the changed interaction and behavior tests.
     Review packages are never promoted by simply moving their files.

4. **Place decisions correctly.**
   - Record a capability-local rule in its CAP only when it changes how the
     implemented behaviour must be understood.
   - Record irreversible or cross-cutting runtime, authentication,
     authorization, persistence, privacy, or observability choices in
     `docs/design-decisions.md` and update the live contracts in the same change.
   - Leave short-lived implementation reasoning in the CHG or Git history.

5. **Hand lifecycle work to the phase skills.**
   - Use `phased-plan-execution` to implement and verify a selected phase.
     The orchestrator follows `phased-plan-closeout`; the executor must not edit
     or commit the CHG path. Use `phased-plan-refactoring` for splits/resequencing.
   - Return to `phased-plan-overview` to select the next active work; do not make
     lifecycle decisions from this skill's checklist.

## Common Pitfalls

1. **Tracker-shaped truth.** A ticket marked complete is not proof of merged or
   deployed behaviour. Link it from a CHG; do not copy its status into a CAP.
2. **Plan-shaped truth.** A completed phase table explains work history. It does
   not describe current behaviour; the CAP must carry that outcome.
3. **CAP churn.** Do not update a CAP because implementation details changed.
   Update it only when a material outcome changed.
4. **Unproved claims.** A CAP without behaviour-test evidence is a coverage
   gap, not an implemented proof. Add focused coverage or state the bounded
   gap precisely before calling the record complete.
5. **Decision inflation.** Do not create a decision record for local naming or
   code-layout choices. Reserve it for durable cross-cutting forks.
6. **Premature promotion.** Do not move a CHG review screenshot, Pencil file,
   or planned screen into `docs/product/wireframes/`. Regenerate a CAP-linked
   HTML/PNG pair only when its product surface and evidence exist.
7. **Lifecycle overlap.** Do not use this skill to mark a phase, integrate a
   checkpoint, or archive a CHG. Those transitions belong to the relevant
   `phased-plan-*` skill.
8. **Parallel progress.** Do not mirror a CHG in a profile-private plan, a
   temporary note, or a tracker checklist. Add a prerequisite phase or use
   `phased-plan-refactoring` to make parallel scope explicit.

## Verification Checklist

- [ ] Every material changed behaviour has an affected CAP and behaviour-test evidence.
- [ ] Every qualifying primary human-facing surface has a current CAP-linked
      HTML and PNG wireframe.
- [ ] Review packages have an owning CHG, a linked review-only README, and valid
      artifact links; no CAP or product manifest references their files.
- [ ] Every active material request has exactly one CHG progress authority.
- [ ] Every CHG references its source request and valid CAP IDs.
- [ ] The selected `phased-plan-*` skill owns every CHG phase-state and archive
      transition.
- [ ] The project's `records:check` integration, phase gate, and required
      workspace checks pass when the selected phase skill requires them.
