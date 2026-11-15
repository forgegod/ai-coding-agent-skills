# Spec Delta

## MODIFIED Requirements

### Requirement: Short bounded delivery invocations
Projects explicitly adopting the invocation contract SHALL let the agent perform
workspace setup, bootstrap, verification, task updates and previewed autonomous
local commits for one approved task group, or for consecutive eligible groups
under *Delivery policy selection*, without repeated plumbing prompts.
Operator restrictions SHALL override defaults and remain effective on continuation.

#### Scenario: Next approved local group
- **WHEN** the operator sends `/openspec-next` in verified current-change context
  and the project has not selected continuous-goal continuation
- **THEN** the agent resolves actual tasks, approval, dependencies and interrupted work and advances one eligible unfinished group
- **AND** it does not infer plan approval, perform remote writes or start another change
- **AND** it performs the authorized workspace/bootstrap, verification, task updates
  and previewed local commits without asking the operator to repeat plumbing

#### Scenario: Selected continuous-goal policy
- **WHEN** a project selected the continuous-goal policy and the operator sends
  `/openspec-next` in verified current-change context without a narrower group restriction
- **THEN** the orchestrator resolves and advances consecutive eligible groups,
  including verification, task updates, and required independent reviews
- **AND** it stops before a missing authority, an unresolved failed gate or finding
  after the orchestration correction policy, a review finding needing
  disposition, conflicting ownership, host block, remote write, next change, the
  current group’s declared stop condition, a missing budget in both the group and
  the project/global authority contract, a missing declared stop condition,
  group/authority-budget exhaustion, an unresolved native human-input wait after automatic
  same-session exposure, or approved-plan/digest mismatch

#### Scenario: Worker needs native human input
- **WHEN** an authorized worker requests approval or other native human input
- **THEN** the orchestration adapter automatically exposes the same waiting session
  through its qualified interaction route without a separate operator chat notification
- **AND** delivery suspends group advancement without answering the prompt,
  replaying the task, or substituting another worker
- **AND** native response, timeout, or exposure failure follows *Automatic operator
  interaction exposure* in the orchestration contract within existing authority

#### Scenario: Worker iteration-cap continuation
- **WHEN** a qualified worker reaches its per-turn iteration cap while the group and
  authority budgets remain available, and the orchestrator retains evidence of
  on-track progress against the group's acceptance evidence, one unfinished action
  identified by an existing native task id inside that group, and positive worker
  identity readback
- **THEN** the orchestrator may continue that cap event once, without widening the
  group, authority, restrictions, outcome, acceptance evidence, or stop boundary
- **AND** the worker does not resume itself; an allowed continuation is one fresh
  bounded same-role session in the same checkout through the selected qualified
  adapter route and never resumes or injects into the capped session or a broader goal
- **AND** a reviewer continuation remains read-only and never resumes an implementer
  conversation
- **AND** a native prompt, failed gate, identity drift, contradictory evidence, a new
  stop boundary, exhausted group/authority budget, unsupported continuation route,
  or any second per-turn iteration cap for that group and worker-session record
  preserves state and stops delivery
- **AND** until this change integrates, the integrated contributor contract's existing
  handoff gate remains in force for this change; the future contract change is inert here
- **AND** it does not ask the operator merely to continue routine progress

#### Scenario: Selected pre-execution review policy
- **WHEN** a project selected the pre-execution-review policy and the plan
  lacks a retained no-blocking-findings review record matching the complete planning
  hash set
- **THEN** delivery stops before accepting an execution-plan freeze or execution
- **AND** it does not treat a reviewer recommendation, draft review, or partial
  hash record as plan approval
- **AND** a provisional historical-successor freeze follows *Review-record continuity*
  in the orchestration contract without acceptance, approval, execution authority
  or a waiver of any adopted integrity guard

#### Scenario: Policy selected after plan freeze
- **WHEN** the contributor contract at the frozen plan commit's parent, an integrated
  target-branch revision, does not select
  continuous-goal continuation
- **THEN** delivery retains single-group behavior for that change

#### Scenario: Pre-execution review selected after plan freeze
- **WHEN** the contributor contract at the frozen plan commit's parent, an integrated
  target-branch revision, does not select
  pre-execution review
- **THEN** delivery retains its existing approval and is not blocked for lacking
  a pre-execution review record

#### Scenario: Legacy plan before integrity-guard adoption
- **WHEN** retained evidence verifies that a plan was frozen before the project
  adopted the delivery version containing the integrated-parent verification guard
- **THEN** that guard applies only at its next freeze or refreeze
- **AND** it does not retroactively invalidate that plan's existing approval; other
  execution restrictions remain effective

#### Scenario: Unintegrated plan parent
- **WHEN** the prospective or frozen plan commit's parent is not a verified
  integrated target-branch revision
- **THEN** delivery stops before freeze or execution without deriving policy
  selection from that unintegrated contract

#### Scenario: Goal-aligned contributor-contract change
- **WHEN** an implementation changes an `AGENTS.md`, `CLAUDE.md`, or a file the
  integrated contributor contract explicitly designates as a contributor contract,
  directly or through a designated child-contract index, and the path is declared in
  the approved plan's contributor-contract path set
- **THEN** delivery treats that change as ordinary implementation work when it remains
  within the approved goal and its acceptance evidence
- **AND** an independent reviewer determines whether the contract change aligns with
  that goal; no separate operator confirmation or notification is required for an
  aligned change
- **AND** the changed file cannot select, disable, or alter policy for that same frozen
  plan, whose policy remains derived from the integrated plan parent
- **AND** any unintegrated contributor-contract edit, whether working-tree or
  committed, is inert for the current change through integration: its authority,
  review, commit, and continuation rules remain those of the integrated plan parent
  and approved frozen plan, and it becomes effective for later changes only after integration
- **AND** uncertain alignment, a material scope or authority expansion, safety or
  security impact, an external write, dependency conflict, or contradictory evidence
  stops for operator disposition

#### Scenario: Undeclared contributor-contract path
- **WHEN** implementation proposes a contributor-contract edit outside the approved
  plan's declared contributor-contract path set
- **THEN** delivery stops for operator disposition even if a reviewer considers it goal-aligned
- **AND** merely mentioning an ordinary file, such as README, does not designate it as
  a contributor contract

#### Scenario: Inspect or restricted execution
- **WHEN** the operator requests inspect-only assessment or excludes commits
- **THEN** inspect performs no mutations and a no-commit execution preserves its uncommitted boundary without claiming a clean candidate
- **AND** ambiguous selection, missing approval or conflicting ownership blocks execution rather than creating replacement work

#### Scenario: Explicit terminal delivery
- **WHEN** the operator sends `/openspec-delivery finish <name>` under the adopted contract
- **THEN** the agent resumes that candidate's protected publication, integrated verification, factual receipt/archive closure, acceptance-bound issue closure and clean-worktree retirement automatically
- **AND** changed candidates require renewed gates/review, already merged implementation is not replayed, and branch deletion, bypass, release or another change remains unauthorized

## ADDED Requirements

### Requirement: Delivery policy selection
Delivery SHALL resolve optional policies from the integrated contributor contract,
own their freeze/continuation gates, and delegate process/review protocols to the
orchestration package. It SHALL retain single-group behavior unless continuous-goal
is selected and SHALL NOT proceed without a selected policy's required package.

#### Scenario: Selected policy behavior
- **WHEN** the integrated contributor contract selects continuous-goal continuation
  and the operator invokes `/openspec-next` without a narrower restriction
- **THEN** delivery starts the selected continuation policy within the invocation's
  existing authority; otherwise single-group behavior remains the default
- **AND** a selected pre-execution-review policy requires the retained independent
  matching planning review before execution-plan acceptance and execution
- **AND** delivery owns that stop and the continuation contract, while the
  orchestration package owns process execution and the review protocol

#### Scenario: Missing selected policy package
- **WHEN** a selected policy's required package is unavailable
- **THEN** delivery stops before freeze or execution without substituting a policy

#### Scenario: Routine correction during delivery
- **WHEN** a gate or independent review reports an in-scope repairable issue
- **THEN** delivery keeps the current group incomplete while the orchestrator uses
  *Orchestrator-owned correction loop* and *Role ownership* in the orchestration contract
- **AND** no later group advances, no failed gate is waived, and no operator prompt
  is required merely to approve a correction already within the grant
- **AND** material decisions, native human waits, identity failures and budget
  exhaustion remain stop boundaries under that contract

### Requirement: Minimum outcome task authoring
Projects adopting this workflow SHALL author the fewest goal-oriented tasks needed
to deliver the complete agreed outcome without weakening scope, safety, acceptance
evidence, or required authority/ownership boundaries. They SHALL split only when a
necessary dependency, authority, ownership, safety, or independently verifiable
delivery boundary requires it, not to prescribe implementation steps. There SHALL
be no fixed task-count target.

#### Scenario: One coherent outcome
- **WHEN** one task can deliver and verify the complete bounded outcome within
  the approved scope, budget, and stop conditions
- **THEN** the author uses that one task rather than creating a procedural checklist
- **AND** files, functions, commands, agent roles, and routine coding/test/docs steps
  do not by themselves justify additional tracked tasks
- **AND** the agent chooses and adapts its working approach without creating a
  second mutable progress tracker

#### Scenario: Necessary outcome boundary
- **WHEN** combining work would obscure a required dependency gate, authority,
  ownership, safety, or independently verifiable delivery boundary
- **THEN** the author adds only the task boundaries needed to preserve it and
  states the material reason for the split
- **AND** fewer checkboxes never justify dropped requirements, weaker verification,
  unbounded work, or bypassing approval or independent review
- **AND** each outcome includes the tests and documentation it needs; a final
  checkpoint covers cross-outcome integration, not deferred basic quality work

#### Scenario: Reusable authoring instructions
- **WHEN** a project authors or revises an unfrozen plan under its adopted workflow
  version containing this rule
- **THEN** its documented OpenSpec `rules.tasks`, SDLC, and contributor guidance
  carry the rule into task generation and planning review
- **AND** adopting that workflow version includes this authoring rule without a
  separate per-change opt-in; already-approved frozen plans are not automatically
  rewritten or refrozen
- **AND** native checkbox syntax and dependency ordering are preserved without
  patching upstream OpenSpec or treating installation as policy adoption
- **AND** verification checks generated instructions and representative plans for
  unnecessary fragmentation and harmful over-merging; strict CLI validation alone
  is not claimed to prove semantic task minimality