# Autonomous-agent skills

## Purpose

Own the portable implementation-and-independent-review workflow and its safe
Herdr pane-selection helper.

## Ownership

| Path | Owns |
| --- | --- |
| `autonomous-implementation-review/SKILL.md` | Bounded implementation, review, and verification loop. |
| `autonomous-implementation-review/references/portable-core.md` | Client-neutral outcome, approach-review, review-record continuity and candidate-review procedure. |
| `autonomous-implementation-review/scripts/orchestration-core.mjs` | Pure packet and retained-observation checks; no launch, progress writes or authority authentication. |
| `autonomous-implementation-review/scripts/worker-handoff.mjs` and `references/worker-handoff.md` | Portable strict request/result schemas, adapter-only local publication and complete retained-artifact admission; no launch, cleanup or delivery acceptance. |
| `autonomous-implementation-review/scripts/terminal-adapters.mjs`, `references/terminal-adapters.md` and `references/profile-preparation.md` | Candidate qualification records, terminal worker adapters (`hermes`, `claude-code`, `codex`, `grok-build`), role/model bindings, non-argv transport, process supervision, same-session interaction exposure, bootstrap-exception expiry, Hermes profile preparation and legacy-route retirement. |
| `autonomous-implementation-review/scripts/herdr_panes.py` | Read-only overview and fail-closed validation of supplied operator selection against fresh pane JSON. |
| `autonomous-implementation-review/scripts/herdr_lifecycle_watch.mjs` | Passive output-based Herdr lifecycle watcher, read-only inspection and arming gate; never sends pane input. |
| `autonomous-implementation-review/scripts/herdr-pane-state.mjs` | Live-composer/footer parser and identity-bound executor observation. |
| `autonomous-implementation-review/references/environment-passthrough.md` | Profile-scoped Hermes child-environment configuration for Herdr context. |
| `autonomous-implementation-review/references/herdr.md` | Prequalified Herdr same-session human-input fallback, read-only pane inspection, and retired `herdr-pane-dispatch` boundary. |
| `autonomous-implementation-review/references/lifecycle-watch.md` | Passive watcher arming, outcomes, and operator-only recovery. |
| `autonomous-implementation-review/references/openspec.md` | OpenSpec change and task-group boundary. No second task list and no distributed lock. |
| `autonomous-implementation-review/references/claude-code-host.md` | Retired `code-tab-phase-roles` redirect to the standalone `claude-code` terminal adapter. |
| `autonomous-implementation-review/templates/phase-implementer.md` | Retired legacy code-tab implementer template retained for package compatibility; do not copy into `.claude/agents`. |
| `autonomous-implementation-review/templates/phase-reviewer.md` | Retired legacy code-tab reviewer template retained for package compatibility; do not copy into `.claude/agents`. |

## Local Contracts

- Portable core work follows `references/portable-core.md` without Hermes or Herdr. Delivery owns integrated-parent policy, contributor-contract alignment and continuation; qualified terminal adapters (`hermes`, `claude-code`, `codex`, `grok-build`) in `references/terminal-adapters.md` and `scripts/terminal-adapters.mjs` own native worker processes, non-argv prompt transport, process supervision and same-session interaction. Core artifact checks require independently retained request/runtime bindings and protected publisher roots; they never grant worker writes or qualification. With `replacementReadiness` verified, `resolveLegacyRouteRequest` retires `code-tab-phase-roles` and operator-selected Herdr pane dispatch (`status: "retired-route"`), without fallback or `.claude/agents` edits.

- The implementation and review phases use distinct, goal-named sessions; review is read-only. One qualified client and the same model may run roles sequentially unless project policy sets `requireDistinctModels: true`.
- Never infer autonomous commit authority or a pane selection from labels, focus, or agent identity.
- Planning-only requests end after design. An approved plan is a prerequisite, not authorization to reserve a phase or dispatch the implementation/review loop.
- Explicit launch selection or an answered form precedes reservation and every pane mutation on the retained Herdr interaction surface; a timeout is not consent. The helper validates supplied evidence, not its authenticity or future liveness.
- Role execution uses an explicitly selected qualified terminal adapter (`hermes`, `claude-code`, `codex`, `grok-build`). `HERDR_ENV` neither selects nor forces a role transport; Herdr remains available as the prequalified same-session human-input fallback (`references/herdr.md`, `references/lifecycle-watch.md`). `delegate_task` is research-only and never substitutes for session-scoped role execution. Requests for `code-tab-phase-roles` (`references/claude-code-roles.md`) or operator-selected Herdr pane dispatch stop at `resolveLegacyRouteRequest` with `status: "retired-route"`.
- The helper accepts Herdr pane-list JSON and optional operator-selection evidence; it must not control panes or send input.
- For explicitly adopted OpenSpec scope, `references/openspec.md` bounds the loop to one authorized native change and one named task group on a qualified terminal adapter (while retiring `code-tab-phase-roles` and operator-selected Herdr pane dispatch). The orchestrator is the sole Git/`tasks.md` writer and uses `openspec-delivery`. Stock apply checkbox writes stay mediated. GitHub issues and pull requests document and review; they are not the task list.
- The orchestrator does not delegate Git writes to a removed phase skill. Executors never stage, commit, integrate, retire checkouts, or edit `tasks.md`. Keep the command protocols in the integration skill.
- The orchestrator dispatches code/prerequisite fixes to the executor, never edits worker code itself, and honors the operator's explicit launch authority and stop decisions.
- Effective identity is verified at launch via `resolveRoleConfiguration` without reading credentials or mutating global defaults; Hermes profiles are prepared offline via `references/profile-preparation.md` and `verifyHermesProfilePreparation` (never by injecting live `/busy`, `/model`, or `/status` commands into a pane).
- Keep external tool and model references as prerequisites, not bundled dependencies.
- Every iteration-cap handoff must pass delivery's `workerContinuationDecision` before dispatch, including retained legacy procedures and their additional approval gates. Only one fresh bounded same-role continuation per group/native task is allowed; a second cap stops. Never split, relabel or change sessions to reset the allowance. Preserve the capped session and complete retained history; no result, goal restart or budget increase bypasses the decision.
- Bound discovery and reuse valid evidence. Qualified terminal adapters launch workers directly and publish sealed attempt handoffs (`worker-handoff.mjs`); operator-selected Herdr pane dispatch (`herdr-pane-dispatch`, which required per-handoff pane approval under issue #141194) is retired via `resolveLegacyRouteRequest`. When `herdr_lifecycle_watch.mjs` is used to observe a Herdr fallback or retained surface, it reads `agent get` for identity and `agent read --source detection` for live activity, records one terminal outcome, and never sends input or starts another goal. An unreadable frame (a repaint caught in flight) is retried up to `--unknown-tolerance` consecutive samples and recorded with a bounded frame excerpt; ambiguous visible input stops at once, and one `inconclusive` receipt may be resumed once with `--resume-from`. Source changes do not authorize installed-profile updates.

## Verification

Run `npm test` and `npm run build`. Confirm the generated package advertises
`SKILL.md`, `references/claude-code-roles.md`, `references/herdr.md`,
`references/environment-passthrough.md`, `references/portable-core.md`,
`references/profile-preparation.md`, `references/terminal-adapters.md`,
`references/worker-handoff.md`, `scripts/orchestration-core.mjs`,
`scripts/terminal-adapters.mjs`, `scripts/worker-handoff.mjs`,
`references/lifecycle-watch.md`, `references/openspec.md`, `references/claude-code-host.md`, `scripts/herdr_panes.py`,
`scripts/herdr_lifecycle_watch.mjs`, `scripts/herdr-pane-state.mjs`,
`templates/phase-implementer.md`, and `templates/phase-reviewer.md`.

Parent contract: `../AGENTS.md`.
