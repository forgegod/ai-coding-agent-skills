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
| [phased-plan-closeout](skills/software-development/phased-plan-closeout/SKILL.md) | Integrate a verified phase and hand off the next goal. |
| [phased-plan-overview](skills/software-development/phased-plan-overview/SKILL.md) | Inspect active changes and select work to resume. |
| [phased-plan-next](skills/software-development/phased-plan-next/SKILL.md) | Select work and inject its goal into a fresh session in the current Herdr pane. |
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

Install the eight generic software-development skills (POSIX shell; omit `-p hermes-dev` to use the active profile):

```sh
for skill in application-records capability-wireframes git-commit-message phased-plan-design phased-plan-execution phased-plan-closeout phased-plan-overview phased-plan-refactoring; do
  hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/$skill" --category software-development || break
done
```

`autonomous-implementation-review` is published separately because it can coordinate editing
agents and worktrees. Review its complete package before installing it; the normal
eight-package example does not establish scanner approval for it:

```sh
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/autonomous-implementation-review" --category autonomous-ai-agents
```

`phased-plan-next` can reset the current session and launch that bounded workflow;
review its complete package separately as well. It is not part of the generic
eight-package loop. Install its related overview, execution, closeout, and
autonomous orchestration skills before use:

```sh
hermes -p hermes-dev skills install "well-known:https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills/phased-plan-next" --category software-development
```

Source edits do not update installed copies. After an authorized publication,
install through the normal hub and start a new session. For an unmodified
hub-tracked copy, use `hermes -p <profile> skills update <skill-name>`; preserve and
resolve local edits/name collisions explicitly rather than forcing replacement.
On a first install, `--yes` answers the install confirmation only, after operator
authorization; it does not bypass scanning or resolve existing-copy conflicts.

### Copy every local package to Hermes profiles

For a reviewed checkout on the local machine, the repository script copies all
ten complete packages to the default profile and every recognized named profile:

```sh
npm run install:local
```

To limit the copy to named profiles, repeat `--profile`; `default` names the
base `~/.hermes` profile explicitly:

```sh
npm run install:local -- --profile hermes-dev --profile default
```

Use `--dry-run` to validate the source, profile discovery, and every destination
without writing. The script preserves the canonical category/package paths under
each profile's `skills/` directory, ignores bare directories that Hermes does not
recognize as profiles, and refuses all existing package destinations before it
copies anything. It intentionally does not overwrite, update, or remove local
skills.

This is a direct local copy for a checkout you have reviewed; it does **not** run
the Hermes Skills Hub security scanner or establish scanner approval. Use the
normal `hermes skills install` workflow above when that scanner-managed install
path is required.

### Run the autonomous implementation-review goal

Use `autonomous-implementation-review` from the orchestrator session, not an
executor pane. It coordinates implementation and review; it does not replace a
project's planning records or create a second progress tracker.
This automated role loop currently supports Herdr only (`HERDR_ENV=1`, selected
Hermes executor, verified model keys). Outside Herdr, use the portable phase skills
under an explicitly agreed manual workflow; do not invent a fallback transport.

#### Choose the progress authority first

- **Material change with no active CHG:** use `application-records`, then
  `phased-plan-design`, to create or revise the CHG. Resolve only the outcome or
  policy decisions that are genuinely unknown; the design skill creates the
  phase table and gates.
- **Selected active CHG phase:** use `phased-plan-execution` as the execution
  authority. The orchestrator reads the CHG, CAPs, and DOX chain for scope,
  phase gate, and status.
- **Non-material standalone work:** no CAP/CHG is required. Use a bounded goal
  with explicit verification and constraints.

#### Start a selected CHG phase

If the active CHG or phase is not already selected, run
`/phased-plan-overview` first. It remains read-only: it lists active records,
applies the selection rules, and, only after a phase is selected or unambiguous,
returns the exact bounded command below for the operator to send.

The operator fills the numeric phase ID and literal active CHG path and sends
this command only if they authorize its listed local Git operations. Displaying
the template grants no authority. Hermes' `/goal draft` expands the request into
a persisted completion contract and immediately starts it:

```text
/goal draft Execute only phase <phase-number> of <active-chg-path> using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.
```

The agent must load all three named skills, read the selected CHG, linked CAPs, and
applicable DOX before dispatching. The CHG supplies scope, boundaries, the
phase gate, and status; add only constraints that are not already recorded.
Use `/goal show` to inspect the drafted contract. Pause or clear it if it
materially misstates the CHG.

Resume with the same bounded command only after closeout identifies the existing
reservation/worktree. A fresh clone lacks local worktree registration; request an
explicit recovery handoff instead of starting a duplicate. For assessment without
commit authority, request a read-only assessment, not this completion goal.

#### Automatically hand off the next phase

For the automatic selection-to-goal handoff instead of copying the launch command,
explicitly invoke `/phased-plan-next` in the intended Herdr orchestrator pane.
It applies overview's selection and blocker rules, then schedules three separate
submissions after the selecting turn settles: `/new --yes <unique-phase-session-name>`,
`/busy queue`, and the designed `/goal draft` command above. This invocation
authorizes that reset, the busy-input preference change (which Hermes may persist),
and the command's single-phase local Git scope; it never authorizes a push or
another phase. A new session may reset session-only model selections. Reading or
installing the skill does not invoke it. Executor selection remains separately
operator-controlled by the orchestration skill.

The helper requires `HERDR_ENV=1`, `HERDR_WORKSPACE_ID`, and `HERDR_PANE_ID`, an
observed working-to-settled lifecycle transition, and recognizable English Hermes
CLI acknowledgments. It refuses missing caller context rather than guessing from
focus. Outside Herdr, with ambiguous selection, or on a transport blocker, it
reports the selected action without injection. Keep the composer untouched during
handoff. The selecting turn reports a scratch receipt path, not premature success;
failed or partial delivery is never retried automatically. Preview stays read-only.

#### Close a verified phase

Use `phased-plan-closeout` before dispatch for reservation and after gate/review
approval for integration. `/phased-plan-closeout --reserve` authorizes the selected
CHG-only target commit and worktree creation, not implementation/completion commits.
A governing goal may explicitly authorize both stages.
The orchestrator is the only Git/CHG writer; executors never stage, commit, or
edit the CHG path. The skill's read-only Node 22+/Git guard checks committed CHG
blobs, history, topology, and phase-table cells; it does not infer passed tests
from prose or discard conflicting edits.

For an explicit one-shot closeout authorization, invoke
`/phased-plan-closeout --commit-ff`. The flag authorizes committing only the
reviewed implementation and record completion batches and requires fast-forward
integration. It does not authorize a missing reservation, a push, bypassed gates,
or another phase. The command protocol lives only in the closeout skill.

#### Start bounded standalone work

For non-material work, use `/goal draft <concise objective>`. State any required
verification and constraints in that objective. Do not create a profile-local
continuation document. If the adopting project requires a durable artifact, use
only its documented repository-tracked location.

#### What persists across sessions and machines

- `docs/changes/active/CHG-*.md` is the sole mutable authority for a material
  change: phase, scope, gate, decisions, evidence, and next executable action.
- For worktree phases, the orchestrator follows `phased-plan-closeout`; executors
  must not edit or commit the CHG path. Resume a reserved worktree rather than
  creating a competing status writer.
- `docs/changes/reviews/CHG-<number>/` may retain a committed, frozen,
  review-only receipt when the project needs one. It is evidence, never another
  progress plan.
- Scratch logs, patches, and agent reports are temporary evidence only. They are
  never required to resume work.

The [Hermes workflow research record](docs/research/hermes-autonomous-goal-workflow.md)
documents the evidence behind this boundary, the existing `/goal draft` option,
and the future custom-shortcut proposal.

#### Fresh-session busy-input protection

When the orchestrator starts a fresh executor session, it sends `/new --yes
<goal-name>`, waits until that session is idle, then sends `/busy queue` before
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
the CHG and any committed review receipt current so automatic compression and a
later fresh session have grounded task state without replaying full logs or
diffs.

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
the same shell used for the agent-specific commands below. It copies all ten
package directories, preflights all name collisions, and never overwrites local
edits.

```sh
# Native installation helper
skills_source="$PWD/ai-coding-agent-skills-review/skills"
install_reviewed_skills() (
  set -eu
  destination="$1"
  for package in autonomous-ai-agents/autonomous-implementation-review software-development/application-records software-development/capability-wireframes software-development/git-commit-message software-development/phased-plan-design software-development/phased-plan-execution software-development/phased-plan-closeout software-development/phased-plan-overview software-development/phased-plan-next software-development/phased-plan-refactoring; do
    skill="${package##*/}"
    test -f "$skills_source/$package/SKILL.md"
    if [ -e "$destination/$skill" ] || [ -L "$destination/$skill" ]; then
      printf 'Refusing to overwrite %s\n' "$destination/$skill" >&2
      exit 1
    fi
  done
  mkdir -p "$destination"
  for package in autonomous-ai-agents/autonomous-implementation-review software-development/application-records software-development/capability-wireframes software-development/git-commit-message software-development/phased-plan-design software-development/phased-plan-execution software-development/phased-plan-closeout software-development/phased-plan-overview software-development/phased-plan-next software-development/phased-plan-refactoring; do
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
2. Describe it as a collection of **ten** categorized Agent Skills packages and
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
