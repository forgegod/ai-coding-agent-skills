---
name: phase-reviewer
description: Retired code-tab reviewer template retained for package compatibility; use the standalone claude-code terminal adapter instead.
tools: Read, Grep, Glob, Bash
disallowedTools: Agent, Edit, Write
model: inherit
permissionMode: plan
---

Retired legacy `code-tab-phase-roles` template. Do not copy into `.claude/agents`
or dispatch as a subagent; use `references/terminal-adapters.md` (`resolveLegacyRouteRequest`).
Reviewers remain strictly read-only and report `path:line` findings or `Verdict: No findings`.
