# Hermes autonomous goal workflow research

## Decision

For a material change, the repository's active CHG is the only mutable progress
record. `autonomous-implementation-review` orchestrates implementation and
review around that record; it must not create a profile-local handoff document.

The normal operator entry point is Hermes' existing goal drafting command.
Use the [current launch contract](../../README.md#start-a-selected-chg-phase),
including its explicit local Git authorization and supported Herdr environment;
do not maintain a competing prompt here. The operator selects the CHG and numeric
phase and decides whether to grant those operations before sending the command.

## Findings

| Finding | Consequence |
| --- | --- |
| `/goal draft <objective>` is Hermes' documented, recommended way to turn a one-line objective into a persisted completion contract. It starts the goal immediately. | Use it for the concise CHG launch. The agent must read the CHG before dispatch; the operator may inspect the resulting contract with `/goal show`. |
| `phased-plan-next` selects an explicit or unambiguous active CHG and prints the literal `/goal draft` command for the operator to send. `phased-plan-overview` inspects and does not print a launch command. | Use next as the read-only launch helper. Overview remains inspection only. |
| Skills and skill bundles load instructions, but cannot activate `/goal`; quick commands support only shell execution or aliases, not reusable prompt text. | A portable SKILL.md cannot honestly provide a one-token command that both loads skills and starts a parameterized persistent goal. |
| Custom prompt shortcuts with optional preloaded skills are proposed but not released. | The desired eventual UX is `/chg CHG-004 1`, implemented as a Hermes shortcut that renders the full goal contract before setting it. Do not emulate it with a shell macro or a skill that merely prints text to paste. |
| Kanban provides a durable host-local task queue with structured run handoffs, dependencies, and retry history. | Use Kanban when work must coordinate across profiles or survive local agent restarts. It is not the portable change record: its database is profile-local and does not travel with a Git clone. |
| A proposed pulse-style handoff was closed because Kanban already covers host-local durable workflow state. | Do not add another generic handoff artifact. Use the CHG for repository progress and optional frozen review receipts for evidence. |
| A proposed Mission/Project SSOT is still open and profile-scoped. | It does not replace a repository-tracked CHG or solve cross-machine portability today. |

## Repository-state rules

- `docs/changes/active/CHG-*.md` is the sole mutable authority for material
  work: selected phase, status, scope, gate, decisions, evidence, and next
  executable phase.
- `docs/changes/reviews/CHG-<number>/` may retain a frozen review-only receipt
  when the project needs one. It is evidence, never a second plan or mutable
  progress tracker.
- Hermes scratch space may contain temporary logs, patches, and agent reports,
  but it is never the only resumption source.
- A fresh session reads the CHG and committed review evidence, then uses closeout's
  reservation/worktree identity checks. A fresh clone has no local worktree
  registration; missing ownership needs an explicit recovery handoff, not a new
  competing worker. A profile-local plan or prior transcript is not authority.

## Future Hermes improvement

The correct extension is a first-class, parameterized custom shortcut. It
should accept a CHG identifier and phase, preload the named skills, render a
full completion contract for the goal judge, validate the selected CHG before
execution, and be explicit about its project trust boundary. This is a Hermes
runtime feature, not a SKILL.md convention.

## Sources

- [Persistent Goals](https://hermes-agent.nousresearch.com/docs/user-guide/features/goals)
- [Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [Slash Commands Reference](https://hermes-agent.nousresearch.com/docs/reference/slash-commands)
- [Custom Slash Commands / Shortcuts proposal #25335](https://github.com/NousResearch/hermes-agent/issues/25335)
- [Kanban RFC #16102](https://github.com/NousResearch/hermes-agent/issues/16102)
- [Pulse handoff proposal #31016](https://github.com/NousResearch/hermes-agent/issues/31016)
- [Mission / Project SSOT proposal #48011](https://github.com/NousResearch/hermes-agent/issues/48011)
