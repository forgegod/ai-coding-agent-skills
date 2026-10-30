## ADDED Requirements

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
- **THEN** the packages are openspec-change-integration, git-commit-message, capability-wireframes, and autonomous-implementation-review

#### Scenario: OpenSpec bundle inventory
- **WHEN** the OpenSpec plugin ZIP is built
- **THEN** it contains integration, commit and wireframe packages only, byte-for-byte

### Requirement: Documentation records are not the task authority
GitHub issues and pull requests SHALL be documentation and review records. They
SHALL NOT be the specification authority, a task list, or an admission lock.
Independent OpenSpec changes MAY be specified concurrently.

#### Scenario: Specification without a ticket
- **WHEN** an operator authorizes an OpenSpec change and does not ask to document it
- **THEN** specification proceeds without creating an issue or pull request

#### Scenario: Overlapping specifications
- **WHEN** two active changes modify the same capability spec
- **THEN** merge waits for explicit reconciliation

### Requirement: Risk-focused documentation issue
When the operator asks to document a change, the issue body SHALL follow the
risk-focused template and SHALL NOT claim ISO/IEC 27001 conformity.

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
- **AND** naming does not authorize branch creation, implementation, commits or publication

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

### Requirement: Independent reviewer before merge
A pull request SHALL NOT be merged, and its branch SHALL NOT be deleted, until
a reviewer that did not implement the candidate has reviewed that exact SHA and
findings are dispositioned.

#### Scenario: Implementer reviews itself
- **WHEN** the only available reviewer is the session that implemented the candidate
- **THEN** merge and branch deletion stop
