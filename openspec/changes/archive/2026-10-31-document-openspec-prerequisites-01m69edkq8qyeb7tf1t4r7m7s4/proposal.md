---
metadata_version: 1
artifact: proposal
change: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
github_issue: https://github.com/forgegod/ai-coding-agent-skills/issues/5
---
# Document mandatory OpenSpec skill installation

## Why

The README explains installation of this distribution's companion skills but leaves upstream OpenSpec's mandatory workflow skills as an unspecified prerequisite. Contributors need one source-grounded setup guide for Hermes Agent, Claude Desktop/Code and OpenAI Codex without mistaking companion installation for a complete OpenSpec environment.

## What Changes

- Add `docs/openspec-installation.md` as the canonical prerequisite guide, linked from `README.md`, `docs/claude-installation.md` and `docs/openspec-workflow.md`.
- List the seven skills required for this project's documented workflow: `openspec-explore`, `openspec-propose`, `openspec-update-change`, `openspec-apply-change`, `openspec-sync-specs`, `openspec-archive-change` and `openspec-verify-change`. Verification remains advisory even though its skill is a setup prerequisite. These are project-selected prerequisites, not a claim that every upstream user needs every workflow.
- Separate the OpenSpec CLI prerequisite (the existing 1.15.0 pin), upstream skill installation/enablement, this repository's companion packages, and project workflow adoption. Preserve the distinct optional orchestration package and its host prerequisites.
- Document profile-scoped Hermes discovery/inspection/installation with normal scanning, detection of already-installed disabled skills, selective enablement and enabled-inventory checks.
- Document user-global Claude Code and Codex setup with explicit skill selection and native invocation spelling. Explain what native OpenSpec initialization generates and why it is not a user/profile installer; do not instruct contributors to initialize this existing repository just to acquire skills.
- Distinguish Claude Desktop Chat/account uploads, Cowork, and the Code tab/CLI. Explain complete individual skill ZIP preparation/upload without promising an upstream marketplace or ready-made upstream downloads that have not been verified. Retain the existing GUI-first companion route and state the local CLI/repository execution requirements.
- Document version alignment, collision/local-edit preservation, update ownership, and actual skill loading verification with current primary sources. Commands that fetch moving upstream content must not be presented as release-pinned or automatically compatible.
- Establish a same-change documentation maintenance rule in `AGENTS.md` and the installation/SDLC guidance: changes to OpenSpec's required skill set, CLI/runtime versions, companion dependencies or supported installation routes must update all affected current instructions, inventories, commands and verification steps before that change is complete. Do not defer the documentation to a follow-up or rewrite historical archived plans.

## Capabilities

### New Capabilities

None. This is installation documentation for existing prerequisites, not new system behavior. The native `.openspec.yaml` sets `skip_specs: true`; no delta specs will be authored.

### Modified Capabilities

None. The existing `local-skill-installation` specification describes this repository's installer, which remains unchanged. The active `parallel-change-workflow` change is not resumed, renamed or edited.

## Impact

Planned implementation files are limited to `AGENTS.md`, `README.md`, new `docs/openspec-installation.md`, `docs/claude-installation.md` and `docs/openspec-workflow.md`. `AGENTS.md` owns the future maintenance obligation; the guides describe the affected installation instructions and verification. No skill source, test code, dependency, installer, marketplace manifest, ZIP generator, CI or deployment behavior changes. The published inventory remains five companion packages and two plugin bundles; this change does not vendor upstream actions.

The proposal is prepared in a dedicated worktree based on `fc184fb1a5068b129c33017b8e8619c5334cf18a`. Potential overlap with `parallel-change-workflow` is installation prose, not a capability-spec change; compare live documentation before integration. No upstream version upgrade or new implementation prerequisite is introduced.

## Acceptance

The guide exposes the complete explicit workflow selection, source-grounded host-specific setup and verification, and clear CLI/skill/companion/adoption boundaries. The root contract and guides require same-change documentation updates whenever the required skill set or dependencies change, including affected host instructions, version/source pins, inventories, installation/enablement/update commands and verification steps. Review checks the documented setup against the resulting prerequisites and blocks completion while affected instructions are stale; a future follow-up is not sufficient. Existing documentation/native-installation tests, `npm test`, `npm run build`, local metadata validation and upstream strict validation pass. Installation snippets are checked in isolated scratch homes/workspaces; unsupported or unperformed Desktop/client probes are labeled rather than invented. Package inventories and production code remain unchanged.

## Authority and non-goals

This invocation authorizes planning only, isolated proposal setup and the one proposal-time documentation issue required by the root contract. Stop for plan review before editing installation documentation. No implementation, commits, push, PR, release, deployment, real installation/profile changes, spec sync/archive or issue closure is authorized. Installing these prerequisites does not adopt this workflow for another project, grant execution authority or bypass host/security policy.
