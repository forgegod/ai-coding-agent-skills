---
metadata_version: 1
artifact: proposal
change: profile-oriented-autonomous-orchestration-01m7d0f7jvv3wyg9ng26fq2w99
github_issue: https://github.com/forgegod/ai-coding-agent-skills/issues/21
---
# Profile-oriented autonomous orchestration

## Why

The local unpushed profile-preparation commit moved Hermes queue/model setup out
of live Herdr panes, but it was made before an ordinary OpenSpec change existed.
The current orchestration package also supports only operator-selected existing
Herdr panes and a narrow Claude Code path. It does not define on-demand pane
creation, a host-neutral role contract for the supported coding clients, or an
outcome-oriented unit above fine-grained checklist steps.

## What Changes

- Establish one OpenSpec change that records and validates the profile-oriented
  orchestration work before it is considered for release; do not represent the
  already-created local commit as approved implementation evidence.
- Add an `autonomous-role-orchestration` capability defining an outcome-oriented
  task-group contract: an approved group has an observable delivery goal,
  acceptance evidence, scope/non-goals, one writer, an independent reviewer, and
  a stop boundary. Native `tasks.md` remains the sole mutable progress authority.
- Establish *Minimum outcome task authoring* as reusable OpenSpec authoring policy:
  use the fewest goal-oriented tasks that preserve the complete agreed outcome,
  verification, and authority/safety boundaries, rather than a fixed task count or
  a prescribed implementation checklist. Carry it into generation and planning review.
- Keep `openspec-delivery` as the host-neutral delivery lifecycle rather than a
  separate operator workflow. Under a project-selected continuous-goal policy,
  the orchestrator resolves and advances eligible approved groups without asking
  the operator to repeat a `next` command, following the canonical continuation
  boundaries in the OpenSpec integration contract.
- When a qualified worker exhausts its Hermes turn budget, let the orchestrator
  continue it autonomously only after it verifies concrete on-track progress, a
  bounded remaining action, unchanged goal/scope/authority, and no native prompt,
  failed gate, drift, or contradictory evidence. An allowed continuation is one
  fresh bounded same-role packet through the qualified adapter; it never uses a
  bare chat `continue` or resumes a broader delivery goal.
- Select the pre-execution-review and continuous-goal policies for future changes
  through this repository’s updated `AGENTS.md`; neither retroactively widens
  authority for this change.
- Define a host-neutral terminal adapter contract for Hermes and candidate
  Claude Code, Codex, Grok Build, OpenCode, Kilo, and Pi adapters, supported only
  after qualification. Each adapter must use its own verified
  launch-time configuration mechanism (CLI flags, explicit profile/config path,
  or narrowly scoped environment), separate process/session identity, and
  read-only reviewer protocol. Reject implicit fallback between hosts, clients,
  profiles, models, or permission modes.
- Launch every implementation/review worker, including Hermes, as a qualified
  native terminal application under adapter-owned process/session supervision.
  Herdr is not a launch prerequisite; it is an optional qualified interaction
  surface. Do not use `delegate_task` or native subagents as role executors.
- Replace the supported Claude `code-tab-phase-roles` subagent route with the
  standalone Claude CLI adapter only when qualified; otherwise record Claude Code
  unsupported and document only other qualified choices without automatic fallback.
  Update its source references, templates,
  documentation and routing tests without modifying installed project agent files.
- Automatically expose the same waiting worker session through its prequalified
  interaction route when it needs human input, without a separate chat notification
  or asking the operator to open it. Exposure never approves or bypasses the native
  decision. An unavailable or unverifiable route preserves state and blocks progress.
- Support one qualified coding client for all roles in distinct sessions,
  sequentially when necessary, as well as mixed-client operation. Let the operator
  select client/model per role within project constraints; different clients or
  models are not mandatory unless project policy requires diversity.
- Add a bounded automatic review-feedback disposition rule: the orchestrator
  applies grounded, non-contradictory planning corrections automatically for a
  bounded number of converging routine correction/review cycles (see design/spec),
  but stops for the canonical Operator disposition required classes,
  non-convergence, or unrecoverable review-count continuity in the
  autonomous-role-orchestration contract.
- Make operator-goal continuity the pre-freeze control boundary: ordinary planning
  drift and review evidence refresh automatically restart the affected validation
  and review step; they never become a new operator decision, a new task, or a
  reason to narrow the operator-requested goal.
- Treat Hermes skill frontmatter configuration as declarative configuration input,
  not a profile switch or launcher. Hermes profile/client selection must remain an
  explicit launch binding; other clients require their own documented launch
  adapters rather than simulated Hermes profiles.
- Make the published orchestration core agent-agnostic: Hermes is one client adapter, not a
  prerequisite. The core enforces outcome, authority, task-progress, and review
  within delivery-owned continuation; independently qualified adapters bind those rules to Claude
  Code, Codex, Grok Build, OpenCode, Kilo, Pi, or another compatible client.
- Require an independent, read-only approach review of the canonical *Complete
  planning input inventory* before the plan is frozen for execution, including
  the repository OpenSpec configuration. The orchestrator incorporates accepted findings, revalidates the
  amended draft, and only then presents a specific plan SHA/digest for operator
  approval.
- Qualify each client's unattended-to-interactive route before launch, including
  same-session identity, native decision delivery, safe view creation/attachment,
  and failure preservation. Never assume Herdr can adopt an arbitrary running process.
- Require final operator documentation for every qualified client, covering exact
  supported role/client/model configuration surfaces, scope and precedence,
  effective-setting verification, one-client and mixed-client examples, model
  availability, automatic interaction exposure, and migration from retired routes.
- Update package docs, support-file inventories, tests, versions, and release
  verification only where the final host contracts require it.

## Capabilities

### New Capabilities
- `autonomous-role-orchestration`: profile-aware, outcome-oriented role dispatch
  and independent review across explicitly selected supported hosts.

### Modified Capabilities
- `openspec-integration`: delivery enforces the selected pre-execution review
  policy and continuous-goal continuation before execution, and routes to the
  orchestration review procedure without becoming a host transport specification.
  Adopting the updated workflow also includes minimum-outcome task authoring for
  new or revised unfrozen plans, without rewriting already-approved frozen plans.
  Every project adopting the invocation contract also receives integrated-plan-parent
  verification. Goal-aligned contributor-contract changes are ordinary implementation
  work whose alignment is independently reviewed; they do not require a separate
  operator checkpoint or notification. Single-group invocation authority remains the
  default without the optional policies, but does not bypass the remaining integrity
  guards.

## Impact

Primary scope is `skills/autonomous-ai-agents/autonomous-implementation-review/`,
`skills/software-development/openspec-delivery/`,
`skills/software-development/openspec-next/`, their role/delivery references,
README, SDLC/install documentation, package inventories, and synchronized tests.
Repository `openspec/config.yaml` also needs a policy-neutral context update before
plan freeze under a separate planning-write grant; it is a frozen digest input and
cannot be deferred to implementation or left stale after policy integration.
That grant also covers the task-authoring rule in `rules.tasks`. This finalized
draft records the resulting reviewed config bytes as a pre-freeze prerequisite;
any later config change requires renewed validation, review, and plan freeze.
Every client adapter is an external prerequisite and must prove its own exact
versioned interface before it is advertised. A Grok Bot chat surface is not an
execution host without a tested local CLI or supported control API. Grok Bot
remains unsupported unless a future change qualifies an executable/control
protocol. No adapter may claim that Hermes profiles configure another client, that
an interaction view starts a second worker, or that a Herdr pane label proves session identity.

The local `5f48fbe` commit is input to this draft, not a valid implementation
checkpoint: it predates this plan, has no plan digest or approval, and currently
sits on local `main`. The release path resets the named draft branch to the
pre-change base, freezes and obtains operator approval of the plan, then
reconstructs the work and obtains an independent candidate review. This proposal
does not authorize a reset, force
push, cherry-pick, release, profile modification, issue creation, or publication.
`github_issue` is the verified proposal-time documentation record. It does not
approve the plan, authorize execution, or become a second task list.