---
metadata_version: 1
artifact: tasks
change: local-client-skill-install-01m6896x3994xcc0erw8jnr15z
---
# Local client skill installation tasks

## 1. Native user-global installation

- [ ] 1.1 Extend the installer fixture tests for detected Claude Code and Codex
  user configurations, absent-client omission, complete package copies,
  cross-target collision refusal, client selection, update backups, and dry-run;
  verify each new behavior fails before its implementation and then passes the
  focused test file.
- [ ] 1.2 Implement the preflight target model and CLI selectors so existing
  Hermes profiles and detected native clients install complete packages only into
  their global user directories; verify `tests/local-profile-installation.test.mjs`.
- [ ] 1.3 Update installer contracts and README native/local-install guidance for
  global-only client targets, selectors, backups, and scanner limits; verify the
  documentation and native-installation tests.

## 2. Explicit historical package retirement

- [ ] 2.1 Add failing fixture coverage for the exact seven packages removed from
  the main-to-current catalog, default retention, opt-in purge backups, unrelated
  skill preservation, and conflicting Hermes registration refusal; verify the
  focused test file fails for the missing purge behavior.
- [ ] 2.2 Implement the explicit retirement manifest, `--purge` plan, backups,
  matching Hermes registration archival/removal, and partial-failure reporting;
  verify `tests/local-profile-installation.test.mjs` passes.
- [ ] 2.3 Document reviewed migration, dry-run, recovery, and no-automatic-purge
  boundaries in the installer contract and README; verify documentation tests.

## 3. Integrated verification and review

- [ ] 3.1 Run `npm test`, `npm run build`, `npm run validate:openspec`, and
  `git diff --check` after the final local change; record actual results.
- [ ] 3.2 Obtain an independent read-only review of the frozen candidate through
  `/autonomous-implementation-review`, address confirmed findings within the
  authorized task group, and rerun affected gates.

## Workflow follow-up

- A separately authorized documentation write must create or reuse the proposal
  issue, read it back, replace `github_issue: null`, and obtain plan approval
  before `/openspec-next` implementation.
- Local commits, profile/client installation, publication, pull requests, merge,
  archive, and worktree retirement require their separate project-authorized
  delivery steps.
