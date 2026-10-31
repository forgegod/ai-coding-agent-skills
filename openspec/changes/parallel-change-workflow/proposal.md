---
metadata_version: 1
artifact: proposal
change: parallel-change-workflow
github_issue: null
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

## Capabilities

### New Capabilities
- `openspec-integration`: explicit committed-candidate review, protected integration
  procedure and post-merge receipt validation for independent changes.

### Modified Capabilities
None: consuming projects' record contracts are outside this source change.

## Impact

Canonical source, package catalog/build, tests and installation guidance change.
No installed profile, live ticket, PR, GitHub setting, sibling repository or public
endpoint is modified. The existing change name stays unchanged. A real proposal
issue remains pending before plan approval; metadata migration does not create it.

## Acceptance

Real Git fixture tests demonstrate independent-clone support and rejection of stale
plans/reviews, failed or mismatched evidence and changed target content. Existing
package/guard tests continue to pass. Workspace fixtures exercise create/reuse,
collision refusal, dirty-work preservation and verified clean retirement. The pinned real OpenSpec CLI validates artifacts.

## Out of Scope

Unattended scheduling, distributed fencing, live API mutation, automatic installation,
record conversion in consuming projects and claims of completed remote integration.
