# Hermes autonomous goal workflow research

## Decision

For a material change, the repository's active CHG is the only mutable progress
record. `autonomous-implementation-review` orchestrates implementation and
review around that record; it must not create a profile-local handoff document.

The normal operator entry point is Hermes' existing goal drafting command:

```text
/goal draft Execute phase <number or name> of docs/changes/active/CHG-<number>.md using autonomous-implementation-review and phased-plan-execution.
```

The CHG identifier and phase are the only recurring operator input. Hermes
expands the short objective into a completion contract and starts the goal.

## Findings

| Finding | Consequence |
| --- | --- |
| `/goal draft <objective>` is Hermes' documented, recommended way to turn a one-line objective into a persisted completion contract. It starts the goal immediately. | Use it for the concise CHG launch. The agent must read the CHG before dispatch; the operator may inspect the resulting contract with `/goal show`. |
| `phased-plan-overview` already selects a CHG and executable phase from repository truth without changing it. | Use it as the read-only launch helper: after an explicit or unambiguous selection, it prints the literal `/goal draft` command for the operator to send. |
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
- A fresh machine or session resumes by reading the repository's CHG and any
  committed review receipt, then verifying the current workspace. It does not
  depend on a profile-local handoff file or a prior transcript.

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
