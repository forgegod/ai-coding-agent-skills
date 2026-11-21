---
metadata_version: 1
artifact: proposal
change: transfer-repository-to-grewety-01m7wcqhgdd3ntk1bpww84a4sf
github_issue: https://github.com/forgegod/ai-coding-agent-skills/issues/25
---
# Proposal

## Why

The project must move from the `forgegod` account to the `grewety` organization
without breaking its repository identity, published skill distribution, or safe
local-install/update behavior. GitHub native transfer preserves repository history
and GitHub records; creating a replacement repository, fork, or mirror would not.

## What Changes

- Plan and implement a controlled GitHub native transfer of
  `forgegod/ai-coding-agent-skills` to `grewety/ai-coding-agent-skills`, retaining
  the repository name, public visibility, default `main` branch, repository ID,
  refs, tags, releases, issue identities, and pull-request identities.
- Inventory old-owner references by purpose and update active owner-dependent
  source, generated distribution content, workflow configuration, tests,
  marketplace metadata, installation instructions, Hermes discovery/update URLs,
  and external-listing guidance. Preserve historical authorship, copyright,
  Blueprint attribution, archived OpenSpec artifacts, and evidence; do not perform
  a blind global replacement.
- Establish a preflight/cutover/recovery runbook for transfer permissions,
  destination availability and policy, records, rulesets, Actions, Pages,
  integrations, remotes across independent and linked checkouts, and GitHub's
  redirect behavior.
- After verified transfer, land only the source changes needed to deploy Pages at
  `https://grewety.github.io/ai-coding-agent-skills/`. Verify the landing page,
  catalog, advertised files, ZIPs, and checksums before publishing canonical links
  or switching installer defaults. Reverify the final deployment and smoke-test
  the public installation routes after that switch. Treat transfer and Pages
  failures as separate stop/recovery paths.
- Extend local Hermes registration behavior and its tests so fresh installs use
  the new canonical well-known source while an exact legacy registration has a
  supported, collision-safe transition on explicit update and remains recognized
  as a managed legacy entry during explicit purge of retired historical packages.
  Preserve unrelated entries, local-edit protection, backups, and scanner
  boundaries; never rewrite live profiles.
- Record measurable implementation acceptance: same GitHub repository ID and
  representative records under `grewety`, preserved refs, protection/CI and Pages
  evidence, and documented installation-route smoke checks proving the skills are
  publicly reachable only after transfer and destination Pages success. Record a
  classified old-URL audit; external-directory claims remain pending until their
  operators verify an update.

**BREAKING:** the canonical GitHub, Pages, marketplace, and Hermes well-known
source becomes `grewety/ai-coding-agent-skills`. Legacy GitHub redirects are a
compatibility aid, not a substitute for updating canonical documentation or for a
verified Pages migration.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `local-skill-installation`: managed Hermes local-copy provenance must recognize
  the exact former well-known registration as a controlled migration input on
  explicit update and explicit purge of retired historical packages while
  continuing to reject arbitrary/conflicting sources and protect local state.

## Impact

Expected implementation touches active repository/distribution documentation,
GitHub workflow and marketplace metadata, build/provenance/installer scripts and
associated tests. It also requires separately authorized live GitHub transfer and
Pages deployment validation; it does not authorize an account/profile migration,
repository recreation, fork, mirror, commit, push, settings write, deployment, or
profile write during this planning change.

Current live observations to revalidate at cutover: repository ID is
`R_kgDOVCmNiw`, default branch is `main`, visibility is public, Pages currently
serves the old owner URL by workflow deployment, the destination name currently
returns a nonexistence/visibility-ambiguous 404, and one active main ruleset exists.
The destination organization's transfer policy, transfer permission, and the
meaning of that 404 remain unresolved preflight decisions.

Resolved operating decisions: retain a successfully transferred repository if
Pages fails and use documented GitHub/manual-download recovery rather than
transferring back; do not promote the destination as canonical in public guidance
or installer defaults before its first Pages deployment passes verification;
support only an explicit local-installer update (and explicit purge of retired
historical packages) for exact legacy Hermes registrations; and treat skills.sh as
a non-blocking external listing whose state is recorded as pending until
independently confirmed.

No active sibling proposal was found in the clean default-branch checkout before
scaffolding. Archived material retains old-owner links as historical evidence and
is explicitly out of scope for rewriting.