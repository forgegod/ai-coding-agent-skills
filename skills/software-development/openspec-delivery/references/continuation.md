# Continuation from repository truth

The short execution contract applies only after explicit project adoption and an
operator execution invocation. Installation or reading an example grants nothing.
Keep one orchestrator and one task-progress/Git writer; no second task table,
profile-local progress file, scheduler, lease or automatic backlog dispatch.

## Select once

Use the named change, an unambiguous short slug via `change-name.mjs resolve`, or
verified current branch/package context. Without context inspect active packages
and registered change worktrees; one unambiguous unfinished change may be used.
Several independent changes are operator choices, never newest-first priority.
Inspect both the current checkout and the owning workspace: a plan may exist only
on its branch, not on the target. If active lookup fails, inspect exact archive
identity and confirmed refs before claiming absence. Duplicate active/archive
locations, competing writers, unknown ownership or inaccessible remote state stop.
Do not generate another ULID or copy artifacts to manufacture a match.

Read native proposal/design/deltas/tasks and approved plan commit/digest, branch,
status, prerequisite evidence, gate output and any actual PRs/receipts. Use native
OpenSpec status/instructions to discover artifact readiness; that is not approval
or execution evidence. Never require a fake issue to obtain local task discovery.
Missing approval stops with one concrete approval request for the actual plan.
An owned draft may first be frozen in a separate local planning commit under an
execution invocation's commit authority; present that SHA and raw planning digest
for approval before implementation. Under `no commits`, report this prerequisite
instead. Do not treat a branch tip, task checkboxes or editable issue as approval.
Record/reference the actual operator approval with its SHA/digest in retained
change evidence; on resume require that evidence or ask for the missing decision.
No mutable ownership/progress ledger is added to the common Git directory.

## Choose the unfinished boundary

| Observed state | Default next action |
| --- | --- |
| Incomplete or unapproved plan | Report missing native artifacts or request plan approval. Do not implement. |
| Owned interrupted task group | Resume only its unfinished work in the same workspace, keeping restrictions. |
| Approved plan, pending implementation | Select the first unfinished approved implementation task group in native document order whose dependencies are accepted. |
| Candidate frozen, gates/review incomplete | Complete gates/review for that candidate before selecting another group. |
| All approved implementation groups accepted | Report the candidate and offer `finish`; no remote write without its authority. |
| Implementation already merged | Do not replay it; resume integrated verification/receipt/archive under existing finish authority, otherwise request it once. |
| Receipt/archive PR already exists | Read its actual head, diff, gate and merge state; resume it rather than creating competing closure evidence. |
| Closure merged, cleanup pending | Resume only authorized cleanup/issue closure; never recreate implementation or archive. |
| Change fully closed and cleanup verified | Report complete; no next change. |

One `next` runs one task group through its remaining local verification/review and
commits, not one shell command and not the whole backlog. A group is the native
heading/task-number group in `tasks.md`, not an invented phase. Explicit `group N`
is a scope restriction, not permission to skip unfinished dependencies. If grouping
or the boundary between implementation and remote/release tasks is ambiguous,
ask once; do not guess or tick external acceptance tasks because local tests pass.
Do not skip a blocked prerequisite to execute a later independent-looking group
unless the operator or approved plan explicitly selects that ordering.

Earlier operator restrictions remain in effect. `no commits` means keep changes
and report the uncommitted boundary; do not call a clean-candidate guard as if a
commit existed. `inspect` means read-only. Approval of a plan is not the invocation
that starts it. Scope/gate/dependency changes require renewed approval. A correction
stays in the same change/group with at most two correction/review cycles.

## Local execution is automatic, not permissionless

Load `workspace.md`; create/reuse and bootstrap without asking the operator for
Git commands. Use native apply as implementation guidance with checkbox writes
mediated. When supported project roles are selected, automatically load
`autonomous-implementation-review` and dispatch through that host protocol.
Do not bypass its pane-selection approvals, manufacture a second model or use
`delegate_task` as a replacement for the supported execution/review role loop.
Without a supported independent reviewer, preserve the candidate and report the
review blocker. The implementer never approves its own work.

Run actual gates, inspect evidence and update only proved task boxes. Preview
exact path batches through `git-commit-message`, then under this invocation's
explicit autonomous local-commit policy stage/commit without another prompt.
Check evidence and include proved ticks in the final candidate commit before
independent review. The reviewer reviews that exact commit including its ticks;
a tick/evidence commit after review changes the SHA and requires renewed review.
Per-group verdicts do not substitute for review of the final delivery candidate.
Retain committed plan identity, candidate and review evidence; transient reports
are not completion. Retain correction/review attempt identities and dispositions
in change-owned evidence or verified review references; derive the two-cycle
budget from them on resume. Missing cycle evidence is a recovery blocker, never
a reset to cycle zero. Do not ask to authorize every Git command already covered.

## Finish is one bounded terminal authorization

`finish <name>` covers the named change's protected publication/integration,
post-merge verification, receipt and native archive, record-only closure PR,
issue closure after acceptance, and clean dedicated workspace retirement. It
never approves findings or risk, relaxes protection, deletes branches, publishes
a release, starts another change or authorizes unrelated remote writes. If an
earlier instruction excludes an action, ask only about that conflict. Confirm
actual repository/target and candidate SHA; if either is ambiguous, stop.
The current receipt guard requires every real checkbox task complete on that
reviewed candidate. A plan containing future tasks whose completion depends on
this same merge/receipt/archive is circular for that guard: report the exact
planning defect for native plan correction/reapproval, never tick prospective
outcomes or silently exclude those boxes. Keep terminal workflow obligations in
the lifecycle contract, not self-referential candidate-completion tasks.

Use `integration.md` and `guard.md`. Preserve candidate ancestry; the guard does
not support squash/rebase mapping. Required checks and human review are actual
project prerequisites, not configurable obstacles to bypass. Review and gates
must bind any changed candidate. Verify every remote write by exact readback;
unknown outcomes require readback before retry, not another PR or duplicate push.

Run gates on the actual integrated revision in an isolated verification checkout.
Spec sync/metadata/link corrections use native sync under finish authority, but
must be reviewed and integrated by the protected route with renewed gates on that
result before receipt creation. The record-only closure contains no product/spec
corrections. Never reapply a delta over newer accepted behavior. Use native archive
with the verified no-spec-update path only when current specs are already correct;
validate byte-identical movement, metadata and upstream strict checks.

Commit receipt/archive as separate factual batches, obtain independent factual
review, publish and merge the closure through the same protected route, read back
and verify the published receipt bytes. A closure PR is not a prediction about
its own merge. No extra PR attests the previous receipt. Then close the issue only
when its actual acceptance boundary is met, and perform `workspace.md` cleanup.

Report change/group, workspace/branch, actual plan/candidate/review identities,
executed commands/results, remote readbacks when applicable, remaining boundary
and at most one short next invocation. A printed prompt is not an executed action.
If terminal scope is blocked, report the precise decision instead of claiming done.
