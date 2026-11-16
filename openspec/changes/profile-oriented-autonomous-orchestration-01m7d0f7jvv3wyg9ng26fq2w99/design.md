---
metadata_version: 1
artifact: design
change: profile-oriented-autonomous-orchestration-01m7d0f7jvv3wyg9ng26fq2w99
---
# Design

## Context

See `proposal.md` and the `autonomous-role-orchestration` delta. The repository
currently has a local `main` commit (`5f48fbe`) that adds Hermes profile
preparation and removes live-pane `/busy`, `/model`, and `/status` setup. It is
unpublished and predates this plan, so it is neither an approved implementation
nor release evidence. Existing package behavior is Herdr-only for automatic role
handoff, with a narrowly selected Claude Code path; it does not create a Herdr
pane on demand or provide a portable adapter layer for other local coding clients.

## Goals / Non-Goals

**Goals:**

- Reconstruct the profile-preparation behavior as a properly planned, tested
  OpenSpec delivery instead of treating the pre-plan local commit as accepted.
- Make the unit of autonomous work a goal-oriented task group with observable
  acceptance evidence, not an agent-owned micro-task list.
- Support explicit host selection and independent review across Hermes,
  and candidate Claude Code, Codex, Grok Build, OpenCode, Kilo, and Pi adapters
  supported only after qualification, without conflating their configuration,
  session, or profile models.
- Make native terminal workers the default for every client, including Hermes;
  qualify automatic same-session interactive exposure without mandatory Herdr.
- Make immutable assignment/result artifacts the primary worker interface rather
  than treating terminal presentation as current protocol state.
- Document and test one-client/mixed-client operation and operator-controlled
  client/model bindings for every advertised client, not only Claude.

**Non-Goals:**

- A generic multi-agent scheduler, a cross-runtime profile format, automatic
  host fallback, bypassing native human approvals, or turning profiles into
  filesystem sandboxes. A chat-only Grok Bot surface is not a local worker merely
  because Hermes can import its settings.
- Releasing, pushing, modifying installed profiles, creating an issue without
  separate proposal-time issue authority, or rewriting/resetting the current
  local `main` branch during planning.
- Reusing the old unplanned commit as candidate, gate, or review evidence.

## Decisions

### Preserve the reconstruction history and freeze a successor plan

The retained integrated reconstruction base is
`ae6488e23414a07d12959bf22bcd283b84d9d8a3`. It retains the integrated PR #19/#20
work and excludes `5f48fbe`; it is a pinned historical base, not a claim about the
current remote tip. The original branch-reset/config-reapplication recipe and
sole-parent/base-to-plan expectations belong to the initial reconstruction only.
They are historical provenance, not instructions or acceptance criteria for this
replacement plan. Do not replay a reset, restore config, or reconstruct missing
historical validation or review logs.

The current recovery preserves candidate
`cc5f23a7f3892fb9e0e5eb858ca8b32e319ac566` and its complete history unchanged.
The first replacement freeze, `d4b87045a72354519af69e0b9b6085c5b4bc5b83`, has
that candidate as its sole parent; an authorized planning-correction freeze has
the preceding frozen plan as its sole parent. Neither parent is represented as
an integrated target revision. The preservation invariant applies to each
planning-successor range from parent
`42a975d8da521de82972be1824546ccd45a3b27d` to its successor: that range contains
only permitted planning edits and new append-only reconciliation evidence. The
branch already contains task-1/task-2 source, test, documentation, and package
history; retain it as historical branch state rather than asserting whole-branch
source byte identity to `cc5f23a7f3892fb9e0e5eb858ca8b32e319ac566` or accepting it
as completed work. The four original historical evidence files remain byte-identical
to the preserved candidate; an ancestry or digest guard pass does not certify
implementation, acceptance, or authority.
Task 1.1 verifies these preservation and non-acceptance boundaries without
another reset. No new name, branch, or worktree is created.

The declared
implementation contract paths are ordinary implementation surfaces when their
changes remain within the approved goal and acceptance evidence. An independent
reviewer, not an additional operator checkpoint, determines that alignment. The
declared paths are:

- `AGENTS.md`: select both delivery policies only for changes frozen after integration;
  adopt *Minimum outcome task authoring* for task generation and planning review.
- `skills/AGENTS.md`: align category ownership and child-contract indexes with the
  portable core, terminal adapters, and operator-configuration responsibilities.
- `skills/autonomous-ai-agents/AGENTS.md`: replace Herdr/code-tab-only contracts
  and obsolete ownership entries with qualified terminal/interaction behavior.
- `skills/software-development/AGENTS.md`: align delivery/next policy, review,
  and continuation responsibilities with the implemented boundaries and
  assign ownership of minimum-outcome task generation and planning review.

Task 4.1 verifies that actual contract edits align with the approved goal and
declared purposes; a reviewer uncertainty or a material scope, authority, safety,
external-write, dependency, or contradictory-evidence conflict stops for operator
disposition. For this historical-successor recovery, current authority, review,
commit, and continuation rules come from the contributor-contract set at the
integrated base `ae6488e23414a07d12959bf22bcd283b84d9d8a3` plus the explicit
operator recovery grants and any later exact-plan approval/execution grant.
They do not come from the unintegrated successor parent or inherited child-contract
edits at `cc5f23a`. Those edits remain inert for this change through integration.
The delta's integrated-plan-parent rule is future behavior to implement, not an
already-adopted rule that forces a reset of this recovery. This named recovery
exception does not waive that rule for future plans. Candidate review determines
alignment of future contract changes, not their effectiveness for this change;
they become effective for later changes only after integration.

Keep the existing proposal issue binding; do not create another issue or imply
that historical issue/approval records approve the replacement bytes. Keep
`openspec/config.yaml` unchanged in this correction: its captured policy-neutral
context and minimum-outcome task rules remain covered planning inputs. There is
no config restoration or reapplication step in the current recovery.

Validate the complete current planning set, then freeze only that set's changed
files plus required new reconciliation evidence under explicit local commit
authority. Capture the new SHA, parent, tree, Git modes, complete input SHA-256
inventory and supported-guard digest outside the checkout; independently reproduce
the identity in place without creating another workspace. Obtain a fresh read-only
review bound to that exact identity. A freeze here establishes provisional identity,
not review acceptance, operator approval, or implementation acceptance. The current
reconciliation chain is defined below under *Review-record continuity*; historical
evidence is never rewritten to match. A correction requires renewed validation,
successor identity, and review. Only a no-findings receipt permits presenting the
exact SHA/digest for explicit operator approval; a later execution grant remains
separate. Future implementation must verify or rework inherited source against
the newly approved contract, not count its presence as completed work.

Alternative rejected: attach a plan after existing source and mark it complete.
Preserving inherited source for audit is not accepting its execution order or
implementation. This planning-phase recovery correction does not change task
progress; already-recorded task state remains unchanged unless a separately
authorized evidence review establishes otherwise.

### Keep roles goal-oriented and OpenSpec-owned

*Minimum outcome task authoring* in the integration delta is the canonical rule
for creating and reviewing task lists, not only for dispatching already-written
groups. Minimize tracked tasks subject to the full outcome and necessary boundaries;
one task is sufficient when those constraints permit it. There is no universal quota.
Project `rules.tasks`, SDLC, and contributor guidance must carry that rule into
future generation. Tests exercise generated instructions and representative plans;
planning review judges unjustified splits and over-merging rather than claiming
an automated semantic minimum-count proof. Keep each outcome's tests and docs with
that outcome; the final checkpoint verifies integration and package consistency.

A task group states a delivery outcome, acceptance evidence, and explicit stop
condition. Roles, model choice, and focused steps remain adaptable execution detail
inside the approved scope and global authority contract; scope and budget remain
authority boundaries; they do
not become a second mutable tracker.
`tasks.md` remains the sole durable progress writer, updated only by the
orchestrator after evidence is checked.

*Role ownership* is the canonical assignment contract. The orchestrator owns
outcome accountability and permitted planning/reconciliation edits; the qualified
implementer makes source, test and implementation-documentation changes, including
review fixes. The independent reviewer stays read-only. An unavailable implementer
does not turn the orchestrator into the worker. This recovery edits planning only
and does not dispatch or impersonate an implementation role.

Alternative rejected: let individual agents create or advance their own checklists.
That duplicates authority and makes an independent reviewer unable to identify the
actual completion boundary.

### Keep requirement ownership and correction policy singular

Keep the two capability files. Requirement introductions state short obligations;
scenarios carry triggers, ordering and recovery variants. *Role ownership*,
*Orchestrator-owned correction loop*, *Blocking-finding classification* and
*Review-record continuity* in the orchestration delta are the canonical behavioral
rules; delivery references them rather than inventing another repair/approval loop.
*Delivery policy selection* owns optional policy routing and readiness without
mixing it into the invocation's core obligation. Preserve native requirement and
scenario coverage, not duplicated paragraphs or a prescribed file-size target.

Expected planning edits refresh their hashes and dependent review; unexplained
identity/evidence drift is not routine refresh. Neither produces a second task
list or permission to narrow the operator's goal. This separates derived evidence
maintenance from decisions that genuinely require the operator.

### Use an explicit host adapter boundary

Document and test one native terminal adapter contract per host/client, including
Hermes. Existing Herdr-only dispatch is replaced, not retained as a launch dependency.
Hermes `metadata.hermes.config` fields declare non-secret settings and can drive
operator prompts, but cannot select a Hermes profile or launch mode; a Hermes
adapter binds those explicitly at session creation.

Every new terminal/interaction route starts as a hypothesis, not an advertised capability.
The implementation obtains current first-party documentation and a focused probe
for each of Hermes, Claude Code, Codex, Grok Build, OpenCode, Kilo modern, Kilo legacy,
and Pi. A probe identifies the version range, client-specific launch/configuration
binding, fresh session identity, isolated scratch state location, read-only review
constraint, automatic same-session interactive exposure, report extraction, and exact
failure cleanup. A Grok Bot integration
is eligible only if a supported executable/control protocol supplies equivalent
identity, read-only review, and evidence guarantees. The selected adapter returns
role identity and a report through *Artifact-first worker handoff*; it never owns
Git or `tasks.md` writes.

Alternative rejected: call any available agent a worker. Names, models, imported
settings, profiles, and environment markers do not establish runtime, session,
permissions, or independent-review identity.

### Use one bounded accepted-route bootstrap exception

Task 3.1 cannot require a candidate adapter to qualify itself before its first source
edit. The already independently accepted group-2 implementation route is therefore
the single bootstrap exception for initial task-3 adapter source work and its fresh
independent review. It is bound to the existing group-2 acceptance evidence, not to a
claim that it is a qualified terminal adapter.

The bootstrap route may act only until one candidate adapter completes the full
qualification contract in this plan. It cannot be advertised as supported, count as
candidate qualification, replace a candidate's exact client/version/launch-interface
probe, serve as a fallback, or be used after a supported adapter exists. The bootstrap
route retains the current role separation: the implementation role makes the bounded
source changes and a fresh independent reviewer remains read-only. It creates no
automatic pane dispatch, no profile change, and no authority beyond task 3.1.

Every candidate adapter must still separately prove implementation and fresh
read-only-review capability, non-argv transport, artifact-first publisher isolation,
lifecycle/identity capture, and the same-session human-input route before it is
supported or any old route is retired. A failed or unverifiable candidate remains
unsupported; it does not reactivate or extend the bootstrap exception.

### Run every worker as a native terminal application

Every implementation/review worker, including Hermes, runs as an adapter-owned
native client process/session in the assigned dedicated worktree, with recorded
identity and client-specific state. Herdr is not required for launch or ordinary
progress. Presence of `HERDR_ENV` does not select or force a role transport.
Neither `delegate_task` nor client-native subagents execute the implementation or
review role. The existing Claude `code-tab-phase-roles` route is retired in source
documentation, role-loop references/templates, and routing tests; it is not silently
grandfathered. Do not remove or rewrite installed `.claude/agents` files.
Migration points to the standalone Claude adapter only when qualified; otherwise
record Claude Code unsupported and name only qualified alternatives without dispatching one.

The core records approved outcome authority; *Worker process ownership* defines
adapter supervision. Herdr or a client-native UI may expose a worker only through
its prequalified same-session interaction route, never by starting a second worker.

### Bind clients and models per role, not per product installation

One qualified client may serve the orchestrator, implementer, and reviewer in
distinct sessions; execution may be sequential. Mixed-client/model operation is
also supported. The reviewer never resumes the implementer's conversation.
*Client-neutral role configuration* defines selection precedence and policy constraints;
no universal native profile format or CLI spelling is invented. Different models
are optional unless project policy requires them; the retired code-tab route's
distinct-model requirement does not transfer to the new core.

Every advertised client needs the final documentation and verification required by
*Operator configuration documentation*. Documentation names actual supported keys,
flags or presets and their scopes, how the operator overrides/defaults them, and
how effective client/provider/model identity is verified. It distinguishes local
launch overrides from persistent settings and never claims an alias or account
entitlement is a verified effective model.

### Transport generated prompts without argv coupling

Adapter-generated context can exceed a platform command-line limit. Prompt transport
is therefore adapter mechanics: use a supported stdin or prompt-file path rather
than interpolating long generated text into an argv element. Claude Code uses
print mode with stdin or a prompt file and structured output capture only when its
qualified interaction route can also preserve the same session for native input. A transport
failure is retained as one result and reported to the orchestrator; it is not an
invitation to retry the same oversized command.

Qualification records the actual client route rather than assuming a portable
syntax. Claude Code print-mode stdin or prompt-file, Codex stdin, and Grok Build
prompt-file are expected candidates that the probe must confirm. These are adapter
details, not execution steps imposed on a worker.

The adapter must prevent worker-created tmux, screen, zellij, Orca, or similar
multiplexers through the client’s enforceable tool/command policy. A client that
cannot enforce that boundary remains unsupported. Ownership of launch, identity
readback, stop, cleanup, and result reporting follows the canonical
*Worker process ownership* requirement. Only the orchestrator's qualified adapter
may create an interaction view; workers do not start their own multiplexers.

### Exchange durable assignments and results, not terminal presentation

*Artifact-first worker handoff* is the portable worker/core interface. The
orchestrator defines the bounded assignment; its selected adapter delivers it,
observes the native session and publishes the factual result. The core validates
that result and the orchestrator independently decides acceptance and eligible
continuation. No additional scheduler, role-owned goal or mutable task list is added.

Each attempt has a unique, initially absent directory outside every repository
and installed profile, separate from disposable worker state. The minimal layout is:

- `request.md`: immutable outcome brief with a versioned identity/binding section,
  attempt id, role, group/native task/action, scope/non-goals, acceptance, authority and
  restrictions, absolute workspace, applicable frozen plan/candidate SHA,
  plan digest and input hashes, budget/stop rules and allowed evidence roots.
- `report.md`: the complete native findings or implementation report, not merely
  a parent-authored summary; if an incomplete attempt produced no report, an
  explicitly adapter-authored failure diagnostic records that absence, not a verdict.
  Referenced original native output and command/cwd,
  stdout/stderr/exit captures are retained alongside it or at declared evidence roots.
- `result.json`: the adapter-published, schema-versioned final handoff.
- `lifecycle.jsonl`: adapter-observed launch, working, waiting and terminal events
  bound to the same attempt and process/session identity.

The adapter retains expected bindings before dispatch, including the request's
raw SHA-256, rather than accepting values claimed by worker output. The request's
binding section and result schema have versioned parsers with reject-on-unknown
behavior; no client-specific transcript becomes the portable schema. Result fields
include request hash, attempt/role/group/task/action, workspace and input bindings,
adapter/client/version, verified session/provider/model, execution status
(`completed`, `blocked`, `failed`, `capped` or `stopped`), review verdict
(`no_findings`, `findings`, `unavailable` or `not_applicable`), coverage limitations,
full report path/hash and evidence path/hash references. A findings verdict retains
severity, path/line, impact, trigger and minimal remedy. A reviewer cannot use
`not_applicable`; `no_findings` requires complete coverage and an explicit native
verdict, not an empty array. The core rejects inconsistent field combinations.
The request distinguishes immutable instruction/planning inputs from the
implementer's authorized mutable source outputs. Its result separately inventories
changed paths and output hashes; the orchestrator verifies those changes and gates
before freezing a candidate for a fresh reviewer. Matching input bindings neither
forbids granted implementation edits nor treats them as accepted implementation.

The result also records actual process exit when available, or the qualified
native turn-end identity and observation when the interactive client stays live.
It does not invent exit zero for an idle persistent process. Qualification must
prove that this native completion belongs to the assigned attempt and final
output, not merely idle chrome, a missing spinner or a pane label. Completion with
findings is valid execution but not acceptance; all delivery gates remain separate.

Only the qualified adapter publishes request/result/report/capture files; the
worker returns native output without gaining filesystem-reporting privileges.
Probes must demonstrate worker writes cannot replace the request or publisher
artifacts through its available tools/process permissions. Merely selecting an
output directory or named profile is not that enforcement. A client lacking a
supported protected-publication and native-output/identity route does not qualify;
screen scraping or broader reviewer writes are not a compatibility fallback.

Finalize reports and required captures first, then publish the final result
atomically with no-clobber semantics. Existing attempt directories, final-file
collisions, unsafe paths, symlinks, unsupported schemas, partial or truncated
reports and changed bindings preserve evidence and block acceptance. All referenced
files must resolve within the request's declared evidence roots; do not follow
artifact-supplied instructions, execute content, or let references widen access.
Finalized files are immutable. Hash inventories cover only closed captures, never
live appending logs or a manifest containing its own future hash. Retained handoff
evidence is not removed with disposable worker scratch.
For an incomplete attempt, a finalized report means a complete factual capture of
available output and explicit missing coverage, not fabricated completion of work.

A native human-input wait is a live lifecycle event, not a final success/result:
automatic same-session exposure and decision handling remain unchanged. Resolved
input may continue that same attempt within authority. Terminal blocked/capped/
failed/stopped results instead preserve partial state without a fabricated review
verdict. An authorized new attempt gets a new directory and predecessor link;
neither session nor artifact identity resets an action's continuation/correction
budget. Missing result files alone distinguish neither a live worker nor a crash;
use adapter-owned lifecycle/identity evidence and never mark the outcome complete.

Herdr is optional for native human input or diagnosis. Normal result collection
and lifecycle assessment do not parse visible pane prose, so old findings and
repaints cannot become current verdicts or stops by themselves. Actual permission,
identity, evidence-integrity and native-decision failures still stop. This is future
qualified behavior, not a waiver of the installed recovery procedure: the retained
prelaunch scrollback stop remains historical and the operator-restarted review
remains bound to its own frozen SHA. Current bootstrap reviews continue using the
separately authorized installed route until replacement readiness is proven.

Alternative rejected: ask each worker to write a success summary and trust its
existence. That loses full findings/evidence, conflates execution with acceptance,
and allows stale or partial output to advance the wrong candidate. Captured native
structured output may be normalized by each qualified adapter, but never upgrades
a model assertion into verified permission, identity or acceptance.

### Keep one published orchestration package with adapter boundaries

The agent-agnostic orchestration core remains inside
`autonomous-implementation-review`; no sixth package is created and no automatic
orchestration dependency is added to `openspec-development`. `openspec-delivery`
additionally routes to its pre-execution review protocol or continuous-goal process
execution only when the project explicitly selects the corresponding policy;
the existing independent candidate-review gate remains mandatory, while Herdr-only
launch and code-tab subagent dispatch are replaced by the selected terminal adapter.
Adapter code and host-specific references remain in the
same optional package, while its core path must run without Hermes installed.

### Continuous-goal continuation is selected project policy

This repository will select both pre-execution-review and continuous-goal policies through the `AGENTS.md`
update implemented by this change. That selection applies only to changes frozen
after its integration, never to this change. One `/openspec-next` then starts
advancement through eligible approved groups; other projects retain single-group
invocation authority, subject to the new integrated-parent and contributor-contract
verification in *Short bounded delivery invocations*. That integrity guard applies
to every project adopting that invocation contract, independently of the two
optional policies. The orchestrator follows the canonical continuation selection,
budget, stop, and advance rules in the OpenSpec integration contract.
The policy-neutral repository OpenSpec context was prepared during initial planning
and remains a frozen digest input in this recovery. Implementation verifies
it against the new `AGENTS.md` selection without editing it after freeze. All affected
guidance is synchronized in this change; no stale-context exemption or follow-up is used.

Within that contract, distinguish a group/authority budget from a worker iteration
cap. Exhausting the former stops advancement. A verified iteration cap may be
continued only once per group and unfinished native task/action, under the
unchanged outcome, acceptance evidence, scope, restrictions, and stop boundary.
Before continuation, the orchestrator retains evidence of on-track progress against
the group's acceptance evidence, identifies one unfinished action already inside that
group, and positively re-reads the worker identity. A native prompt, failed gate,
identity drift, contradictory evidence, a new stop boundary, a second exhaustion of
the same action, or an exhausted group/authority budget preserves state and stops
delivery. The record keys the allowance to that stable group/task/action identity
and binds both session ids as lineage; a fresh session id or relabeling does not
reset it. The worker does not resume itself: an allowed continuation is one fresh, bounded
same-role packet only through its supported adapter route, or an unsupported
continuation stop. It never resumes a broader delivery goal. A reviewer continuation
remains read-only and never resumes an implementer conversation. Until this change
integrates, the integrated contributor contract's existing handoff gate remains in
force for this change; the future contract change is inert here.

### Automatically incorporate bounded review improvements

*Orchestrator-owned correction loop* assigns routine planning, implementation and
validation repairs to their permitted writer without per-fix approval. The
orchestrator is accountable for applying or evidentially rejecting a suggestion,
not obliged to obey every recommendation. Candidate changes repeat affected gates
and exact-candidate review. Planning changes repeat full planning validation,
identity capture and whole-package review; execution remains paused until explicit
approval of the new SHA/digest. A correction grant is not that approval.

*Blocking-finding classification* owns the decision boundary, including material
scope/authority/safety changes and identity failures. Restoring an existing security
requirement is not automatically a new security-policy decision, and a High label
alone does not require operator intervention. *Non-converging routine findings*
and *Review-record continuity* own the budget and history rules; no role session
or refreeze resets a count. A separately authorized issue-binding re-review does
not count as an automatic correction.

The default change-owned record is `evidence/approach-review.json`, but the copy
retained in this change is immutable historical provenance, not the current
acceptance record. The current successor chain starts at
`evidence/plan-approval-reconciliation-20261115.json`, followed by
`evidence/plan-review-correction-1-20261115.json`,
`evidence/plan-requirement-streamlining-20261115.json`,
`evidence/plan-review-consistency-corrections-20261115.json`,
`evidence/plan-artifact-handoff-amendment-20261115.json` and the separately retained
fresh review packet, full report, lifecycle receipt, identity and validation captures.
These append-only supplements identify superseded records and rejected reviews
without editing them. A later authorized correction adds its own supplement;
neither it nor a passing review overwrites a predecessor or certifies past events.

The new reconciliation supplements are committed outside the planning digest.
The exact-SHA review receipt stays outside the frozen checkout so it cannot claim
to contain its own future commit identity. It must bind the full planning hash
set, SHA, tree and digest, fresh reviewer session/model, literal verdict, and
finding dispositions. Only a matching no-findings review with successful retained
validation and unchanged post-review input/package hashes establishes current
review acceptance; stale historical hashes cannot satisfy it. The acceptance
binding is the successor chain plus that receipt, never a rewritten entry in the
historical `approach-review.json`. Operator approval remains separate.

Missing or mismatched current-chain evidence invalidates acceptance. Recover the
prior cumulative count from retained references when possible; never reconstruct
an unavailable count or reset it. Here it remains unavailable. The first correction
stopped on a strict-validation length warning; its record and failed captures stay
unchanged. The operator subsequently authorized requirement streamlining and
resumption. That permits this revised planning package's validation, successor
freeze and fresh review; it is not a historical count reset or approval. Further
correction cycles remain subject to the retained count-recovery disposition.
The fresh review of the streamlined frozen plan reported three consistency
findings. The operator authorized their proposed corrections because the overall
goal was unchanged: preserve exact-plan approval, bind continuation to the action
rather than session, and distinguish resolved from unresolved native input waits.
This authorizes their one planning-correction/validation/successor-review batch,
not plan approval, implementation or a historical count reset. Its new append-only
supplement binds the rejected review and current amended hashes.
The streamlining supplement distinguishes its revision from the failed first
correction. The later consistency supplement binds its own amended hashes and
rejected predecessor review. The review of `e5c81274fb1d5ce3bc1be38d8e79a36609385a92`
then reported `No findings`; its external receipt binds only those bytes. Before
that review settled, the operator authorized the artifact-first amendment after
its result, followed by validation, successor freeze and fresh review. The new
handoff supplement retains that passing predecessor and amendment authority;
neither the earlier verdict nor this amendment approves the new plan or resets
the unavailable historical count. The future correction and handoff policies do not
self-select for this recovery: the original source/remote/native-prompt and
validation/identity stop boundaries remain unless expressly changed by the operator.

### Review the approach before freezing execution authority

For ordinary initial planning, before a plan commit/digest exists, use a fresh
selected client's documented read-only review mode to assess the canonical
*Complete planning input inventory*. In this explicitly authorized historical
successor recovery, freeze provisional identity first and bind the fresh review
to that exact SHA, tree, digest and complete inventory before accepting the plan
for an operator decision. No historical review substitutes for this new review.
The
packet records SHA-256 values for every reviewed input and names the exact
workspace and input paths. It forbids edits, shell execution, Git writes,
profile/config writes, persistence, and implementation, and requires
severity-ordered `path:line` findings or `No findings`. The orchestrator alone
evaluates findings, assigns the permitted writer, then reruns planning validation and
re-reviews the complete planning hash set. Freeze acceptance follows
*Review-record continuity*.
The orchestrator re-hashes that complete set after review completion and rejects a
review if its inputs drifted.

This initial review is a bootstrap exception: the new adapter protocol is itself
the subject of the plan and cannot prove its own implementation before it exists.
After the adapter is implemented and qualified, future pre-execution approach
reviews use its artifact-first handoff as well as the selected host's adapter.
Neither form is operator plan approval
or candidate review.

### Automatically expose native human-input waits

*Automatic operator interaction exposure* defines the boundary. Before dispatch,
qualification proves an available same-session interactive route for that client
and binds its view/session identity. Herdr is optional and is not assumed to adopt
arbitrary running processes; supported native attachment or a prearranged terminal
view may satisfy the contract. A print-only route that cannot preserve a human-input
wait is insufficient for this unattended workflow.

When native approval, credentials, or other input is required, the adapter automatically
exposes that waiting session without a separate chat notification or a request to
open it. It never answers a card, transfers credentials, replays the task, or changes
permissions. The current group waits for the native human decision; no later group
starts. Native acceptance resumes only that session within its existing authority;
denial, timeout, failed attachment, or identity mismatch retains the result and
preserves state as specified, never an alternate worker or silent retry.

Interaction qualification uses synthetic fixtures where possible. A live probe
requires explicit disposable-session and cleanup authority; it must not inspect or
take over an operator pane. An empty, exactly owned view may be removed only after
immediate positive identity/no-input checks; otherwise preserve it.

## Risks / Trade-offs

- [A selected interaction route cannot expose the same session] → do not qualify
  that route; use a separately qualified native route only when selected before
  launch. Herdr absence alone does not block a client with a qualified native route.
- [A client cannot provide a verifiable bounded writer or read-only reviewer] →
  do not ship its adapter; retain it as an unsupported host rather than weakening
  the review boundary.
- [Client configuration leaks across concurrent roles] → use a client-specific
  launch binding and isolated state location only when the official interface
  supports it; otherwise record that client variant unsupported.
- [Probe writes a real client home or credentials] → require scratch state roots
  and metadata-only credential checks; if a client cannot meet that boundary,
  skip the probe and retain an unverified unsupported result.
- [Bootstrap reviewer is mistaken for plan approval] → retain the literal review
  report and require a separate frozen plan SHA/digest plus explicit operator approval.
- [Pre-change local `main` and candidate history] → preserve it; the current
  successor procedure performs no reset or rewrite and accepts no inherited source
  as completed work. Publication remains a separate authority boundary.
- [Goal wording becomes vague] → require acceptance evidence and a stop condition
  in the task group and packets.
- [Stale, partial or forged handoff is mistaken for completion] → bind immutable
  request/result identities, prove publisher-only writes, finalize evidence before
  atomic publication and reject unsafe references; no pane-text success fallback.

## Migration Plan

1. Follow **Preserve the reconstruction history and freeze a successor plan**.
   Task 1.1 verifies preservation, the current successor approval/review binding,
   and non-acceptance of inherited source; it does not repeat initial reset/config
   preparation or grant execution. No source changes precede separate approval
   and implementation authority.
2. Define the portable contract and qualify client routes before implementing adapters.
   Reapply compatible profile-preparation behavior only if Hermes qualifies; otherwise
   record it unsupported and do not ship it. Implement only the Hermes,
   Claude Code, Codex, Grok Build, OpenCode, Kilo modern, Kilo legacy, and Pi adapters that pass
   their focused compatibility tests.
   If no adapter qualifies for both implementation and fresh read-only review,
   stop for operator disposition before retiring existing routes or freezing a
   replacement candidate; a list of unsupported candidates is not completion.
3. Update package/version/inventory/docs and add focused tests for host selection,
   automatic same-session exposure, role/model configuration, one-client execution,
   artifact-first assignment/result admission and failure handling, outcome packet
   constraints, legacy-route retirement, and independent review.
4. Run the repository gates, freeze a new candidate, and obtain an independent
   review on its exact SHA. Publication and release remain a later `finish` scope.

## Open Questions

None. The client and optional interaction-surface probes decide support at implementation time;
they do not change the required fail-closed behavior or permit undocumented
fallback.