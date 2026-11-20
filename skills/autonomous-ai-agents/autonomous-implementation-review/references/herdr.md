# Herdr interaction fallback and pane helpers

With `replacementReadiness` verified, operator-selected Herdr pane dispatch
(`herdr-pane-dispatch`) is retired (`resolveLegacyRouteRequest({ route: "herdr-pane-dispatch" })`
stops with `status: "retired-route"`, `herdrRole: "interaction-fallback-only"`,
`herdrForcedByEnv: false`). `$HERDR_ENV=1` neither selects nor forces a role
transport: launch implementer and reviewer workers through the qualified
terminal adapters in [terminal-adapters.md](terminal-adapters.md). Load
[environment-passthrough.md](environment-passthrough.md) only for child-tool
context.

Herdr remains in the package for two bounded purposes:
1. The prequalified same-session human-input fallback (`exposeOperatorInteraction`
   with `boundRoute: "herdr-fallback"`).
2. Read-only pane inspection/selection helpers (`scripts/herdr_panes.py`,
   `scripts/herdr-pane-state.mjs`, `scripts/herdr_lifecycle_watch.mjs`) and
   retained legacy-host audits (see Hermes issue
   [#141194](https://github.com/NousResearch/hermes-agent/issues/141194)).

## Same-session human-input fallback (`herdr-fallback`)

When a terminal worker launched under [terminal-adapters.md](terminal-adapters.md)
enters a native human-input wait (`approval`, `credentials`, `clarify`, `input`)
and its bound interaction route is `herdr-fallback`:

- The orchestrator creates a fresh Herdr pane (`freshPaneCreated: true`) and
  attaches to the waiting worker session (`mode: "attach"`) or natively resumes
  that exact session (`mode: "resume"`) after verifying the prior process
  terminated (`previousProcessStopped: true`, recording `oldPid` and `newPid`).
- No per-pane operator approval (`perPaneApprovalRequired: false`), manual
  operator pane setup (`operatorSetupRequired: false`), historical pane reuse,
  task replay, or live `/new`, `/busy queue`, `/model`, or `/status` injection
  is used on this fallback route.
- Wait for the native decision (`waiting` -> `resumed` or `blocked`/`stopped`)
  under [lifecycle-watch.md](lifecycle-watch.md). Afterwards, `cleanupInteractionView`
  removes only an adapter-owned view after immediate identity verification.

## Read-only pane inspection and retained legacy selection guard

Before reservation or any mutating pane command on a retained legacy Herdr
surface, require explicit operator selection. A timed-out, cancelled, skipped,
unanswered, or undelivered form is a blocker. A sole candidate, an existing
`exec` name, or broad autonomous authority never supplies consent.

1. Capture pane inventory without mutating panes:

   ```sh
   herdr pane list --workspace "$HERDR_WORKSPACE_ID" > <scratch>/panes.json
   python3 <this-skill-dir>/scripts/herdr_panes.py --workspace "$HERDR_WORKSPACE_ID" --orchestrator "$HERDR_PANE_ID" < <scratch>/panes.json
   ```

2. Validate any supplied selection evidence against a fresh `--inspect` readback:

   ```sh
   node <this-skill-dir>/scripts/herdr_lifecycle_watch.mjs --inspect --pane <pane-id> --workspace "$HERDR_WORKSPACE_ID" > <scratch>/inspection.json
   python3 <this-skill-dir>/scripts/herdr_panes.py --workspace "$HERDR_WORKSPACE_ID" --orchestrator "$HERDR_PANE_ID" --selection <scratch>/selection.json --inspection <scratch>/inspection.json < <scratch>/panes.json
   ```

3. Why legacy pane-dispatch is retired: under issue #141194, pane output cannot
   prove session binding, so legacy Herdr role dispatch required per-handoff
   operator approval as the only handoff authority and live slash setup. With
   qualified terminal adapters (`hermes`, `claude-code`, `codex`, `grok-build`),
   do not use `herdr agent prompt` to deliver role packets or inject `/new`,
   `/busy`, `/model`, or `/status`; `resolveLegacyRouteRequest` stops
   `herdr-pane-dispatch` with `status: "retired-route"`.
4. Do not install `herdr integration install hermes` for monitoring: it modifies
   profile state and cannot replace adapter-owned artifact handoffs.
5. An operator stop request pauses the orchestrator goal first (`/goal pause`);
   `/stop` is not an immediate foreground-turn interrupt.
