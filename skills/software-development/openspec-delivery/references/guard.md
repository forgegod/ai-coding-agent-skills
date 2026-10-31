# Read-only committed-evidence checks

Run through the host's terminal tool. Resolve `<guard>` to this package's
`scripts/change-guard.mjs`, not an assumed profile path. Node 22+ and Git are
required; there are no network calls, dependencies or Git writes. The helper
prints one JSON result and exits zero only when its checks pass. Inspect exit
status and `ok`; a malformed/missing result is failure. Commands below are
unexecuted templates, not permission to write or fabricated evidence.

## Inputs and trust

Use an exact absolute `<repo>` and literal lowercase full Git commit object IDs,
not `HEAD`, branch names, abbreviations or repaired identifiers. SHA-1 and Git
SHA-256 repositories use their respective full IDs. Objects must already exist
locally; authorized fetching remains the orchestrator's separate responsibility.
Inherited Git topology, index, object-directory, graft-file, replace-ref and
config-injection environment variables are refused, and every child Git process
runs with replace objects disabled plus repository-configured `core.fsmonitor`
neutralized, so a repository cannot rewrite ancestry or execute a configured
fsmonitor command. Optional Git locks are disabled so status inspection does not refresh the
index. Repository-local `refs/replace/*` entries and non-empty `info/grafts` in the
selected repository fail the check. Candidate/review checks require a clean attached
checkout at the exact candidate SHA. Receipt checks also allow a clean detached
verification checkout, but HEAD must still equal the exact named target SHA;
never clean/reset/stash someone else's work to make a check pass.

Options are single-valued: a repeated flag such as two `--head` values is refused
instead of silently taking the last one.

The full change name uses lowercase kebab-case, including the lowercase ULID
suffix for new changes under the naming convention in `naming.md`. Existing
unsuffixed names remain valid. The guard requires the exact name, not short-name
resolution, and never generates an identity. Collaborative evidence also requires
a canonical `https://github.com/<owner>/<repo>/issues/<positive-number>` URL.
Supply the operator-selected values independently; JSON must match, not redefine
them. Never append another suffix. The helper does not authenticate approval, reviewer
identity, PR state or gate execution. Evidence links must be independently retrieved, matched to actual
objects/output and retained under project policy. It does not infer required
gates from a list: compare that list with the approved project's gate policy.

## Candidate and approval digest

```sh
node <guard> candidate --repo <repo> --change <name> --base <base-sha> --head <candidate-sha> --plan <approved-plan-sha>
```

Output includes `base`, `head`, `plan`, `tree`, `planDigest`, `tasksComplete`.
Capture the digest while reviewing the plan; record the actual operator approval
with that immutable commit/digest. Subsequent candidate checks should add
`--expect-plan <approved-digest>`. Comparing a plan with itself computes a digest,
not approval. Both base and plan must be ancestors of candidate.

The digest covers regular committed `openspec/config.yaml`, change `.openspec.yaml`,
`proposal.md`, `tasks.md`, optional `design.md`, and every file below the change's
`specs/`, including Git file modes. Their paths, modes and raw blob bytes are
length-framed into one SHA-256 digest, so arbitrary bytes hash distinctly instead
of being re-encoded, and any planning input that is not valid UTF-8 fails closed.
A task file's UTF-8 BOM is preserved in the digest while its first task is parsed.
Only real task checkbox states outside Markdown fences are normalized.

The task grammar is intentionally strict rather than a full Markdown parser. A task
is a `-`, `*`, `+`, `1.`-style or `1)`-style list item with an `[ ]`, `[x]` or
`[X]` checkbox at up to three leading spaces, optionally blockquoted; both states
are counted, so a pending item can never hide behind an unusual bullet. Fenced
blocks (including nested and tilde fences) are examples, not tasks. HTML comment
openers must start directly after the optional blockquote prefix, without leading
spaces, to mark example text; indented comment text can be counted as tasks.
Explicit Markdown links such as `- [docs](url)` are ordinary list text, not task
checkboxes. Other indented task-like lines and malformed multi-character checkboxes are
rejected as ambiguous. A checkbox without a description still counts
as a task and must be completed. Unclosed fences or comments fail. Changed
descriptions, ordering, gates, code-fence examples
and unknown checkbox states cannot silently preserve approval. Unclosed structures,
missing required planning files, oversized inputs and symlink inputs fail. Keep approved scope,
acceptance, dependencies and gate definitions in these covered files; externally
referenced policy/risk inputs still require their own immutable approval identity.

## Independent review

```sh
node <guard> review --repo <repo> --change <name> --base <base-sha> --head <candidate-sha> --plan <approved-plan-sha> --expect-plan <approved-digest> --issue <issue-url> --review <review-json-path>
```

The review JSON is a regular, non-symlink file up to one MiB, read through one
descriptor with the size and identity checked before use. Required fields:

- `schemaVersion`: numeric `1`.
- `change`, `issueUrl`: exact selected change name and issue URL.
- `head`, `planDigest`: exact reviewed candidate SHA and approved plan digest.
- `verdict`: `pass`; `findings`: an empty array, after every finding is resolved.
- `reviewer`, `reference`: non-empty identity and retrievable review reference.
- `gates`: non-empty array of records with non-empty `command`, exact candidate
  `commit`, numeric `exitCode: 0`, and non-empty retained `evidence` reference.

Malformed, empty, array-shaped, unsupported-schema, oversized and symlinked
evidence files fail, as does a directory in place of a file.

Reviewers remain read-only. Keep this evidence outside a mutable candidate tree,
or commit it in an explicitly authorized later evidence step; a candidate cannot
truthfully contain a record naming its own future SHA. Preserve failed/rejected
reviews separately; do not rewrite them into passing records. Residual-risk
acceptance needs attributable project policy and cannot masquerade as an empty
independent review. Changed SHA requires a new review and real gate execution.

## Post-merge receipt

```sh
node <guard> receipt --repo <repo> --change <name> --target <actual-target-sha> --issue <issue-url> --receipt <receipt-json-path>
```

Receipt JSON requires `schemaVersion: 1`, exact `change`, `issueUrl`,
`base`, `head`, `plan`, `planDigest`, `integrated`, `verified`, `review`,
`integrationReference` and `gates`. `review` embeds the complete accepted review
shape above. `integrationReference` is the exact canonical PR URL in the selected
issue's repository. Receipt `gates` use the same successful gate shape but every
`commit` must equal `verified`, not the pre-merge candidate. Retain environment,
gate definitions/configuration and real output with the linked evidence; the
helper validates references, not their authenticity or completeness.

All implementation task boxes in the candidate must be checked. The reviewed
candidate must be an ancestor of `integrated`; `integrated` an ancestor of
`verified`; `verified` an ancestor of actual `target`. Consequently squash or
rebase merges are unsupported in this initial helper. Never change merge settings
without authorization or substitute guessed SHA mappings.
The active planning digest and completed tasks must also be unchanged at both
`integrated` and `verified`; a new passing gate cannot approve a changed plan.

Every commit in `verified..target` is inspected against its in-range parents, not
only the net `verified..target` diff, so evidence published at one closure commit
and rewritten at a later one fails even though the endpoints differ only by an
addition. A closure history larger than 200 commits (or than
`--max-closure-commits`, 1-200) is refused rather than partially checked. Because
Git cannot see superseded objects of an amended or force-pushed history, read back
the actual branch history before trusting a closure result.

On each such edge, only append-only new non-executable
`.json`/`.md`/`.txt`/`.log` evidence below this change's exact `evidence/` path,
and byte/mode-identical movement of its package to one
`openspec/changes/archive/YYYY-MM-DD-<name>/` are accepted. Existing evidence
cannot be edited/deleted except identical movement; active+archived canonical
copies, duplicate archives and prefix-lookalike paths fail. Product/current-spec/
other-record changes need an actual new verified revision and updated output, not
an expanded allowlist. Archival never permits reapplying deltas over newer current
specs.

Add `--receipt-path <change-or-archive-relative evidence.json>` to bind published
bytes to the local evidence file. The helper then requires that exact regular
committed file at `target` and compares its raw bytes with the validated receipt,
so a published copy that differs from the reviewed evidence fails. The option is
optional because project policy may publish evidence outside the change package;
without it, the reported `receiptSha256` is the identity to record and read back
independently. Paths must be repository-relative, inside the selected change or its
single archive, and below `evidence/` with a `.json` suffix.

Keep evidence factual and secret-free. The receipt describes verification at
`verified`; it does not predeclare its own eventual archive-PR merge or cleanup.
Closure CI validates the receipt/archive diff, and exact readback of the merge and
the `receiptSha256` establishes the later outcome without creating another
attestation PR.
