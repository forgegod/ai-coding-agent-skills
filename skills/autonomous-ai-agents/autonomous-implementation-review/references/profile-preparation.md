# Hermes role-profile preparation

Run this only under a separately authorized profile-preparation grant, after
`hermes` is qualified in `scripts/terminal-adapters.mjs`, and before any Hermes
role session is created. It is not pane-selection, packet, review, or
publication authority. If `hermes` is not qualified, `verifyHermesProfilePreparation`
refuses preparation and this procedure does not apply.

## Required values

Prepare every named Hermes profile that will orchestrate or execute a role.
Through `terminal`, set these explicit values with
`hermes --profile <name> config set`:

```text
auxiliary.background_review.enabled = false
curator.enabled = false
curator.consolidate = false
skills.write_approval = true
memory.write_approval = true
display.busy_input_mode = queue
model.default = <operator-selected exact role model>
model.provider = <matching provider>
```

The first three values disable automatic post-turn skill review and curator
maintenance. The approval values stage any remaining skill or memory write.
Queue mode is a persistent profile preference that keeps later operator input
as the next turn instead of redirecting active role work. Pin the exact role
model and provider here rather than switching them in a live pane.

Hermes `metadata.hermes.config` frontmatter fields are declarative non-secret
inputs only; they never select a Hermes profile or CLI operation mode implicitly.
External CLI adapters (`claude-code`, `codex`, `grok-build`) use their own
launch-scoped flags and config paths and never claim or inherit a Hermes profile.

## Verification

For each required key, use two fresh processes and require the same result from:

```text
hermes --profile <name> config get --json <key>
hermes --profile <name> config get --json --raw <key>
```

Pass the collected readbacks to `verifyHermesProfilePreparation` from
`scripts/orchestration-core.mjs`. Start fresh role sessions only after all
readbacks match. Under this profile-prepared terminal adapter route, do not
send `/busy queue`, `/model`, or `/status` into a live pane during setup. A
later config mismatch or package-hash drift is a profile-integrity stop, not a
repair warrant.
