---
metadata_version: 1
artifact: proposal
change: update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr
github_issue: https://github.com/forgegod/ai-coding-agent-skills/issues/9
---
# Update OpenSpec 1.16 prerequisites and compatibility probe

## Why

Current, non-archived guidance and the opt-in compatibility probe still declare
OpenSpec CLI v1.15.0 even though the repository has already passed the relevant
v1.16.0 strict-validation and isolated-probe evidence. Keeping those pins stale
would direct operators to a release different from the one the project supports.

## What Changes

- Replace current OpenSpec v1.15.0 prerequisite and exact npm-probe pins with
  v1.16.0; retain the existing npm installation and `npm exec` probe route.
- Replace the reviewed release source tag and commit with v1.16.0 and
  `27c0515724decc633818c735ee596481eec78a8b`, while keeping the selected
  seven-workflow inventory and its verified identical package-content claim
  accurate.
- State the OpenSpec npm package's host prerequisite as Node 22.12.0+ wherever
  that package is described, without changing this repository's own Node `>=22`
  engine or generic packaged-guard requirements unless independent inspection
  identifies a separate need.
- Align README, installation/workflow/metadata/Claude guidance, OpenSpec config,
  portable delivery instructions, and the isolated compatibility probe with the
  same current release facts.
- Preserve archived OpenSpec plans and evidence, frontmatter-free delta specs,
  native `tasks.md` as the only task authority, installed-profile boundaries,
  upstream-skill non-vendoring, and no automatic external publication.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a documentation, configuration, and compatibility-probe pin update;
it does not change a durable product behavior requirement. Set `skip_specs: true`
so no artificial delta spec is introduced.

The only current capability, `local-skill-installation`, governs native package
copy and retirement and is unaffected. The active `parallel-change-workflow`
change has an unmerged `openspec-integration` delta; this change makes no delta
against it. Implementation must nevertheless reconcile edits to shared OpenSpec
documentation/configuration with that active change before either candidate is
integrated.

## Impact

Affected current source includes `README.md`, OpenSpec installation/workflow/
metadata and Claude installation guides, `openspec/config.yaml`, the portable
`openspec-delivery` skill, and `tests/openspec-cli-compatibility.mjs`. The change
updates no runtime dependency, project Node engine, installed profile, upstream
skill package, GitHub workflow, published endpoint, or archived record.

Compatibility is bounded to the reviewed v1.16.0 CLI release: npm installation
requires Node 22.12.0+, strict scenario/config validation remains enabled, and
the existing scratch-HOME credential-minimized probe continues to run the exact
pinned package. Planning is authorized only; implementation, commits, pushes,
publication, and profile writes remain out of scope.
