# Claude Code host

Load only when the operator sent `code-tab-phase-roles` and Herdr is not active.
This is not a Herdr transport and does not authorize execution. Displaying the
command does not send it.

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
Execute only the authorized task group of openspec/changes/<name> using code-tab-phase-roles and openspec-change-integration. I authorize this Claude Code parent session to use an isolated checkout, commit the reviewed implementation, and update that change's tasks.md after checking evidence. Dispatch implementation and review only through the project subagents phase-implementer and phase-reviewer. Stop after the named task group; do not push, open a pull request, merge, or start another change.
```
