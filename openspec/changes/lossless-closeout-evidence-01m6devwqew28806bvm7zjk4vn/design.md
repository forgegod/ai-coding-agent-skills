---
metadata_version: 1
artifact: design
change: lossless-closeout-evidence-01m6devwqew28806bvm7zjk4vn
---
# Design

## Context

See `proposal.md` and the `lossless-closeout-evidence` delta for the behavioral
contract. Canonical delivery already has a read-only receipt guard and permits
append-only closeout evidence, but its current text does not provide a complete
portable representation, provenance, and round-trip contract. Accepted
`parallel-change-workflow` is archived with closure receipt at main
`38140894ee08d2bd738de1abc9e91a621104c889`; its package/docs/test domain is
reconciliation input, not a source to copy or authority to inherit.

## Goals / Non-Goals

**Goals:**

- Make retention of actual gate/API/review output lossless, verifiable, and
  portable across supported delivery hosts.
- Keep actual gate execution separate from evidence representation and preserve
  failed/rejected history as append-only records.
- Give factual closure review enough evidence to assess claims at an exact closure
  SHA without re-running side-effecting installers or pretending current queries
  prove historical facts.
- Reconcile the plan/digest and workspace rules with the existing guard behavior.

**Non-Goals:**

- A general logging service, standalone skill, upstream OpenSpec fork, Hermes
  session-search dependency, Herdr setup, model polling, watcher changes, packet
  transport, mixed-runtime adapters, or profile updates.
- Running gates, polling GitHub, creating an issue/PR, committing, publishing, or
  resolving the dirty sibling during this proposal.
- Treating bootstrap output, a scratch prototype, prose, or a current empty thread
  query as acceptance evidence for a historical event.

## Decisions

### Add a package-local evidence reference and a small verifier

Add one detailed `openspec-delivery/references/evidence-retention.md` and keep
`SKILL.md`, `guard.md`, `integration.md`, `recovery.md`, `workspace.md`, and
`continuation.md` limited to routing and boundary statements. Add a dependency-light
Node helper only if it can create/verify the versioned representation and
round-trip/hash checks without running a project gate, invoking GitHub, polling,
or making writes outside an explicitly selected evidence path.

A helper is warranted: canonical guard code already validates JSON evidence and
hashes, while hand-authored wrappers are prone to CRLF, trailing-whitespace, and
binary corruption. The helper's contract is representation/verification only; the
orchestrator captures the original command output and exit status first.

Alternatives rejected:

- Store all output as plain `.log`: repository whitespace rules can reject a
  byte-identical original.
- Normalize text before storage: loses byte identity and makes hash claims false.
- Use a custom argv-logging gate runner: replaces rather than retains the project's
  named gate and violates the authority boundary.
- Depend on Hermes session search: not portable and unavailable on other hosts.

### Versioned lossless representation

Define a JSON schema version with immutable provenance fields, explicit encoding,
stored-artifact SHA-256, and decoded-original SHA-256. Valid UTF-8 may be stored
as text only if UTF-8 re-encoding produces the exact original bytes; non-UTF-8
uses a byte-safe encoding such as base64, or the helper fails closed. The verifier
reads bytes, validates declared encoding and hashes, decodes, and compares exact
bytes without newline or trailing-whitespace normalization.

The implementation must record whether a file is an original byte copy, a lossless
representation, a redacted/transformed artifact, a historical extract, or fresh
corroboration. Redacted material is never described as an original. Repository
confidentiality policy decides whether content can be retained; the helper cannot
make secret publication safe.

### Provenance and factual-claim model

Each capture records source/command, observation time, revision, scope, and
pagination/completeness. Check conclusions bind the reviewed PR head plus the
applicable identity/app/conclusion and completion time. Historical assertions
require evidence captured at the original event or a labeled extract from a
real original response; when only a fresh corroboration exists, it is current and
cannot establish past empty threads. For historical check corroboration, completion
times must precede merge.

An operator notification that checks finished permits a one-time read of the same
head and conclusions. It never starts polling or grants merge authority. A
merge-state response is retained as a narrower fact and does not substitute for
check or fully paginated thread evidence.

### Preserve correction and closure boundaries

Keep failed gate output and rejected review files byte-identical, bound to their
original candidate, and add dispositions/successors append-only. Every changed
candidate or closure successor gets applicable real gates and independent review
at its own SHA; prior correction history remains counted. A fresh reviewer role
reviews the exact closure SHA after local closure gates and before authorized
publication. It verifies wrapper hashes/round-trips, archive identity, and claim
completeness without relabeling verified-revision gates as closure gates.

### Plan integrity and worktree ownership

Document that the guard hashes `openspec/config.yaml`, the change `.openspec.yaml`,
proposal, tasks, optional design, and every delta-spec file; only recognized task
checkbox state is normalized and `evidence/` is outside that set. The plan must
freeze every covered byte before approval. `Planning content changed after approval`
requires comparison of those covered paths from approved plan to candidate; evidence
additions are not the explanation. Authorized drift requires a new immutable
plan identity/digest and renewed approval, and `--plan == --head` computes identity
rather than consent or a permission to commit.

Before judging a plan, resolve its dedicated owning workspace/planning home. A
lagging target checkout and an old passing digest do not authorize unplanned work.
Incomplete documented bootstrap is remediated only by the authorized documented
bootstrap followed by the actual validation. Dirty sibling files, including
untracked files, are preserved and block overlap reconciliation rather than being
cleaned.

### Sibling and profile classification

The implementation plan shall record this classification and recheck it immediately
before execution:

| Source | Classification | Treatment |
| --- | --- | --- |
| Canonical receipt guard's raw planning digest and append-only closure checks | already covered | Preserve; extend only where the new capability has an explicit gap. |
| Installed delivery generic lossless-wrapper and exact-review ideas | portable candidate | Re-specify from this change; do not copy profile prose or versions. |
| Installed delivery `session_search`/context recovery and Herdr-only role wording | out of scope | Exclude; portable procedure cannot require Hermes or Herdr. |
| Archived `parallel-change-workflow` recovery/sandbox/clone hardening | already delivered, not Lossless scope | Preserve as reconciliation input; do not copy or claim it here. |
| Installed `openspec-next` and orchestration differences | impact assessment only | Change only after concrete shared wording/template ownership is reconciled. |
| Installed script files | already covered | The observed scripts match canonical bytes; no profile script is an implementation source. |

The selected sequencing decision is strict: the accepted `parallel-change-workflow`
archive and closure receipt have been re-inspected from a clean current-main
workspace. Before approval, this change must retain only non-duplicated scope,
re-assess its exact implementation paths, and revise planning artifacts where that
assessment changes scope, gates, or dependencies. It then needs a verified
proposal-time issue binding, a frozen plan SHA/digest, and explicit approval. Until
then, this proposal is not implementation-ready.

## Risks / Trade-offs

- [Binary data or redaction requirements] → Fail closed or retain an honestly
  labeled authorized transformation; never coerce bytes to text.
- [Evidence volume] → Bound helper inputs and retain exact raw/represented bytes
  under project policy; do not silently truncate.
- [API pagination ambiguity] → Store pagination/completeness facts and narrow or
  block claims when the response is incomplete.
- [False confidence from profile content] → Treat it as read-only input, classify
  each addition, and use synthetic tests for adopted behavior.
- [Group 10 collision] → Preserve its dirty work, sequence after accepted
  integration, and replan/reapprove rather than merging concurrent edits.
- [Missing scanner/native prerequisites] → Leave the opt-in security gate pending;
  never mark it passed or bypass scanning.

## Migration Plan

1. After the dependency and approval boundary, implement the reference, optional
   helper, and synthetic fixtures in the dedicated workspace.
2. Update only actually affected support-file inventories, skill/plugin versions,
   contracts, README/workflow/install/prerequisite documentation, and focused tests.
3. Run named local validation and packaging gates after the final edit. Run the
   opt-in security release gate only with its trusted `HERMES_SOURCE` and Python
   prerequisites; record absent prerequisites as pending.
4. Preserve prior evidence and use normal independent candidate and later factual
   closure review/publication routes. No migration rewrites historical evidence.

## Open Questions

None. The only conditional implementation detail is whether the small helper is
needed after its design spike against the defined representation contract; either
outcome preserves the same observable requirements and task boundaries.
