---
metadata_version: 1
artifact: proposal
change: parallel-change-workflow
github_issue: https://github.com/forgegod/ai-coding-agent-skills/issues/8
---
# Explicit OpenSpec parallel-change integration

## Why

Provide an explicitly selectable parallel-change workflow with independently
mergeable OpenSpec changes, reviewed candidates and truthful integrated evidence.
This distribution publishes that workflow only. Other projects' older records
stay where they are; no consuming environment is assumed to have selected
OpenSpec.

## What Changes

- Define native OpenSpec proposal/spec/design/tasks for explicitly selected scope.
- Provide `openspec-delivery` for automatic isolated workspace setup, bounded local
  execution and verified protected closeout, with read-only evidence/workspace checks.
- Add `openspec-next` for grounded continuation or read-only inspection without long
  operator prompts; explicit project adoption defines local defaults and finish scope.
- Adapt commit, visual and supported-host role skills to the OpenSpec change.
- Publish only the OpenSpec companion packages and the separate orchestration
  package. Do not publish a second phase skill set.
- Add identity-only YAML frontmatter, proposal-time issue linking, read-only
  metadata validation and an isolated upstream compatibility probe. Obsidian
  views use the same files and stable identity across archive moves.
- Recover the already-integrated implementation through a new, truthful
  correction/closure record without asserting that the historical admission
  controls occurred before the original work.
- Constrain Git child environments in the evidence and workspace helpers to an
  explicit execution allowlist, including documented Git configuration selectors,
  while retaining override refusal and all existing integrity protections.
- Clarify scanner-flagged authorization wording without changing authority, and
  express workspace C0/DEL rejection as an equivalent auditable numeric predicate.

## Capabilities

### New Capabilities
- `openspec-integration`: explicit committed-candidate review, protected integration
  procedure and post-merge receipt validation for independent changes.

### Modified Capabilities
None: consuming projects' record contracts are outside this source change.

## Impact

Canonical source, package catalog/build, tests, current OpenSpec specifications and
installation guidance change. The existing change name stays unchanged. Issue #8 is
the recovery documentation record, not retrospective proof that a pre-admission
issue or approval existed. The accepted baseline is main
`a85ceff2e461a70fbeca1e8e2abf6ff5fddd7007`, including the integrated
OpenSpec 1.16.0 / Node 22.12.0+ prerequisite contract and the archived
`update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr` package. That archive
and its approval, review, gate and receipt evidence remain byte-for-byte history.
The retained dirty hardening patch is a separate unfinished local input, not a
candidate or sandbox source. No installed profile, GitHub setting, sibling repository
or public endpoint is modified.

## Acceptance

Real Git fixture tests demonstrate independent-clone support and rejection of stale
plans/reviews, failed or mismatched evidence and changed target content. Existing
package/guard tests continue to pass. Workspace fixtures exercise create/reuse,
collision refusal, dirty-work preservation and verified clean retirement. The pinned
real OpenSpec CLI validates artifacts. The recovery synchronizes the delta for both
previously shipped behavior and newly implemented hardening, runs the documented
scanner/native-client/sandbox checks, and uses a new protected, independently
reviewed correction PR before integrated verification, receipt and archive.

Hardening acceptance requires tests for override refusal, restricted value reads
and child inheritance, explicit configuration compatibility, preserved safeguards
and exhaustive path-character equivalence. Native Linux, macOS and Windows results
must be distinguished from simulations; missing platform evidence blocks hardening
completion. Complete-package scanning with the unchanged trusted scanner and its
negative controls must pass for all five packages. A safe scratch prototype is not
that result. Affected package inventories, skill/plugin versions and documentation
must remain synchronized, with independent review of the actual candidate.

Strict required CI for the future correction PR is a protected-integration
acceptance prerequisite, not a candidate-task checkbox. Complete tasks 2.3/2.4
and commit their evidence-supported progress before final candidate freeze and
independent exact-SHA review. Historical PR #13's non-required `verify` result
and R2's integrated-target verification do not satisfy that pre-merge requirement.

### Retained candidate-evidence provenance

The checked recovery/hardening work at candidate
`2910d00ec448e80e5eacc764a1aa284b53d21abf` is traceable to retained records
outside the repository; those records remain external so they are not rewritten
as candidate history. The candidate-bound Linux/package/final-gate summary is
`/home/raphael/verification-records/ai-coding-agent-skills/f1-completion-2910d00-20261110T054658Z/result.json`
(SHA-256 `73623fc89d304dd1a7cb74462d6c538a65ed6bdd4871b170eb1b43f5197c2fa6`).
The raw affected-gate collection is bounded before and after by
`f3-affected-gates-2910d00-20261109T193322Z/00-initial-candidate-identity/stdout.log`
and `09-post-final-candidate-identity/stdout.log` (each SHA-256
`c5e30a2cb73dd363635c2d569d064bb04f2e26dca5ddf7b06cf6442b9322518e`).
Native focused-fixture records are
`native-windows-2910d00-20261109T171915Z/windows-focused-fixture.stdout.log`
(SHA-256 `af95a14d576cf58357887359a64793d7932edb8ac5e1ccc96e336afec0fa9d76`)
and `native-macos-2910d00-20261109T183715Z/macos-focused-fixture.stdout.log`
(SHA-256 `f14f58e8a0b7b7eb1603ce1b76c9ee07f2b4a8ee8a3084a042783e2bd61d7533`),
under `/home/raphael/verification-records/ai-coding-agent-skills/`.

The exact plan approval for
`1a2f939a44f7d3e9174beae03ee5559de583351b` / digest
`1b70760674a95f50f73bc2bd46cf11812fd79372bb19d9dd2ae1f2b60e0ce470` is
`r3e-exact-plan-approval-1a2f939a44f7d3e9174beae03ee5559de583351b.json`
(SHA-256 `4fe64f351a239c71820a7dcf2a44ee98c24387935355495297ac8124c0dbd403`).
These pointers establish provenance only; they do not convert the failed review
of `2910d00…` into acceptance. Any successor candidate needs its own retained
exact-SHA independent review.

## Out of Scope

Unattended scheduling, distributed fencing, automatic installation, record conversion
in consuming projects, direct target pushes, releases, branch deletion, and claims
that missing historical admission or review evidence existed.
Scanner-policy changes, exclusions, suppressed findings, bypass flags and installed
profile modifications are also outside this hardening revision. Approval of this
artifact revision is not implementation, task-update, release or remote-write authority.

## Reconciliation boundary

This revision imports the complete accepted main baseline rather than copying a
version string. The five shared current documents are content unions of accepted
prerequisite language and unfinished Git-child-environment hardening. Lossless
closeout evidence remains sequenced: its planning workspace is unchanged and cannot
implement until this hardening group reaches an accepted integrated revision. A new
plan SHA and digest are required before group 10 or recovery tasks resume.
