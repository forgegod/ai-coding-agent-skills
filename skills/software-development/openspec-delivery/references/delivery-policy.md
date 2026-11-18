# Delivery policy and planning identity

Delivery owns policy selection, freeze stops, contract alignment and continuation. The optional
`autonomous-implementation-review` package owns approach-review protocol and worker
execution through qualified adapters. No automatic package dependency is added.
If either optional policy is selected and that package is unavailable, stop before
freeze or execution. Its core checks need no Hermes or Herdr installation.

## Read-only inventory and integrated parent

Resolve `<guard>` to this package's `scripts/change-guard.mjs` and invoke through
the host terminal. The following templates read only; they do not authorize Git
writes, a reviewer launch, policy adoption or plan approval:

```text
node <guard> planning-worktree --repo <absolute-root> --change <full-name>
node <guard> planning --repo <absolute-root> --change <full-name> --head <full-plan-sha>
node <guard> policy-context --repo <absolute-root> --change <full-name> --plan <full-plan-sha> --target <verified-integrated-target-sha>
```

`planning-worktree` enumerates actual draft files, including untracked specs;
`planning` uses the committed tree. Both select exactly `planning()` inputs:
repository `openspec/config.yaml`, change `.openspec.yaml`, proposal, tasks,
design when present, and every file under `specs/`. Evidence files are excluded.
Both return raw-file SHA-256 `inputs`; only committed `planning` also returns the
normalized path/mode-framed `planDigest`. Checkbox-only progress preserves that
digest but changes raw task hashes. Never compare execution progress to draft raw
hashes: compare the retained approach review to the frozen plan's raw hashes,
and current planning to the approved normalized digest via the candidate guard.

Worktree reads require an isolated, operator-serialized workspace, regular UTF-8
files, no symlink components, bounded file sizes and valid native task syntax.
They are observations, not an atomic filesystem snapshot or a lock. Re-enumerate
and re-hash after review and again at freeze; any addition, removal or edit
invalidates the prior observation. Do not clean, stage or commit to obtain hashes.

Before a prospective freeze, verify the intended sole parent as an ancestor of
the actual integrated target revision using read-only Git ancestry inspection.
Read policy only from that parent's contributor contracts. Do not create a plan
commit merely to discover whether it was permitted. After freeze and before
execution, `policy-context` requires a single parent and proves that ancestry
again, returns frozen planning inputs/digest, parent/target identities, native
contract hashes and the full parent-to-plan `changedPaths` without rename hiding.
The target must already have been verified as integrated: a local feature ref or
an arbitrary SHA is not remote integration evidence. The guard does not fetch or
prove protected integration. Ordinary candidate checks do not substitute for this
policy gate; run both.

## Contributor-contract authority

Read every applicable integrated `AGENTS.md` and `CLAUDE.md`, plus explicit
contributor-contract designations and their recursive child-contract indexes.
A mere README mention is not a designation. Retain the exact parent blobs and
hashes for any custom contract, as well as the guard's native contract hashes.
Resolve designation ambiguity with the operator, not a Markdown-link heuristic.

Import the pure functions in `scripts/delivery-policy.mjs` from Node 22+:

- `contractChangePaths({ declared, changed, designations })`: supply all file paths
  declared by the planning artifacts and all plan-diff paths. `designations` are
  explicit `{ parent, path }` edges from the integrated contract/child-contract
  index, not arbitrary prose mentions. Any AGENTS.md/CLAUDE.md at any path is a
  contract; custom paths count only through that explicit designation chain.
- Compare those paths to the approved plan's `declaredContractPaths`. An undeclared
  path stops for operator disposition. An in-scope declared edit is ordinary
  implementation work, not a separate operator checkpoint or notification.
- `contractAlignment({ declared, changed, head, review })` checks the exact-candidate
  independent alignment review: head, paths, reviewerSession, implementerSession,
  readOnly, goalAligned, materialConflict and retained reference. Uncertain alignment
  or a material scope/authority/safety/external-write/dependency/evidence conflict stops.
- `bindContractGrant` and `verifyContractGrant` remain read-only compatibility
  helpers for retained older grant records, not a new mandatory approval step.
  Existing frozen plans retain their integrated-parent authority and restrictions.

Any working-tree or committed unintegrated contributor-contract edit is inert for
its own change through integration. Authority, review, commit and continuation
rules remain those of the integrated plan parent and approved frozen plan. New
rules become effective only for later changes after integration, never because
an independent reviewer found the edit goal-aligned.

## Policy selection and legacy plans

`resolveDeliveryPolicy` consumes `phase: freeze | execute`, verified `context`,
`selection`, `contractPaths`, `declaredContractPaths`, and optional review and
legacy evidence. Context contains `change`, `parent`, integrated `target`, `inputs`
and `ok: true` only after actual ancestry verification. For prospective freeze,
`plan`/`planDigest` can be null; execution requires full literal frozen identities.
Selection contains that exact parent `revision`, retained contract-readback
`reference` and explicit boolean `preExecutionReview`/`continuousGoal` decisions.
These are derived observations of contributor policy, not a new configuration
file or permission flags. Never infer them from the working-tree contract.

- Without explicit parent selection: single-group continuation and existing plan
  approval behavior; no retroactive approach review. Policy selected after freeze
  cannot widen that change or invalidate its existing approval.
- With pre-execution review: invoke the orchestration core's approach protocol,
  re-hash all inputs, and retain its `reviewReadiness` result. Supply the matching
  `reviewAcceptance` (`action: freeze-ready`, complete `inputs`, retained `reference`)
  and `orchestrationAvailable: true`. A draft/partial/recommended review cannot
  satisfy the gate or approve execution. Freeze still needs separate commit
  authority and subsequent operator approval bound to its actual SHA/digest.
- With continuous-goal: an execution invocation advances consecutive eligible
  groups of that same approved change within restrictions, budgets and stops.
  Delivery owns that decision; the core is not a scheduler or a second task list.
- Verified legacy evidence that a frozen plan predates adoption of the integrated-
  parent integrity guard defers that guard until the next
  freeze/refreeze. Supply `legacy` with exact `plan`, `planDigest`, retained
  `reference`, `verified: true` and `predatesIntegrityGuards: true` only after
  evidence readback. Keep historical parent-policy selection, approval and all
  other execution restrictions. Do not fabricate authority or infer legacy status
  from age, missing evidence or a failed new guard. Freeze has no legacy exemption.

These helpers check structure and consistency of supplied observations; they do
not authenticate approvals, parse natural-language contracts, inspect remote
state, run reviews or enforce process permissions. A true boolean without retained
readback is not evidence. The orchestrator owns the complete input inventory and
semantic policy/path interpretation; the independent reviewer verifies both.

### Named historical-successor exception

Only until `profile-oriented-autonomous-orchestration-01m7d0f7jvv3wyg9ng26fq2w99`
integrates, its successor freezes/execution use pinned integrated policy base
`ae6488e23414a07d12959bf22bcd283b84d9d8a3` plus explicit recovery, exact-plan approval
and execution grants, not its unintegrated successor parent's contracts.
This exception authorizes no reset, applies to no later change and waives no
other identity, review, approval, execution or contributor-contract guard.

For this path only, retain independent read-only verification of the sole parent,
target, pinned base integration, preservation chain and complete planning identity.
Use `planning` for frozen raw hashes/digest; do not falsify a `policy-context` pass
or invoke its ordinary integrated-parent gate expecting it to authorize recovery.
Supply that retained context to `resolveDeliveryPolicy` with `ok: false` and an
explicit `recovery` observation binding `change`, `parent`, `target`, `plan`,
`planDigest`, `inputs`, the exact `policyBase`, `integratedBaseVerified: true`,
`changeIntegrated: false`, `identityVerified: true`, `preservationVerified: true`,
`reference` and `recoveryReference`. Execute additionally requires separate
`approvalReference` and `executionReference`; a prospective provisional freeze
uses null plan/digest and still requires its explicit recovery/freeze grant.
Selection must cite the pinned base revision. Independently verify the fresh
successor review under orchestration's `acceptSuccessorReview` before approval
or execution, regardless of the base's optional-policy selection. The helper
does not authenticate these observations or turn the provisional freeze into
review acceptance. Expired, missing or mismatched recovery evidence stops.

## Continuation and stop boundaries

After each accepted group, resolve actual native tasks in document/dependency
order. Resume interrupted work and incomplete candidate verification first. Keep
one Git/task writer and the original invocation's restrictions; a bare `next`
does not lift them. Default single-group delivery stops after one task group.
Continuous-goal proceeds only if selected at the integrated plan parent, with no
narrower group restriction. Never start another change or remote write.

`continuationDecision({ policy, change, group, authority, restrictions, observed })`
is a pure decision check, not a launcher or durable progress ledger:

- `policy.continuation` is `single-group` or `continuous-goal` from selection.
- `group` has native `id`, declared `stop` and a positive finite `{ limit, unit }`
  budget, optionally inherited from `authority.budget`. Budget observations use
  that same unit and retained consumed history; no reset on resume.
  When both budgets exist, `observed.authorityBudgetUsed` independently measures
  the authority budget in its own unit; a larger group budget cannot mask exhaustion.
- `authority` binds the same `change`, approved `plan`/`planDigest`, actual execution
  `reference` and separate `approvalReference`. `restrictions` retains `inspect`,
  `noCommits` and a selected `group` or null; other operator limits also still apply.
- `observed` names current `plan`/`planDigest`, `ownership: exclusive`,
  `dependencies: accepted`, `gates: pass`, `review: pass`, `host: ready`,
  `humanInput: none`, `stopReached: false`, `remoteRequired: false`,
  `nextChange: false`, consumed `budgetUsed` and accepted `completedGroups` within
  this invocation. These describe the boundary being left, including any prior
  candidate. At initial dispatch, explicitly record successful preflight gates
  and satisfaction of applicable review requirements, never imaginary worker tests.

Any absent/unproved observation, missing authority, failed gate, unresolved review
finding, conflicting ownership, host block, remote boundary, next change, declared
stop condition reached, absent budget or stop condition, exhausted budget, native
human-input wait, or approved-plan/digest mismatch stops advancement. Native input
is automatically exposed by the qualified adapter in the same session; delivery
suspends without answering, replaying or substituting. Denial, timeout and failed
exposure remain blockers. Approval resumes only that worker within existing scope.

`inspect` returns a read-only assessment without bootstrap, dispatch or Git writes.
`no commits` preserves the uncommitted boundary and never claims a clean candidate;
do not bypass the mandatory independent-review gate to advance. The decision's
`commits` field describes allowed local scope, not completed operations. Only the
orchestrator updates proved task boxes and previews authorized commits. Every
subsequent group repeats the gate, without a new plumbing prompt. `finish` remains
separate named publication/closure authority; these policies never grant it.

## Worker handoff, corrections and iteration caps

For a selected terminal route, require orchestration's `readHandoff` and
`references/worker-handoff.md` before using worker output as evidence. Completion
with findings is valid execution, not acceptance. Missing/invalid handoff leaves
the group incomplete. Recheck actual output paths/hashes, approved-plan/digest,
gates and independent review; only the orchestrator updates tasks.

Use orchestration's canonical `correctionDecision` and review-record continuity
for routine in-scope failures/findings. Dispatch source/test/documentation repairs
to the qualified implementer; planning amendments belong to the authorized
orchestrator. Do not prompt merely to approve an already-granted repair, waive a
failed gate or advance a later group. Changed planning bytes pause execution until
fresh identity, whole-package review and explicit exact-plan approval. Missing
authority, native waits, material conflicts or exhausted budgets remain stops.

`workerContinuationDecision` is separate from group advancement. Every iteration-cap
handoff must pass it; no route may bypass this decision.
Group advancement with `observed.workerStatus: capped` stops and directs the caller
here instead of treating the cap as accepted progress. Supply actor and
orchestrator, equal `before`/`after` bounded assignments, nativeTasks observations,
verified complete retained `history`, previousSession, nextSession, `cappedProcess`
and observed
facts. Boundaries contain change/group/task/action, workspace, plan/digest, role,
outcome, acceptance, scope, restrictions, stop, authorityReference and finite budget.
Use the native task id itself as action: a label cannot mint another allowance.
Read nativeTasks from the approved plan and current task progress; never split a
capped action into invented task ids, relabel it or restart a session to reset the limit.

Observed facts must bind status capped, fresh positive session identity readback,
onTrack with progressReference against the unchanged acceptance, one unfinished
in-group action, a fresh same-role session through the same qualifiedRoute, and
positive groupBudgetRemaining and authorityBudgetRemaining. They explicitly deny
nativePrompt, failedGate, drift, contradictory evidence and stopReached. A reviewer
remains readOnly and never inherits the implementer's conversation. Any absent
observation or unsupported route stops. This is not a self-continuation token.

Before launch require verified quiescence, not an idle screen or cap alone.
`cappedProcess` is the independently retained exact tree binding: session, positive
pid, startIdentity (rejects PID reuse) and treeIdentity (the retained tree inventory
reference). `observed.quiescence` repeats that `process`, carries
`identityReadback: { process, verified: true, immediate: true, reference }` and a
retained proof `reference`. The adapter must positively read back identity
immediately before stopping only that exact tree and verify termination
(`method: terminated`, `terminationVerified: true`), or prove that exact tree
cannot still write (`method: non-writing`, `cannotWriteVerified: true`).
Retain the proof and all session evidence/scratch before any fresh worker launch.
Failed identity readback preserves the process and forbids continuation; missing
or unverified quiescence also blocks it. No helper signals or cleans a process;
these are adapter observations, not a task-3 qualification or a self-attestation.

Retain the returned record before launch with both session ids and the complete
quiescence proof. It consumes the
one allowance per change/group/native task, independent of session, role or label.
A second cap stops. Never inject into the capped session or resume a broader goal.
A new artifact directory links its predecessor but does not reset this count.
Budget exhaustion is a stop, not an iteration cap. Existing integrated handoff
gates still constrain already-frozen changes; this source revision grants no new
handoff authority to the change implementing it.
