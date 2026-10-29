# AI Coding Agent Skills

## Purpose

Maintain portable AI coding-agent playbooks and publish complete Agent Skills packages through a static well-known endpoint and native Claude installation packages.

## Ownership

- `skills/` owns categorized skill source and its local DOX contracts.
- `scripts/` owns deterministic endpoint/ZIP generation and the opt-in release security scan; `tests/` owns executable packaging and guard evidence.
- `.github/` owns credential-free verification and GitHub Pages deployment with narrowly scoped deployment permissions.
- Root owns this contract, README, package manifest, license, ignore rules, `.claude-plugin/marketplace.json`, distribution documentation including `docs/claude-installation.md`, the selectable workflow in `docs/openspec-workflow.md`, and project-local `openspec/` change artifacts.

## Local Contracts

- Read applicable parent and child AGENTS.md files before editing. Update owning contracts and child indexes after changing durable responsibilities or workflows.
- `skills/<category>/<name>/SKILL.md` is canonical. Generated `.well-known/skills/` packages contain only SKILL.md and explicitly supported package directories, never repository-control documents, credentials, or profile state.
- Preserve portable workflows and synthetic examples; project DOX and product policy always outrank a skill.
- Publish via GitHub Pages at `https://forgegod.github.io/ai-coding-agent-skills/`. Support discovery under the project URL, not an assumed origin-root endpoint.
- Community installation uses Hermes security scanning. Do not recommend bypassing scan failures with --force or claim built-in trust.
- Document Claude Code, Codex, Kilo (modern and legacy), and Pi native user/project installation from their current upstream skill-discovery documentation. Native copying preserves complete packages, preflights collisions, and does not claim Hermes scanner approval or cross-host tool equivalence.
- Lead Claude installation with the native marketplace GUI and ready-made ZIP uploads, citing Anthropic primary sources; keep directory copies as advanced alternatives. Separate installation, account sync, and host execution verification. No official catalog listing or Desktop acceptance is implied by local packaging tests.
- The Claude marketplace selects canonical source via explicit root-relative skill lists: `openspec-development` contains integration, commits and wireframes; `autonomous-orchestration` is a separate opt-in. Duplicates within a bundle and unselected canonical packages fail. Do not add a root plugin manifest, automatic orchestration dependency, hooks, agents, or connectors. Bump every affected plugin version on bundled-content changes. Generated plugin wrappers and ZIPs stay untracked and preserve complete canonical package bytes.
- Directory-discovery documentation distinguishes public package availability from actual indexing/submission. Preserve literal domains, confirm catalog policies, and do not invent listings, dummy root skills, telemetry installs, or authentication/submission success.
- Publish all four complete packages: `openspec-change-integration`, `git-commit-message`, `capability-wireframes`, and the separate `autonomous-implementation-review` package. The scanner-blocked blueprint initializer is migration-local to AI Software Blueprint and is not part of this distribution.
- `docs/openspec-workflow.md` is the SDLC for this distribution. Installing skills does not select that workflow for another project or transfer its records. Native `tasks.md` is the sole mutable task authority. GitHub issues and pull requests document and review; they are not a second task list. Do not invent a ticket or prospective merge evidence. Post-merge receipts remain Git-tracked when integration is authorized.
- A skill installed in a shared agent profile must not remove or modify its installed package while operating on a target project.
- Source migration preserves complete packages and provenance; generated output is disposable and untracked.
- Changes in this repository may be committed and pushed when requested. Changes in other repositories require their own authorization.

## Work Guidance

- Use Agent Skills frontmatter with name, description, and version. Keep related skill names resolvable and support files portable.
- Keep the build dependency-light; reject malformed metadata, unsafe paths, duplicate names, and symlinks rather than publishing incomplete packages.
- Tests use synthetic fixtures and local output; live endpoint and installer probes are release checks, not ordinary CI dependencies.
- Exercise documented native copy commands in isolated scratch homes; do not modify real agent installations while testing documentation or claim client discovery was verified if that client is unavailable.
- Documentation describes the current design. Git history carries migration history.
- Operator-facing launch examples state their exact side-effect authority; displaying a template neither executes it nor grants permission. Keep canonical examples synchronized by tests.
- Operational documentation states the supported SDLC, its execution boundaries, and the companion skills. It does not infer that another project has adopted this workflow from installation.

## Verification

- With Node 22+ and Git available, `npm test` proves package metadata, workflow boundaries, read-only evidence guards against isolated Git fixtures, and endpoint artifacts.
- `npm run build` generates the distributable static site, complete skill/plugin ZIPs, download page, and checksum inventory. Test native Claude validation/installation in a scratch home; Desktop upload and published-download checks are separate release probes.
- `HERMES_SOURCE=<trusted-checkout> npm run test:security` additionally requires Python compatible with that Hermes scanner. It rebuilds, proves `.mjs` negative controls, and requires safe community verdicts for every complete package. This local release gate does not replace the normal installer scan or grant installation authority.
- Before publishing, verify clean diffs and the full package inventory. After publishing, fetch the index and every advertised file and exercise Hermes discovery and installation in an isolated scratch home.

## Child DOX Index

| Child | Owns | Read when editing |
| --- | --- | --- |
| `skills/AGENTS.md` | Portable skill sources and category ownership. | Any skill or support file. |
| `scripts/AGENTS.md` | Endpoint generation and release security scanning. | Build behavior, public package format, or scanner verification. |
| `.github/AGENTS.md` | Verification and deployment workflows. | CI or GitHub Pages publishing. |
