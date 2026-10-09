# Skill distribution scripts

## Purpose

Generate the static well-known skill endpoint from canonical categorized sources.

## Ownership

- `build-well-known-skills.mjs` owns discovery, metadata validation, package inventory, and site generation.

## Local Contracts

- Export `buildWellKnownSkills({root, output})` for synthetic fixture tests; CLI defaults to repository root and `dist/`.
- Emit `.well-known/skills/index.json` with a `skills` array: each entry has `name`, `description`, and explicit relative `files` including SKILL.md.
- Copy only SKILL.md and regular files below assets/, examples/, references/, scripts/, and templates/. Reject symlinks and unsafe or hidden paths; never expose AGENTS.md or secrets.
- Validate YAML metadata, unique directory-matching names, descriptions, and versions before deleting or creating output. Output may not overlap skill source.
- Publish complete packages deterministically; rebuilds remove stale endpoint inventory. Keep the root landing page minimal and link the index.
- This is a static build, not a custom registry server. Installer scanning remains the consumer's responsibility.

## Work Guidance

Add behavior tests before changing the public index or safety boundary. Use explicit parser dependencies rather than treating regex as a YAML parser.

## Verification

Run `npm test` and `npm run build`. Release verification fetches all advertised files and runs Hermes in an isolated home.

## Child DOX Index

No child DOX documents. Parent: `../AGENTS.md`.
