---
metadata_version: 1
artifact: tasks
change: profile-oriented-autonomous-orchestration-01m7d0f7jvv3wyg9ng26fq2w99
---
# Profile-oriented autonomous orchestration tasks

The design and both delta specs remain the complete acceptance contract. These
four outcome checkpoints replace the unstarted detailed checklist; they do not
remove requirements or grant implementation, Git, profile, or external-write authority.
Complete the design's separately authorized pre-freeze prerequisites before execution.
Apply *Minimum outcome task authoring*: this draft's count is not a quota. Each
implementation outcome includes its required tests and documentation; the final
checkpoint checks cross-outcome consistency rather than deferring those obligations.
The splits preserve necessary boundaries: 1 is the pre-source authority/identity
gate; 2 establishes the portable contract required by adapters; 3 has its own
qualification and replacement-readiness gate; 4 independently verifies the integrated candidate.

## 1. Verify the reconstruction boundary

- [x] 1.1 Verify the approved reconstruction/freeze evidence and preserve the old profile-preparation inputs without treating them as accepted implementation.

Acceptance: the design's base, planning identity, grants, preserved commits, and
input inventory verify; local `main` and installed state remain untouched.
Stop: missing authority, preservation, approval, or identity mismatch.

## 2. Implement the portable core and delivery policies

- [x] 2.1 Implement and test the agent-neutral orchestration core and `openspec-delivery`/`openspec-next` behavior defined by both delta specs.

Acceptance: focused tests cover minimum-outcome task generation/review, the core,
approach-review, review-record, grant,
and delivery-policy scenarios, including planning-input identity, single-writer
ownership, legacy/default behavior, and operation without Hermes or Herdr.
Stop: an unsatisfied contract, failed gate, or operator-disposition boundary.

## 3. Deliver qualified terminal workers

- [ ] 3.1 Qualify every candidate in the design, implement only supported adapters, and test role/model configuration, worker supervision, prompt transport, automatic same-session interaction, and legacy-route migration against the orchestration spec.

Acceptance: every candidate has a qualification or unsupported record; at least
one adapter supports implementation and fresh read-only review before any old
route is retired. One-client sequential execution works without requiring distinct
models. Compatible Hermes profile preparation ships only if Hermes qualifies.
Stop: no qualifying implementation/review adapter, an unsafe or unverifiable
boundary, or a native human-input wait after automatic session exposure.

## 4. Document, package, and verify the candidate

- [ ] 4.1 Verify cross-outcome documentation/routing/test consistency, synchronize final versions and package inventories, run the required gates, and obtain independent review of the exact frozen local candidate.

Acceptance: *Operator configuration documentation* covers every advertised client
and all affected guidance is current; contract edits match the design's declared,
grant-bound paths and purposes. Retired routes and package contents match
the qualified behavior. Focused suites, `npm run validate:openspec`, `npm test`,
and `npm run build` pass after the final edit, and independent review passes for
the exact candidate SHA. Verify the pre-freeze repository config is unchanged
from the approved planning digest; never defer stale guidance to another change.
Stop: failed verification, stale guidance, blocking review, or a publication,
integration, archive, release, or workspace-retirement boundary requiring separate authority.
