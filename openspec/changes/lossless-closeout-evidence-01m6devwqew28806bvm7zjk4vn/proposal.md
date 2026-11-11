---
metadata_version: 1
artifact: proposal
change: lossless-closeout-evidence-01m6devwqew28806bvm7zjk4vn
github_issue: https://github.com/forgegod/ai-coding-agent-skills/issues/18
---
# Lossless closeout evidence

## Why

The published `openspec-delivery` package requires factual gates, review, receipt,
and closure evidence, but it does not yet define one portable, byte-preserving
procedure for retaining command output and API readbacks when raw files cannot be
committed unchanged. Without that contract, a future closeout can lose trailing
whitespace, conflate a current readback with historical proof, or turn a failed
record into a reconstructed passing narrative.

## What Changes

- Add a portable, package-relative evidence-retention reference to
  `openspec-delivery`, with concise routing from `SKILL.md` and the existing
  closeout/recovery references; do not add a standalone skill, vendor OpenSpec,
  or create a generic logging framework.
- Define a versioned lossless representation and integrity verification for original
  bytes, including invalid UTF-8 handling, wrapper and decoded SHA-256 identities,
  round-trip checks, provenance, completeness, and honest transformation labels.
- Define retention rules for actual named gate output and failures, PR/check/thread
  API readbacks, historical extracts versus fresh corroboration, rejected reviews,
  correction successors, and a fresh independent factual closure review bound to
  the exact closure SHA.
- Preserve existing authority boundaries: the orchestrator remains the sole Git and
  task-progress writer; named project gates remain the gate runners; check waits
  remain operator pauses rather than unattended polling; publication, profile
  updates, and secrets disclosure remain separately prohibited.
- Add only the focused helper, tests, package inventories, plugin/version changes,
  contracts, and current documentation that implementation proves are required.
  A dependency-light representation/verification helper is conditional on the
  design assessment; it must not execute gates or issue API calls.
- Amend the evidence contract after independent review findings: retain
  `supported` as a factual PR-check-claim result only when an integrity-verified,
  structured payload proves the expected head, applicable check identities,
  successful conclusions, strict UTC completion times before merge, and the
  type-specific pre-merge observation-time rule. Missing, invalid, mismatched, or
  contrary facts block support rather than being supplied as free caller inputs.

## Capabilities

### New Capabilities
- `lossless-closeout-evidence`: portable retention, provenance, and integrity
  behavior for delivery closeout evidence and factual closure review.

### Modified Capabilities
None. `local-skill-installation` governs user-local installation safety, not
closeout evidence semantics.

## Impact

Primary scope is `skills/software-development/openspec-delivery/`, its focused
fixtures, package inventories, and documentation that states the delivery and
prerequisite contract. Implementation may bump `openspec-delivery` and the
`openspec-development` plugin; `openspec-next` and
`autonomous-implementation-review` are impact-assessment-only unless a concrete
shared wording or template conflict requires a separately reconciled change.

The installed `hermes-dev` copies were inspected read-only. Their six delivery-file
differences are input, not a release baseline: portable generic rules are adopted
only when independently justified; existing canonical coverage is not recopied;
Herdr/session-search and incident-specific recovery instructions are out of scope.

`parallel-change-workflow` is now accepted, archived, and closed. Its integrated
candidate merged as `d0ca50c154193dbe5b2a7b90ba7f8a555f4b0b1c`, and its record-only
closure merged as `38140894ee08d2bd738de1abc9e91a621104c889`. The final integration
changed only its planning/current-spec paths; the archive and closure receipt are
reconciliation input, not a template or authority for this change. Lossless still
shares the future `openspec-delivery` package/docs/tests domain, so its current-base
planning candidate must retain only non-duplicated capability scope and re-assess
the exact implementation paths before approval. Documentation issue
https://github.com/forgegod/ai-coding-agent-skills/issues/18 is verified OPEN and
is the single proposal-time identity binding. This proposal remains a draft: it is
not ready for plan approval, implementation, a commit, publication, or profile
modification.
