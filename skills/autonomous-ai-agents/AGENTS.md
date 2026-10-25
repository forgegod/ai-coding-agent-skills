# Autonomous-agent skills

## Purpose

Own the portable implementation-and-independent-review workflow and its safe
Herdr pane-selection helper.

## Ownership

| Path | Owns |
| --- | --- |
| `autonomous-implementation-review/SKILL.md` | Bounded implementation, review, and verification loop. |
| `autonomous-implementation-review/scripts/herdr_panes.py` | Read-only overview and fail-closed validation of supplied operator selection against fresh pane JSON. |
| `autonomous-implementation-review/scripts/herdr_lifecycle_watch.mjs` | Passive output-based Herdr lifecycle watcher, read-only inspection and arming gate; never sends pane input. |
| `autonomous-implementation-review/scripts/herdr-pane-state.mjs` | Live-composer/footer parser and identity-bound executor observation. |
| `autonomous-implementation-review/references/environment-passthrough.md` | Profile-scoped Hermes child-environment configuration for Herdr context. |
| `autonomous-implementation-review/references/herdr.md` | On-demand Herdr selection, delivery, lifecycle, and stop mechanics. |
| `autonomous-implementation-review/references/lifecycle-watch.md` | Passive watcher arming, outcomes, and operator-only recovery. |

## Local Contracts

- The implementation and review phases use distinct, goal-named sessions; review is read-only.
- Never infer autonomous commit authority or a pane selection from labels, focus, or agent identity.
- Planning-only requests end after design. An approved plan is a prerequisite, not authorization to reserve a phase or dispatch the implementation/review loop.
- Explicit launch selection or an answered form precedes reservation and every pane mutation; a timeout is not consent. The helper validates supplied evidence, not its authenticity or future liveness.
- The automated role loop is Herdr-only (`$HERDR_ENV=1`); role handoff and passive monitoring belong here, not to read-only phase selection. Require literal caller identity from `HERDR_PANE_ID` and a different explicitly selected executor pane; never reset or control the orchestrator as a worker. `delegate_task` is research-only and never substitutes for session-scoped model selection. Other environments use an explicitly approved manual workflow, not a guessed transport.
- The helper accepts Herdr pane-list JSON and optional operator-selection evidence; it must not control panes or send input.
- For CAP/CHG work, the tracked CHG is the sole mutable progress authority; do not create profile-local continuation documents.
- The orchestrator delegates Git/CHG writes to `phased-plan-closeout`; executors never stage, commit, integrate, retire worktrees, or edit the CHG path. Keep the command protocol out of this skill.
- The orchestrator dispatches code/prerequisite fixes to the executor, never edits worker code itself, and honors the operator's explicit launch authority and stop decisions.
- Keep external tool and model references as prerequisites, not bundled dependencies.
- Bound discovery and reuse valid evidence. Arm `herdr_lifecycle_watch.mjs` before delivery and leave the turn after dispatch. It reads `agent get` for identity and `agent read --source detection` for live activity, records one outcome, and never sends input or starts another goal. One `inconclusive` receipt may be resumed once with `--resume-from`, which inherits that receipt's terminal identity and working evidence; identity drift, a changed terminal, or a non-`inconclusive` prior outcome fails closed. Frozen status/counters are not activity proof; unknown output blocks injection. Output inspection only detects unsafe pane input; it cannot bind output to the active Hermes session. A turn-budget cap is an executor handoff, never self-directed continuation or a role switch; only the orchestrator decides a new packet. While Hermes issue #141194 is open, every role handoff requires explicit operator approval of the literal target pane; neither selection nor a watcher receipt permits another packet. Source changes do not authorize installed-profile updates.

## Verification

Run `npm test` and `npm run build`. Confirm the generated package advertises
`SKILL.md`, `references/herdr.md`, `references/lifecycle-watch.md`, `scripts/herdr_panes.py`,
`scripts/herdr_lifecycle_watch.mjs`, and `scripts/herdr-pane-state.mjs`.

Parent contract: `../AGENTS.md`.
