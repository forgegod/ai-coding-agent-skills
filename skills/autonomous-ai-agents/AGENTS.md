# Autonomous-agent skills

## Purpose

Own the portable implementation-and-independent-review workflow and its safe
Herdr pane-selection helper.

## Ownership

| Path | Owns |
| --- | --- |
| `autonomous-implementation-review/SKILL.md` | Bounded implementation, review, and verification loop. |
| `autonomous-implementation-review/scripts/herdr_panes.py` | Read-only Herdr pane overview for explicit executor selection. |

## Local Contracts

- The implementation and review phases use distinct, goal-named sessions; review is read-only.
- Never infer autonomous commit authority or a pane selection from labels, focus, or agent identity.
- When `$HERDR_ENV=1`, role execution stays in the selected Herdr pane; `delegate_task` is research-only and never substitutes for session-scoped model selection.
- The helper accepts only Herdr pane-list JSON and must not control panes or send input.
- For CAP/CHG work, the tracked CHG is the sole mutable progress authority; do not create profile-local continuation documents.
- A worktree CHG edit becomes progress only when the integrating commit carries it and target-ref readback confirms the phase table; never close a worktree on scratch or narrative evidence alone.
- Keep external tool and model references as prerequisites, not bundled dependencies.

## Verification

Run `npm test` and `npm run build`. Confirm the generated package advertises both
`SKILL.md` and `scripts/herdr_panes.py`.

Parent contract: `../AGENTS.md`.
