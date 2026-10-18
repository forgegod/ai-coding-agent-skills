# Skill distribution scripts

## Purpose

Generate and verify the static well-known skill endpoint from canonical categorized sources.

## Ownership

- `build-well-known-skills.mjs` owns discovery, metadata validation, package inventory, and site generation.
- `check-skill-security.py` owns the opt-in release scan against an explicitly selected trusted Hermes source checkout; it never installs packages or changes a profile.

## Local Contracts

- Export `buildWellKnownSkills({root, output})` for synthetic fixture tests; CLI defaults to repository root and `dist/`.
- Emit `.well-known/skills/index.json` with a `skills` array: each entry has `name`, `description`, and explicit relative `files` including SKILL.md.
- Copy only SKILL.md and regular files below assets/, examples/, references/, scripts/, and templates/. Reject symlinks and unsafe or hidden paths; never expose AGENTS.md or secrets.
- Validate YAML metadata, unique directory-matching names, descriptions, and versions before deleting or creating output. Output may not overlap skill source.
- Publish complete packages deterministically; rebuilds remove stale endpoint inventory. Keep the root landing page minimal and link the index.
- This is a static build, not a custom registry server. Installer scanning remains the consumer's responsibility.
- The release scan uses the real Hermes community policy without force, checks exact advertised inventories, and extends content coverage to all UTF-8 package files (including `.mjs`/`.cjs`) in-process only. Missing scanner, invalid inventory, symlinks, undecodable content, and non-safe verdicts fail closed. Never duplicate threat regexes or hide required package files to pass.

## Work Guidance

Add behavior tests before changing the public index or safety boundary. Use explicit parser dependencies rather than treating regex as a YAML parser.

## Verification

Run `npm test` and `npm run build`. Release verification fetches all advertised files and runs Hermes in an isolated home.
With Python compatible with the selected Hermes scanner, `HERMES_SOURCE=<trusted-checkout> npm run test:security` runs real-scanner negative controls and scans a fresh build. It reports scanner version/hash; no network or profile writes are required. Ordinary CI remains Hermes-independent.

## Child DOX Index

No child DOX documents. Parent: `../AGENTS.md`.
