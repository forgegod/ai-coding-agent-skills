---
metadata_version: 1
artifact: design
change: local-client-skill-install-01m6896x3994xcc0erw8jnr15z
---
# Design

## Context

See proposal.md for motivation. The current installer validates package sources,
plans Hermes profile destinations, stages complete packages, replaces only with
`--update`, and records Hermes HubLockFile provenance. Native installation
recipes duplicate that behavior in shell and do not share its collision or backup
logic. The main-to-current catalog transition removed seven CAP/CHG packages and
added OpenSpec packages, but the installer intentionally leaves old package names
alone.

## Goals / Non-Goals

**Goals:**

- Reuse one collision-safe local-copy pipeline for Hermes profiles and detected
  global Claude Code/Codex targets.
- Make retirement opt-in, exact, recoverable, and independent of a Git checkout
  at installation time.
- Preserve source-package bytes, client-global scope, dry-run behavior, and
  truthful scanner/provenance wording.

**Non-Goals:**

- Project-scoped client installation, automatic client discovery by launching
  client binaries, remote installation, or scanner integration.
- Dynamic deletion of packages merely because a Git ref or future catalog no
  longer contains them.
- Purging arbitrary same-named third-party skills or changing a native client's
  own plugin/skill configuration.

## Decisions

### Model each install location as a target

The installer will produce target objects before planning writes. Hermes targets
retain their category/package relative paths and HubLockFile handling. Claude
Code packages use flat directories under `~/.claude/skills`; Codex packages use
flat directories under `~/.agents/skills`, which is Codex's documented user
skill location. A target is eligible only when its owning user configuration
already exists: `.claude` for Claude Code, and `.codex` or `.agents` for Codex.

Default invocation selects all recognized Hermes profiles plus eligible native
clients. A repeatable `--client claude-code|codex` selector will permit an
explicit native-only or mixed selection; `--profile` continues to select Hermes
profiles. `--all` remains the no-selector spelling and cannot combine with either
selector. This avoids treating a repository directory or an absent client as an
installation request.

Alternatives rejected: maintaining the README shell copier leaves behavior
inconsistent; using `~/.codex/skills` contradicts Codex's documented user skill
location; creating every possible client directory makes an install appear to
configure clients the user does not have.

### Keep one preflight, staging, backup, and reporting contract

Each target will expose its destination root, flat or categorized package path,
and backup root. Existing package collisions are collected before copies begin.
`--update` replaces an installed complete package only after staging all selected
packages and moves the previous tree below that target's non-discoverable backup
root. Dry-run constructs the same plan and writes nothing. Native targets do not
create or mutate Hermes hub locks.

The CLI result will report target names and separate installed, updated, and
purged counts so a mixed invocation cannot imply all hosts accepted equivalent
runtime capabilities.

### Encode the reviewed legacy set instead of inspecting Git at runtime

A constant retirement manifest will contain the seven package names removed by
the main-to-current comparison, with their former Hermes category path. `--purge`
will consider only those manifest entries. It will never call Git, infer a remote
branch, or delete a package just because it is not in the current source catalog.

The manifest is deterministic in ZIPs and source exports and is reviewed through
fixture tests. A future retirement must explicitly extend the manifest, its tests,
and documentation; it is not implicitly authorized by a future source change.

### Preserve and retire matching Hermes registrations deliberately

Before removing a legacy Hermes package, the installer will preflight any lock
entry against the historical well-known source/name/path. A conflicting
registration blocks instead of being reassigned or deleted. For a matching entry,
the installer writes its prior registration into the same backup batch before
atomically removing the live entry. The retirement backup therefore preserves
local package edits and the old registration while avoiding a live lock that
points to a removed directory.

Alternatives rejected: retaining a live stale registration breaks later hub
operations; deleting an unknown registration risks another source's package; an
unbacked lock removal loses recovery evidence.

## Risks / Trade-offs

- [Global native directories can contain unrelated skills] → purge is limited to
  the explicit legacy manifest, requires `--purge`, and moves rather than deletes
  matching package trees.
- [A multi-target operation can fail after an earlier target completes] → retain
  existing partial-failure reporting, print every backup path, and preflight all
  known collisions, symlinks, and conflicting registrations before mutation.
- [Native hosts do not share Hermes tools or scanner policy] → document local
  copy provenance and avoid claims of scanner approval or execution parity.
- [Codex's shared `.agents` directory can be used by other agents] → document
  that the target is user-global and use unique package directories with
  collision refusal.

## Migration Plan

1. Existing users run `npm run install:local -- --dry-run` to see all detected
   global targets without writes.
2. Users with current package copies use `--update --dry-run`, then `--update`;
   their previous complete packages are retained in target-local backups.
3. Users who intentionally retire the prior CAP/CHG package set add `--purge` to
   the reviewed update command. Recovery is by restoring the printed package and
   registration backup paths after stopping affected clients.
4. No installed profile or client directory is modified during source tests;
   fixtures validate the migration paths.
