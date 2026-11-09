---
metadata_version: 1
artifact: spec
capability: openspec-integration
---
# openspec-integration Specification

## Purpose
Defines the current OpenSpec integration contract for controlled change delivery.

## Requirements

### Requirement: Explicit workflow authority
The integration package SHALL act only for explicitly adopted OpenSpec scope and
SHALL NOT create a second CAP/CHG task tracker or infer authority from installation.

#### Scenario: Untransferred project
- **WHEN** a project already keeps older installed skills or records
- **THEN** this distribution does not transfer that project or rewrite those records

#### Scenario: Planning-only request
- **WHEN** the operator approves only planning
- **THEN** no executor, Git publication, integration or task execution is authorized

### Requirement: Immutable review identity
The guard SHALL bind approval to committed planning content and review to an exact
committed candidate, while permitting only task-checkbox progress changes to preserve
the plan digest.

#### Scenario: Changed task definition
- **WHEN** a task or gate changes after plan approval
- **THEN** the previous plan digest is rejected

#### Scenario: Changed candidate
- **WHEN** the candidate SHA changes after review
- **THEN** the previous review cannot satisfy the candidate gate

### Requirement: Truthful integrated evidence
The guard SHALL require successful exact-revision gate evidence, candidate integration
ancestry and conservative freshness before accepting a post-merge receipt structurally.

#### Scenario: Independent clone
- **WHEN** the required Git objects are present in another clone
- **THEN** evidence validation does not require a shared Git common directory

#### Scenario: Failed or stale verification
- **WHEN** a gate failed or unverified product content changed after verification
- **THEN** receipt validation fails without repairing or discarding work

### Requirement: Isolated package choice
The distribution SHALL publish the OpenSpec companion packages and the separate
orchestration package only, and SHALL NOT publish a second phase skill set.

#### Scenario: Catalog inventory
- **WHEN** the distribution is built
- **THEN** the packages are openspec-delivery, openspec-next, git-commit-message, capability-wireframes, and autonomous-implementation-review

#### Scenario: OpenSpec bundle inventory
- **WHEN** the OpenSpec plugin ZIP is built
- **THEN** it contains delivery, next-step execution, commit and wireframe packages only, byte-for-byte

### Requirement: Documentation records are not the task authority
GitHub issues and pull requests SHALL be documentation and review records. They
SHALL NOT be the specification authority, a task list, or an admission lock.
Independent OpenSpec changes MAY be specified concurrently.

#### Scenario: Offline or unauthorized issue creation
- **WHEN** local specification proceeds without authority or connectivity for its required issue
- **THEN** the proposal keeps `github_issue: null` and remains pending before plan approval, without creating a pull request or fabricating an issue

#### Scenario: Overlapping specifications
- **WHEN** two active changes modify the same capability spec
- **THEN** merge waits for explicit reconciliation

### Requirement: Risk-focused documentation issue
For projects selecting proposal-time documentation, an authorized new proposal
SHALL create or reuse one verified issue before approval. The issue body SHALL
follow the risk-focused template and SHALL NOT claim ISO/IEC 27001 conformity.
Installation and metadata migration SHALL NOT grant issue-write authority.

#### Scenario: Documented request
- **WHEN** the operator sends the documentation prompt
- **THEN** the issue records impact and authorization fields, and does not copy `tasks.md`

### Requirement: Change name is the identity
The full OpenSpec change directory name SHALL identify the change across the issue,
pull request and evidence. Projects selecting the naming convention SHALL generate
`<slug>-<lowercase-ulid>` once at creation, automatically from a short proposal
request. The authorized branch SHALL be `change/<full-name>` through specification,
implementation and review. Existing names SHALL remain valid and unchanged.

#### Scenario: Short proposal request
- **WHEN** the operator requests `/openspec-propose add-dark-mode` for a new change
- **THEN** the agent generates the suffix before OpenSpec scaffolding and reuses the returned name without requiring the operator to type a ULID
- **AND** naming alone does not authorize writes; the selected proposal invocation includes isolated setup, not implementation, commits or publication

#### Scenario: Resume and ambiguous selection
- **WHEN** an operator resumes by a short slug or current change context
- **THEN** the agent resolves the existing full name without generating another suffix
- **AND** ambiguous matches require operator selection, never newest-change guessing

#### Scenario: Read-only naming helper
- **WHEN** the helper generates an identity or resolves active change directories
- **THEN** it emits the full name, path and branch without writing files, refs or installed profiles
- **AND** malformed input, repeated options and symlinked discovery paths are refused

#### Scenario: Second clone
- **WHEN** another checkout already edits the same capability spec
- **THEN** work stops for reconciliation even if a new change name could be chosen

#### Scenario: Durable reference across archive movement
- **WHEN** a ticket or another document refers to an OpenSpec change
- **THEN** it cites the full change name and optional artifact role, not the moving active/archive path
- **AND** locating an archived package preserves that identity and does not invent a new name or claim that an active-only helper searches archives

#### Scenario: Proposal-time documentation
- **WHEN** the documentation issue is created during a proposal
- **THEN** it records the request, blast radius, risk and authorization boundary without prospective review, merge or closure evidence
- **AND** any later approval binds retained input revisions rather than treating an editable issue body as immutable

### Requirement: Independent reviewer before merge
A pull request SHALL NOT be merged, and its branch SHALL NOT be deleted, until
a reviewer that did not implement the candidate has reviewed that exact SHA and
findings are dispositioned.

#### Scenario: Implementer reviews itself
- **WHEN** the only available reviewer is the session that implemented the candidate
- **THEN** merge and branch deletion stop

### Requirement: Queryable identity metadata
Proposals, designs, task files and current specs SHALL use the versioned YAML
frontmatter contract. Delta specs SHALL remain native Markdown without frontmatter
because pinned upstream strict validation rejects it; their identity is path-derived.
Metadata SHALL describe identity and navigation, not task progress, approval or
PR state, and SHALL remain included in the existing planning digest.

#### Scenario: Stable proposal association
- **WHEN** the proposal's documentation issue is read back successfully
- **THEN** its full URL is recorded only on the proposal and remains unchanged by default
- **AND** correcting metadata after plan approval requires reapproval

#### Scenario: Archive and current spec identities
- **WHEN** OpenSpec moves a completed change to its archive and updates current specs
- **THEN** archived artifacts retain their original change identity and current specs carry only their capability identity
- **AND** a same-files vault can query the new location without a second mutable tracker

#### Scenario: Invalid metadata
- **WHEN** metadata has duplicate YAML keys, wrong types, unsupported fields or identities inconsistent with its native path
- **THEN** the read-only metadata check fails without repairing files or bypassing upstream validation

### Requirement: Short bounded delivery invocations
Projects explicitly adopting the invocation contract SHALL let the agent perform
workspace setup, bootstrap, verification, task updates and previewed autonomous
local commits for one approved task group without repeated plumbing prompts.
Operator restrictions SHALL override defaults and remain effective on continuation.

#### Scenario: Next approved local group
- **WHEN** the operator sends `/openspec-next` in verified current-change context
- **THEN** the agent resolves actual tasks, approval, dependencies and interrupted work and advances one eligible unfinished group
- **AND** it does not infer plan approval, perform remote writes or start another change

#### Scenario: Inspect or restricted execution
- **WHEN** the operator requests inspect-only assessment or excludes commits
- **THEN** inspect performs no mutations and a no-commit execution preserves its uncommitted boundary without claiming a clean candidate
- **AND** ambiguous selection, missing approval or conflicting ownership blocks execution rather than creating replacement work

#### Scenario: Explicit terminal delivery
- **WHEN** the operator sends `/openspec-delivery finish <name>` under the adopted contract
- **THEN** the agent resumes that candidate's protected publication, integrated verification, factual receipt/archive closure, acceptance-bound issue closure and clean-worktree retirement automatically
- **AND** changed candidates require renewed gates/review, already merged implementation is not replayed, and branch deletion, bypass, release or another change remains unauthorized

### Requirement: Recoverable isolated workspace lifecycle
The delivery package SHALL supply read-only creation, reuse, location and retirement
previews, leaving execution and exact readback to the authorized orchestrator.

#### Scenario: Automatic workspace preparation
- **WHEN** authorized setup begins from a captured clean base without collisions
- **THEN** the helper emits exact worktree creation arguments outside existing checkouts without writing files or refs
- **AND** preparation precedes parallel proposal scaffolding and bootstrap uses the project's actual documented recipe

#### Scenario: Resume and retirement
- **WHEN** the selected branch already has one verified registered dedicated worktree
- **THEN** the agent reuses it and preserves dirty or interrupted work rather than resetting or creating a competitor
- **AND** removal requires exact clean head and reachable closure evidence, ignored-file inspection, no force and verified absence; branch refs remain recoverable

### Requirement: Restricted Git child environment
The evidence and workspace helpers SHALL read and forward inherited environment
values only from a documented execution allowlist. They SHALL refuse inherited
topology and command-config injection overrides before launching Git, even when
those overrides have empty values.

#### Scenario: Forbidden override presence
- **WHEN** any previously refused Git override is present, including an empty value or a Windows case variant
- **THEN** either helper fails before launching Git without reading the override value or silently dropping it and continuing

#### Scenario: Unrelated inherited values
- **WHEN** the inherited environment includes unrelated credential or execution-injection values
- **THEN** neither helper reads those values or forwards them to a Git child
- **AND** synthetic getter tests and actual child-environment tests demonstrate that restriction without accessing real credentials

#### Scenario: Platform-specific names
- **WHEN** a supported platform resolves inherited allowlisted names
- **THEN** Windows matching is case-insensitive and ambiguous aliases are refused; Linux and macOS matching is case-sensitive
- **AND** simulated Windows matching alone does not establish native Windows support

### Requirement: Explicit Git configuration compatibility
Both helpers SHALL retain present `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM` and
`GIT_CONFIG_NOSYSTEM` values as trusted configuration selectors. Absent selectors
SHALL remain absent. Configuration selection SHALL NOT permit topology or
command-config injection overrides or be described as a sandbox.

#### Scenario: Explicit fixture configuration
- **WHEN** isolated fixtures select synthetic global/system configuration or disable its use through the documented selectors
- **THEN** both helpers preserve those values, including empty values, for Git to interpret rather than silently reverting to host configuration

#### Scenario: Default configuration discovery
- **WHEN** configuration selectors are absent
- **THEN** both helpers leave them absent and retain documented runtime/home configuration discovery inputs
- **AND** executable search paths, home/config locations and Git configuration remain explicit trust inputs

### Requirement: Preserved Git integrity controls
Environment hardening SHALL preserve fixed replacement-object and optional-lock
controls, fsmonitor neutralization, and existing topology, identity, ancestry and
dirty-work protections in both helpers. It SHALL NOT turn a refusal into permission
to repair, discard or redirect repository state.

#### Scenario: Conflicting inherited controls
- **WHEN** inherited values conflict with replacement-object or optional-lock safety settings or the fixed output locale
- **THEN** Git children receive `GIT_NO_REPLACE_OBJECTS=1`, `GIT_OPTIONAL_LOCKS=0` and `LC_ALL=C` independently of those values, with fsmonitor still neutralized

#### Scenario: Existing integrity failure
- **WHEN** a repository fails an existing replacement-ref/graft, topology, identity, ancestry or dirty-work check
- **THEN** the relevant helper continues to refuse the operation and preserves the work

### Requirement: Equivalent workspace path rejection
Workspace validation SHALL reject C0 control characters and DEL without broadening
or weakening the existing character restriction. Absolute, normalized and canonical
path requirements, symlink refusal and workspace-overlap checks SHALL remain intact.

#### Scenario: Control-character equivalence
- **WHEN** every UTF-16 code unit and representative multicharacter Unicode paths are compared against the original character restriction
- **THEN** the replacement predicate has identical results, rejecting character codes below 32 or equal to 127
- **AND** other path-validation failures remain failures independently of the character predicate

### Requirement: Complete-package security acceptance
Hardening acceptance SHALL require safe community verdicts for all five complete
packages using the unchanged trusted scanner with negative controls. It SHALL NOT
rely on exclusions, suppressed findings, bypass flags or a prototype-only scan.
Authorization wording changes SHALL preserve existing side-effect boundaries.

#### Scenario: Safe prototype but blocked distribution
- **WHEN** a scratch prototype scans safe but a complete package remains blocked
- **THEN** the security gate and hardening acceptance remain incomplete, and historical failures are retained rather than rewritten

#### Scenario: Clarified authorization wording
- **WHEN** scanner-flagged issue-authorization prose is clarified
- **THEN** explicit project adoption and bounded issue-write authority remain required, and installation or a planning-only request grants no additional side effects

#### Scenario: Candidate acceptance evidence
- **WHEN** a hardened candidate is presented for completion
- **THEN** its complete package inventory, affected versions/documentation, native Linux/macOS/Windows results, full-package scanner output and independent exact-candidate review are verified
- **AND** missing native platform evidence or unresolved findings block completion rather than being replaced with simulated results or release claims
