# Lossless evidence retention

## Scope and authority

This reference preserves evidence already captured by an authorized command, API
readback, or independent review. It is not a command runner, scheduler, GitHub
client, polling loop, approval service, or publication authority. Run each named
project gate through its own authorized surface, retain the actual command,
revision, scope, environment policy, stdout, stderr, and numeric exit status, then
represent the captured bytes under the repository's confidentiality policy.

Do not infer a historical fact from current prose or a fresh query. A fresh
corroboration is current evidence; it must say so and cannot establish earlier
thread absence, check conclusions, or review state by itself. An operator report
that checks finished allows one read of the same head and conclusions; it never
permits unattended polling, merge, or a changed head.

## Original bytes and representations

Keep an original-byte copy when repository policy safely permits it. When raw text
would be unsafe or rejected by repository whitespace rules, use the versioned
representation made by `scripts/evidence-retention.mjs`.

A representation has:

- `schemaVersion: 1` and `kind: "lossless-evidence-representation"`;
- `encoding` of `utf8` only when UTF-8 re-encoding returns exactly the original
  bytes, otherwise `base64`;
- `content`, the stored textual artifact;
- `storedArtifactSha256`, the SHA-256 of UTF-8 bytes of that stored content;
- `decodedOriginalSha256`, the SHA-256 of the decoded original bytes;
- `wrapperSha256`, the SHA-256 of the canonical immutable wrapper payload;
- provenance: source, command argv, environment scope, numeric exit status,
  UTC source-capture time in `observedAt`, revision, scope, pagination state, and
  verified readback type (`original-response`, `lossless-representation`,
  `redacted-transformed`, `historical-extract`, `fresh-corroboration`, or
  `merge-snapshot`). A `historical-extract` also has a distinct strict-UTC
  `extractedAt`; and
- fixed labels: that same readback type, completeness of `complete`, `partial`,
  or `not-applicable`, and confidentiality of `publishable`, `restricted`, or
  `redacted`.

The verifier compares all declared SHA-256 values and returns the exact decoded bytes. It
does not trim trailing whitespace, rewrite CRLF, normalize Unicode, execute a
command, contact an API, or write a file. Empty, CRLF-only, and whitespace-only
content are valid evidence bytes. Invalid UTF-8 is base64 represented; an invalid
wrapper, unsupported encoding, malformed base64, changed provenance/label/encoding/
content, or hash mismatch fails closed. `wrapperSha256` covers the canonical payload
other than itself, avoiding a recursive self-hash. Canonical JSON recursively
sorts object keys; unknown wrapper fields are rejected. Provenance/label coherence
is rechecked after deserialization: the readback type and completeness label must
agree with verified provenance. A
redacted-transformed representation must have a `redacted` confidentiality label,
and a redacted label must use `redacted-transformed` provenance. An original byte
copy is not a wrapper. A redacted or transformed artifact must never be described
as an original-byte copy.

## Provenance, completeness, and confidentiality

Name the real capture source, command argv, environment scope, numeric exit status,
observation time, revision, scope, and pagination/completeness state. Observation,
merge, and completion times are strict UTC instants: a valid calendar date and
clock time ending in `Z`, with either no fractional seconds or exactly three
fractional digits. A partial response cannot prove all threads were absent. A merge
response proves merge state only; it cannot replace retained check or review-thread
data.

For a claim that checks passed on a PR head, retain decoded JSON with a string
`head` equal to the expected head and a `checks` array. Each check must provide a
unique string `id`, a string `conclusion`, and a strict-UTC `completedAt`. Every
caller-supplied applicable check identity must occur exactly once, have conclusion
`success`, and have a completion instant before the merge instant. For an
`original-response`, `observedAt` is the source-capture time and must precede
merge. For a `historical-extract`, `observedAt` remains that original
source-capture time; `extractedAt` may be later and never substitutes for it. A
historical claim requires original captured output or a labeled historical extract
from it. If the original is unavailable, retain the gap and narrow or block the
claim rather than reconstructing a response from a narrative.

`assessClaimSupport` is a pure helper for this factual limit: it verifies and
decodes the retained representation, then compares its structured payload with a
caller-supplied expected head and applicable check identities. Caller-supplied
completion times, conclusions, or opaque bytes cannot establish a claim. Missing or contrary evidence blocks
before any narrowing. A supported claim
requires complete original-response or historical-extract evidence with a
successful exit status, publishable non-redacted labels, a strict UTC merge instant,
the applicable source-capture rule, and every applicable decoded check successful
and completed before merge. A partial `original-response` can only return
`narrowed` after that same decoded-payload, head, applicable-check, completion, and
pre-merge source-capture validation; it never becomes `supported`. A complete
`fresh-corroboration` or `merge-snapshot` can return `narrowed` only after the
decoded-payload, head, applicable-check, and completion validation. Partial
fresh-corroboration and merge-snapshot evidence blocks. It neither fetches nor
proves facts that were not retained.

Secrets and confidential material remain subject to repository policy. Stop
publication or retain an authorized transformation with its limitation. Neither a
hash nor base64 makes sensitive material publishable.

## Failures, reviews, and successors

Retain a named gate failure with its actual exit status and unmodified output. Keep
rejected review output byte-identical and bound to its original candidate. A later
successful candidate, disposition, or closeout record supplements those facts; it
does not rewrite the failure into a pass.

Every changed candidate receives its applicable real gates and an independent
review at that candidate's exact SHA. A factual closure review is a fresh reviewer
role after local closure gates and before authorized publication. It verifies
retained hashes, representation round trips, archive identity, and claim
completeness without relabeling candidate gates as closure gates or reusing the
implementation-review session.

## Routing

Use [guard.md](guard.md) for immutable plan/candidate/review/receipt identity.
Use [integration.md](integration.md) for protected publication, actual named-gate
retention, and target readbacks. Use [recovery.md](recovery.md) when evidence is
missing, a gate fails, or a review is rejected. Use [continuation.md](continuation.md)
to select the next authorized delivery boundary. Those references retain their
existing authority rules; this file does not widen them.
