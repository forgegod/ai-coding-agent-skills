# AI Coding Agent Skills

Portable engineering workflows for AI coding agents. This repository owns the skill sources and their static distribution endpoint; adopting projects own their DOX contracts, product behavior, and change progress.

## Catalog

| Skill | Purpose |
| --- | --- |
| [application-records](skills/software-development/application-records/SKILL.md) | Canonical CAP/CHG lifecycle and evidence. |
| [blueprint-initialization](skills/software-development/blueprint-initialization/SKILL.md) | Explicit one-time adoption of a copied blueprint; includes the initial DOX template. |
| [capability-wireframes](skills/software-development/capability-wireframes/SKILL.md) | CAP-linked HTML/PNG visual handoff. |
| [git-commit-message](skills/software-development/git-commit-message/SKILL.md) | Tiered Conventional Commit messages from staged changes. |
| [phased-plan-design](skills/software-development/phased-plan-design/SKILL.md) | Design restart-safe CHG phases. |
| [phased-plan-execution](skills/software-development/phased-plan-execution/SKILL.md) | Execute and prove one CHG phase. |
| [phased-plan-overview](skills/software-development/phased-plan-overview/SKILL.md) | Inspect active changes and select work to resume. |
| [phased-plan-refactoring](skills/software-development/phased-plan-refactoring/SKILL.md) | Split or resequence work at verified boundaries. |

## Install with Hermes

Discovery index:

https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/index.json

Search the project URL (the project path is required):

```sh
hermes skills search https://forgegod.github.io/ai-coding-agent-skills/
```

Install an individual skill and its advertised support files through the well-known adapter:

```sh
hermes skills install well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/application-records --category software-development
```

To target a named profile, add `-p <profile>`; for example:

```sh
hermes -p hermes-dev skills install well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/application-records --category software-development
```

Install the seven scanner-compatible skills (POSIX shell; omit `-p hermes-dev` to use the active profile). The initializer has a separate manual-review path below:

```sh
for skill in application-records capability-wireframes git-commit-message phased-plan-design phased-plan-execution phased-plan-overview phased-plan-refactoring; do
  hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/$skill" --category software-development || break
done
```

Installations become available in new sessions. Existing local copies can produce name conflicts: back up local edits and review the installer's replacement prompt rather than forcing a reinstall.

### Manual initializer installation

All eight complete packages are published. The current Hermes community scanner marks `blueprint-initialization` as **dangerous**, because `templates/root-AGENTS.md` requires updating project AGENTS.md contracts. This is intentional DOX behavior, but normal hub installation is blocked. The template remains intact and visible to scanning; neither the well-known nor GitHub route bypasses this finding.

Only install this package manually after an operator reviews both [SKILL.md](skills/software-development/blueprint-initialization/SKILL.md) and [the full DOX template](skills/software-development/blueprint-initialization/templates/root-AGENTS.md), including its file-deletion and project-instruction boundaries. Manual installation does not receive the hub scanner's approval or hub provenance/update tracking.

For an explicitly reviewed `hermes-dev` installation, clone this repository into a new review directory, inspect the two files, then copy the complete package into that profile. These are separate operator steps, not an automatic install script:

```sh
git clone https://github.com/forgegod/ai-coding-agent-skills.git ai-coding-agent-skills-review
```

After review, from the directory containing that checkout:

```sh
destination="$HOME/.hermes/profiles/hermes-dev/skills/software-development/blueprint-initialization"
test ! -e "$destination" && mkdir -p "$(dirname "$destination")" && cp -R ai-coding-agent-skills-review/skills/software-development/blueprint-initialization "$destination"
hermes -p hermes-dev skills list --source local
```

The copy command refuses to overwrite an existing installation. If one exists, stop and compare it rather than deleting local edits. Select another profile destination deliberately; never modify another profile implicitly. Initialization still requires an explicit adoption request and must never run on this skills-hosting repository itself.

### GitHub fallback

The well-known endpoint is the preferred, host-independent distribution route. The categorized source packages can also be installed directly:

```sh
hermes skills install forgegod/ai-coding-agent-skills/skills/software-development/application-records --category software-development
```

Other Agent Skills-compatible agents can consume the same SKILL.md packages using their own installation mechanism. Well-known discovery and Hermes-specific metadata support depend on the client.

## Security and boundaries

These are community skills, not Hermes built-in or official skills. Hermes fetches and scans hub-installed packages for suspicious instructions, exfiltration, shell injection, and destructive commands. Scanning is not a safety guarantee: review the source and any findings. Do not bypass a blocked install with `--force`.

Only SKILL.md and allowlisted support directories are distributed. Repository-control documents and hidden or credential-file paths are excluded or rejected; symlinks are rejected. This packaging boundary does not establish that arbitrary source content is safe.

Skills are execution aids. The target project's root and child AGENTS.md files remain authoritative. Blueprint initialization runs only on an explicit adoption request and never removes a shared profile installation.

## Development and publishing

Requires Node 22 or newer; the YAML parser is the only npm dependency.

```sh
npm ci
npm test
npm run build
```

Canonical source is `skills/<category>/<name>/`. `dist/` is generated and ignored. The generator emits the complete `.well-known/skills/` inventory, with an explicit file list for each package. The initializer's `templates/root-AGENTS.md` is included.

Pull requests run credential-free checks. Pushes to main and manual publishing runs build and test before deploying dist/ to GitHub Pages. Deployment packages dot-directories explicitly because the stock upload-pages-artifact action omits them.

The build tests cover metadata, workflow contracts, complete inventories, forbidden paths, symlinks, and deployment packaging. Release verification must additionally fetch the live index and every advertised file and exercise actual Hermes discovery/installation in an isolated scratch home.

## Provenance and license

The initial collection was extracted from [AI Software Blueprint](https://github.com/forgegod/ai-software-blueprint), preserving skill authors and versions except for the installed-package safety correction to blueprint-initialization. Skill source, testing, and publication are owned here; the blueprint references installation instead of bundling a second source copy.

MIT; see [LICENSE](LICENSE).
