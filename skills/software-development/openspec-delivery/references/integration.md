# Protected integration and terminal evidence

This procedure is operator-controlled; the package supplies no GitHub writer,
merge queue, distributed fencing or default mutation authority.

## Before any publication

1. Confirm the real issue and change name when the operator asked to publish a
   documentation or review record. Use `references/ticket.md` for a new issue.
   Specification does not wait on that record. Read the exact objects again
   before writing. Operator-serialize starts and handoffs; finding two sessions
   active on one change blocks both until the operator designates one.
   Assignment is not mutual exclusion. A second change name does not authorize a
   second edit of the same capability spec.
2. Preview exact changed paths and logical batches with `git-commit-message`.
   Only the orchestrator stages/commits under separately explicit authority.
   Preserve a clean committed candidate, actual passing gate output and independent
   review bound to it. No broad staging or unreviewed incidental files.
3. Inspect the actual remote target and current capability specifications. Include
   updated implemented specs and stable visuals in the implementation PR; proposed
   visuals remain change-owned. Reconcile semantic overlaps even if Git merges cleanly.
   Rebased/conflict-resolved candidates require renewed candidate review and gates.
4. Verify actual protection and entitlement: required review and up-to-date combined
   checks, or a configured merge queue whose CI runs on `merge_group`. Verify direct
   push/bypass restrictions match project policy. If missing, stop for the owner;
   do not silently administer repository settings. Record configuration readbacks.
5. Publish only the explicitly authorized branch or pull request and verify its
   exact remote head and body after the write. Unknown API outcome requires
   readback, not a blind retry. The pull request is the review record of the
   candidate. Use a plain issue reference when a documentation issue exists; do
   not close a still-unverified request.

## Integration and verification

Integrate only the approved PR by the configured protected route with explicit
permission, and only after an independent reviewer that did not implement the
candidate has reviewed that exact SHA and every finding has a disposition.
Read the exact PR merge state and actual resulting commit/target from
the authoritative remote. Confirm candidate reachability; this helper does not
support squash/rebase mapping. Keep the candidate's evidence immutable.
Delete the branch only after that integrated evidence is recoverable and the
operator authorizes deletion. Review is not that authorization.

Run every required acceptance gate on a named integrated or containing target
revision in an isolated checkout/environment. Record actual revision, environment,
commands, exit statuses and retained output, including failures. Source-only gates
do not establish deployment acceptance. A failure keeps the change open. Update
a documentation issue only when one exists and the operator authorizes that write.
obtain explicit repair/revert scope rather than claiming done or replaying the merge.

Intervening target changes are not presumed irrelevant from path prefixes. When
covered inputs are uncertain, re-run the required gates on a new named target.
Updated receipt evidence must name that actual verified revision.

## Record-only closure and stop boundary

Create a post-merge receipt only after successful named-revision verification.
The closure PR contains receipt/evidence and archive movement only; no unreviewed
product fixes or current-spec changes. Before archiving, inspect OpenSpec's real
CLI help and select its no-spec-update path only when the deltas were already
incorporated and current specs are correct. If current specs differ, stop for
explicit reconciliation and new verification; never overwrite newer requirements.

Validate receipt structure and exact archive paths with the helper, then obtain
independent factual review of completion prose/output references. Publish/integrate
only if authorized; verify the exact closure merge and any authorized cleanup.
If cleanup is blocked, state that honestly without erasing accepted source evidence.
Close a documentation issue only when its declared acceptance boundary is
satisfied and that write is authorized. Closing it is not archival.

The receipt is evidence for the named integrated verification, not a prediction
about its own publication. Closure CI checks the closure diff; remote readback
proves the closure merge. Do not open an extra PR merely to attest the previous
receipt PR. Stop at this one change; no next-task dispatch or release is implied.
