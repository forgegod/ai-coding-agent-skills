---
metadata_version: 1
artifact: proposal
change: local-client-skill-install-01m6896x3994xcc0erw8jnr15z
github_issue: https://github.com/forgegod/ai-coding-agent-skills/issues/1
---
# Local client skill installation

## Why

`npm run install:local` currently installs only into Hermes profiles. Users who
already run Claude Code or Codex must manually copy the same packages, and prior
CAP/CHG package copies remain installed after the OpenSpec package transition.

## What Changes

- Extend the local installer to copy complete current packages into detected,
  user-scoped Claude Code and Codex skill directories without writing to a project.
- Keep collision checks, complete-package staging, explicit `--update` backups,
  and dry-run behavior consistent across Hermes and native client targets.
- Add an explicit purge mode for the seven retired packages identified by the
  `main`-to-current catalog difference; preserve each retired package and any
  associated Hermes registration in backups before removing its live copy.
- Document target detection, global-only scope, update/purge authority, recovery
  locations, and the separate scanner/host-compatibility limits.

## Capabilities

### New Capabilities
- `local-skill-installation`: safely install and explicitly retire this
  distribution's local skill packages across supported user-scoped clients.

### Modified Capabilities
- None.

## Impact

Changes affect `scripts/install-local-skills.mjs`, Hermes hub-registration
handling, installer tests, and installation guidance/contracts. The verified
documentation issue is https://github.com/forgegod/ai-coding-agent-skills/issues/1.
Plan approval must bind this revised local proposal. No installed profile,
project skill directory, publication, commit, or push is authorized by this
proposal.
