# Portable orchestration core

Use this protocol for outcome packets, approach review and candidate review.
It runs without Hermes or Herdr or any AI client installed. Node 22+ can import
`scripts/orchestration-core.mjs`; its packet/decision exports are pure checks.
The explicit adapter-only artifact exports perform local I/O under
[worker-handoff.md](worker-handoff.md); none launches workers, writes Git/tasks or
makes network requests. The module does not authenticate authority, reviewer identity,
report truth or adapter qualification. The orchestrator must read back retained
observations before supplying them. A passing check is not permission to act.

Delivery owns policy selection, freeze stops and continuation. Read delivery's
`references/delivery-policy.md` and `references/task-authoring.md`. Installing
this optional package neither adopts those policies nor adds a sixth package.
Legacy host recipes remain separate until replacement readiness is proved; their
presence does not qualify a terminal adapter or permit fallback to a legacy route.

## One outcome, one writer

1. Resolve one actual native task group, the approved plan SHA/digest, dependencies,
   operator restrictions and the exclusive owning checkout. Stop on ambiguity.
2. Call `outcomePacket({ group, authority, workerSession })`. `group` contains
   `change`, `group` (native identifier), `outcome`, nonempty `acceptance`, `scope`
   and `nonGoals` arrays, `workspace`, `stop`, and `budget: { limit, unit }`.
   The positive finite budget may instead be inherited from `authority.budget`.
   A checklist without an observable outcome/acceptance is not a valid packet.
3. `authority` names that same change/group, full `plan`, `planDigest`, actual
   retained `approvalReference` and `executionReference`, `orchestrator`, identical
   `writer`, and `ownershipVerified: true` only after exclusive ownership readback.
   Worker and orchestrator sessions must differ. This is not a distributed lock.
4. Before dispatch, require an explicitly selected qualified terminal adapter and
   launch binding, effective client/provider/model/version, fresh role/session
   identity, native read-only reviewer enforcement and a qualified same-session
   human-input route. The adapter, not this module, owns launch/readback/stop and
   exact process/scratch cleanup. It must reject unavailable bindings without
   substituting a host, profile, model, permission mode or worker.
5. Neither `delegate_task` nor native subagents execute a role. Workers must not
   create multiplexers. The packet's `git` prohibition means Git writes, not
   read-only inspection; `tasks` prohibits task-progress writes. Implementers
   report evidence only; the delivery orchestrator alone owns Git and `tasks.md`.
   Reviewers cannot edit, persist files, escalate to writes or create subagents.
   Adapter-observed violations invalidate results; preserve evidence and stop.
6. One qualified client may supply all roles sequentially in fresh sessions. The
   reviewer never inherits the implementer's conversation. Different products or
   models are not required unless project policy requires diversity. Hermes
   frontmatter is declarative non-secret input, not a launch/profile switch.

## Approach review before the first plan freeze

Only delivery's selected policy or an explicitly authorized bootstrap review
invokes this procedure. It does not authorize implementation or approve a plan.

1. Obtain the complete draft inventory from delivery's `planning-worktree` command:
   repository `openspec/config.yaml`, change `.openspec.yaml`, proposal, tasks,
   design when present, and every file under `specs/`. Do not select only Markdown
   or omit new/untracked spec files. Exclude evidence records. Read the actual
   bytes and retain their raw SHA-256 hashes with the workspace and full paths.
2. Call `approachPacket({ change, workspace, inputs, authorSession, reviewerSession })`.
   `inputs` is that complete path-to-hash object, not an approved plan digest.
   The fresh reviewer is read-only: no edits, shell execution, Git/profile/config
   writes, persistence, implementation, subagents or multiplexers. Require
   severity-ordered `path:line` findings with impact, trigger and minimal remedy,
   or literal `Verdict: No findings`. Review the whole approach including minimum-outcome task
   generation, not only a last edit. A recommendation is not operator approval.
3. Re-enumerate and re-hash the complete set after review. A review carries the
   same `inputs`, `reviewerSession`, `readOnly: true`, retained `reference`,
   `verdict`, `findings` and explicit `coverageLimitations`.
   `acceptApproachReview({ packet, review, currentInputs })` requires literal
   `Verdict: No findings`, empty findings and empty coverage limitations; it refuses
   input drift, partial inventories, wrong sessions and unresolved findings.
   Ordinary draft drift preserves the goal and automatically repeats validation
   and full review subject to continuity below; do not create a task or narrow scope.
4. Retain the review chain in change-owned `evidence/approach-review.json`, outside
   the planning digest but committed with the frozen plan. Keep original reports
   externally with hashes; this file is derived evidence, never another task list.
   Compare committed `planning` hashes to the last reviewed draft before binding
   freeze. Raw review hashes do not replace the normalized path/mode-framed digest.

## Review record and correction continuity

`reviewReadiness({ change, inputs, record, recordIntegrityVerified, recovery })`
checks a schemaVersion 1 record with `change`, unchanged operator `goal`,
`cumulativeCycles`, retained `countReference`, and ordered `entries`. Each entry
retains its full `inputs`, `authorSession`, `reviewerSession`, `readOnly`,
`automaticCycle` boolean, `reference`, `verdict`, `findings` and `coverageLimitations`. Re-read external
captures before asserting `recordIntegrityVerified`. A filename is not integrity.
An automatic entry also retains `correction: { finding, beforeInputs,
amendedInputs, reReviewReference }`: the finding binds the old hashes, the entry
binds the amended hashes and its full re-review reference. With an unavailable
count, retain that cycle's `cycleAuthorization` (findingId, inputs, reference).
Historical bootstrap formats are retained as history, not silently rewritten or
accepted as this schema; normalize verified observations in external scratch.

- Assign stable finding IDs. Preserve the original finding and later dispositions,
  amended input hashes and full re-review result. Never overwrite a rejection.
  Blocking means not fully applied, evidenced as unfounded, or explicitly disposed
  of by the operator. `blocking: false` alone is insufficient. Applied findings
  require `disposition: applied`, evidence and `reReviewReference`; unfounded
  findings require evidence and reason; operator dispositions require reason and
  `operatorReference`. A later empty verdict cannot erase a retained finding.
- Freeze readiness needs the latest complete independent receipt with literal
  `Verdict: No findings`, empty findings and explicit empty coverage limitations,
  matching the complete frozen inputs and resolved retained findings. Applied,
  unfounded or operator-disposed findings (including `No blocking findings`) stay
  in history but never substitute for that later fresh receipt. Do not rewrite a
  historical report to produce the required literal. This is readiness only,
  never plan approval or execution authority.
- Missing, unreadable, mismatched or revised records invalidate acceptance.
  Recover the prior cumulative count from retained external reports. Supply a
  verified `recovery` with `cumulativeCycles` and `reference`; validate and review
  afresh without asking merely because derived evidence changed. Never invent zero.
- If recovery is impossible, stop for operator disposition. Either establish a
  verified baseline count or retain a `countDisposition` with `mode: per-cycle`
  and its operator reference; the count stays null. A verified recovery of that
  disposition enables fresh validation/review, not an automatic correction.
  Each later correction needs a separate, unused operator authorization.

`planningCorrection` receives `goal`, `frozen`, `finding`, `currentInputs`,
`authorizedPaths`, `cumulativeCycles`, `repeated`, `contradictory`, and optional
`cycleAuthorization`. The finding has stable `id`, `classification`, complete
`inputs`, affected `paths`, cited `evidence`, and exact minimal `remedy`.

Only grounded, non-contradictory `routine` findings inside authorized planning
paths can return `apply-validate-review` before freeze. The orchestrator applies
that remedy, retains the consumed cycle and amended hashes, validates and requests
fresh whole-package review. The suggestion remains blocking until applied and
re-reviewed. Retain a routine unsupported finding as unfounded with evidence and
reason instead of silently dropping it. Preserve the operator goal throughout.

Stop for scope, client topology, authority, safety posture, dependencies, external
state, security, host or accepted-contract decisions; unknown classes also stop.
Post-freeze planning corrections use `correctionDecision` below only with an
existing amendment/validation/successor-freeze grant; otherwise stop for disposition.
Changed bytes always require renewed identity, whole-package review and explicit
exact-plan approval before execution. Stop if a routine finding repeats unchanged after correction,
findings contradict, or eight automatic correction/review cycles do not converge.
The count never resets on resume or a new record. With an unavailable count,
`cycleAuthorization` must be verified and bind that finding ID, exact inputs and
retained reference; record its consumption and never reuse it for another cycle.

### One correction loop and permitted writer

`correctionDecision` extends `planningCorrection` to planning, source, test and
implementation-documentation remedies (including repairable validation failures).
Supply the same finding/input/path/count fields plus `actor`, `orchestrator`,
`kind`, `grant`, `qualifiedImplementer`, positive `groupBudgetRemaining` and
`authorityBudgetRemaining`, `nativeInput: false` and `identityVerified: true`.
The actor must be the orchestrator. The grant explicitly covers write, validate,
review and, for implementation, launch; frozen planning additionally requires
planningAmendment and successorFreeze. These are retained observations, not flags
that manufacture permission. A missing qualified implementer is a blocker, never
permission for the orchestrator to make source/test/documentation edits.

Routine repairs need no per-fix approval within those grants. High severity alone
does not stop a grounded fix restoring an existing safety requirement. Material
scope, topology, authority, safety/security posture, dependencies, host, external
state, accepted-contract changes and unexplained identity/evidence failures do stop.
Retain each rejected finding/gate, remedy, before/amended hashes and new exact
review in the existing review chain. Apply, validate and re-review counts once.
Eight automatic cycles, repetition, contradiction or any narrower inherited budget
stop; planning/source phase changes, refreezes and role sessions never reset it.
An unavailable cumulative count retains the per-cycle authorization rule above.

### Append-only historical successors

An explicitly authorized historical-successor freeze establishes provisional
identity only, not review acceptance or approval, and waives no adopted integrity
guard. Preserve historical records and link their hashes through an append-only
chain. `acceptSuccessorReview` takes change, identity (plan/tree/planDigest/inputs),
receipt, currentInputs, currentPackageHashes, chain and validation. The receipt
binds that exact identity, distinct authorSession/reviewerSession, effective model,
readOnly, literal `Verdict: No findings`, empty findings and coverageLimitations,
reference and complete packageHashes. Chain
observations require verified preservation, reference and superseded-record hashes;
validation binds the plan/inputs, successful exitCode and retained reference.
Re-enumerate/re-hash the complete inputs and review package after review. Missing,
changed or partial identity blocks acceptance. This check returns freeze-ready,
never plan approval, execution authority or a reset of reviewReadiness's cumulative
count. Exact-SHA receipts stay outside the frozen checkout to avoid self-reference.

## Candidate review and return to delivery

After implementation, actual gates and orchestrator-owned task updates, delivery
freezes a clean committed candidate. Call `candidateReviewPacket` with the group,
authority, distinct `implementerSession` and `reviewerSession`, full `head` and
`base`, and actual `gates` (`command`, exact `commit`, zero `exitCode`, `evidence`).
Pass the candidate/diff, scope, plan digest and reports to a fresh read-only role.
Freeze the candidate while reviewing; do not reuse the implementation conversation.

For both portable and retained legacy candidate reviews, require severity-ordered
`path:line` findings with impact, trigger and minimal correction/reproduction, or
literal `Verdict: No findings`. Review correctness, regressions, security/privacy, data
loss/concurrency, contracts and test gaps, not refactors.

`acceptCandidateReview({ packet, review, currentHead, currentPlanDigest })` checks
the exact candidate/plan, independent read-only reviewer, literal no-findings verdict
and explicit empty coverage limitations. A disposed finding is not that verdict.
Retain actual gate and report evidence; structural acceptance cannot prove their
truth. A changed candidate requires renewed gates and review. Candidate corrections
use the same retained correction count and any narrower project/authority budget;
the retained legacy host's two-cycle limit is not widened for already-frozen work.

Return only verified results to delivery for progress and continuation decisions.
The orchestrator dispatches code corrections; it does not edit worker code itself.
On native human input the qualified adapter automatically exposes the same waiting
session without a separate notification or asking the user to open it. Suspend
advancement; never answer, replay, substitute or change permissions. Native
approval resumes only that session within existing authority. Denial/timeout or
exposure failure is retained, not retried through a different route. An executor
turn cap returns factual partial state; only the orchestrator can authorize a
fresh bounded same-role packet through delivery's `workerContinuationDecision`:
once per group/native task, never a capped-session resume or a broader goal.
Every cap handoff, including a retained legacy procedure, passes that fail-closed
decision and any additional integrated approval gate before dispatch. Never split,
relabel or change sessions to reset the allowance; a second cap on that native task
stops. A missing qualified continuation route stops without fallback.
Before a fresh continuation, the adapter must re-read the exact capped process-tree
identity immediately before stopping it and verify termination, or prove the tree
cannot still write. Retain that quiescence proof in the decision record under
delivery's `references/delivery-policy.md`. Failed identity readback preserves the
process and forbids continuation; idle UI or cap output alone is not quiescence.
Preserve session evidence and worker scratch. The pure decision never stops a process.
No next group or next change is implied. Before admitting any terminal worker's
report, use `readHandoff` under [worker-handoff.md](worker-handoff.md). Execution
completion, review verdict and delivery acceptance are separate gates.
