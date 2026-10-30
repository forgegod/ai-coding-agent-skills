# Documentation issue

Create this issue only when the operator uses the short invocation. Specification
does not wait for it. Displaying the line below does not create an issue.

Hermes prompt:

```text
/openspec-change-integration document <name>
```

The skill applies the rest. Link `openspec/changes/<name>/` by that change
name. Do not generate another suffix. Use the body below. Do not copy `tasks.md`. Do
not implement, commit, open a pull request, or assign the issue to acquire a
lock. Stop after the issue readback. The operator does not repeat those
constraints.

Other hosts use their own spelling of this skill. The action is the same.

## Identity

The full OpenSpec change name is the identity. Link `openspec/changes/<name>/`
from the issue, the pull request and the evidence. Resolve a short slug using
`naming.md` and ask on ambiguous matches. Documentation never generates a suffix
or creates a missing change. Before proposing new work, inspect visible matching
requests and adopt the existing change when it is the same work. A second name
does not make a duplicate request independent; a local search cannot discover
every unpushed proposal in another clone.

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

## Required body

Empty is not "no risk". Use `not applicable` with a reason, or mark the fact
unknown. An agent may draft impact from inspected scope and must label
assumptions. It must not invent user counts, fabricate approval, or treat its
own risk opinion as human acceptance. Unknown material risk blocks execution
of the affected scope until a person disposes of it. A low-risk documentation
change still uses this body; concise justified answers are enough.

```markdown
## Identity and request
- OpenSpec change: openspec/changes/<name>/
- Change type: <feature | bug | security | refactor | dependency | infrastructure | documentation>
- Change procedure: <normal | approved standard change | emergency>
- Requester: <person or team>
- Responsible operator: GitHub Assignees, one accountable person
- Request / problem / justification:
- Desired outcome and acceptance criteria:
- In scope / explicitly out of scope:
- Related requests or dependencies: <links>
- Closure boundary: <source integration | deployment and operational validation>

## Impact and estimated blast radius
- Affected assets, services or components:
- Environments, regions, tenants or user groups:
- Data categories; personal or regulated data:
- Access, privilege, trust-boundary or external-interface changes:
- Dependencies and plausible downstream effects:
- Failure scenarios and worst credible consequence:
- Disruption, data-loss or corruption exposure:
- Expected blast radius, with assumptions:
- Unknowns:

## Risk assessment and treatment
- Risk method: <link, or qualitative low/medium/high/unknown if no method is adopted>
- Confidentiality impact and rationale:
- Integrity impact and rationale:
- Availability impact and rationale:
- Likelihood and inherent risk, with rationale:
- Mitigations or compensating controls:
- Residual risk and limitations:
- Risk owner: <role; not this agent>
- Applicable policy or SoA reference: <link or not applicable, with reason>

## Verification, rollout, and recovery
- Verification approach: <summary; tasks stay in tasks.md>
- Required security or privacy review: <link or not applicable, with reason>
- Rollout and change dependencies:
- Abort triggers:
- Rollback or forward recovery; owner; whether it is reversible:
- Stakeholders to notify:

## Authorization and review evidence
- Assessment revision being approved: <permalink of this body>
- Plan or execution approval: <actor, time, scope, link; do not invent>
- Required risk-owner approval: <link or not applicable, with reason>
- Independent reviewer verdict: <reviewer that did not implement the candidate, exact SHA, link>
- Conditions or reassessment triggers:

## Outcome
- Integrated revision and retained gate evidence:
- Pull request and candidate SHA:
- Actual impact or deviation from the estimate:
- Follow-up, with owner:
- Closure decision: <actor, time, result>
```

Reassess if scope, data, permissions, rollout or dependencies change. Do not
keep an old approval as if it covered the new body. Public text must not
contain secrets, exploit detail, or customer data.

A self-assigned operator does not accept their own high-risk deployment.
Segregation follows the adopting ISMS. An emergency path still needs identity,
a named authorizer and a retrospective deadline from policy, not an agent
invented bypass.
