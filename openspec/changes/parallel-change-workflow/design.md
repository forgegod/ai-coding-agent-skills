# Design

## Decision

Use native OpenSpec artifacts as the task/specification authority for migrated scope.
Keep one operator-designated orchestrator per change. Shared source packages route to
on-demand OpenSpec references only under explicit project adoption; legacy skills and
current launch examples stay functional.

## Integration boundary

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
