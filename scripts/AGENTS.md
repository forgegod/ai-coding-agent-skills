# Skill distribution scripts

## Purpose

Generate and verify the static well-known skill endpoint and Claude upload packages from canonical categorized sources.

## Ownership

- `build-well-known-skills.mjs` owns discovery, metadata validation, package inventory, and site generation.
- `validate-openspec-metadata.mjs` owns read-only validation of native OpenSpec Markdown identity frontmatter, archive/path consistency and optional proposal issue readiness. `tests/openspec-cli-compatibility.mjs` owns the opt-in pinned upstream validation/spec-update/archive probe in scratch; neither modifies a real vault or creates tickets.
- `build-distribution.mjs` owns the full build entry point, Claude marketplace validation, deterministic complete-package ZIPs, plugin wrappers, and download HTML/checksum inventory. It enforces two explicit bundles: the OpenSpec companion set and optional orchestration. Every canonical package belongs to exactly one bundle. Root owns the source marketplace manifest.
- `check-skill-security.py` owns the opt-in release scan against an explicitly selected trusted Hermes source checkout; it never installs packages or changes a profile.
- `install-local-skills.mjs` owns collision-safe installation and explicit, backed-up updates of every validated local package into selected Hermes profiles.
- `hermes-skill-provenance.mjs` owns Hermes HubLockFile v1 compatibility: public update identifiers, exact installed-content baselines, and atomic preservation of unrelated registration entries. `tests/local-update-integration.mjs` owns the opt-in real CLI/internet compatibility probe in scratch profiles.

## Local Contracts

- Export `buildWellKnownSkills({root, output})` for synthetic fixture tests; CLI defaults to repository root and `dist/`.
- Emit `.well-known/skills/index.json` with a `skills` array: each entry has `name`, `description`, and explicit relative `files` including SKILL.md.
- Copy only SKILL.md and regular files below assets/, examples/, references/, scripts/, and templates/. Reject symlinks and unsafe or hidden paths; never expose AGENTS.md or secrets.
- Validate YAML metadata, unique directory-matching names, descriptions, and versions before deleting or creating output. Output may not overlap skill source.
- Publish complete packages deterministically; rebuilds remove stale endpoint inventory. Keep the root landing page minimal and link the index.
- This is a static build, not a custom registry server. Installer scanning remains the consumer's responsibility.
- The full build validates catalog metadata, exact per-bundle skill selections, and opt-in isolation before replacing output. The workflow bundle names delivery, next-step execution, commits and wireframes. The orchestration bundle names only its one package. Duplicates within a bundle and canonical packages selected by no bundle fail; every canonical package must be covered. It reuses canonical package discovery and never edits source or installs profiles. Reject unknown catalog components, source/output symlinks, a conflicting root plugin manifest, and source overlap. Use explicit skill lists for the Git marketplace; export only validated package files into ZIPs, plus generated metadata/README and the root license for plugin wrappers. Fixed ZIP timestamps and ordered input give repeatable bytes; the inventory records SHA-256 hashes. Rebuilds remove stale downloads.
- The release scan uses the real Hermes community policy without force, checks exact advertised inventories, and extends content coverage to all UTF-8 package files (including `.mjs`/`.cjs`) in-process only. Missing scanner, invalid inventory, symlinks, undecodable content, and non-safe verdicts fail closed. Never duplicate threat regexes or hide required package files to pass.
- The local installer preserves category/package paths, detects only Hermes profiles with an identity file, and preflights every selected destination before copying. Default installation refuses existing packages; `--update` installs missing packages and replaces whole existing packages after preserving them outside skill discovery under `.skills-backups/<batch>/<category>/<skill>`. Stage all copies before replacement, reject destination/backup-parent symlinks and source overlap, leave unrelated skills alone, and report partial failure rather than claiming a cross-profile transaction. Dry-run writes nothing. This direct copy is not a Hermes scanner-approved installation.
- Register local packages against the canonical public well-known endpoint, with community trust, `unscanned` verdict, empty scan provenance, and explicit `local-checkout` metadata. Never reuse a previous scan attestation or upstream revision for newly copied bytes. Hashes must match Hermes's POSIX-path/NUL/raw-byte SHA-256 format and string ordering. Preflight malformed/unsupported locks and conflicting names, sources, or install paths; preserve unrelated entries and refuse observed concurrent lock changes. Do not run local installs concurrently with Hermes skill updates. Future hub updates use their normal scanner and protect post-install local edits; unpublished local content can be replaced by older published bytes.

## Work Guidance

Add behavior tests before changing the public index or safety boundary. Use explicit parser dependencies rather than treating regex as a YAML parser.

## Verification

Run `npm test` and `npm run build`. Release verification fetches all advertised files and ZIPs, verifies checksums, and runs Hermes in an isolated home. Claude validation/local installation uses a scratch HOME and CLAUDE_CONFIG_DIR; verify component inventories and extracted ZIPs without claiming Desktop GUI acceptance or workflow execution. After publication, test the actual Desktop marketplace/upload routes separately.
With Python compatible with the selected Hermes scanner, `HERMES_SOURCE=<trusted-checkout> npm run test:security` runs real-scanner negative controls and scans a fresh build. It reports scanner version/hash; no network or profile writes are required. Ordinary CI remains Hermes-independent.
With an installed Hermes CLI and internet access, `npm run test:local-update` registers all packages in a scratch home and exercises the real public `git-commit-message` update and local-edit protection. Keep account HOME unchanged for runtime discovery, set only scratch HERMES_HOME, and remove inherited HERMES_PROFILE. The probe must not modify live profile skills or assert that unpublished packages already exist remotely.

## Child DOX Index

No child DOX documents. Parent: `../AGENTS.md`.
