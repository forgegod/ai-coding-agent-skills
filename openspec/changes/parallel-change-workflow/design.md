---
metadata_version: 1
artifact: design
change: parallel-change-workflow
---
# Design

## Decision

Use native OpenSpec artifacts as the task/specification authority for migrated scope.
Keep one operator-designated orchestrator per change. Shared source packages route to
on-demand OpenSpec references only under explicit project adoption; legacy skills and
current launch examples stay functional.

## Integration boundary

Proposal, design, tasks and current specs use the identity-only schema in
`docs/openspec-metadata.md`. Delta specs remain native Markdown: upstream strict
validation rejects frontmatter there, so their identities are path-derived.
One verified proposal-time issue URL lives on the proposal, null while blocked;
no PR metadata or separate index is needed. Metadata remains inside the plan
digest. A read-only YAML checker validates types and path identities, including
archive moves. Current specs use capability identity, not a change/issue link.
The opt-in pinned CLI probe tests validation, task parsing and actual spec-update
and archive operations in scratch. Same-files vault views follow file locations;
static link repair and Windows/WSL watcher behavior need separate client probes.

Cross-document references use the full change name and, when needed, artifact
role rather than active/archive paths. Resolve locations only for tool use;
same-package relative links move together. Current visual paths are a companion
default, not native OpenSpec policy. Spec-sync links are resolved from their
destination before final verification; archived packages remain byte-identical.
The documentation issue is a proposal-time risk snapshot. Later reviews and
outcomes are separately authorized factual records, not blank future evidence
fields or an editable issue-body permalink presented as an immutable revision.

New changes in projects selecting this naming convention use a readable slug and
one lowercase ULID. The agent generates it before upstream proposal scaffolding;
the operator supplies only the slug. A read-only package helper emits the name,
directory and `change/<full-name>` branch, or resolves existing active changes.
Ambiguous short names require selection. Existing identities stay unchanged.
The full name is the only identity; no second registry or issue-time ULID exists.
Project instructions activate this pre-scaffold step, not an installed adapter
fork or a claim that OpenSpec config is a pre-creation hook. Branch creation
remains separately authorized. Unique names do not resolve semantic spec overlap.

Add a self-contained Node 22+/Git read-only helper to the new integration package.
Review a committed candidate, not a mutable index. A plan digest covers config,
proposal, design, tasks (checkbox-only changes excluded outside fences), metadata and
all change delta specs, with regular-file modes. A changed task or gate invalidates
approval; changed candidate SHA invalidates review.

Receipt checks bind change name, issue, candidate/review, merged revision and verified
target, require successful exact-revision gates and evidence references, and refuse
unverified intervening product changes. Merge ancestry initially requires candidate
reachability; squash/rebase content mapping is not implemented. No helper authenticates
a reviewer, verifies GitHub state, runs tests, obtains a lock or grants writes.

## Distribution

Preserve the legacy general bundle and separate orchestration. A third opt-in
OpenSpec bundle selects integration plus shared commit/wireframe packages. Sharing
those exact packages across workflow bundles is intentional; duplicates within an
entry, unselected canonical packages and implicit orchestration remain invalid.

## Recovery and boundaries

Native tasks track implementation progress, not merge completion. Only actual target
verification permits a Git-tracked receipt/archive PR. An unknown write outcome needs
exact readback; already merged implementation is never replayed. Future live sandbox,
security scan, publication and target-project migration require separate authority.
