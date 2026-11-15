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

### Reconstruct from the exact pre-change integrated base

The reconstruction base is `ae6488e23414a07d12959bf22bcd283b84d9d8a3`, the
current `origin/main` revision that is an ancestor of local `850244e` and does
not contain `5f48fbe`. It retains the integrated PR #19/#20 work that a literal
parent-of-`5f48fbe` base would omit. The local `main` commits remain preserved
input until an operator explicitly authorizes history reconciliation.

The existing named change branch/worktree is a pre-freeze draft only. The declared
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
disposition. The plan parent remains the policy source for this plan, so a changed
contract cannot self-select or alter its own frozen policy. Any unintegrated
contributor-contract edit, whether working-tree or committed, is inert for this
change through integration: authority, review, commit, and continuation rules derive
only from the integrated plan parent and approved frozen plan. Independent candidate
review determines alignment, not effectiveness for the current change; the edit
becomes effective for later changes only after integration.
Before
freeze, an authorized proposal-time issue is created/read back and its URL is
bound in `proposal.md`; validation and an independent re-review then bind the
canonical *Complete planning input inventory*. The orchestrator captures the final
reviewed inventory bytes and hashes, including tracked `openspec/config.yaml` and
change-local artifacts, outside repositories and verifies that no other
change-owned work exists there. It records the full local `main` SHA, the named
branch tip, and stops unless every commit reachable from that branch tip is already
reachable from a ref the reset will not move; `5f48fbe` is separately retained by
local `main`, not described as a branch-tip commit. Before reset, it restores
`openspec/config.yaml` to the exact base blob, records that base-config hash as the
pre-reset expectation, and proves no staged or unstaged tracked changes exist;
otherwise it stops before reset. Under separately authorized branch-reset authority
it runs a hard reset of that same named draft branch to the exact base without
`git clean`. Immediately after that reset, the separately authorized pre-freeze
planning-write grant reapplies the externally captured reviewed config bytes and
only its invocation-summary context and `rules.tasks` update. The invocation
summary defers to the integrated contributor contract: single-group by default,
continuous-goal only when selected, with restrictions and inspect boundaries intact.
This wording must describe both policies without selecting one for this change.
The task rules express *Minimum outcome task authoring*, preserving native syntax,
dependency ordering, and verification while preferring the fewest complete outcomes
over the stock template's procedural examples. Neither update patches upstream
OpenSpec. Revalidate, refresh the complete input hashes, and independently
re-review after reapplying that config update.
Before the plan commit, the only tracked diff is that reviewed config update; the
only untracked paths are the change-local planning set plus
`evidence/approach-review.json` and `evidence/freeze-record.json`, captured externally
after their final writes. The plan commit has the exact base as its sole parent.
Its base-to-plan diff lists only the reviewed repository config, change-local set,
and those two evidence records; planning-file identity follows
the canonical *Review-record continuity* requirement.
The freeze record never contains its own hash; the external capture records hashes
for both evidence records and the planning set.
The freeze record retains the reviewed complete planning-input hashes and the
independent review reference. A refreeze creates a new plan identity and requires
the normal exact-plan approval before execution; it does not turn a goal-aligned
contract edit into a separate operator grant.
The plan is then approved before reapplying the profile-preparation implementation.
No new name, branch, or worktree is minted.

Alternative rejected: attach a new plan after the existing implementation and
mark it complete. That would preserve the unplanned execution order and make the
plan digest meaningless as an approval boundary.

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

Alternative rejected: let individual agents create or advance their own checklists.
That duplicates authority and makes an independent reviewer unable to identify the
actual completion boundary.

### Treat pre-freeze evidence as derived state, not operator work

Before freeze, artifact hashes, review records, validation captures, and review
rounds are derived evidence for the operator’s existing goal. A stale item causes
the orchestrator to refresh that item and its dependent review automatically. It
does not create a new task, require approval, or shrink the goal. Operator
interruption classes are defined canonically by the autonomous-role-orchestration
specification.

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
role identity and a report; it never owns Git or `tasks.md` writes.

Alternative rejected: call any available agent a worker. Names, models, imported
settings, profiles, and environment markers do not establish runtime, session,
permissions, or independent-review identity.

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
The policy-neutral repository OpenSpec context is prepared under the separate
pre-freeze grant above and included in the approved digest. Implementation verifies
it against the new `AGENTS.md` selection without editing it after freeze. All affected
guidance is synchronized in this change; no stale-context exemption or follow-up is used.

Within that contract, distinguish a group/authority budget from a worker iteration
cap. Exhausting the former stops advancement. A verified iteration cap may be
continued only once for that cap event, inside the current group and under the
unchanged outcome, acceptance evidence, scope, restrictions, and stop boundary.
Before continuation, the orchestrator retains evidence of on-track progress against
the group's acceptance evidence, identifies one unfinished action already inside that
group, and positively re-reads the worker identity. A native prompt, failed gate,
identity drift, contradictory evidence, a new stop boundary, a second exhaustion of
the same action, or an exhausted group/authority budget preserves state and stops
delivery. The worker does not resume itself: an allowed continuation is one fresh, bounded
same-role packet only through its supported adapter route, or an unsupported
continuation stop. It never resumes a broader delivery goal. A reviewer continuation
remains read-only and never resumes an implementer conversation. Until this change
integrates, the integrated contributor contract's existing handoff gate remains in
force for this change; the future contract change is inert here.

### Automatically incorporate bounded review improvements

Treat a pre-freeze reviewer recommendation as presumptively applicable only when it is
grounded in current files, has an exact minimal remedy, stays inside authorized
planning paths, and does not require a canonical Operator disposition required
decision. The orchestrator applies those corrections, retains the
finding/hash/review chain in the change’s review record, validates, and dispatches
a fresh whole-package review. The *Non-converging routine findings* scenario
defines the cumulative correction-cycle limit and stop triggers; *Review-record
continuity* prevents a record restart from resetting that count. A separately
authorized issue-binding re-review does not count as an automatic correction.
Post-freeze planning findings follow their separately defined operator-disposition
boundary; the operator is not asked merely to repeat a routine accepted correction.

The review record is the change-owned
`openspec/changes/<name>/evidence/approach-review.json`: it binds the complete
planning hash set, cycle counter, findings, and re-review results. It is committed
with the frozen plan but outside the planning digest. Missing, unreadable, or
hash-mismatched evidence follows *Review-record continuity*: acceptance is invalidated;
validation/review restarts automatically only after the prior cumulative correction
count is recovered from retained external report references. An unrecoverable count
requires operator disposition, never an invented zero or a reset.
The retained disposition establishes a verified baseline count or requires separate
authorization for every later correction cycle while the count remains unavailable.
The first record is created from retained operator-authorized review reports; an
unavailable earlier chain is labeled unavailable, not reconstructed, and grants no
disposition or acceptance.
Each review entry records its input hashes, verdict, findings or finding digest,
automatic-cycle status, and report reference. Freeze acceptance follows the
canonical *Review-record continuity* requirement.

### Review the approach before freezing execution authority

Before a plan commit/digest exists, use a fresh selected client's documented
read-only review mode to assess the canonical *Complete planning input inventory*.
The
packet records SHA-256 values for every reviewed input and names the exact
workspace and input paths. It forbids edits, shell execution, Git writes,
profile/config writes, persistence, and implementation, and requires
severity-ordered `path:line` findings or `No findings`. The orchestrator alone
evaluates and incorporates accepted feedback, then reruns planning validation and
re-reviews the complete planning hash set. Freeze acceptance follows
*Review-record continuity*.
The orchestrator re-hashes that complete set after review completion and rejects a
review if its inputs drifted.

This initial review is a bootstrap exception: the new adapter protocol is itself
the subject of the plan and cannot prove its own implementation before it exists.
After the adapter is implemented and qualified, future pre-execution approach
reviews use the selected host's adapter. Neither form is operator plan approval
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
- [Pre-change local `main` history] → preserve it and reconstruct in a dedicated
  branch; require an explicit later decision before any reset or rewrite of local
  `main`, or any publication.
- [Goal wording becomes vague] → require acceptance evidence and a stop condition
  in the task group and packets.

## Migration Plan

1. Under the separate issue, branch-reset, pre-freeze repository-config, and freeze
   grants, follow the canonical
   **Reconstruct from the exact pre-change integrated base** decision above before
   any source changes.
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
   outcome packet constraints, legacy-route retirement, and independent review.
4. Run the repository gates, freeze a new candidate, and obtain an independent
   review on its exact SHA. Publication and release remain a later `finish` scope.

## Open Questions

None. The client and optional interaction-surface probes decide support at implementation time;
they do not change the required fail-closed behavior or permit undocumented
fallback.