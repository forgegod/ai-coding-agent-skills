# Spec Delta

## Purpose

Define portable, lossless evidence retention for OpenSpec delivery closeout so
reviewers can verify factual completion claims without rewriting original output.

## ADDED Requirements

### Requirement: Lossless evidence representation
The delivery procedure SHALL preserve original captured evidence bytes unchanged
when they can be retained safely, and SHALL use a versioned representation when
repository rules prevent unchanged retention. The representation SHALL identify
its encoding, stored-artifact SHA-256, decoded-original SHA-256, and provenance.

#### Scenario: UTF-8 output with trailing whitespace and CRLF
- **WHEN** a captured gate output is valid UTF-8 and cannot be committed as raw text
- **THEN** the retained representation round-trips to exactly the captured bytes,
  including trailing whitespace and original line endings
- **AND** verification reports matching stored-artifact and decoded-original hashes

#### Scenario: Non-UTF-8 output
- **WHEN** captured evidence contains bytes that are not valid UTF-8
- **THEN** the procedure uses an explicitly byte-safe encoding or refuses retention
  without decoding or newline normalization
- **AND** it does not label a transformed text value as the original bytes

#### Scenario: Corrupt retained representation
- **WHEN** a retained wrapper or its decoded content does not match its declared hash
- **THEN** integrity verification fails
- **AND** the evidence cannot support a completion claim

### Requirement: Actual gate evidence retention
The delivery procedure SHALL retain the actual command, revision, environment
scope, exit status, and unmodified output for every named gate it claims. Failed
gates and rejected reviews SHALL remain byte-identical records bound to their
original candidate and SHALL be supplemented, not rewritten, by later outcomes.

#### Scenario: Named gate fails
- **WHEN** a required gate exits nonzero
- **THEN** its real output and exit status are retained as failed evidence
- **AND** a later successful successor gate does not alter or relabel that failure

#### Scenario: Bootstrap is incomplete
- **WHEN** documented workspace bootstrap is incomplete before validation
- **THEN** bootstrap output is recorded separately from acceptance evidence
- **AND** the procedure completes only authorized bootstrap and reruns the named validation

### Requirement: Readback provenance and completeness
The delivery procedure SHALL distinguish original captured responses, historical
extracts, and fresh corroborating responses. Any retained API/check/thread
readback SHALL identify source command, observation time, revision, scope, and
pagination or completeness state.

#### Scenario: PR check conclusion claim
- **WHEN** closure prose claims that required checks passed for a reviewed PR head
- **THEN** retained readbacks identify that exact head, relevant check identities,
  conclusions, and completion times
- **AND** historical corroboration verifies the applicable completion times precede merge

#### Scenario: Partial or current-only query
- **WHEN** a readback is truncated, partially paginated, or obtained after merge
- **THEN** the retained evidence labels its limitation and does not establish
  historical thread absence or earlier check conclusions

#### Scenario: Original response is unavailable
- **WHEN** the original response cannot be recovered
- **THEN** the procedure records missing evidence or narrows or blocks the claim

- **AND** it does not reconstruct an original response from a narrative summary

#### Scenario: Fail-closed claim eligibility
- **WHEN** a completion claim has failed, redacted, non-publishable, incoherent,
  invalid-timestamp, missing, or post-merge evidence
- **THEN** verification blocks the claim rather than reporting it supported
- **AND** a supported claim uses a verified representation with coherent provenance
  and labels, a successful exit status, strict UTC instants, and completion before merge

### Requirement: Factual closure review and successor evidence
The delivery procedure SHALL require a fresh independent factual review for the
exact closure SHA after local closure gates and before authorized publication.
It SHALL preserve review identity and correction history across successors.

#### Scenario: Record-only closure review
- **WHEN** a closure branch contains receipt, evidence, and archive movement
- **THEN** a new independent reviewer verifies retained hashes, representation
  round-trips, archive identity, and factual claim completeness at that closure SHA
- **AND** the review does not reuse the implementation-review session, packet, or JSON

#### Scenario: Closure correction successor
- **WHEN** a closure finding requires a correction
- **THEN** the prior review and its disposition remain retained
- **AND** the successor receives applicable real gates and independent review at its exact SHA
- **AND** the correction does not reset the existing correction budget

### Requirement: Bounded authority and confidentiality
Evidence retention SHALL not add a scheduler, gate runner, API polling loop, or
publication authority. It SHALL retain confidentiality decisions honestly and
shall not claim a redacted artifact is a byte-identical original.

#### Scenario: Operator-reported check completion
- **WHEN** an operator reports that protected checks have completed
- **THEN** the procedure reads the same PR head and conclusions once
- **AND** it does not use unattended polling or treat the notification as merge authority

#### Scenario: Sensitive captured material
- **WHEN** captured output contains data that repository confidentiality policy
  forbids publishing
- **THEN** the procedure blocks publication or records an authorized transformation
  and its limitation
- **AND** it does not expose the sensitive original or claim byte-identical retention
