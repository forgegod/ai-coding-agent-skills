# Autonomous-agent skills

## Purpose

Own the portable implementation-and-independent-review workflow and its safe
Herdr pane-selection helper.

## Ownership

| Path | Owns |
| --- | --- |
| `autonomous-implementation-review/SKILL.md` | Bounded implementation, review, and verification loop. |
| `autonomous-implementation-review/scripts/herdr_panes.py` | Read-only overview and fail-closed validation of supplied operator selection against fresh pane JSON. |
| `autonomous-implementation-review/references/herdr.md` | On-demand Herdr selection, delivery, lifecycle, and stop mechanics. |

## Local Contracts

- The implementation and review phases use distinct, goal-named sessions; review is read-only.
- Never infer autonomous commit authority or a pane selection from labels, focus, or agent identity.
- Explicit launch selection or an answered form precedes reservation and every pane mutation; a timeout is not consent. The helper validates supplied evidence, not its authenticity or future liveness.
- The automated role loop is Herdr-only (`$HERDR_ENV=1`); role execution stays in the selected pane. `delegate_task` is research-only and never substitutes for session-scoped model selection. Other environments use an explicitly approved manual workflow, not a guessed transport.
- The helper accepts Herdr pane-list JSON and optional operator-selection evidence; it must not control panes or send input.
- For CAP/CHG work, the tracked CHG is the sole mutable progress authority; do not create profile-local continuation documents.
- The orchestrator delegates Git/CHG writes to `phased-plan-closeout`; executors never stage, commit, integrate, retire worktrees, or edit the CHG path. Keep the command protocol out of this skill.
- The orchestrator dispatches code/prerequisite fixes to the executor, never edits worker code itself, and honors the operator's explicit launch authority and stop decisions.
- Keep external tool and model references as prerequisites, not bundled dependencies.
- Bound discovery and reuse valid evidence; monitor one lifecycle wait with explicit milliseconds/seconds, not sleep/capture loops. Source changes do not authorize installed-profile updates.

## Verification

Run `npm test` and `npm run build`. Confirm the generated package advertises
`SKILL.md`, `references/herdr.md`, and `scripts/herdr_panes.py`.

Parent contract: `../AGENTS.md`.
