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
- The helper accepts only Herdr pane-list JSON and must not control panes or send input.
- Keep external tool and model references as prerequisites, not bundled dependencies.

## Verification

Run `npm test` and `npm run build`. Confirm the generated package advertises both
`SKILL.md` and `scripts/herdr_panes.py`.

Parent contract: `../AGENTS.md`.
