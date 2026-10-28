# Code-tab role loop

Load only when the operator sent the `code-tab-phase-roles` command and
`$HERDR_ENV` is not `1`. If Herdr is active, stop. Do not mix hosts. This is not
`delegate_task` and not a pane transport.

## Parent

The parent session is the orchestrator and the only Git/CHG writer, through
`phased-plan-closeout`. Stay in Manual permission mode. Accept-edits, auto, and
bypass ignore subagent `permissionMode`; stop before dispatch if the parent is
in one of those modes.

Before the first dispatch, read the target project's
`.claude/agents/phase-implementer.md` and `.claude/agents/phase-reviewer.md`.
Require distinct non-`inherit` `model` values. Otherwise stop. Do not edit those
files or search another home.

Dispatch only those two subagents, one fresh agent per role. Do not reuse an
implementer transcript as the reviewer. Pass outcome, scope, workspace, base,
paths, gates, and budget in the task. A subagent summary is not success: run
the named gates and closeout's review-boundary recipe on the frozen candidate.

Limit fixes to two cycles. A third needs operator direction. Do not push or
start another phase.
