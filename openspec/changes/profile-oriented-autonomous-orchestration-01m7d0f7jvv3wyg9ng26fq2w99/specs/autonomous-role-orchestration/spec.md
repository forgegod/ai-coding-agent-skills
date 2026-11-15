# Spec Delta

## Purpose
Defines portable, outcome-oriented dispatch and review roles for explicitly
selected autonomous-development hosts without inventing shared authority.

## ADDED Requirements

### Requirement: Agent-agnostic orchestration core
The orchestration core SHALL operate without Hermes, Herdr, or any specific AI
client installed. It SHALL enforce outcome, authority, task-progress, and review
within delivery-owned continuation contracts, while a selected qualified host adapter binds those
contracts to a concrete orchestrator and worker client.

#### Scenario: Non-Hermes orchestrator
- **WHEN** a project uses the core from Claude Code, Codex, Grok Build, OpenCode,
  Kilo, Pi, or another qualified client without Hermes installed
- **THEN** the core contract remains available and does not require a Herdr pane,
  Hermes profile, or Hermes-specific tool

#### Scenario: Standalone role execution
- **WHEN** an implementer or reviewer is dispatched
- **THEN** its qualified adapter launches a separate native client session/process
- **AND** neither Hermes `delegate_task` nor a client-native subagent executes that role

### Requirement: Outcome-oriented task groups
The orchestration package SHALL treat one approved OpenSpec task group as a
bounded delivery outcome, with stated acceptance evidence and an explicit stop
condition. Roles, model selection, and execution detail remain adaptable
within the approved scope and global authority contract. It SHALL keep native
`tasks.md` as the sole mutable progress authority and SHALL NOT create a fine-grained
parallel tracker.

#### Scenario: Approved outcome dispatch
- **WHEN** an operator or selected continuous-goal continuation starts an approved
  task group that names a delivery outcome
- **THEN** the selected worker packet includes that outcome, acceptance evidence,
  scope/non-goals, workspace, budget, and stop boundary
- **AND** the orchestrator alone records verified progress in `tasks.md`

#### Scenario: Unbounded checklist request
- **WHEN** a requested worker packet is only a sequence of low-level actions with
  no observable outcome or acceptance evidence
- **THEN** dispatch stops until the task group is expressed as a bounded outcome

### Requirement: Independent pre-execution approach review
The orchestration package SHALL independently review the complete planning set
read-only before execution-plan acceptance, bind every input's SHA-256, and report
actionable findings or `No findings`. Review SHALL NOT approve a plan, edit
artifacts, create a candidate, or start implementation.

#### Scenario: Review selection and ordering
- **WHEN** delivery invokes its selected pre-execution-review policy or the operator
  requests a bootstrap approach review
- **THEN** ordinary planning review precedes freeze for an operator approval decision
- **AND** only an explicitly authorized provisional historical-successor freeze
  may precede that review under *Review-record continuity*; acceptance still waits

#### Scenario: Complete planning input inventory
- **WHEN** an approach-review packet or matching review record is prepared
- **THEN** its input paths equal delivery's `change-guard.mjs` `planning()` inputs:
  repository `openspec/config.yaml`, the change's `.openspec.yaml`, proposal,
  tasks, design when present, and every file under the change's `specs/`
- **AND** raw-file SHA-256 review bindings do not replace the guard's separate
  normalized, path/mode-framed approved-plan digest

#### Scenario: Approach review finding
- **WHEN** an independent planning reviewer identifies a concrete scope, safety,
  host-adapter, or acceptance gap
- **THEN** the orchestrator records the finding and incorporates only accepted
  corrections into the planning artifacts before rerunning validation and a
  read-only review binding the complete planning hash set

#### Scenario: Ready approach review
- **WHEN** the independent planning reviewer reports no blocking findings
- **THEN** the orchestrator may freeze the validated plan for a separate operator
  approval decision
- **AND** for an authorized provisional successor already frozen, only the matching
  exact-identity review can establish review acceptance before that decision
- **AND** planning-file identity and review acceptance follow *Review-record continuity*
- **AND** the review does not grant implementation, Git, profile, or remote-write authority

### Requirement: Explicit host and launch boundaries
The orchestration package SHALL require an explicit supported execution host,
client, launch binding, and role identity before dispatch. It SHALL distinguish
Hermes profile state from each external CLI's configuration and SHALL NOT infer
host fallback, profile equivalence, or write authority from a model name, agent
definition, pane label, or environment marker.

#### Scenario: Hermes role profile
- **WHEN** a Hermes terminal role is selected
- **THEN** the role uses the verified named Hermes profile prerequisites and a
  distinct session identity before receiving a packet
- **AND** Herdr is not a launch prerequisite

#### Scenario: Hermes declarative settings
- **WHEN** an operator configures a Hermes role through skill frontmatter settings
- **THEN** those settings are treated as declared non-secret configuration input
- **AND** the concrete Hermes profile and CLI operation mode remain explicitly
  bound at launch rather than selected implicitly by the skill

#### Scenario: External CLI role
- **WHEN** a Claude Code, Codex, Grok Build, OpenCode, Kilo, or Pi role is
  selected under its qualified adapter protocol
- **THEN** the role uses a fresh bounded client session and verified effective
  launch configuration from that client's supported flags, configuration path,
  profile, or narrowly scoped environment
- **AND** it does not claim to use, configure, or inherit a Hermes profile

#### Scenario: Unsupported chat-only surface
- **WHEN** a requested client surface has no tested local execution interface or
  no supported role/session control protocol
- **THEN** the workflow records it as unsupported and does not represent a chat,
  bot, or imported configuration as an executable worker

#### Scenario: Unselected fallback
- **WHEN** the selected host or its required identity evidence is unavailable
- **THEN** dispatch stops without substituting another host, profile, pane, or model

#### Scenario: Recorded model choice
- **WHEN** a worker packet is prepared
- **THEN** its model choice is recorded at launch within the approved authority
- **AND** a later unavailable model does not permit silent substitution

### Requirement: Role ownership
The orchestrator SHALL remain accountable for the outcome, finding disposition,
assignment, verification, Git and task progress. The implementer SHALL make
authorized source, test and implementation-documentation changes. The reviewer
SHALL assess independently and read-only. Role authority SHALL NOT transfer merely
because a finding is routine or a worker is unavailable.

#### Scenario: Assigned implementation correction
- **WHEN** a source, test or implementation-documentation correction is needed
  within approved implementation scope
- **THEN** the orchestrator dispatches it to a qualified implementer and verifies
  its evidence before obtaining fresh independent review
- **AND** it does not perform the worker's edits, even when the remedy is obvious
- **AND** no available qualified implementer means a blocker, not role substitution

#### Scenario: Planning and operator ownership
- **WHEN** authorized planning artifacts or reconciliation evidence need correction
- **THEN** the orchestrator may edit those artifacts within its planning grant
- **AND** only the operator decides material changes outside existing authority
  and approves the exact execution-plan identity
- **AND** neither a reviewer verdict nor task-progress authority grants execution

### Requirement: Qualified client adapters
The orchestration package SHALL advertise a client adapter, including Hermes, as supported only when
a recorded compatibility probe passed for its documented version range and launch
interface. It SHALL require current first-party interface evidence, an isolated
scratch state location or an explicit unverified stop, and a separate probe result
for each distinct client variant.

#### Scenario: Qualification controls
- **WHEN** a client variant is qualified
- **THEN** its probe verifies enforceable prohibition of worker-created multiplexers,
  role delegation to subagents by implementers, any subagent creation by read-only
  reviewers, and reviewer write escalation
- **AND** it verifies a supported non-argv prompt route
- **AND** it verifies terminal-first launch, effective role/model binding, and
  *Automatic operator interaction exposure* before dispatch

#### Scenario: Missing or stale qualification
- **WHEN** a selected client version is outside its qualified range or its probe
  evidence is missing, failed, or does not bind the selected launch interface
- **THEN** dispatch stops and the client is not advertised as supported

#### Scenario: Replacement readiness before retirement
- **WHEN** migration would retire an existing role route or freeze a replacement candidate
- **THEN** at least one qualified adapter must support both implementation and a
  fresh read-only reviewer under the terminal/interaction contract
- **AND** if none qualifies, migration stops for operator disposition before
  retirement or candidate freeze; unsupported records alone do not satisfy delivery

### Requirement: Launch payload transport
A client adapter SHALL keep generated worker/reviewer prompts out of a command-line
argument when their size can approach the host argument-vector limit. It SHALL use
the selected client’s supported stdin or prompt-file transport, retain structured
stdout/stderr and exit status outside the repository. An oversized invocation is
retained and never retried; a correctly sized transient failure may retry once
before being retained.

#### Scenario: Transport failure handling
- **WHEN** a client adapter retains a transport failure after any permitted retry
- **THEN** it stops the current group as a host block
- **AND** a correctly sized transient failure receives at most one retry on the same
  qualified route and identity, never a route, host, profile, or model fallback

#### Scenario: Oversized qualified Claude print prompt
- **WHEN** a qualification probe confirms Claude Code print-mode transport and its
  payload exceeds the adapter’s safe argv budget
- **THEN** the adapter supplies it through stdin or a prompt file with `--print`
- **AND** retains the structured result or transport failure for the orchestrator

#### Scenario: Qualified non-argv transport variants
- **WHEN** Codex or Grok Build is selected for a payload exceeding the safe argv budget
- **THEN** the Codex adapter may use its stdin prompt route and the Grok Build adapter
  may use its prompt-file route when their qualification probes confirm it
- **AND** each qualification records the client version, route, prompt-file hash
  where applicable, structured stdout/stderr, and exit status

#### Scenario: Separate Kilo variants
- **WHEN** Kilo modern and legacy configuration routes are evaluated
- **THEN** each route has an independent probe and adapter decision
- **AND** a pass for one route does not qualify the other

### Requirement: Worker process ownership
The selected adapter SHALL own launch, identity readback, stop, and scratch cleanup
for every qualified worker, including Hermes, in dedicated worktrees, within
core-recorded outcome authority. It SHALL report results to the core and prohibit
worker-created multiplexers and native-subagent role executors.

#### Scenario: Terminal-first worker
- **WHEN** a worker is dispatched with or without Herdr present
- **THEN** it runs as a qualified adapter-owned native client process/session
- **AND** an interaction view does not become a second worker or a required launcher

#### Scenario: Implementation role
- **WHEN** a qualified client is selected for implementation
- **THEN** the selected adapter launches it as the recorded role process in the
  assigned dedicated worktree
- **AND** it prohibits worker-created tmux, screen, zellij, Orca, or another multiplexer

#### Scenario: Stop or group-budget boundary
- **WHEN** a worker reaches the group or authority budget, exits unexpectedly, or
  receives a stop decision
- **THEN** the selected adapter reports its process/session result and, after positive
  identity readback immediately before action, stops only the exact owned process
  tree and cleans only its recorded scratch root
- **AND** otherwise preserves the process state and stops
- **AND** it does not inject a continuation packet, answer a client prompt, or clean
  an unverified process tree
- **AND** it reports every preserved PID, session, and scratch root in the stop record
- **AND** a human-input request instead follows *Automatic operator interaction exposure*

#### Scenario: Iteration-cap continuation boundary
- **WHEN** the integration contract verifies a once-only worker iteration-cap
  continuation before any group or authority budget, unexpected exit, or stop decision
- **THEN** the adapter preserves the identified worker session and reports the cap
- **AND** only the orchestrator may send that contract's one fresh bounded same-role
  session through the qualified route in the same checkout, never into the capped
  session, and retains one continuation record per group and worker-session id

#### Scenario: Implementation process violates process boundary
- **WHEN** an implementation role starts a multiplexer or delegates its role to a subagent
- **THEN** the adapter stops the exact owned process tree after identity readback
- **AND** preserves the scratch root as evidence without cleanup and the orchestrator
  does not accept that group's evidence
- **AND** a failed identity readback preserves the process and scratch root

#### Scenario: Retired Claude code-tab route
- **WHEN** `code-tab-phase-roles` is requested after this migration
- **THEN** dispatch stops with a retired-route result and points to explicit
  standalone Claude selection only when that adapter is qualified
- **AND** otherwise it records Claude Code unsupported and names only qualified
  adapters, without launching a fallback
- **AND** source launch guidance, native-subagent role references/templates, and
  routing tests are migrated; installed project agent files are not changed

#### Scenario: Retired Herdr pane dispatch
- **WHEN** operator-selected Herdr pane dispatch is requested after migration
- **THEN** dispatch stops with a retired-route result and names only qualified
  terminal adapters without launching a fallback or resetting the selected pane
- **AND** `HERDR_ENV` neither selects nor forces a role transport
- **AND** Herdr remains available only as a qualified same-session interaction route
- **AND** retirement occurs only after *Replacement readiness before retirement*

#### Scenario: Read-only review escalation
- **WHEN** a read-only reviewer attempts to create a subagent, use a
  writing tool, or start a multiplexer
- **THEN** the review is invalidated and the orchestrator records the violation
- **AND** no review verdict is accepted from that process
- **AND** the adapter stops the exact owned process tree after identity readback
  and preserves the scratch root as evidence without cleanup
- **AND** a failed identity readback preserves the process and scratch root

### Requirement: Orchestrator-owned correction loop
The orchestrator SHALL resolve grounded, non-contradictory review findings and
repairable validation failures within existing scope and authority without
per-fix operator approval. It SHALL assign the writer under *Role ownership*,
retain evidence, revalidate and obtain fresh independent review. *Blocking-finding
classification*, *Review-record continuity* and the existing budget constrain
every attempt, including authorized refreezes.

#### Scenario: Routine grounded correction
- **WHEN** a planning review reports a non-contradictory, in-scope correction with
  exact paths and a minimal remedy
- **THEN** the orchestrator applies the correction, validates, and requests a
  fresh full-package read-only review without a separate operator prompt unless
  *Review-record continuity* requires per-cycle operator authorization

#### Scenario: Routine implementation finding
- **WHEN** review reports a grounded correction to source, tests or implementation
  documentation that satisfies the approved plan without changing it
- **THEN** the orchestrator assigns the correction to the implementer, verifies
  the result, reruns affected gates and obtains review of the new exact candidate
- **AND** it does not ask the operator merely to approve that in-scope fix

#### Scenario: Repairable validation failure
- **WHEN** a gate fails and a cited, bounded remedy preserves scope, authority,
  safety, dependencies, identity integrity and all acceptance conditions
- **THEN** the orchestrator retains the failure, assigns the permitted writer,
  corrects and revalidates within the same correction budget
- **AND** it does not suppress the gate, weaken acceptance or count the failure as
  success; an unexplained failure follows *Operator disposition required*

#### Scenario: Required correction authority is absent
- **WHEN** a proposed remedy needs a file write, commit, worker launch or other
  action outside the existing grant
- **THEN** the orchestrator preserves the finding and stops for the missing authority
- **AND** a routine classification does not create that authority


### Requirement: Goal-first pre-freeze control
The orchestrator SHALL preserve the operator-requested goal while refreshing
derived planning/review state under *Orchestrator-owned correction loop*. Such
refresh grants neither plan approval nor execution authority and SHALL NOT create
a second task list or an artificial operator decision.

#### Scenario: Ordinary planning drift
- **WHEN** an ordinary planning edit changes reviewed hashes while the requested goal
  and authority contract remain unchanged
- **THEN** the orchestrator updates the review revision and repeats validation and
  independent review automatically
- **AND** it preserves the same operator-requested goal without starting a task group
- **AND** it does not create a new operator decision, task group, narrower authority,
  or stop unless it requires an Operator disposition required decision or reaches
  the *Non-converging routine findings* boundary, or is subject to a *Review-record
  continuity* count-recovery stop or per-cycle authorization

#### Scenario: Non-converging routine findings
- **WHEN** a routine finding repeats unchanged after correction, routine findings contradict,
  eight automatic correction/review cycles have occurred without convergence, or
  a narrower group or authority budget is exhausted
- **THEN** the orchestrator stops for operator disposition
- **AND** one correction/revalidation/re-review attempt counts once; crossing a
  freeze, role session or planning/implementation phase does not reset the retained count

### Requirement: Review-record continuity
The approach-review record or explicitly authorized append-only successor chain
SHALL bind the complete planning hash set and review history. Review acceptance
of a frozen plan binds only to the current chain's latest no-blocking-findings
entry matching that complete planning set. Historical records SHALL NOT be
rewritten or treated as approval of successor bytes.

#### Scenario: Matching acceptance
- **WHEN** a no-blocking-findings review entry hashes to the frozen planning set
- **THEN** review acceptance may bind to that entry in the current record/chain
- **AND** operator approval of the exact frozen identity remains separate

#### Scenario: Authorized append-only historical successor
- **WHEN** an operator explicitly authorizes a replacement plan while historical
  review/freeze/approval records must remain immutable
- **THEN** an append-only reconciliation record identifies the superseded records,
  their hashes, the preservation boundary and the current successor-chain locators
- **AND** separately retained fresh review evidence binds the complete planning
  hashes, exact SHA, tree, digest, reviewer session/model and literal verdict
- **AND** the operator may authorize a provisional identity freeze before that
  review, but it establishes no review acceptance, approval or execution authority
- **AND** this exception does not waive any adopted integrated-parent or other
  integrity guard; those guards still govern acceptance and execution
- **AND** acceptance requires matching no-blocking findings, successful retained
  validation, and unchanged post-review input and review-package hashes
- **AND** historical hash mismatches do not require historical edits and cannot
  satisfy current acceptance; a missing or mismatched successor receipt blocks it
- **AND** correction supplements retain each rejected report, amended hashes,
  cycle authority and fresh result without resetting an unavailable cumulative count

#### Scenario: Correction evidence
- **WHEN** an authorized routine planning or implementation correction is applied
- **THEN** the record retains its finding, amended hashes, and re-review result

#### Scenario: Missing or revised record
- **WHEN** the record is missing, unreadable, or hash-mismatched
- **THEN** review acceptance is invalidated and the prior cumulative correction count
  is recovered from retained external report references without resetting it
- **AND** when that count is recoverable, a fresh record/revision and whole-package
  review occur before freeze without operator disposition
- **AND** when that count is not recoverable, the orchestrator stops for operator
  disposition instead of restarting the count
- **AND** the record retains that disposition: either a verified baseline count
  is established, or each later correction cycle requires separate operator
  authorization while the cumulative count remains unavailable

### Requirement: Blocking-finding classification
A blocking finding is any finding not fully applied, recorded as unfounded with its
evidence and reason, or explicitly disposed of under the Operator disposition required
scenario; the review record
SHALL retain that classification.

#### Scenario: Retained blocking classification
- **WHEN** a review reports a finding
- **THEN** the review record retains whether it is blocking and its disposition
- **AND** severity alone does not require operator intervention: an in-scope
  high-severity defect may be corrected under *Orchestrator-owned correction loop*

#### Scenario: Unfounded routine finding
- **WHEN** the orchestrator determines a routine finding is unsupported by current artifacts
- **THEN** it records the finding, evidence, and reason as unfounded
- **AND** the finding does not block freeze
- **AND** fresh independent review receives that disposition; disagreement does
  not become unilateral acceptance or bypass *Non-converging routine findings*



#### Scenario: Operator disposition required
- **WHEN** a remedy materially changes scope, client topology, authority, safety
  posture, dependencies, external state, security, host or an accepted contract;
  requires historical evidence edits; has an identity/evidence-integrity failure;
  cannot be shown to align with the accepted goal; or reaches an unresolved native
  human-input wait, unavailable qualified role, or exhausted correction budget
- **THEN** the orchestrator preserves the finding and stops for an operator decision
- **AND** a fix restoring an existing safety or security requirement is not itself
  a change to that requirement; it is assessed against the existing authority
- **AND** native human-input handling follows *Automatic operator interaction exposure*

#### Scenario: Post-freeze planning finding
- **WHEN** a review after plan freeze requires a planning-artifact correction
- **THEN** the orchestrator pauses implementation and follows the correction loop
  only if the grant covers the planning amendment, validation and successor freeze
- **AND** an in-scope routine amendment within that grant needs no per-fix approval
- **AND** changed planning bytes require fresh identity, whole-package independent
  review and explicit exact-plan approval before implementation can start or resume
- **AND** missing amendment authority or a material conflict stops for operator disposition

### Requirement: Automatic operator interaction exposure
Every worker adapter SHALL qualify an available same-session human-input route
before launch. On a native input request it SHALL automatically expose that
session through the bound route without a separate chat notification or asking
the operator to open it. Herdr MAY provide the view but SHALL NOT be mandatory.
Exposure SHALL NOT answer, approve, deny, or bypass the native decision.

#### Scenario: Prelaunch interaction readiness
- **WHEN** a terminal-first worker is prepared for unattended execution
- **THEN** its qualification verifies same-session identity, supported native
  attachment or a prearranged terminal view, and delivery of native human decisions
- **AND** a route unable to preserve a human-input wait does not qualify
- **AND** the authorized role launch binds the automatic view-exposure scope;
  no per-wait permission to open that qualified view is required

#### Scenario: Unexpected human-input wait
- **WHEN** the worker requests native security approval, credentials, or other input
- **THEN** the adapter automatically exposes the same waiting session and native prompt
- **AND** it does not send a separate notification or ask the operator to open it
- **AND** it does not start another worker, replay the task, supply credentials,
  change permissions, or act on the operator's decision
- **AND** group advancement remains suspended until the native response is resolved

#### Scenario: Native decision result
- **WHEN** the operator responds through the qualified native interaction surface
- **THEN** approval resumes only the same worker within its existing scope and authority
- **AND** denial or native timeout is retained without reissuing the action or
  substituting another worker, model, profile, or permission mode

#### Scenario: Exposure failure or identity drift
- **WHEN** the qualified route fails or its session/view identity cannot be verified
- **THEN** the adapter preserves worker state and records a blocker without
  claiming exposure, issuing the task again, or bypassing the native gate

#### Scenario: Owned interaction-view cleanup
- **WHEN** an adapter removes an unused view it created
- **THEN** it uses a supported operation only after immediate positive checks of
  exact ownership, unchanged session/view identity, and absence of operator input
- **AND** it never removes the orchestrator view, a pre-existing view, or an active
  worker session; unverifiable conditions preserve the view

### Requirement: Client-neutral role configuration
The operator SHALL be able to select client and model per role through supported
adapter bindings within project constraints. One qualified client MAY serve all
roles in fresh sessions, sequentially if needed. Different clients or models SHALL
NOT be mandatory unless project policy requires diversity. Effective identities
SHALL be verified; configuration SHALL NOT silently change live global defaults.

#### Scenario: Role selection precedence
- **WHEN** a role launch is resolved
- **THEN** an explicit authorized per-run role override precedes project role defaults,
  followed only by explicitly accepted client defaults
- **AND** project restrictions and operator limits constrain every level
- **AND** missing, contradictory, or unavailable bindings block dispatch without fallback

#### Scenario: One-client workflow
- **WHEN** only one qualified coding client is installed
- **THEN** that client can serve every selected role in distinct sessions without
  requiring a second product, simultaneous workers, or Claude-native role subagents
- **AND** a fresh read-only reviewer receives the frozen candidate, not the
  implementer conversation; same-model use is allowed only within project policy

#### Scenario: Per-role model binding
- **WHEN** the operator chooses the same or different models for role sessions
- **THEN** the adapter uses supported launch-scoped settings and records effective
  client, provider, model identity, configuration source, scope, and version
- **AND** account/model availability and alias resolution are checked without
  reading credentials or treating the requested alias as effective-model proof

### Requirement: Operator configuration documentation
Final operator guidance SHALL cover every advertised client, not only Claude,
and match qualified interfaces and actual role/interaction behavior. README,
installation/SDLC guides, client references, examples, inventories, and tests SHALL
be synchronized before completion. Unsupported capabilities SHALL remain explicit;
installation SHALL NOT imply workflow selection or execution authority.

#### Scenario: Configure and verify any supported client
- **WHEN** a client is advertised as supported
- **THEN** documentation names its supported versions and actual keys, flags,
  presets or profile paths for role/client/provider/model selection
- **AND** it states configuration scope, precedence, default/override behavior,
  effective-setting verification, model availability, and how to change or remove
  the operator's selection without silently modifying persistent global settings
- **AND** it includes qualified one-client same/different-model and mixed-client
  examples, sequential execution, fresh reviewer identity, and policy limitations
- **AND** it explains automatic same-session exposure, native human decisions,
  Herdr's optional status, unavailable-route behavior, and retired-route migration

#### Scenario: Documentation acceptance
- **WHEN** the implementation candidate is verified and independently reviewed
- **THEN** tests exercise documented configuration examples with synthetic/scratch
  state and compare the complete advertised-client inventory with the guidance
- **AND** stale or missing client instructions block completion before publication
- **AND** no real profile, credential, installed agent definition, or external
  system is modified by documentation verification

### Requirement: Independent review across supported hosts
The orchestration package SHALL require a fresh read-only reviewer role distinct
from the implementer, regardless of the explicitly selected supported host. It
SHALL bind the review to the frozen candidate SHA and preserve the delivery
orchestrator as the sole Git and task-progress writer.

#### Scenario: Cross-host review
- **WHEN** an implementation role and a reviewer role use different supported hosts
- **THEN** the review packet identifies the exact candidate SHA, base, scope, and
  gate evidence and remains read-only
- **AND** neither worker stages, commits, pushes, merges, or edits `tasks.md`

#### Scenario: Same-role review attempt
- **WHEN** the proposed reviewer is the implementer session or lacks read-only
  constraints
- **THEN** the independent-review gate remains unsatisfied