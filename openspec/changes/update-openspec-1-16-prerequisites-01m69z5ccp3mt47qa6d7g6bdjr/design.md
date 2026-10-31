---
metadata_version: 1
artifact: design
change: update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr
---
# Design

## Context

See `proposal.md` for motivation. Current non-archived sources declare v1.15.0
in prerequisite, source-review, compatibility-probe, metadata, and delivery
instruction paths. The isolated probe already centralizes its package selection in
`tests/openspec-cli-compatibility.mjs` via `const pinned`, runs `npm exec` with a
scratch cache/HOME and an allowlisted environment, and verifies the invoked CLI
reports the pinned version before exercising strict validation, task discovery,
spec synchronization, archive byte preservation, and metadata validation.

The repository's Node engine is independently declared as `>=22`; the portable
read-only guard also states Node 22+. Neither is an OpenSpec npm-package
installation claim. The active `parallel-change-workflow` change has not been
integrated and edits related OpenSpec policy/docs, so shared-file changes require
integration-time reconciliation even though this change intentionally has no
capability-spec delta.

## Goals / Non-Goals

**Goals:**

- Establish one current v1.16.0 release fact set: CLI/package pin, npm Node
  floor, source tag, immutable release commit, selected workflow inventory, and
  probe version assertion.
- Preserve the existing npm install and isolated `npm exec` probe mechanics while
  proving the exact v1.16.0 package is invoked.
- Keep current documentation and portable instructions internally consistent and
  retain historical records unchanged.

**Non-Goals:**

- Changing the repository Node engine, generic packaged-guard floor, CI runtime,
  workflow schema, selected seven-skill inventory, or any skill package bytes.
- Adding the openspec.dev standalone installer, vendoring upstream skills,
  updating installed profiles, or publishing a release.
- Rewriting archived plans, evidence, or their v1.15.0 historical assertions.

## Decisions

### Treat v1.16.0 and its release commit as the single current source of truth

Update every current prerequisite/compatibility statement that binds this project
to v1.15.0, including the upstream tree/tag commands and immutable GitHub source
links. Use `v1.16.0` and
`27c0515724decc633818c735ee596481eec78a8b` consistently. Retain the exact
seven-skill allowlist and its one-`SKILL.md`, no-support-file/no-symlink claim
because the supplied comparison evidence says the selected package names and
contents are unchanged.

Alternative: update only the npm commands and test constant. Rejected because
review-source commands, current release links, and host guidance would still
claim a different supported release.

### Scope Node guidance to the npm package, not repository runtime policy

Where a sentence describes installing or running `@fission-ai/openspec` through
npm/npx/npm exec, state Node 22.12.0+ as the package floor. Preserve the
repository `engines.node: >=22`, CI Node 22, and generic Node 22+ guard wording
unless a separate inspection proves that those independent contracts need a
change.

Alternative: globally replace every `Node 22+` occurrence. Rejected because that
would silently strengthen unrelated repository and portable-skill requirements.

### Retain the isolated probe and change only its exact package pin

Set the existing `pinned` constant to `1.16.0`; keep the scratch HOME/XDG cache,
telemetry disablement, credential/environment allowlist, `--ignore-scripts`, and
all existing strict-validation/task/spec-sync/archive/metadata assertions. The
probe's initial `openspec --version` assertion remains the direct proof that npm
executed the desired exact package.

Alternative: replace the probe with ambient CLI checks or a new installer route.
Rejected because ambient state cannot prove the documented exact package and the
standalone installer is outside the requested compatibility surface.

### Preserve zero-delta OpenSpec semantics and reconcile shared-source overlap

Keep `skip_specs: true`: prerequisite documentation and a test pin do not alter
observable capability requirements. Do not create a frontmatter-bearing delta
or change current specs. Before integration, compare the candidate with the
latest `parallel-change-workflow` result and reconcile overlapping documentation,
config, and delivery-skill edits rather than resolving conflicts by blindly
choosing either version pin.

Alternative: add a new compatibility capability solely to describe the pin.
Rejected because it would invent a behavioral requirement and violate the
project's no-artificial-delta policy.

## Risks / Trade-offs

- [A missed current v1.15.0 reference leaves contradictory setup guidance] →
  inventory non-archived source before editing and assert the intended current
  replacements while exempting `openspec/changes/archive/`.
- [Node wording accidentally changes the repository runtime contract] → review
  each match by context and leave `package.json`, CI, and guard-only wording
  untouched unless independently required.
- [The probe becomes less isolated while changing the pin] → limit the code edit
  to the version constant and preserve its existing environment and scratch
  cleanup assertions.
- [The active workflow change changes shared text before integration] → re-read
  its final artifacts and the target branch before resolving overlap; a clean
  textual merge is not compatibility evidence.
- [Upstream npm availability/network failure blocks the opt-in probe] → report
  the failed external prerequisite; do not substitute an ambient binary result.

## Migration Plan

1. Re-inventory current references and update only approved current docs,
   configuration, portable delivery instructions, and the probe pin.
2. Run formatting/diff checks plus OpenSpec v1.16.0 strict validation, metadata
   validation, the relevant test suite, the exact-package isolated probe, and the
   distribution build.
3. Before any authorized integration, re-check active-change overlap and verify
   no archive path was modified. A regression or incorrect reference is reverted
   or forward-fixed in current source; archives remain immutable history.
