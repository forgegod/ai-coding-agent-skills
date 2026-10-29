# Explicit OpenSpec parallel-change integration

## Why

Provide an explicitly selectable parallel-change workflow with independently
mergeable OpenSpec changes, reviewed candidates and truthful integrated evidence.
This distribution publishes that workflow only. Other projects' older records
stay where they are; no consuming environment is assumed to have selected
OpenSpec.

## What Changes

- Define native OpenSpec proposal/spec/design/tasks for explicitly selected scope.
- Add an opt-in integration skill with read-only committed evidence checks.
- Adapt commit, visual and supported-host role skills to the OpenSpec change.
- Publish only the OpenSpec companion packages and the separate orchestration
  package. Do not publish a second phase skill set.

## Capabilities

### New Capabilities
- `openspec-integration`: explicit committed-candidate review, protected integration
  procedure and post-merge receipt validation for independent changes.

### Modified Capabilities
None: consuming projects' record contracts are outside this source change.

## Impact

Canonical source, package catalog/build, tests and installation guidance change.
No installed profile, live ticket, PR, GitHub setting, sibling repository or public
endpoint is modified. A real issue and securely generated correlation ID are pending
before collaborative admission; neither is fabricated for this local bootstrap.

## Acceptance

Real Git fixture tests demonstrate independent-clone support and rejection of stale
plans/reviews, failed or mismatched evidence and changed target content. Existing
package/guard tests continue to pass. The pinned real OpenSpec CLI validates artifacts.

## Out of Scope

Unattended scheduling, distributed fencing, live API mutation, automatic installation,
record conversion in consuming projects and claims of completed remote integration.
