# Claude Code host (retired `code-tab-phase-roles` route)

With `replacementReadiness` verified, `code-tab-phase-roles` is retired:
`resolveLegacyRouteRequest({ route: "code-tab-phase-roles" })` stops with
`status: "retired-route"` and redirects to the standalone `claude-code` terminal
adapter in [terminal-adapters.md](terminal-adapters.md) only when `claude-code`
is qualified (otherwise recording `claudeCodeSupported: false` and naming only
qualified adapters), without launching a fallback or modifying installed
`.claude/agents` files.

## Retired subagent templates

The legacy files `templates/phase-implementer.md` and `templates/phase-reviewer.md`
remain in the package inventory solely so existing distributions and migration
audits stay deterministic. Do not copy them into `.claude/agents/`, edit
installed `.claude/agents/phase-implementer.md` or
`.claude/agents/phase-reviewer.md`, or dispatch subagents for role execution.

## Legacy command token

If an operator sends `/openspec-delivery <name> code-tab-phase-roles`, do not
dispatch subagents; return the `resolveLegacyRouteRequest` retired-route stop.
