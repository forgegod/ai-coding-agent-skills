# Code-tab role loop (retired)

With `replacementReadiness` verified, the `code-tab-phase-roles` subagent route
is retired. Calling `resolveLegacyRouteRequest({ route: "code-tab-phase-roles" })`
stops immediately with `status: "retired-route"`, `launched: false`, and
`modifiedInstalledAgents: false`.

## Migration and boundaries

- When `claude-code` is qualified in `scripts/terminal-adapters.mjs`, the
  retired-route result sets `redirectAdapter: "claude-code"` and points to
  explicit standalone `claude-code` terminal adapter selection in
  [terminal-adapters.md](terminal-adapters.md).
- If `claude-code` is not qualified in the supplied qualification records, it
  records `claudeCodeSupported: false`, `redirectAdapter: null`, and lists only
  the qualified terminal adapters (`qualifiedAdapters`), without launching a
  fallback.
- Never dispatch `.claude/agents/phase-implementer.md` or
  `.claude/agents/phase-reviewer.md` subagents, require distinct subagent
  `model` fields there, or modify existing `.claude/agents` files in a project.
- The orchestrator remains the sole Git and `tasks.md` writer through
  `openspec-delivery`. Do not mix `code-tab-phase-roles` with Herdr or
  `delegate_task`.
