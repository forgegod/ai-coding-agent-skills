---
name: phase-implementer
description: Retired code-tab implementer template retained for package compatibility; use the standalone claude-code terminal adapter instead.
tools: Read, Grep, Glob, Edit, Write, Bash
disallowedTools: Agent
model: inherit
permissionMode: default
---

Retired legacy `code-tab-phase-roles` template. Do not copy into `.claude/agents`
or dispatch as a subagent; use `references/terminal-adapters.md` (`resolveLegacyRouteRequest`).
Implementers never edit `tasks.md`, stage, commit, integrate, push, or spawn subagents.
