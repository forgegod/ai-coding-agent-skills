# Protected integration and terminal evidence

This procedure is operator-controlled; the package supplies no GitHub writer,
merge queue, distributed fencing or default mutation authority.

## Before any publication

1. Confirm real issue/change/ULID, approved plan commit/digest, risk disposition,
   accountable operator, designated orchestrator and current activation. Read
   the exact objects again before writing. Operator-serialize starts/handoffs;
   finding two sessions active blocks both until the operator designates one.
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
5. Publish only the explicitly authorized branch/PR and verify its exact remote head
   and body after the write. Unknown API outcome requires readback, not a blind retry.
   Use plain issue references; do not prematurely close a still-unverified request.

## Integration and verification

Integrate only the approved PR by the configured protected route with explicit
permission. Read the exact PR merge state and actual resulting commit/target from
the authoritative remote. Confirm candidate reachability; this helper does not
support squash/rebase mapping. Keep the candidate's evidence immutable.

Run every required acceptance gate on a named integrated or containing target
revision in an isolated checkout/environment. Record actual revision, environment,
commands, exit statuses and retained output, including failures. Source-only gates
do not establish deployment acceptance. A failure keeps the issue/change open;
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
Close the issue only at its declared source/deployment acceptance boundary.

The receipt is evidence for the named integrated verification, not a prediction
about its own publication. Closure CI checks the closure diff; remote readback
proves the closure merge. Do not open an extra PR merely to attest the previous
receipt PR. Stop at this one change; no next-task dispatch or release is implied.
