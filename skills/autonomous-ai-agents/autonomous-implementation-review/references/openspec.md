# OpenSpec change orchestration

Load this when the operator has authorized execution of one OpenSpec change.
Selecting or approving a change grants nothing by itself.

For agent-neutral packets and review, use [portable-core.md](portable-core.md),
[terminal-adapters.md](terminal-adapters.md), and
[profile-preparation.md](profile-preparation.md).
It follows delivery-owned policy selection and continuation, with one group per
worker packet. Once `replacementReadiness` is verified, `resolveLegacyRouteRequest`
stops `code-tab-phase-roles` and operator-selected `herdr-pane-dispatch` with
`status: "retired-route"`, redirecting only to qualified terminal adapters
(`hermes`, `claude-code`, `codex`, `grok-build`) without modifying `.claude/agents`
or launching a fallback. The host-specific recipe below applies only to retained legacy
routes until replacement readiness is proved; it does not qualify a terminal
adapter. Do not infer a route from an environment marker or fall back silently.

## Unit and hosts

- The unit is one authorized native OpenSpec change and one named task group from
  its `tasks.md`. Never a second change, an unapproved task, or a whole backlog.
- Use only the qualified terminal adapters in [terminal-adapters.md](terminal-adapters.md)
  (`hermes`, `claude-code`, `codex`, `grok-build`). Legacy requests for operator-selected
  Herdr pane dispatch (`$HERDR_ENV=1`, see `references/herdr.md`) or the
  `code-tab-phase-roles` command (see `references/claude-code-roles.md` and
  `references/claude-code-host.md`) stop at `resolveLegacyRouteRequest` with
  `status: "retired-route"` and name only qualified adapters without launching a
  fallback or modifying `.claude/agents`.
  This reference defines no new host, CLI launcher, wrapper script or apply driver.
  A missing, unqualified or unclear adapter is a blocker.
- The `/goal draft` launch template in `SKILL.md` is the only persisted-goal
  example. Do not dispatch `code-tab-phase-roles` (`references/claude-code-host.md`
  retains it only to document the retired-route redirect).

## Roles and writes

- The orchestrator is the sole Git and `tasks.md` writer, and it uses
  `openspec-delivery` for committed candidate, review and receipt
  checks. Stock OpenSpec apply checkbox writes are mediated: the implementer
  reports evidence and never edits `tasks.md`; the orchestrator checks a task only
  after verifying the implementation evidence. Include those ticks in the final
  frozen commit reviewed by the independent reviewer. A later checkbox commit
  changes the SHA and requires renewed candidate review.
- Review binds the immutable candidate commit and the approved plan content
  digest. The reviewer is a fresh read-only session distinct from the implementer
  and orchestrator; one qualified client and the same model may be used
  sequentially unless project policy sets `requireDistinctModels: true`.
  A changed head, changed planning content or changed gate evidence
  invalidates review. Per-group verdicts never substitute for review of the final
  delivery SHA. Correct confirmed in-scope findings in the same unit and
  stop at eight correction/review cycles (two only for already-frozen legacy-host
  work) before operator escalation.
- A pull request must not be merged, and its branch must not be deleted, until
  this independent verdict exists for that SHA and findings are dispositioned.
  The verdict is not a GitHub approval and not risk acceptance. This loop does
  not merge or delete the branch.
- GitHub issues and pull requests, when the operator asks for them, document and
  review the change. They are not the task list and not permission to start.
- Integration, receipts and archival stay with the orchestrator through the
  integration skill. This loop stops after the named task group; push, merge,
  documentation writes and any next change need new authority.
