---
metadata_version: 1
artifact: tasks
change: update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr
---
# OpenSpec 1.16 prerequisite update tasks

## 1. Align current release documentation and source instructions

- [x] 1.1 Re-inventory non-archived OpenSpec version, package, Node-floor, release-tag, and immutable-source references; reconcile shared-file overlap with `parallel-change-workflow` before editing, and verify `openspec/changes/archive/` remains excluded from the change.
- [x] 1.2 Update `README.md`, `docs/openspec-installation.md`, `docs/openspec-workflow.md`, `docs/openspec-metadata.md`, `docs/claude-installation.md`, `openspec/config.yaml`, and `skills/software-development/openspec-delivery/SKILL.md` to state OpenSpec v1.16.0, commit `27c0515724decc633818c735ee596481eec78a8b`, and the existing seven-workflow inventory/source claims; verify all current release links, review commands, and package-content claims agree.
- [x] 1.3 Scope Node 22.12.0+ wording to documentation of the OpenSpec npm package while preserving unrelated `package.json` engine, CI, and packaged-guard requirements; verify a non-archived reference audit finds no stale v1.15.0 prerequisite/pin and no unintended generic Node-floor edits.

## 2. Pin and exercise the existing isolated compatibility probe

- [x] 2.1 Change only the exact OpenSpec package pin in `tests/openspec-cli-compatibility.mjs` from 1.15.0 to 1.16.0, retaining its scratch HOME/cache, telemetry, credential-minimized allowlist, `--ignore-scripts`, and strict-validation/task/spec-sync/archive/metadata coverage; verify the test still asserts the executed CLI reports the pinned version.
- [x] 2.2 Run `npm run test:openspec` with network access and verify its probe log reports the exact v1.16.0 npm package plus strict validation, task discovery, spec synchronization, byte-preserving archive behavior, and post-sync metadata validation; report any external npm failure without substituting ambient CLI output.

## 3. Validate the complete current-source change

- [x] 3.1 Run `openspec validate --all --strict --json --no-interactive` with OpenSpec 1.16.0 and `npm run validate:openspec`; verify the zero-delta package remains valid with `skip_specs: true`, delta specs remain frontmatter-free, and proposal issue metadata remains valid.
- [x] 3.2 Run `npm test`, `npm run build`, and `git diff --check`; verify distribution generation succeeds and no generated output, installed profile, upstream-vendored package, or archived OpenSpec record is modified.
- [x] 3.3 Re-read the target branch and active `parallel-change-workflow` artifacts before any authorized integration; reconcile shared documentation/configuration semantics, rerun affected gates after the final edit, and record actual results without claiming publication, merge, or archive.

## Workflow follow-up

- Plan approval authorizes neither implementation nor Git/remote writes. Execute only under a later explicit `/openspec-apply-change` or project-selected delivery invocation.
- Any publication, protected integration, issue closure, receipt, and archive remain separately authorized finish work; native `tasks.md` remains the sole mutable task authority.
