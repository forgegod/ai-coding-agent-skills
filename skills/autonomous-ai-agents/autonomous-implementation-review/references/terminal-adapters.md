# Qualified terminal worker adapters

Use `scripts/terminal-adapters.mjs` (re-exported by `scripts/orchestration-core.mjs`)
with [portable-core.md](portable-core.md) and [worker-handoff.md](worker-handoff.md).
Every worker runs as a supervised native terminal process in the assigned
dedicated worktree. Neither `delegate_task` nor client-native subagents execute
an implementation or review role, and workers must not start `tmux`, `screen`,
`zellij`, `orca`, or another multiplexer.

## Candidate qualification and replacement readiness

`CANDIDATE_RECORDS` and `qualifyCandidateAdapter(probe)` record the exact
versioned probe outcome for every candidate in the design:

| Candidate | Status | Version range | Non-argv transport | Roles | Notes |
| --- | --- | --- | --- | --- | --- |
| `hermes` | `qualified` (`supported: true`) | `>=0.23.0 <1.0.0` | `--query-file <path>` or `--query-file -` (`stdin`) | `implementer`, `reviewer`, `approach-reviewer` | Explicit `--profile` + `--in <workspace>`; enables [profile-preparation.md](profile-preparation.md). |
| `claude-code` | `qualified` (`supported: true`) | `>=2.1.273 <3.0.0` | `--print` with `stdin` | `implementer`, `reviewer`, `approach-reviewer` | Standalone CLI (`--session-id`, `--permission-mode`, `--tools`, `--disallowed-tools`); excludes `--bg` auto-respawn; retires `code-tab-phase-roles`. |
| `codex` | `qualified` (`supported: true`) | `>=0.167.0 <1.0.0` | `codex exec -` (`stdin`) | `implementer`, `reviewer`, `approach-reviewer` | `-C <workspace>`, `-s read-only` or `workspace-write`, `--json`, `-o`, `codex resume <id>`. |
| `grok-build` | `qualified` (`supported: true`) | `>=1.0.89 <2.0.0` | `--prompt-file <path>` | `implementer`, `reviewer`, `approach-reviewer` | `--cwd <workspace>`, `-s <id>`, `--no-subagents`, `--no-leader`, `--permission-mode plan` or `default`, `--disallowed-tools`. |
| `opencode` | `unsupported` (`supported: false`) | `null` | none | none | Uninstalled in probe environment; fail-closed. |
| `kilo-modern` | `unsupported` (`supported: false`) | `null` | none | none | `.kilo` modern route evaluated independently of `kilo-legacy`; uninstalled. |
| `kilo-legacy` | `unsupported` (`supported: false`) | `null` | none | none | `.kilocode` legacy route evaluated independently of `kilo-modern`; uninstalled. |
| `pi` | `unsupported` (`supported: false`) | `null` | none | none | `.pi/agent` route uninstalled in probe environment; fail-closed. |
| `grok-bot` | `unsupported` (`supported: false`) | `null` | none | none | Chat-only surface / imported settings without local CLI execution or session control. |

`replacementReadiness({ records })` requires a qualification or unsupported
record for every design candidate and at least one qualified adapter supporting
both `implementer` and fresh read-only `reviewer` before retiring legacy routes.
Operational readiness or binary presence alone never qualifies a client.

## Prospective bounded bootstrap exception

`bootstrapSupervisorDecision` enforces the design's one-time task-3.1 bootstrap
exception:

- Admits only `task === "3.1"` (`implementer` or fresh read-only `reviewer`)
  under fresh plan review, exact-plan approval and a separate task-3 execution
  reference, with an orchestrator-owned supervisor independent of candidate code
  (`independentOfCandidateCode: true`, `usesCandidateCode: false`).
- Preserves the non-waived floor: immutable request SHA-256, explicit
  client/version/provider/model/session bindings, non-argv prompt transport,
  supervisor-only artifact publication outside repositories/profiles,
  independent core verification and fresh literal review verdict.
- Expires immediately (`expired: true`, `allowed: false`) once any adapter
  qualifies for implementation and fresh read-only review. It never advertises
  support, self-qualifies, reuses historical group-2 sessions, or serves other tasks.

## Client-neutral role and model configuration

`resolveRoleConfiguration` resolves role bindings with strict precedence:

1. Explicit authorized per-run role override (`per-run-override`)
2. Project role default (`project-default`)
3. Explicitly accepted client default (`client-default`)

Project restrictions and operator limits (`allowedClients`, `allowedModels`,
`allowedProviders`, `requireDistinctModels`) constrain every level. Missing,
contradictory, or unavailable bindings stop without host, client, profile,
model, or permission fallback.

### Supported client keys, flags, presets, and profile paths

| Advertised client | Supported versions (probed) | Role / client / provider / model selectors & profile paths |
| --- | --- | --- |
| `hermes` | `>=0.23.0 <1.0.0` (`0.23.2`) | Launch argv `--profile <verified-profile> chat --query-file <-\|prompt.md> --oneshot --format stream-json --pass-session-id --in <workspace> -t <file\|file,terminal>` (`cliMode: "chat --oneshot"`); profile keys `model.default`, `model.provider`, `display.busy_input_mode = queue` in `<hermes-home>/profiles/<verified-profile>/` ([profile-preparation.md](profile-preparation.md)); declarative skill frontmatter keys `autonomous_ai_agents.implementer` and `autonomous_ai_agents.reviewer`; scratch isolation via `HOME=<scratchRoot>` and `TMPDIR=<scratchRoot>`. |
| `claude-code` | `>=2.1.273 <3.0.0` (`2.1.327`) | Launch argv `--print --output-format json --session-id <session> --permission-mode <plan\|manual> --tools <Read,Glob,Grep\|Read,Edit,Write,Glob,Grep,Bash> --disallowed-tools <...>` with `stdin` (`plan` for read-only reviewers, `manual` for implementers); scratch isolation via `HOME=<scratchRoot>` and `TMPDIR=<scratchRoot>`; model/provider selection is verified via caller-supplied `effectiveReadback` in `resolveRoleConfiguration` rather than injected into `preparePromptTransport` argv. |
| `codex` | `>=0.167.0 <1.0.0` (`0.169.0`) | Launch argv `exec - -C <workspace> -s <read-only\|workspace-write> --json -o <captureDir>/last-message.txt` with `stdin` (and `codex resume <session-id>` for `herdr-fallback`); scratch isolation via `HOME=<scratchRoot>` and `TMPDIR=<scratchRoot>`; model/provider selection is verified via caller-supplied `effectiveReadback` in `resolveRoleConfiguration` rather than injected into `preparePromptTransport` argv. |
| `grok-build` | `>=1.0.89 <2.0.0` (`1.0.89`) | Launch argv `--prompt-file <captureDir>/prompt.md --cwd <workspace> -s <session> --no-subagents --no-leader --output-format json --permission-mode <plan\|default> --disallowed-tools <...>` (`plan` for read-only reviewers, `default` for implementers); scratch isolation via `HOME=<scratchRoot>` and `TMPDIR=<scratchRoot>`; model/provider selection is verified via caller-supplied `effectiveReadback` in `resolveRoleConfiguration` rather than injected into `preparePromptTransport` argv. |

- **Scope, effective verification, and model availability:** Configuration is
  launch-scoped or isolated to a named Hermes role profile / scratch
  `HOME`/`TMPDIR` root. `resolveRoleConfiguration` requires positive
  `effectiveReadback` of `client`, `version`, `provider`, `model`, and `session`
  without reading secret credentials (`credentialsRead: false`), modifying live
  global defaults (`globalDefaultsModified: false`), or accepting an unverified
  alias or account entitlement (`aliasOnly: false`, `entitlementOnly: false`) as
  effective-model proof. External-client model/provider selection is verified
  through caller-supplied `effectiveReadback` rather than injected into
  `preparePromptTransport` argv.
- **Changing or removing an operator selection:** To change a role selection for
  a run, supply a new `perRunOverride` (`client`, `provider`, `model`, or
  `profile` for Hermes). To remove a selection, omit or clear `perRunOverride`
  (reverting to `projectDefault` or `clientDefault`) or retire the disposable
  role profile/scratch config directory—never by silently mutating persistent
  global user settings.
- **One-client sequential or mixed-client execution:** One qualified client may
  serve `orchestrator`, `implementer`, and `reviewer` sequentially in distinct
  fresh sessions (`implementerSession !== orchestratorSession`,
  `reviewerSession !== implementerSession`). Different models are optional
  unless project policy sets `requireDistinctModels: true`.
- **Hermes vs. external CLIs:** Hermes skill frontmatter is declarative input
  only; concrete `--profile` and CLI mode are bound at launch. External CLIs
  (`claude-code`, `codex`, `grok-build`) bind via their own flags and isolated
  config/state paths and never claim or inherit a Hermes profile.

### Qualified role configuration examples

One-client same-model sequential configuration (`requireDistinctModels: false`):

```json
{
  "example": "one-client-same-model",
  "role": "reviewer",
  "orchestratorSession": "claude-orch-1",
  "implementerSession": "claude-impl-1",
  "session": "claude-rev-1",
  "projectDefault": {
    "client": "claude-code",
    "provider": "anthropic",
    "model": "claude-sonnet-4-6"
  },
  "restrictions": {
    "allowedClients": ["claude-code"],
    "allowedProviders": ["anthropic"],
    "allowedModels": ["claude-sonnet-4-6"],
    "requireDistinctModels": false,
    "implementerModel": "claude-sonnet-4-6"
  },
  "effectiveReadback": {
    "verified": true,
    "client": "claude-code",
    "version": "2.1.327",
    "provider": "anthropic",
    "model": "claude-sonnet-4-6",
    "session": "claude-rev-1",
    "credentialsRead": false,
    "aliasOnly": false,
    "entitlementOnly": false,
    "globalDefaultsModified": false
  }
}
```

One-client different-model sequential configuration (`requireDistinctModels: true`):

```json
{
  "example": "one-client-different-model",
  "role": "reviewer",
  "orchestratorSession": "hermes-orch-1",
  "implementerSession": "hermes-impl-1",
  "session": "hermes-rev-1",
  "perRunOverride": {
    "client": "hermes",
    "provider": "xai",
    "model": "grok-4.7",
    "profile": "hermes-dev-review",
    "cliMode": "chat --oneshot"
  },
  "restrictions": {
    "allowedClients": ["hermes"],
    "allowedProviders": ["xai", "google"],
    "allowedModels": ["gemini-4-argon", "grok-4.7"],
    "requireDistinctModels": true,
    "implementerModel": "gemini-4-argon"
  },
  "effectiveReadback": {
    "verified": true,
    "client": "hermes",
    "version": "0.23.2",
    "provider": "xai",
    "model": "grok-4.7",
    "session": "hermes-rev-1",
    "credentialsRead": false,
    "aliasOnly": false,
    "entitlementOnly": false,
    "globalDefaultsModified": false
  }
}
```

Mixed-client configuration (`codex` implementer + `grok-build` fresh read-only reviewer):

```json
{
  "example": "mixed-client",
  "role": "reviewer",
  "orchestratorSession": "orch-1",
  "implementerSession": "codex-impl-1",
  "session": "grok-rev-1",
  "perRunOverride": {
    "client": "grok-build",
    "provider": "xai",
    "model": "grok-code-fast-1"
  },
  "restrictions": {
    "allowedClients": ["codex", "grok-build"],
    "allowedProviders": ["openai", "xai"],
    "allowedModels": ["gpt-5.4", "grok-code-fast-1"],
    "requireDistinctModels": true,
    "implementerModel": "gpt-5.4"
  },
  "effectiveReadback": {
    "verified": true,
    "client": "grok-build",
    "version": "1.0.89",
    "provider": "xai",
    "model": "grok-code-fast-1",
    "session": "grok-rev-1",
    "credentialsRead": false,
    "aliasOnly": false,
    "entitlementOnly": false,
    "globalDefaultsModified": false
  }
}
```

## Non-argv payload transport and supervision

`preparePromptTransport` keeps generated prompts out of argv using the client's
qualified `stdin` or `prompt-file` (`--query-file` / `--prompt-file`) route and
records `promptSha256`, `promptBytes`, and external stdout/stderr/exit capture
paths. Oversized payloads fail closed without retry (`retryAllowed: false`). A
correctly sized transient transport failure permits at most one retry
(`action: "retry-once"`, `maxRetries: 1`) on the exact same qualified route,
client, and session, never a fallback.

`superviseWorkerLaunch` and `handleWorkerStopOrViolation` bind `pid`,
`startIdentity`, `treeIdentity`, and `scratchRoot` outside the worktree. On
budget exhaustion, unexpected exit, or stop, positive immediate identity
readback stops only the exact owned process tree and cleans only `scratchRoot`
(while attempt handoff artifacts survive). Failed identity readback preserves
both process and scratch root. On a process-boundary violation (multiplexer,
subagent delegation, or reviewer write escalation), the adapter invalidates the
result, stops the verified process tree, and preserves `scratchRoot` as evidence
without cleanup.

## Automatic same-session operator interaction

`exposeOperatorInteraction` and `cleanupInteractionView` handle native human
input (`approval`, `credentials`, `clarify`, `input`):

- Prelaunch qualification accepts either a verified `native-cli` same-session
  surface (`herdrRequired: false`) or a prequalified `herdr-fallback` route.
  Herdr proof is required only when the bound fallback is used.
- For `herdr-fallback`, the orchestrator creates a fresh Herdr pane without
  per-pane approval or operator setup, attaches or resumes the same logical
  session after verifying prior process termination (`previousProcessStopped: true`,
  recorded `oldPid`/`newPid`), and forbids duplicate workers, historical pane
  reuse, or task replay.
- Waiting records a `waiting` lifecycle event, suspends group advancement, and
  exposes the session without a separate chat notification, answering the card,
  supplying credentials, or changing permissions. Operator approval records
  `resumed` and continues that same attempt; denial or timeout preserves state
  without reissuing or substituting a worker.
- `cleanupInteractionView` removes an unused adapter-created view only after
  immediate positive verification of adapter ownership, non-orchestrator
  identity, no active worker, and no operator input; otherwise it preserves the view.

## Artifact-first assignments, publication, and recovery

`executeTerminalAdapterAttempt` integrates with `scripts/worker-handoff.mjs`
([worker-handoff.md](worker-handoff.md)):

- **Locations and bindings:** Each attempt writes outside the repository
  checkout in a unique attempt directory (`0700`): `createAttempt` writes
  sealed `request.md` (`0400`), and `executeTerminalAdapterAttempt` publishes
  `report.md`, `native.txt`, `stderr.log`, `exit.txt`, `lifecycle.jsonl` (plus
  `turn.json` for `completionKind === "turn-end"`), and atomic `result.json`
  (each sealed `0400`), with transport scratch `stdout.log`, `stderr.log`, and
  `exit.txt` under `<scratchRoot>/transport/` (`0600`). `result.json` binds
  `requestSha256`, `identity` (`attempt`, `predecessor`, `role`, `group`,
  `task`, `action`, `workspace`), `runtime` (`client`, `version`, `provider`,
  `model`, `session`), `report`, `nativeReport`, and `evidence` descriptors
  within declared `evidenceRoots`.
- **Adapter-only publication vs. delivery acceptance:** The adapter—never the
  read-only reviewer—publishes `report.md` and `result.json` atomically and
  seals every artifact `0400` inside the `0700` attempt directory without
  writable staging aliases. Process exit `0` or `status: "completed"` is
  lifecycle observation only, never delivery acceptance, plan approval, or
  `tasks.md` progress. A completed review with findings triggers the
  orchestrator-owned correction loop; literal `Verdict: No findings` with empty
  findings and empty coverage limitations is required for candidate review
  acceptance.
- **Evidence retention and safe recovery:** Handoff artifacts under the attempt
  directory survive `scratchRoot` cleanup. Missing, partial, truncated,
  writable, symlinked, or hash-mismatched artifacts fail closed in `readHandoff`
  (`status: "incomplete"`), preserving the sealed attempt directory as evidence.
  Recovery never overwrites an existing attempt or assumes cross-client CLI flag
  or session equivalence: the orchestrator dispatches a new attempt directory
  linked via `predecessor` (`predecessorAttemptId`) within the existing
  continuation and correction budgets.

## Legacy route retirement

After `replacementReadiness` is verified, `resolveLegacyRouteRequest` stops
requests for `code-tab-phase-roles` and operator-selected `herdr-pane-dispatch`
with `status: "retired-route"` and `launched: false`. `code-tab-phase-roles`
points to standalone `claude-code` selection only when `claude-code` is
qualified (otherwise recording it unsupported and naming only qualified
adapters), without modifying installed `.claude/agents` files. `HERDR_ENV`
neither selects nor forces Herdr pane dispatch; Herdr remains available only as
the bound same-session interaction fallback.
