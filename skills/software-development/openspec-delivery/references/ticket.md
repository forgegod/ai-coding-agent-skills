# Documentation issue

Create or reuse one issue during an authorized new proposal when the target
project explicitly selects proposal-time issue creation. Otherwise require the
short invocation below. Local drafting can proceed offline, but a required issue
link must be verified before plan approval. Installation or metadata migration
never grants a ticket write. Displaying the line below does not create an issue.

Hermes prompt:

```text
/openspec-delivery document <name>
```

The skill applies the rest. Identify the change by its full name, including the
existing ULID where present, not its current directory. Do not generate another
suffix or copy `tasks.md`. Create or reuse the documentation issue, read it back,
record its verified URL in the proposal when that local write is authorized, and
stop. Do not implement, commit, open a pull request or assign the issue to acquire
a lock. The operator does not repeat those constraints.

Other hosts use their own spelling of this skill. The action is the same.

## Stable proposal link

Confirm the intended GitHub repository; do not assume a fork's remote is the
documentation repository. Search for the exact full change name before creating
an issue. Reuse one confirmed matching issue without rewriting its body by
default. Multiple matches or conflicting ownership require operator selection.
If the write outcome is unknown, read back before retrying. Stop on repository,
ownership or permission ambiguity. An existing issue update needs its own authority.
Record the read-back full issue URL as `github_issue` on `proposal.md` when the
project uses that frontmatter convention. A missing or unauthorized issue stays
`null`, never a synthetic URL. Keep this identity unchanged by default; the issue
body can receive separately authorized corrections or risk reassessment.

PRs link the issue in GitHub; no PR metadata or separate Markdown index is needed.
Do not copy the URL into every artifact. Metadata is not status or approval.
Frontmatter edits remain covered by the plan digest and need reapproval after
plan approval. Specification and native task progress remain OpenSpec-owned.

## Identity

The full OpenSpec change name is the stable reference in issues, pull requests,
dependencies and evidence. Add an artifact role when needed, for example
`proposal of <full-change-name>`. Archival changes its location, not this identity.
Do not use an active-directory path or a guessed archive path as the reference.
The repository identity supplies context when referencing another project.

Resolve a short slug using `naming.md` and ask on ambiguous matches. That helper
searches active changes only; an archived reference requires inspecting the
archive for the same exact name. Never interpret a missing active match as
permission to create another change. Duplicate active/archive identities need
reconciliation. Documentation never generates a suffix or creates a missing
change. Before proposing new work, inspect visible matching requests; a local
search cannot discover every unpushed proposal in another clone.

An optional clickable source link must be a verified commit permalink to an
already published artifact. It supplements the full name and describes that
revision, not the latest location. If the proposal is local-only, the name is
enough; do not invent a URL, push merely to obtain one, or make a relative path
in a GitHub issue look like a working repository link.

Two operators in two clones can still edit the same capability spec. That
overlap is stopped by comparing the specs and reconciling before either change
merges. Assignees, comments and refs are not a lock.

## ISO/IEC 27001 limit

The body supports change-control evidence for confidentiality, integrity and
availability, in the shape described by public Annex A 8.32 guidance:
impacts, authorization, testing, communication, fallback and records. It does
not establish ISO/IEC 27001 conformity, certification, or a complete control
mapping. This package has not audited the licensed standard or the adopting
organization's ISMS or Statement of Applicability. Do not write "ISO compliant"
on the issue. The ISMS owner decides applicability, approvers, retention and
confidentiality.

Do not install this body as `.github/ISSUE_TEMPLATE/` unless the operator
authorizes that repository change.

## Proposal-time body

Empty is not "no risk". Use `not applicable` with a reason, or mark the fact
unknown. An agent may draft impact from inspected scope and must label
assumptions. It must not invent user counts, fabricate approval, or treat its
own risk opinion as human acceptance. Unknown material risk blocks execution
of the affected scope until a person disposes of it. A low-risk documentation
change still uses this body; concise justified answers are enough.

```markdown
## Identity and request
- OpenSpec change: <full-change-name>
- Repository: <confirmed owner/repository>
- Proposal reference: <full-change-name>, proposal; <verified commit permalink if published, otherwise local-only>
- Change type: <feature | bug | security | refactor | dependency | infrastructure | documentation>
- Change procedure: <normal | approved standard change | emergency>
- Request and justification: <problem, affected people, expected benefit>
- Scope and exclusions: <concise summary; proposal and delta specs remain authoritative>
- Expected outcome and acceptance boundary: <summary; source integration or deployment/operational validation>
- Dependencies: <full change names and existing issue links, or none with rationale>

## Impact and estimated blast radius
- Affected components, environments and people: <bounded extent; label estimates>
- Data and trust boundaries: <personal/regulated data, permissions, external interfaces>
- Worst credible failure and blast radius: <disruption, corruption, loss and downstream effects>
- Assumptions and unknowns: <include facts needing confirmation>

## Risk assessment and treatment
- Confidentiality: <impact and rationale>
- Integrity: <impact and rationale>
- Availability: <impact and rationale>
- Likelihood and risk: <project method; if absent, qualitative estimate with rationale, not approval>
- Mitigations and residual risk: <controls, limitations and unresolved questions>
- Applicable policy / SoA: <reference or not applicable with reason>

## Verification and recovery plan
- Verification: <required gates and security/privacy reviews; summary, not a task list>
- Rollout and abort conditions: <approach and signals that stop it>
- Recovery: <rollback or forward repair, reversibility and responsible person/role>
- Communication: <affected stakeholders and notification needs>

## Ownership and authorization boundary
- Requester and accountable operator: <confirmed people/roles, otherwise unknown; no automatic assignment>
- Risk owner / required approvers: <project-defined people/roles, otherwise unresolved>
- Authorization: <what is currently authorized, by whom and from which real instruction; otherwise pending>
- Reassessment triggers: <scope, data, permissions, dependencies or rollout changes>
```

This is a proposal-time risk snapshot, not a second specification or a live
progress form. Keep all headings; use concise justified answers for small changes.
Do not prepopulate passing reviews, merge SHAs, deployed outcomes or closure
decisions. Missing approval is `pending`, not implied by issue creation.

## Later evidence, only after the events occur

The stable issue URL does not require a frozen body, but updates remain separately
authorized. Prefer links from the actual PR and later factual comments over
continually copying state into the initial request. A comment is still editable;
do not describe an issue/comment URL alone as immutable evidence.

An editable issue body is not an immutable approval snapshot. Approval must name
the exact plan commit/digest and a retained revision of any external risk input
that it depends on. Use the project's evidence-retention mechanism, not a
fictional "permalink of this body". If that revision cannot be retained, report
the approval evidence gap instead of claiming review binding.

After they actually occur, separately authorized records can link the independent
review of the exact candidate SHA, the real PR, integrated revision and retained
gate evidence, deviations, and the human closure decision. These belong to the
existing review/receipt workflow; do not add PR fields to proposal frontmatter.

Reassess if scope, data, permissions, rollout or dependencies change. Do not
keep an old approval as if it covered the new body. Public text must not
contain secrets, exploit detail, or customer data.

A self-assigned operator does not accept their own high-risk deployment.
Segregation follows the adopting ISMS. An emergency path still needs identity,
a named authorizer and a retrospective deadline from policy, not an agent
invented bypass.
