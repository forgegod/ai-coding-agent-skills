# Install the upstream OpenSpec prerequisites

This is the prerequisite guide for the [OpenSpec SDLC](openspec-workflow.md), not
an installer or permission to execute a change. Complete four separate steps:

1. Make OpenSpec CLI **1.15.0**, Node **22+**, and Git available in the actual
   execution host. A Desktop account upload does not install local executables.
2. Install and enable the seven upstream workflows below in the intended host.
3. Install this repository's [companion packages](../README.md#catalog) separately:
   `openspec-delivery`, `openspec-next`, `git-commit-message`, and
   `capability-wireframes`. `autonomous-implementation-review` is a fifth,
   separately selected optional package, not an upstream prerequisite.
4. Explicitly adopt the SDLC in the target project's contributor instructions.
   Installing skills neither adopts it nor transfers records or grants Git/GitHub
   authority. This repository already has its OpenSpec project configuration.

Neither our marketplace, ZIPs, well-known endpoint nor `npm run install:local`
installs upstream OpenSpec. The published inventory stays five companion packages
and two plugins. No upstream packages are vendored here.

## Required upstream inventory

These are this project's seven mandatory setup prerequisites, not a claim that
all OpenSpec users need all workflows. Use this table as the authoritative inventory.

| Upstream skill | Purpose |
| --- | --- |
| `openspec-explore` | Investigate ideas and requirements before implementation. |
| `openspec-propose` | Draft a new change's planning artifacts. |
| `openspec-update-change` | Revise an existing plan; not the CLI adapter-update command. |
| `openspec-apply-change` | Implement the authorized tasks within the project's delivery boundaries. |
| `openspec-sync-specs` | Reconcile change deltas into current capability specifications. |
| `openspec-archive-change` | Archive a completed change with the required sync assessment. |
| `openspec-verify-change` | Advisory completeness, correctness and coherence review. |

Verification is required in the installed inventory but remains advisory in use.
It is not an `openspec verify` CLI gate and does not independently block archive.
Project gates, independent review and finish authority still apply. Do not use an
upstream apply/archive prompt to bypass `openspec-delivery`: one approved local
task group, orchestrator-only Git/task writes, and separately authorized finish
remain the local policy. Other upstream workflows, including bulk archive and
OpenSpec's own release/docs-maintainer skills, are not selected by these recipes.

## CLI and release alignment

Check `node --version`, `git --version`, and `openspec --version` in the environment
where the agent runs commands, not just in a different terminal. Stop on a
version mismatch; do not silently upgrade the project's pin. After reviewing and
authorizing installation into your chosen npm prefix, the pinned npm route is:

```sh
npm install --global @fission-ai/openspec@1.15.0
openspec --version
```

For disposable checks without changing a global installation:

```sh
OPENSPEC_TELEMETRY=0 npx --yes --package=@fission-ai/openspec@1.15.0 openspec --version
```

`npx` can download code into its cache; it is not a no-network check. The result
must be `1.15.0`. The package's CLI version and a skill's `metadata.version` are
not the same version namespace. The v1.15.0 CLI already exposes `context` and
`store`; seeing those commands in a skill is not evidence of incompatibility.

Use the [v1.15.0 upstream packages](https://github.com/Fission-AI/OpenSpec/tree/v1.15.0/skills),
reviewed at commit `8e0288df12d401b0e183e2f47254d22528c1dffb`. In a fresh review
directory outside this distribution and outside an agent's installed skills:

```sh
# Release source and explicit workflow selection; reuse in the sections below.
set -eu
export OPENSPEC_TELEMETRY=0 DISABLE_TELEMETRY=1 DO_NOT_TRACK=1
OPENSPEC_REF=8e0288df12d401b0e183e2f47254d22528c1dffb
OPENSPEC_SOURCE="$PWD/openspec-v1.15.0-review"
OPENSPEC_SKILLS='openspec-explore openspec-propose openspec-update-change openspec-apply-change openspec-sync-specs openspec-archive-change openspec-verify-change'
git clone --depth 1 --branch v1.15.0 https://github.com/Fission-AI/OpenSpec.git "$OPENSPEC_SOURCE"
test "$(git -C "$OPENSPEC_SOURCE" rev-parse HEAD)" = "$OPENSPEC_REF"
git -C "$OPENSPEC_SOURCE" status --short
for skill in $OPENSPEC_SKILLS; do
  git -C "$OPENSPEC_SOURCE" ls-tree -r --name-only HEAD -- "skills/$skill"
done
```

Stop if the revision differs or the checkout is dirty. Inspect every listed file,
not only a preview of `SKILL.md`. At this revision each selected package contains
exactly one `SKILL.md`, with no support files or symlinks. Preserve complete
packages if that changes; a bare Markdown URL cannot enumerate arbitrary support
files. Do not trim files or metadata to evade a scanner or upload restriction.

Optional discovery through the third-party skills CLI (not installation):

```sh
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx --yes skills@1.7.4 add "$OPENSPEC_SOURCE/skills" --list
```

The explicit `skills/` source avoids discovering upstream-maintainer packages
elsewhere in the checkout. Still select only the seven names above, never
`--all` or `--skill '*'`. `skills-sh/fission-ai/openspec/<name>` in Hermes and
`npx skills add Fission-AI/OpenSpec` resolve moving upstream content, not our
1.15.0 release pin. Directory discovery is neither release compatibility evidence
nor Hermes scanner approval. Optional discovery telemetry is disabled above.

### What native initialization does

Upstream [`openspec init`](https://openspec.dev/docs/setup) creates project
`openspec/` scaffolding and tool-specific skill/command adapters. It is not a
Hermes profile installer or a user-global skill installer. The upstream core set
omits verification; a generated setup needs an explicitly selected profile that
includes it. Do not run init in this existing repository just to acquire adapters.
Use the reviewed release checkout above instead. For another project's authorized
initialization, inspect the matching CLI's `init --help` and profile configuration
in a disposable workspace first; installation alone never authorizes scaffolding.

A directory skill installs `/openspec-propose` in Claude Code, not `/opsx:propose`.
The latter spelling (and `/opsx:verify`) applies only when the corresponding
`.claude/commands/opsx/` command files were actually generated/installed. Codex
uses skills directly. See the [upstream tool matrix](https://openspec.dev/docs/supported-tools);
current online documentation can describe newer releases, so check the pinned
CLI and source before adopting new flags or paths.

## Hermes: selected profile, scanning and enablement

Use an existing, deliberately selected profile. Replace `my-profile` below;
confirm the resolved path before installing or configuring anything. Keep `-p`
on every profile-specific command, rather than relying on the shell's active
profile or hardcoding `~/.hermes` as the destination.

```sh
PROFILE=my-profile
hermes -p "$PROFILE" config path
hermes -p "$PROFILE" skills list
hermes -p "$PROFILE" skills list --enabled-only
for key in skills.disabled skills.platform_disabled; do
  if value=$(hermes -p "$PROFILE" config get "$key" --json 2>&1); then
    printf '%s\n' "$value"
  elif [ "$value" = "Config key not set: $key" ]; then
    printf '%s is unset: no exclusions at this scope\n' "$key"
  else
    printf '%s\n' "$value" >&2
    exit 1
  fi
done
```

Compare installed and enabled inventories first. An installed-but-disabled skill
needs enablement, not a reinstall. Inspect its loaded path, source revision and
local edits; a same-name package from another source is a collision, not an
invitation to overwrite it. Check project/external skill directories too.

For missing skills only, after reviewing the release source above, use the
commit-qualified URL adapter. This recipe is complete specifically because the
seven packages at this revision each consist of one file. Set `MISSING_SKILLS`
to the missing subset; use the full selection only for an empty upstream inventory.

```sh
# Fresh upstream inventory only; otherwise replace with the missing subset.
MISSING_SKILLS="$OPENSPEC_SKILLS"
for skill in $MISSING_SKILLS; do
  source_url="https://raw.githubusercontent.com/Fission-AI/OpenSpec/$OPENSPEC_REF/skills/$skill/SKILL.md"
  hermes -p "$PROFILE" skills inspect "$source_url" || exit 1
  hermes -p "$PROFILE" skills install "$source_url" --category software-development || exit 1
done
hermes -p "$PROFILE" skills list
```

These remain community sources. Keep the normal quarantine/security scan and
read the verdict and installed result, not just the process exit code. Stop on a
blocked or unresolved finding, missing package or incomplete fetch; retain the
output. Never force, bypass, hide files, or switch installers to evade it. An
operator-authorized noninteractive probe may add `--yes` to the install command;
that answers confirmation only and does not bypass scanning. Byte-compare the
installed file inventory with the reviewed packages before claiming completeness.

For existing disabled packages, `hermes -p "$PROFILE" skills config` provides
individual enable/disable controls. Select the intended platform and individual
skills, not an entire category. Global disabling and per-platform disabling are
cumulative. Preserve unrelated exclusions, including exclusions for packages not
currently installed. For a precise config change, read the two values above,
remove only the seven selected names from the applicable lists, and review the
result before writing. For example, if the global list contains these seven plus
`unrelated-disabled`, its replacement is `["unrelated-disabled"]`, not `[]`:

```sh
# Set this JSON to YOUR reviewed remaining list, not an unreviewed empty list.
REMAINING_DISABLED_JSON='["unrelated-disabled"]'
hermes -p "$PROFILE" config set skills.disabled "$REMAINING_DISABLED_JSON"
hermes -p "$PROFILE" config get skills.disabled --json
hermes -p "$PROFILE" skills list --enabled-only
```

The example name is illustrative, not a new exclusion to add to your profile.
For a relevant platform list, use its actual key, for example
`skills.platform_disabled.cli`, with the same read/review/selective-write process;
do not clear the whole platform map. Some Hermes versions warn that these keys
are unrecognized even though skill discovery consumes them. Do not suppress the
warning with force; verify the enabled inventory and actual platform's loading.
If the key is rejected or loading still excludes a skill, stop and resolve the
version/configuration discrepancy. Do not parse mixed warning text as pure JSON.

Start a fresh session in that profile (or refresh its skill picker), check all
seven names, and ask for a read-only `skill_view` of each. Check the returned
path/content, not merely a model assertion. The list command is inventory
evidence; a successful download alone is not evidence of model loading or execution.

Source: [Hermes skills, profiles, discovery and scanning](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills).

## Native user-global packages

Claude Code and Codex can load complete directories from a reviewed source.
These native copies do **not** run the Hermes scanner or receive its approval.
They do not register with Hermes or the skills CLI for updates. Review all files,
preserve local edits and resolve account/plugin/project duplicates first. Never
use a native copy as a workaround for a blocked Hermes scan.

Use the release variables above in a POSIX shell (Linux/macOS or WSL/Git Bash).
This helper preflights every selected name before copying, refuses symlinked
package entries and destination components, and copies complete directories. Run without
concurrent installers. It refuses existing copies rather than merging/overwriting.

```sh
# Upstream-only native helper; not the README's companion helper.
install_openspec_skills() (
  set -eu
  destination="$1"
  case "$destination" in /*) ;; *) printf 'Use an absolute destination\n' >&2; exit 1;; esac
  parent="$destination"
  while [ "$parent" != / ]; do
    test ! -L "$parent" || { printf 'Symlink: %s\n' "$parent" >&2; exit 1; }
    parent="${parent%/*}"
    test -n "$parent" || parent=/
  done
  test -z "$(git -C "$OPENSPEC_SOURCE" status --porcelain)"
  test "$(git -C "$OPENSPEC_SOURCE" rev-parse HEAD)" = "$OPENSPEC_REF"
  for skill in $OPENSPEC_SKILLS; do
    test -f "$OPENSPEC_SOURCE/skills/$skill/SKILL.md"
    test ! -L "$OPENSPEC_SOURCE" && test ! -L "$OPENSPEC_SOURCE/skills"
    test -z "$(find "$OPENSPEC_SOURCE/skills/$skill" -type l -print)"
    if [ -e "$destination/$skill" ] || [ -L "$destination/$skill" ]; then
      printf 'Refusing to overwrite %s\n' "$destination/$skill" >&2
      exit 1
    fi
  done
  mkdir -p "$destination"
  for skill in $OPENSPEC_SKILLS; do
    cp -R "$OPENSPEC_SOURCE/skills/$skill" "$destination/$skill"
  done
)
```

### Claude Code, including Desktop's Code tab

For a user-global directory installation (not an additional copy after account
sync), use:

```sh
install_openspec_skills "$HOME/.claude/skills"
```

Start a new Code session with access to the target checkout. Check `/skills` and
`/` autocomplete for all seven, then inspect the selected path/content. Direct
skills use `/openspec-propose`; do not use that write workflow as an installation
smoke test. Ask instead: “Read the installed OpenSpec skill instructions and
report their paths and prerequisites. Do not create, edit, apply or archive.”

The host needs local OpenSpec 1.15.0, Node 22+, Git, project tools and repository
permissions. A local directory copy is not a Claude account upload and does not
sync back to the account. Avoid a second account/plugin/directory copy of the
same skill. Companion plugin namespacing remains separate, for example
`/openspec-development:openspec-delivery`.

Source: [Claude Code skill locations and invocation](https://code.claude.com/docs/en/skills).

### Codex

For user-global Codex setup, use:

```sh
install_openspec_skills "$HOME/.agents/skills"
```

This location is shared with other Agent Skills clients, not Codex-exclusive.
Check existing user, project and administrator copies; Codex does not merge
same-name skills. Open `/skills` or mention `$openspec-propose` in the CLI/IDE
when intentionally proposing, not as a setup test. Use the read-only inspection
request above for loading verification. Codex detects changes automatically;
restart if entries do not appear. Inspect any disabled `[[skills.config]]` entry
in the intended Codex config and enable only the reviewed paths; preserve
unrelated settings. There is no assumed `codex skills install` subcommand.

Source: [OpenAI skill discovery, invocation and enablement](https://learn.chatgpt.com/docs/build-skills).

## Claude Desktop account uploads and Cowork

For our companions, retain the [GUI-first marketplace or ready-made ZIP route](claude-installation.md).
That route does not supply the seven upstream skills. No upstream OpenSpec
marketplace or ready-made upstream ZIP downloads are assumed here.

For upstream account uploads, prepare **one complete skill folder per ZIP** from
the reviewed release. A maintainer can supply these files to a GUI-only user;
they are not artifacts hosted by this distribution. With Python 3 available for
this packaging step, choose a new output directory outside the source checkout:

```sh
# Local ZIP preparation only; does not upload or install anything.
export OPENSPEC_SOURCE OPENSPEC_SKILLS
OPENSPEC_ZIPS="$PWD/openspec-v1.15.0-zips"
export OPENSPEC_ZIPS
python3 - <<'PY'
import os
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
source = Path(os.environ['OPENSPEC_SOURCE']) / 'skills'
out = Path(os.environ['OPENSPEC_ZIPS'])
packages = []
for name in os.environ['OPENSPEC_SKILLS'].split():
    package = source / name
    files = sorted(package.rglob('*'))
    if package.is_symlink() or not (package / 'SKILL.md').is_file():
        raise SystemExit(f'Invalid package: {package}')
    if any(p.is_symlink() or not (p.is_dir() or p.is_file()) for p in files):
        raise SystemExit(f'Unsupported package entry: {package}')
    packages.append((name, package, [p for p in files if p.is_file()]))
out.mkdir(exist_ok=False)
for name, package, files in packages:
    with ZipFile(out / (name + '.zip'), 'x', ZIP_DEFLATED) as archive:
        for file in files:
            archive.write(file, name + '/' + file.relative_to(package).as_posix())
    with ZipFile(out / (name + '.zip')) as archive:
        expected = {name + '/' + f.relative_to(package).as_posix(): f.read_bytes() for f in files}
        assert set(archive.namelist()) == set(expected)
        assert all(archive.read(path) == data for path, data in expected.items())
    print(out / (name + '.zip'))
PY
```

Each ZIP contains `<skill-name>/SKILL.md` and every package support file, not the
whole repository, loose files at ZIP root, or our `.plugin.zip` format. Review the
source inventory before packaging and compare ZIP bytes as above.

1. In the intended Claude account, enable **Settings → Capabilities → Code
   execution and file creation** (also called **Create and edit files**).
2. Subject to organization policy, open **Customize → Skills → + → Create skill
   → Upload a skill**. Upload each of the seven individual ZIPs.
3. Enable each accepted skill, start a new conversation/task and inspect the
   actual skill list and loading. Missing controls require the account/organization
   owner, not a bypass.

**Upload compatibility is unverified.** Anthropic's custom-skill documentation
states a 200-character description limit; all seven reviewed upstream descriptions
exceed it. Local ZIP checks cannot establish that the account UI accepts this
metadata. Preserve upstream bytes, report any rejection and stop for a reviewed
compatibility decision; do not silently shorten descriptions or claim GUI success.

| Surface | What still needs verification |
| --- | --- |
| Desktop Chat / claude.ai | Account upload, enablement and loading. Cloud code execution is not access to the user's local Git/OpenSpec checkout. |
| Cowork | Its actual task workspace, CLI/runtime availability, filesystem access and permissions; account visibility is not proof of a working SDLC host. |
| Desktop Code tab / Claude Code CLI | Local CLI and repository prerequisites, actual loaded paths, and explicit execution authority. |

Anthropic documents one-way account skill sync into Claude Code **v2.1.273+**
when signed in with the same Claude account; API-key/cloud-provider sign-ins do
not use that sync. Check `/skills` under **claude.ai sync** in a new session.
Do not assume acceptance, sync, or execution from ZIP validation. Account upload,
sync, Cowork execution and end-to-end Code execution require separate authorized
client probes; they have not been established by this guide's package checks.

Sources: [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude),
[create/package custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills),
and [plugin/account platform boundaries](https://claude.com/docs/plugins/overview).

## Verification, updates and ownership

Record CLI/client versions, upstream commit, source/installed inventories and
byte comparisons. Verify all seven enabled names in the real host, then actual
read-only loading. No proposal/apply/sync/archive action is a safe installation
smoke test. Package tests do not prove model obedience, permissions or execution.
For isolated probes, put HOME, HERMES_HOME, XDG_CONFIG_HOME, CLAUDE_CONFIG_DIR and
CODEX_HOME under disposable scratch roots, use a credential-free environment and
scratch cwd, and disable optional telemetry. Never inherit real account tokens
or redirect a probe to real profiles to make it pass. If the installed launcher
cannot start with an isolated home, report that separately from package results;
do not repair the real installation as part of a documentation probe.

Updates belong to the route that installed the copy:

- **Hermes hub:** inspect/check the selected profile with
  `hermes -p "$PROFILE" skills check <skill-name>`, then explicitly authorize
  `hermes -p "$PROFILE" skills update <skill-name>` after review. A commit-qualified
  URL stays on that commit; update does not choose a newer release. Moving
  skills.sh sources can advance independently of CLI 1.15.0. Preserve edits and
  registrations before an operator-reviewed source migration; never force it.
- **Native copies above:** there is no updater registration. Review a new matching
  source revision, back up existing packages outside discovery paths, resolve
  edits/collisions, then authorize replacement. The helper intentionally refuses
  existing copies. Updating this repository's companions does not update upstream.
- **Third-party skills CLI installations:** use its scoped inventory and update
  commands only for copies it owns; review source/ref tracking and collisions.
  Do not assume `skills update` preserves a release pin or manages manual copies.
  See the [skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md).
- **Generated adapters:** `openspec update` refreshes project adapters from the
  installed CLI/profile. It does not update user-global copies, account uploads
  or Hermes profiles. Review its project diff under separate authority.
- **Uploaded ZIPs:** snapshots. Prepare/review new complete ZIPs, preserve
  customizations and explicitly resolve replacement prompts in the account UI.
  Account sync is not an independent upstream updater.

A removed/renamed prerequisite is not automatic uninstall permission. Identify
obsolete copies and registrations, preserve local edits/backups, and obtain
operator approval for migration or removal. A running shared-profile skill must
not modify or remove its own installed package.

Optional orchestration still needs a supported host and separately configured
roles/models/permissions: [Herdr](../skills/autonomous-ai-agents/autonomous-implementation-review/references/herdr.md)
or the explicitly selected [Claude Code role protocol](../skills/autonomous-ai-agents/autonomous-implementation-review/references/claude-code-roles.md).
Installing either upstream or companion skills does not create those roles or
select a different orchestration host.

## Keep prerequisites and instructions in the same change

The author of any change to required skills (addition/removal/rename or dependency
relationships), CLI/runtime versions, companion dependencies, or supported
installation routes must assess documentation impact and update all affected
current instructions **in that same change, before completion**, not a follow-up.
Cover the inventory and required/optional distinctions, commands, version/source
pins, host prerequisites, install/enable/update/removal guidance, verification
steps, counts and cross-links in this guide, the [README](../README.md),
[Claude guide](claude-installation.md) and [SDLC](openspec-workflow.md).

The reviewer compares those instructions against the resulting prerequisite and
dependency configuration and the actual gate/probe evidence. Stale, missing or
contradictory affected instructions block completion before integration/publication.
Rerun affected command probes and documentation gates after the final edit; change
existing tests only when separately in scope. This is an author/reviewer obligation,
not a claim of new automated enforcement. Preserve archived plans and evidence as
historical records; do not rewrite them. Migration documentation grants no uninstall,
real-profile modification, scanner bypass or account-installation authority.
