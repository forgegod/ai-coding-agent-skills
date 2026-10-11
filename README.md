# AI Coding Agent Skills

Portable engineering workflows for AI coding agents. This repository owns the skill sources and their static distribution endpoint; adopting projects own their DOX contracts, product behavior, and change progress.

## Catalog

| Skill | Purpose |
| --- | --- |
| [autonomous-implementation-review](skills/autonomous-ai-agents/autonomous-implementation-review/SKILL.md) | Bounded implementation and independent review loop. |
| [application-records](skills/software-development/application-records/SKILL.md) | Canonical CAP/CHG lifecycle and evidence. |
| [capability-wireframes](skills/software-development/capability-wireframes/SKILL.md) | CAP-linked HTML/PNG visual handoff. |
| [git-commit-message](skills/software-development/git-commit-message/SKILL.md) | Dependency-aware logical Git batches, a preview before apply (or autonomous execution), and tiered Conventional Commit messages. |
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

Install the seven generic software-development skills (POSIX shell; omit `-p hermes-dev` to use the active profile):

```sh
for skill in application-records capability-wireframes git-commit-message phased-plan-design phased-plan-execution phased-plan-overview phased-plan-refactoring; do
  hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/$skill" --category software-development || break
done
```

`autonomous-implementation-review` is published separately because it can coordinate editing
agents and worktrees. Review its complete package before installing it; the normal
seven-package example does not establish scanner approval for it:

```sh
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/autonomous-implementation-review" --category autonomous-ai-agents
```

Installations become available in new sessions. Existing local copies can produce name conflicts: back up local edits and review the installer's replacement prompt rather than forcing a reinstall.

### Run the autonomous implementation-review loop

Use `autonomous-implementation-review` from the orchestrator session, not an
executor pane. First create a compact task packet and durable handoff record;
ask the skill to prepare this only, without dispatching an executor:

```text
/autonomous-implementation-review Prepare only the task packet and durable handoff record at <handoff-record path>; do not dispatch an executor yet.

Outcome: <desired result>
Scope: <included paths or behaviour>
Non-goals: <excluded work>
Acceptance criteria: <testable requirements>
Workspace/base: <repository and base commit or branch>
Required verification: <tests, lint, build>
Constraints: no commits, pushes, deployments, secrets, or external writes.
```

Then start a self-paced loop that reloads the skill at every tick:

```text
/loop /autonomous-implementation-review Continue <task name> from <handoff-record path>. Read the handoff record and current workspace before acting. Execute one bounded implementation, verification, review, or confirmed-fix phase; update the handoff record with evidence; preserve unrelated changes; do not commit, push, deploy, or access secrets. End with LOOP_COMPLETE only when every acceptance criterion is verified or a real user decision blocks progress. --until every acceptance criterion is verified or a real user decision is required
```

Omit the interval for self-paced work. Add an interval such as `5m` after
`/loop` only while waiting for external state such as CI. For one finite coding
objective, prefer `/goal` instead; do not run an active `/goal` and this loop
for the same task because the goal defers loop wakeups.

Hermes automatically compresses the orchestrator context at its configured
threshold (50% by default), and active loops survive that compression. Do not
use `/loop resume` as a context reset. To compact earlier, the operator—not the
running agent—must enter these commands in the orchestrator session:

```text
/loop pause
/compress here 2
/context
/loop resume
```

An agent printing a slash command does not execute it in its own session. Keep
the handoff record current so automatic compression and a later fresh session
have grounded task state without replaying full logs or diffs.

### GitHub fallback

The well-known endpoint is the preferred, host-independent distribution route. The categorized source packages can also be installed directly:

```sh
hermes skills install forgegod/ai-coding-agent-skills/skills/software-development/application-records --category software-development
```

Other Agent Skills-compatible agents can consume the same SKILL.md packages using their own installation mechanism. Well-known discovery and Hermes-specific metadata support depend on the client.

## Install with Claude Code, Codex, Kilo, or Pi

These recipes use each agent's native skill directories. They assume the agent
and Git are already installed, and use a POSIX shell (Linux, macOS, or Windows
through WSL/Git Bash). Native installs do not run the Hermes security scanner and
do not receive its approval or hub update tracking. Review the skill instructions
and all supporting files before installing; do not use another agent merely to
evade a finding you have not reviewed.

### Prepare a reviewed checkout

Clone into a new review directory. Inspect the source and note
`git -C ai-coding-agent-skills-review rev-parse HEAD`
to record the revision you reviewed. Do not automatically pull
unreviewed changes into a global skill directory.

```sh
git clone https://github.com/forgegod/ai-coding-agent-skills.git ai-coding-agent-skills-review
```

After review, from the directory containing that checkout, define this helper in
the same shell used for the agent-specific commands below. It copies all eight
package directories, preflights all name collisions, and never overwrites local
edits.

```sh
# Native installation helper
skills_source="$PWD/ai-coding-agent-skills-review/skills"
install_reviewed_skills() (
  set -eu
  destination="$1"
  for package in autonomous-ai-agents/autonomous-implementation-review software-development/application-records software-development/capability-wireframes software-development/git-commit-message software-development/phased-plan-design software-development/phased-plan-execution software-development/phased-plan-overview software-development/phased-plan-refactoring; do
    skill="${package##*/}"
    test -f "$skills_source/$package/SKILL.md"
    if [ -e "$destination/$skill" ] || [ -L "$destination/$skill" ]; then
      printf 'Refusing to overwrite %s\n' "$destination/$skill" >&2
      exit 1
    fi
  done
  mkdir -p "$destination"
  for package in autonomous-ai-agents/autonomous-implementation-review software-development/application-records software-development/capability-wireframes software-development/git-commit-message software-development/phased-plan-design software-development/phased-plan-execution software-development/phased-plan-overview software-development/phased-plan-refactoring; do
    skill="${package##*/}"
    cp -R "$skills_source/$package" "$destination/$skill"
  done
)
```

Choose the agent and scope deliberately. Run only the desired recipe; some agents
also discover other agents' compatibility directories, so duplicate names can
cause conflicting copies. Project-scoped destinations are relative to the target
project, not this review checkout: switch to that project before using them.

### Claude Code

Personal installation, available across projects:

```sh
install_reviewed_skills "$HOME/.claude/skills"
```

For project-only installation, use `install_reviewed_skills "$PWD/.claude/skills"`
from the target project. Start a fresh Claude Code session, inspect `/` autocomplete
for `application-records`, or explicitly invoke `/application-records`. Verify the
loaded skill path and content rather than relying only on the model's claim.

Reference: [Claude Code skills](https://code.claude.com/docs/en/skills).

### Codex

Personal installation uses the current Agent Skills directory, not a guessed
`codex skills install` subcommand:

```sh
install_reviewed_skills "$HOME/.agents/skills"
```

For project-only installation, use `install_reviewed_skills "$PWD/.agents/skills"`
from the target repository. Open `/skills` or mention `$application-records` in
Codex CLI/the IDE extension. Codex detects skill changes automatically; restart
if the new entries do not appear. `.agents/skills` is also consumed by some other
agents, so this location is shared rather than Codex-exclusive.

Reference: [OpenAI local skill discovery](https://learn.chatgpt.com/docs/build-skills).

### Kilo

Current Kilo CLI and the current VS Code platform use `.kilo`:

```sh
install_reviewed_skills "$HOME/.kilo/skills"
```

For project-only installation, use `install_reviewed_skills "$PWD/.kilo/skills"`.
Start a new session or run `/reload`; invoke `/application-records` and inspect
the `skill` tool call to confirm the selected package.

The legacy Kilo Code extension uses `~/.kilocode/skills/` and project
`.kilocode/skills/` instead. For that version only, use
`install_reviewed_skills "$HOME/.kilocode/skills"`, then reload the VS Code window.
Do not install identical copies into both modern and compatibility directories.

Modern Kilo also supports `skills.urls` pointing at a well-known directory, but
its discovery behavior does not imply that Kilo applies the Hermes scanner policy.

References: [Current Kilo skills](https://github.com/Kilo-Org/kilocode/blob/main/packages/kilo-docs/pages/customize/skills.md)
and [legacy Kilo skills](https://github.com/Kilo-Org/kilocode-legacy/blob/main/docs/legacy-ides/customize/skills.md).

### Pi

Personal installation for the Pi coding agent defaults to `~/.pi/agent/skills/`.
The command also honors an explicitly configured `PI_CODING_AGENT_DIR`:

```sh
install_reviewed_skills "${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}/skills"
```

For project-only installation, use `install_reviewed_skills "$PWD/.pi/skills"`
from the target project and review its project-trust prompt. Start a new session
or run `/reload`, then invoke `/skill:application-records`. Pi also discovers
`.agents/skills`; avoid copying the same skill into both locations.

References: [Pi skills](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md)
and [Pi agent/project directories](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/configuration.md).

These packages contain Hermes-specific tool names such as `terminal`, `read_file`,
`patch`, and `skill_view`. In another agent, use its equivalent shell/read/edit
tools and resolve support paths from the loaded skill directory; do not assume
Hermes tools or `metadata.hermes` integrations exist there. Package placement is
portable, but correct workflow execution depends on the host's available tools
and the target project's contracts. Keep permission and project-trust checks on.

## Discovery on skill directories

GitHub source, the well-known endpoint, and third-party directory listings are
separate distribution surfaces. A successful Pages deployment does not submit
this collection to a catalog or guarantee a listing.

### skills.sh

The [skills.sh FAQ](https://skills.sh/docs/faq) describes automatic listing through
anonymous installation telemetry from the `skills` CLI. There is no separate
registry publish command or submission form for this route. This public repository
already contains discoverable SKILL.md packages; a root SKILL.md is not required.

Inspect the available packages without installing:

```sh
npx skills add forgegod/ai-coding-agent-skills --list
```

After reviewing the selected package, a genuine user installation can use:

```sh
npx skills add forgegod/ai-coding-agent-skills --skill application-records --agent claude-code
```

The default scope is the current project; add `--global` for a personal install.
Choose explicit skill names rather than `--all` or `--skill '*'`. The `skills` CLI
is not the Hermes installer, and its installation/audit behavior must not be
presented as Hermes scanner approval. Review replacement prompts and preserve
existing edits.

When install telemetry is enabled, genuine installations contribute to the
directory's indexing/ranking. Do not manufacture installs to inflate the listing.
Users can opt out with `DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1`; opted-out installs
should not be relied on to seed leaderboard visibility. A `--list` discovery check
is not an installation and does not establish a directory entry.

Share the explicit install command with users and check the resulting
[repository directory page](https://skills.sh/forgegod/ai-coding-agent-skills)
after real adoption. Indexing timing and ranking belong to skills.sh; do not claim
a listing merely because the CLI can discover the packages. The GitHub and
well-known install routes remain available independently.

References: [skills.sh documentation](https://skills.sh/docs) and
[upstream skills CLI](https://github.com/vercel-labs/skills#telemetry).

### SkillsLLM (skillsllm.com)

The verified SkillsLLM site is `https://skillsllm.com`. Its
[submission page](https://skillsllm.com/submit) requires GitHub OAuth:

1. Sign in as the operator and submit `https://github.com/forgegod/ai-coding-agent-skills`.
2. Describe it as a collection of eight categorized Agent Skills packages and
   retain the README's installation and security boundaries.
3. Confirm the platform accepts the collection layout, wait for its scanning and
   catalog policy checks, and read back the resulting listing before claiming success.

There are two material catalog constraints to resolve with the operator/site:

- The [About page](https://skillsllm.com/about) states that only repositories with
  **100+ GitHub stars** are included. Submitting a new repository does not guarantee
  public visibility; ask the platform whether submitted collections have an
  exception before relying on this route.
- The [FAQ](https://skillsllm.com/faq) describes a root `SKILL.md`, while the
  [submission guide](https://skillsllm.com/blog/skillsllm-features-guide) says any
  public GitHub URL can be submitted. Our canonical packages live under
  `skills/<category>/<name>/`. Authenticated acceptance of that nested
  collection is not established by the public instructions. Do not add a dummy root skill
  or flatten/duplicate the collection just to satisfy a scraper; confirm collection
  support or an accepted per-package submission format first.

SkillsLLM also documents daily GitHub discovery through SKILL.md files and relevant
topics. Accurate topics such as `agent-skills`, `claude-code`, and `ai-agent` can
help discovery, but do not bypass its star threshold or review. Submissions, OAuth,
moderation, scanner results, and public listing approval remain separate operator
actions, not part of this repository's Pages publishing workflow.

## Security and boundaries

These are community skills, not Hermes built-in or official skills. Hermes fetches and scans hub-installed packages for suspicious instructions, exfiltration, shell injection, and destructive commands. Scanning is not a safety guarantee: review the source and any findings. Do not bypass a blocked install with `--force`.

Only SKILL.md and allowlisted support directories are distributed. Repository-control documents and hidden or credential-file paths are excluded or rejected; symlinks are rejected. This packaging boundary does not establish that arbitrary source content is safe.

Skills are execution aids. The target project's root and child AGENTS.md files remain authoritative.

## Development and publishing

Requires Node 22 or newer; the YAML parser is the only npm dependency.

```sh
npm ci
npm test
npm run build
```

Canonical source is `skills/<category>/<name>/`. `dist/` is generated and ignored. The generator emits the complete `.well-known/skills/` inventory, with an explicit file list for each package.

Pull requests run credential-free checks. Pushes to main and manual publishing runs build and test before deploying dist/ to GitHub Pages. Deployment packages dot-directories explicitly because the stock upload-pages-artifact action omits them.

The build tests cover metadata, workflow contracts, complete inventories, forbidden paths, symlinks, and deployment packaging. Release verification must additionally fetch the live index and every advertised file and exercise actual Hermes discovery/installation in an isolated scratch home.

## Provenance and license

The initial collection was extracted from [AI Software Blueprint](https://github.com/forgegod/ai-software-blueprint), preserving skill authors and versions. Skill source, testing, and publication are owned here; the scanner-blocked one-time blueprint initializer remains local to that blueprint for migration.

MIT; see [LICENSE](LICENSE).
