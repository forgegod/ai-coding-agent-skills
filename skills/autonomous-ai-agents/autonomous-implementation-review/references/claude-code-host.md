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

For a project explicitly adopting the short-invocation policy, print this command exactly.
Its local authority comes from that project contract; it does not grant remote
writes or bypass the armed-role requirements. Do not dispatch it. Do not also print the Herdr
`/goal draft` command.

```text
/openspec-delivery <name> code-tab-phase-roles
```
