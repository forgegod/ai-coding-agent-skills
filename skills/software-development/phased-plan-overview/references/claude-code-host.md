# Claude Code host

Load only when overview classified an armed Code-tab host. This is not a Herdr
transport and does not authorize execution. Displaying the command does not send it.

## Armed files

Both files must exist in the target project, not in another home:

- `.claude/agents/phase-implementer.md`
- `.claude/agents/phase-reviewer.md`

Read each `model` value. Armed means both are set, neither is `inherit`, and they
differ. Missing, equal, or `inherit` is an unbound host: no launch command.
Do not copy templates, search `~/.claude`, or edit the files.

Templates live next to this file at `templates/phase-implementer.md` and
`templates/phase-reviewer.md`. The operator copies them into the target project
after review and refuses an existing destination. The parent session must stay
in Manual permission mode. Accept-edits, auto, and bypass ignore a subagent
`permissionMode`, so those parent modes are not armed.

## Command

Print this command exactly. Do not dispatch it. Do not also print the Herdr
`/goal draft` command.

```text
Execute only phase <phase-number> of <active-chg-path> using code-tab-phase-roles, phased-plan-execution, and phased-plan-closeout. I authorize this Claude Code parent session to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Dispatch implementation and review only through the project subagents phase-implementer and phase-reviewer. Stop after verified target completion and cleanup; do not push or start another phase.
```
