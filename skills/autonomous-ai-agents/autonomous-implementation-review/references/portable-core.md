# Portable orchestration core

Use this protocol for outcome packets, approach review and candidate review.
It runs without Hermes or Herdr or any AI client installed. Node 22+ can import
`scripts/orchestration-core.mjs`; its exports are pure checks and return detached
packet/decision objects. They perform no launches, file writes, Git writes or
network requests. The module does not authenticate authority, reviewer identity,
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
   or `No findings`. Review the whole approach including minimum-outcome task
   generation, not only a last edit. A recommendation is not operator approval.
3. Re-enumerate and re-hash the complete set after review. A review carries the
   same `inputs`, `reviewerSession`, `readOnly: true`, retained `reference`,
   `verdict` and `findings`. `acceptApproachReview({ packet, review, currentInputs })`
   refuses input drift, partial inventories, wrong sessions and unresolved findings.
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
`automaticCycle` boolean, `reference`, `verdict`, and `findings`. Re-read external
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
- Freeze readiness needs the latest `No findings` or `No blocking findings` entry
  matching the complete frozen inputs and resolved retained findings. This is
  readiness only, never plan approval or execution authority.
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
Post-freeze planning corrections require operator disposition, renewed freeze and
explicit approval. Stop if a routine finding repeats unchanged after correction,
findings contradict, or eight automatic correction/review cycles do not converge.
The count never resets on resume or a new record. With an unavailable count,
`cycleAuthorization` must be verified and bind that finding ID, exact inputs and
retained reference; record its consumption and never reuse it for another cycle.

## Candidate review and return to delivery

After implementation, actual gates and orchestrator-owned task updates, delivery
freezes a clean committed candidate. Call `candidateReviewPacket` with the group,
authority, distinct `implementerSession` and `reviewerSession`, full `head` and
`base`, and actual `gates` (`command`, exact `commit`, zero `exitCode`, `evidence`).
Pass the candidate/diff, scope, plan digest and reports to a fresh read-only role.
Freeze the candidate while reviewing; do not reuse the implementation conversation.

`acceptCandidateReview({ packet, review, currentHead, currentPlanDigest })` checks
the exact candidate/plan, independent read-only reviewer and resolved verdict.
Retain actual gate and report evidence; structural acceptance cannot prove their
truth. A changed candidate requires renewed gates and review. Candidate correction
still has delivery's separate two-cycle limit, not the eight-cycle planning budget.

Return only verified results to delivery for progress and continuation decisions.
The orchestrator dispatches code corrections; it does not edit worker code itself.
On native human input the qualified adapter automatically exposes the same waiting
session without a separate notification or asking the user to open it. Suspend
advancement; never answer, replay, substitute or change permissions. Native
approval resumes only that session within existing authority. Denial/timeout or
exposure failure is retained, not retried through a different route. An executor
turn cap returns factual partial state; only the orchestrator can authorize a
fresh bounded same-role packet. No next group or next change is implied.
