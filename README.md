# AI Coding Agent Skills

Portable engineering workflows for AI coding agents that use OpenSpec. This repository owns the companion skill sources and their static distribution endpoint. Adopting projects own their product behavior. OpenSpec owns specification and task progress.

## SDLC

The process is [OpenSpec plus these companion skills](docs/openspec-workflow.md).

OpenSpec propose, apply, sync and archive own the change package and current behavior specs. This repository does not vendor those actions.

Before using the workflow, follow [Install the upstream OpenSpec prerequisites](docs/openspec-installation.md):
CLI **1.15.0**, Node **22+**, Git, and **seven required upstream workflow skills**,
including advisory verification. The guide separates Hermes profile enablement,
Claude account uploads versus Code execution, and Codex user-global setup.
The five packages below are companions, not a replacement for those prerequisites.

| Skill | What it adds |
| --- | --- |
| [openspec-delivery](skills/software-development/openspec-delivery/SKILL.md) | Automatic workspace setup, bounded execution and verified closeout. |
| [openspec-next](skills/software-development/openspec-next/SKILL.md) | Find and advance the next approved local task group; inspect mode is read-only. |
| [git-commit-message](skills/software-development/git-commit-message/SKILL.md) | Logical batches, a preview, and exact staging. Commit authority stays explicit. |
| [capability-wireframes](skills/software-development/capability-wireframes/SKILL.md) | Stable HTML/PNG review for a primary human-facing surface. |
| [autonomous-implementation-review](skills/autonomous-ai-agents/autonomous-implementation-review/SKILL.md) | Optional fresh implementer and read-only reviewer for one task group. |

Independent OpenSpec changes may be specified and implemented in parallel, one orchestrator and one checkout each. A dependent implementation waits for the prerequisite's integrated revision. Overlapping capability specs are reconciled explicitly.

With the project's [naming policy](docs/openspec-workflow.md#change-names-and-branches)
selected, `/openspec-propose add-dark-mode` stays short: the agent generates
`add-dark-mode-<lowercase-ulid>` once and reuses it for the change folder and the
authorized `change/<full-name>` branch. Existing names stay unchanged; ambiguous
short names require selection. This is project instruction, not a stock OpenSpec
hook or an installed-profile modification.

GitHub issues and pull requests document and review. They are not the task list and not an execution lock. Under the explicitly selected [metadata policy](docs/openspec-metadata.md), a new proposal includes one authorized documentation issue before approval; offline drafts keep a null link. PR creation remains separately authorized. Do not invent a ticket. Identity-only YAML frontmatter supports Dataview without copying progress or PR state.

Installing these packages does not select the workflow for another project, transfer that project's records, or grant Git or GitHub authority.

Companion installation: [Claude Desktop (no terminal)](#install-with-claude-desktop) ·
[Hermes](#install-with-hermes) ·
[Other agents / advanced directory installation](#advanced-native-directory-installation).

## Catalog

| Skill | Purpose |
| --- | --- |
| [openspec-delivery](skills/software-development/openspec-delivery/SKILL.md) | Workspace, candidate review, recovery and protected closeout when authorized. |
| [openspec-next](skills/software-development/openspec-next/SKILL.md) | Grounded continuation without a long operator prompt. |
| [git-commit-message](skills/software-development/git-commit-message/SKILL.md) | Dependency-aware logical Git batches, a preview before apply (or autonomous execution), and tiered Conventional Commit messages. |
| [capability-wireframes](skills/software-development/capability-wireframes/SKILL.md) | Stable HTML/PNG visual handoff for a human-facing surface. |
| [autonomous-implementation-review](skills/autonomous-ai-agents/autonomous-implementation-review/SKILL.md) | Bounded implementation and independent review loop. |

## Install with Claude Desktop

**Recommended: use Claude's built-in plugin installer.** No Git, shell commands,
or hidden-folder copying is needed for installation.

1. Open **Customize → Plugins → Add → Add marketplace**.
2. Choose **Add from a repository** and enter `forgegod/ai-coding-agent-skills`.
3. Select **openspec-development**, review its contents, and click **Add**.
4. Start a new conversation or task and check that its skills appear in the skill picker.

This installs delivery, next-step execution, commits and wireframes. It does not install OpenSpec
or its CLI. **autonomous-orchestration** is a separate optional plugin: review it
and its host/role prerequisites before adding it. Neither plugin installs
execution roles, transfers another project's records, or changes permissions.

Prefer a file upload? The [download page](https://forgegod.github.io/ai-coding-agent-skills/downloads/index.html)
offers ready-made plugin ZIPs and individual skill ZIPs. Upload a plugin with
**Customize → Plugins → Add → Upload plugin**, or an individual skill with
**Customize → Skills → + → Create skill → Upload a skill**. Do not upload GitHub's
whole-repository ZIP. Plugin installation requires a paid Claude plan; individual
skills also support Free plans with code execution enabled, subject to organization policy.

The repository route requires the marketplace revision to be published to GitHub;
download links require its matching Pages deployment. A local build alone publishes
neither. Local ZIPs are generated in `dist/downloads/` for pre-release testing.

**Installation is not execution compatibility.** Chat, Cowork, and Claude Code have
different tools. Git/worktree workflows need a capable coding host and project access;
they are not made runnable in ordinary Chat merely by installing a skill.

See [Claude installation, updates, compatibility, and verification](docs/claude-installation.md).
Install the [separate upstream prerequisites](docs/openspec-installation.md#claude-desktop-account-uploads-and-cowork)
as well; our marketplace and downloads do not include them.
Primary sources: [Anthropic's plugin installation guide](https://claude.com/docs/plugins/overview)
and [custom skill installation](https://support.claude.com/en/articles/12512180-use-skills-in-claude).

## Install with Hermes

Discovery index:

https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/index.json

Search the project URL (the project path is required):

```sh
hermes skills search https://forgegod.github.io/ai-coding-agent-skills/
```

Install an individual skill and its advertised support files through the well-known adapter:

```sh
hermes skills install well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/openspec-delivery --category software-development
```

To target a named profile, add `-p <profile>`; for example:

```sh
hermes -p hermes-dev skills install well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/openspec-delivery --category software-development
```

Install the workflow skills (POSIX shell; omit `-p hermes-dev` to use the active profile):

```sh
for skill in openspec-delivery openspec-next git-commit-message capability-wireframes; do
  hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/$skill" --category software-development || break
done
```

`autonomous-implementation-review` is published separately because it can coordinate editing
agents and worktrees. Review its complete package before installing it; the normal
four-package example does not establish scanner approval for it:

```sh
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/autonomous-implementation-review" --category autonomous-ai-agents
```

The commands use the published endpoint, not this checkout:

```sh
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/openspec-delivery" --category software-development
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/openspec-next" --category software-development
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/git-commit-message" --category software-development
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/capability-wireframes" --category software-development
```

OpenSpec's CLI and native workflows remain [separate prerequisites](docs/openspec-installation.md#hermes-selected-profile-scanning-and-enablement).
Check all seven installed/enabled upstream skills in the intended profile; the
four-package example above installs companions only. No command above selects
that workflow for a project or grants execution authority.

Source edits do not update installed copies. After an authorized publication,
install through the normal hub and start a new session, or use the reviewed local
installer below to copy unpublished source. For an unmodified hub-tracked copy
(including copies registered by the local installer), use
`hermes -p <profile> skills update <skill-name>`; preserve and
resolve local edits/name collisions explicitly rather than forcing replacement.
On a first install, `--yes` answers the install confirmation only, after operator
authorization; it does not bypass scanning or resolve existing-copy conflicts.

### Copy every local package to global agent profiles

Run these commands from the reviewed repository checkout. Local installation
copies this checkout's bytes to every selected target. Only selected Hermes
profiles register the public source for future Hermes updates; local installation
does not download the published version or start a skill workflow.

#### Choose where updates come from

| Intent | Command | Content source |
| --- | --- | --- |
| Install missing local packages; refuse existing copies | `npm run install:local` | Reviewed checkout |
| Install missing packages and replace existing copies with backups | `npm run install:local -- --update` | Reviewed checkout |
| Update registered packages in one profile | `hermes -p <profile> skills update` | Published internet sources |

The local commands default to all recognized profiles, not just the active profile,
plus detected user-global Claude Code and Codex installations. An existing
`~/.claude` receives packages under `~/.claude/skills/<skill-name>/`; an existing
`~/.codex` or `~/.agents` receives them under `~/.agents/skills/<skill-name>/`.
An absent client is left untouched. The installer never writes a project skill directory.
Project paths such as `$PWD/.claude/skills` and `$PWD/.agents/skills` stay untouched.

Use `--profile <name>` to limit the run to Hermes profiles, or `--client
claude-code` / `--client codex` to limit it to detected global native clients.
Selectors may be combined; `--all` selects every recognized target within the
home-root scope below and cannot be combined with either selector.
`--hermes-home <path>` selects an alternate base containing the default profile
and `profiles/`; `--user-home <path>`
selects the user home used for native-client detection. Neither path is a named
profile home, and the installer does not infer its Hermes base from HERMES_HOME.

Without selectors, one explicit home root isolates the run to that family:
`--hermes-home` alone selects only Hermes profiles, and `--user-home` alone selects
only native clients. This also applies with `--all`. Supply both roots to enable
both families under those roots; with neither override, both families use their
normal user-home defaults. Explicit `--profile` / `--client` selectors take
precedence and select only their named targets, including opting in to the other
family. If that family's root is omitted, it uses the real user's default home
location; `--user-home` does not relocate the Hermes base. For fully isolated
scratch runs covering both families, supply both home roots.

#### Install or refresh local packages

For a reviewed checkout on the local machine, the repository script copies all
five complete packages to the default profile, every recognized named profile,
and detected user-global Claude Code/Codex targets:

```sh
npm run install:local
```

To limit the copy to named profiles, repeat `--profile`; `default` names the
base `~/.hermes` profile explicitly:

```sh
npm run install:local -- --profile hermes-dev --profile default
```

To install only into a detected global native client, use its client selector:

```sh
npm run install:local -- --client claude-code
npm run install:local -- --client codex
```

Install missing packages and update existing packages across all recognized
targets, including `openspec-delivery`:

```sh
npm run install:local -- --update --dry-run
npm run install:local -- --update
```

Use `--profile <name>` or `--client <name>` (both repeatable) to limit updates,
just as for installation. Without `--update`, existing package destinations are
refused. Hermes copies preserve canonical category/package paths; native clients
use their global flat `<skill-name>/` directory. Bare Hermes directories and absent
native client configurations are ignored.

Update replaces each complete package, removing obsolete support files from the
installed copy. Before replacement it moves the entire previous package—including
local edits—to `<target-home>/.skills-backups/<batch>/...` and prints each backup
path. Unrelated skills and profile configuration are untouched. Backups stay
outside skill discovery and are not automatically deleted. To recover local edits,
compare or restore from the printed backup after stopping the affected agent.

#### Retire historical packages

The installer does not remove historical packages by default. After reviewing the
dry run and stopping affected agents, `--purge` retires only these package names
from the main-to-current catalog transition: `application-records`,
`phased-plan-closeout`, `phased-plan-design`, `phased-plan-execution`,
`phased-plan-next`, `phased-plan-overview`, and `phased-plan-refactoring`.
It never infers a retirement from a missing current package and leaves all other
skills alone.

```sh
npm run install:local -- --update --purge --dry-run
npm run install:local -- --update --purge
```

Each retired package is moved into the target backup batch. The backup records a retired Hermes registration before removing a matching project-owned lock entry.
A conflicting registration from another source aborts without deleting it. Native
client copies have no Hermes lock entry to remove.

Source validation and destination preflight cover all selected targets; symlink
destinations/parents and source overlap are refused. All copies are staged before
replacing installed packages. This is not an all-targets transaction: a runtime
failure can leave earlier packages installed, updated, or purged; inspect the
error and backups before retrying. `--dry-run` previews install/update counts without creating copies or
backups. Stop agents using the selected targets and avoid concurrent installers
or source edits during updates; start fresh sessions afterwards.

This is a direct local copy for a checkout you have reviewed; it does **not** run
the Hermes Skills Hub security scanner, establish scanner approval, or make Claude
Code/Codex execution capabilities equivalent to Hermes. Use the normal `hermes
skills install` workflow above when that scanner-managed installation path is
required.

Hermes installations also register each package in the selected profile's
`skills/.hub/lock.json`, pointing to this repository's public well-known endpoint.
Registration records the exact locally installed hash and category, with
`local-checkout` metadata and an `unscanned` verdict—not a fabricated scan
attestation. Claude Code and Codex copies do not create Hermes registrations.
Existing unrelated registrations are preserved; conflicting sources/paths or
malformed locks are refused rather than silently reassigned.

#### Migrate existing local copies to internet updates

For copies made by the older untracked installer, stop agents using the selected
profile, review the checkout and local edits, then preview and apply one refresh:

```sh
npm run install:local -- --update --profile hermes-dev --dry-run
npm run install:local -- --update --profile hermes-dev
```

This replaces the package files and preserves the previous packages in backups
for every selected target. Only selected Hermes profiles register the new
installed-content baseline. There is no registration-only mode. Without selectors,
replacement and backups apply to every recognized target. Refresh native Claude
Code/Codex copies by rerunning this local installer with `--update`, not
`hermes skills update`. Start a fresh session after installation. Later, use the
normal internet updater for the Hermes profile copy:

```sh
hermes -p hermes-dev skills update
hermes -p hermes-dev skills update openspec-delivery
```

The first command updates all eligible registered skills in that profile, including
skills from other sources; the second targets only `openspec-delivery`. Unlike the
local installer, Hermes does not update every profile at once.

Internet updates run Hermes's normal scanner, keep the category, and protect edits made after that
installation. Local installation does not publish anything: a newly added skill
needs to reach the public endpoint before Hermes can fetch it. Hermes compares
content hashes, not version ordering, so an internet update can replace newer,
unpublished local source with the currently published version. Publish first if
that replacement is not wanted. Do not run Hermes updates and the local installer
concurrently.

If registration fails because a skill already belongs to another source or
install path, preserve that copy and resolve its ownership explicitly. Do not
hand-edit the hub lock or use `--force` to suppress a scan failure. A missing
public package is a publication prerequisite, not a reason to change its source.
`npm run test:local-update` checks the local-to-internet workflow using a scratch
profile and a real public update; it does not update your live installations.

### Run the autonomous implementation-review goal

Use `autonomous-implementation-review` from the orchestrator session, not an
executor pane. It coordinates implementation and review for one authorized
OpenSpec task group. It does not replace OpenSpec artifacts or create a second
progress tracker.
This automated role loop currently supports Herdr only (`HERDR_ENV=1`, selected
Hermes executor, verified model keys). Outside Herdr, stop unless the operator
sent `code-tab-phase-roles`. Do not invent a fallback transport.

For a project that explicitly adopts the short-invocation policy, the operator
sends `/openspec-next` to advance the current approved group, or
`/openspec-delivery <name>` to select a change. Setup, bootstrap, task updates and
previewed autonomous local commits are included; push/PR/merge are not. Operator
restrictions override defaults. `/openspec-next inspect` is read-only.
`/openspec-delivery finish <name>` separately authorizes protected publication
and verified receipt/archive/issue closure/clean-worktree retirement for that
change, not branch deletion, a release or another change. See the SDLC for the
complete contract. No operator worktree commands are required.

For a persisted Hermes goal, the optional short form is below. Displaying the
template grants no authority.
Hermes' `/goal draft` expands the request into a persisted completion contract
and immediately starts it:

```text
/goal draft /openspec-delivery <name>
```

The agent loads delivery, the configured role-loop skill and selected artifacts before
dispatching. Use `/goal show` to inspect the drafted contract. Pause or clear it
if it materially misstates the change.

The operator decides when and where to send the goal. After submission,
`autonomous-implementation-review` keeps that session as orchestrator and asks
for an explicitly selected different Herdr pane for implementer/reviewer roles.
It owns that role handoff, including fresh-session queue/model setup, visible
idle/input checks and passive executor monitoring. It never resets or runs a
worker in the orchestrator pane. A displayed goal grants no execution authority.

Publication, a pull request, and merge need separate authorization. The
[SDLC](docs/openspec-workflow.md) owns that boundary. A pull request documents
review of the frozen candidate. It is not the task list.

#### Start bounded standalone work

For work that is not an OpenSpec change, use `/goal draft <concise objective>`.
State any required verification and constraints in that objective. Do not create
a profile-local continuation document. If the adopting project requires a durable
artifact, use only its documented repository-tracked location.

#### What persists across sessions and machines

- `openspec/changes/<name>/tasks.md` is the sole mutable task authority for the
  selected change. The orchestrator is the only writer. Executors do not edit it.
- A GitHub issue or pull request, when the operator asked for one, is a
  documentation or review record. It is not another plan.
- Scratch logs, patches, and agent reports are temporary evidence only. They are
  never required to resume work.

#### Fresh-session busy-input protection

When the orchestrator starts a fresh executor session, it sends `/new --yes
<goal-name>`, verifies visible idle through output inspection, then sends `/busy queue` before
the model or role task. Queue mode keeps any later operator message as the next
turn instead of redirecting the executor's active work. This is an orchestrator
action; the operator does not need to send it separately during a normal run.

#### Stop an execution deliberately

Stopping is an explicit operator decision. The operator sends `/goal pause` in
the orchestrator session; the orchestrator does not dispatch another packet.
After the executor settles, the orchestrator prompts it with `/stop` to stop Hermes background processes and
then verifies the pane state. `/stop` is not an immediate foreground-turn
interrupt; with `/busy queue` it is queued until the current role turn finishes.
Do not use `ctrl+c` as an undocumented substitute.

Do not use `/loop` for implementation and review: it replays a fixed prompt on
a cadence and lacks `/goal`'s outcome, verification, constraint, boundary, and
stop-condition contract. It can therefore re-fire stale work after a verified
checkpoint. Reserve `/loop` for bounded external polling, such as CI status.
Use `/goal pause`, `/goal resume`, and `/goal clear` to control the objective;
add a newly discovered acceptance criterion with `/subgoal <criterion>`.

Hermes automatically compresses the orchestrator context at its configured
threshold (50% by default). Goal state persists independently of the active
transcript, but `/goal resume` is not a context reset. To compact earlier, the
operator—not the running agent—must enter these commands in the orchestrator
session:

**Operator commands, not an agent response:**

```text
/goal pause
/compress here 2
/context
/goal resume
```

An agent printing a slash command does not execute it in its own session. Keep
the selected change's `tasks.md` current so automatic compression and a
later fresh session have grounded task state without replaying full logs or
diffs.

### GitHub fallback

The well-known endpoint is the preferred, host-independent distribution route. The categorized source packages can also be installed directly:

```sh
hermes skills install forgegod/ai-coding-agent-skills/skills/software-development/openspec-delivery --category software-development
```

Other Agent Skills-compatible agents can consume the same SKILL.md packages using their own installation mechanism. Well-known discovery and Hermes-specific metadata support depend on the client.

## Advanced: native directory installation

For Claude, prefer the [built-in plugin or ZIP installer](#install-with-claude-desktop).
The following Claude Code, Codex, Kilo, and Pi recipes are advanced alternatives,
not additional steps after plugin installation. Avoid duplicate installations.

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
the same shell used for the agent-specific commands below. It copies all five
package directories, preflights all name collisions, and never overwrites local
edits.

```sh
# Native installation helper
skills_source="$PWD/ai-coding-agent-skills-review/skills"
install_reviewed_skills() (
  set -eu
  destination="$1"
  for package in autonomous-ai-agents/autonomous-implementation-review software-development/capability-wireframes software-development/git-commit-message software-development/openspec-delivery software-development/openspec-next; do
    skill="${package##*/}"
    test -f "$skills_source/$package/SKILL.md"
    if [ -e "$destination/$skill" ] || [ -L "$destination/$skill" ]; then
      printf 'Refusing to overwrite %s\n' "$destination/$skill" >&2
      exit 1
    fi
  done
  mkdir -p "$destination"
  for package in autonomous-ai-agents/autonomous-implementation-review software-development/capability-wireframes software-development/git-commit-message software-development/openspec-delivery software-development/openspec-next; do
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
for `openspec-delivery`, or explicitly invoke `/openspec-delivery`. Verify the
loaded skill path and content rather than relying only on the model's claim.

Reference: [Claude Code skills](https://code.claude.com/docs/en/skills).

That copy installs skills only. It does not install Code-tab subagents and does
not receive Hermes scanner approval for them. Role templates are
`templates/phase-implementer.md` and `templates/phase-reviewer.md` in
`autonomous-implementation-review`. Copy them into the target project's `.claude/agents/` only
after review, and refuse an existing file. Set distinct non-`inherit` `model`
values and keep the parent session in Manual mode before use. Absence of Herdr
does not select this path.

### Codex

Personal installation uses the current Agent Skills directory, not a guessed
`codex skills install` subcommand:

```sh
install_reviewed_skills "$HOME/.agents/skills"
```

For project-only installation, use `install_reviewed_skills "$PWD/.agents/skills"`
from the target repository. Open `/skills` or mention `$openspec-delivery` in
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
Start a new session or run `/reload`; invoke `/openspec-delivery` and inspect
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
or run `/reload`, then invoke `/skill:openspec-delivery`. Pi also discovers
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
npx skills add forgegod/ai-coding-agent-skills --skill openspec-delivery --agent claude-code
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
2. Describe it as a collection of **five** categorized Agent Skills packages and
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

Requires Node 22 or newer. Runtime build dependencies are the YAML parser and
`fflate` for deterministic ZIP generation; no system ZIP command is needed.

```sh
npm ci
npm test
npm run build
```

Canonical source is `skills/<category>/<name>/`. `dist/` is generated and ignored. The generator emits the complete `.well-known/skills/` inventory, with an explicit file list for each package.

The same build emits `dist/downloads/`: five complete skill ZIPs, two plugin ZIPs,
an HTML download page, and a JSON inventory with SHA-256 checksums. The checked-in
`.claude-plugin/marketplace.json` selects canonical source packages directly;
no generated skill copies are committed. Its explicit skill lists separate the
OpenSpec companion workflow from opt-in orchestration. Bump every affected plugin's version when
its bundled content changes. See the [Claude release checks](docs/claude-installation.md#maintainer-verification).

The optional `npm run test:local-update` probe requires the installed `hermes`
CLI and internet access. It installs all local packages into a disposable scratch
home, then tests a real public `git-commit-message` update, scanner acceptance,
category retention, and local-edit protection. It is not part of offline CI and
does not touch live profile skills. Prefer a scratch TMPDIR under the existing
Hermes data root so the CLI can reuse its managed dependency runtime.

Before publishing, run the additional local security gate with a trusted Hermes
source checkout and a compatible Python interpreter (`python3`, Python 3.11+ for
skills-guard-v10):

```sh
HERMES_SOURCE=/path/to/trusted/hermes-agent npm run test:security
```

This rebuilds all packages, tests an inert malicious `.mjs` negative control, then
uses that checkout's actual scanner and community policy. It extends scanning to
every UTF-8 package file, including `.mjs`/`.cjs` and extensionless files, without
renaming files or modifying Hermes. The JSON report includes scanner version/hash,
file counts, findings, and verdicts. Missing scanner, inventory drift, symlinks,
undecodable/binary content needing manual review, or a non-safe verdict fails the
gate. No network, package installation, credentials, or profile writes are used.
This is a stricter local release check, not a promise of approval by other scanner
versions. Ordinary `npm test` and CI remain independent of a Hermes checkout.

Publication and profile updates need separate operator authorization. After
publication, verify the live files and normal hub installation in an isolated
scratch home, then update the intended profile and start a fresh session. Do not
use `--force` to bypass security findings; `--yes` only skips the install question.

Pull requests run credential-free checks. Pushes to main and manual publishing runs build and test before deploying dist/ to GitHub Pages. Deployment packages dot-directories explicitly because the stock upload-pages-artifact action omits them.

The build tests cover metadata, workflow contracts, complete inventories, forbidden paths, symlinks, and deployment packaging. Release verification must additionally fetch the live index and every advertised file and exercise actual Hermes discovery/installation in an isolated scratch home.

## Provenance and license

The initial collection was extracted from [AI Software Blueprint](https://github.com/forgegod/ai-software-blueprint), preserving skill authors and versions. Skill source, testing, and publication are owned here; the scanner-blocked one-time blueprint initializer remains local to that blueprint for migration.

MIT; see [LICENSE](LICENSE).
