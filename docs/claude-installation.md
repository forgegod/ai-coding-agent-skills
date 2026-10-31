# Install in Claude without a terminal

Use the [README quick start](../README.md#install-with-claude-desktop) for the
recommended marketplace route. This guide covers alternatives, limits, and verification.
All packages are community-maintained, not official Anthropic skills. Native
installation does not provide Hermes scanner approval. Review instructions and
scripts before enabling; do not use another client to evade an unresolved security finding.

This guide installs our five companion packages, not upstream OpenSpec. Complete
the [separate OpenSpec prerequisite setup](openspec-installation.md) for CLI
1.16.0, Node 22.12.0+ for the OpenSpec npm package, Git and the seven required
upstream workflows. Its
[account upload section](openspec-installation.md#claude-desktop-account-uploads-and-cowork)
covers preparing complete individual upstream ZIPs and the unverified metadata/
GUI acceptance boundary; its [Code section](openspec-installation.md#claude-code-including-desktops-code-tab)
covers user-global installation. Our ready-made downloads remain companion-only.

## Choose one installation route

### Recommended: add the repository in Claude

1. In Claude Desktop or claude.ai, open **Customize → Plugins**.
2. Select **Add → Add marketplace → Add from a repository**.
3. Enter `forgegod/ai-coding-agent-skills`.
4. Open **openspec-development**, review the package, and select **Add**.
5. Start a new conversation or Cowork task and look for the skills in the picker.

The workflow plugin contains `openspec-delivery`, `openspec-next`, `git-commit-message`,
and `capability-wireframes`. It does not install OpenSpec or its CLI and does not
transfer another project's records. The separate **autonomous-orchestration**
plugin adds `autonomous-implementation-review` only. It requires
`openspec-development` and separately configured roles; those prerequisites are
not installed automatically.
No agents, hooks, MCP servers, or permission changes are installed by any plugin.
The bundled role templates remain inert support files.

Plugins require a paid plan (Pro, Max, Team, or Enterprise). Organization policy
may restrict third-party marketplaces or uploads. Ask the owner if the controls
are unavailable rather than trying to bypass policy.

Source: [Anthropic plugin installation and management](https://claude.com/docs/plugins/overview)
and [plugin availability](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).

### Alternative: upload a ready-made plugin ZIP

1. Open the [download page](https://forgegod.github.io/ai-coding-agent-skills/downloads/index.html).
2. Download **openspec-development** (`openspec-development.plugin.zip`).
3. In Claude, select **Customize → Plugins → Add → Upload plugin** and choose the ZIP.
4. Review the installed plugin and check its skill inventory.

The optional `autonomous-orchestration.plugin.zip` uses the same route but needs
separate review.
Plugin ZIPs contain `.claude-plugin/plugin.json`, a standalone README and license,
and complete `skills/<name>/` directories. Do not unzip before uploading, and do
not upload GitHub's whole-repository ZIP.

Source: [Anthropic's plugin ZIP upload instructions](https://claude.com/docs/plugins/overview#find-and-add-a-plugin).

### Alternative: upload one skill

1. Download the individual skill ZIP, for example `openspec-delivery.zip`, from
   the same download page. It is different from a `.plugin.zip` bundle.
2. Ensure **Settings → Capabilities → Code execution and file creation** (also
   called **Create and edit files**) is enabled, subject to organization policy.
3. Select **Customize → Skills → + → Create skill → Upload a skill**.
4. Upload the ZIP and enable the skill in the list.

Individual skills support Free, Pro, Max, Team, and Enterprise plans. Each ZIP
contains one matching top-level skill folder with `SKILL.md` and all its support
files. Related skills are not installed automatically: for the composed workflow,
prefer the `openspec-development` plugin instead of selecting isolated pieces.

Sources: [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude)
and [Create and package custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills).

## Confirm what is installed

Open the plugin's skill list rather than trusting a model's statement that it has
loaded something. The workflow plugin should list exactly
`openspec-delivery`, `openspec-next`, `git-commit-message`, and `capability-wireframes`,
and not `autonomous-implementation-review`.
The optional orchestration plugin should list only that latter skill.

Claude Code namespaces plugin skills: use
`/openspec-development:openspec-delivery`, not the bare slash-command
names used by direct directory copies. Resolve related skill names within the
installed plugins and support files relative to the loaded skill directory;
Hermes's `skill_view`, `terminal`, and `patch` tools are not installed by these packages.

For an initial read-only check, ask Claude to describe the installed
`openspec-delivery` workflow without creating or editing anything. This confirms
loading, not the ability to execute a change safely.

Avoid enabling an individual upload, a plugin copy, and a manually copied local
skill for the same workflow at once. Preserve any local customizations before
changing installation routes.

## Installation is not execution compatibility

| Surface | What installation provides | Remaining requirements |
| --- | --- | --- |
| Desktop Chat / claude.ai | Skills and bundled reference material | Not a local repository executor merely because code execution is enabled. Do not assume access to local Git, worktrees, or project subagents. |
| Cowork | Skills in its task environment | Check actual workspace access, tools, and permissions. This repository's Claude Code role protocol is not automatically a Cowork role protocol. |
| Claude Code, including Desktop's Code tab | Coding-agent skill loading | A project checkout, Git, Node 22+ for the packaged guards, project-specific tooling, and explicit execution authority. |

The orchestration path additionally requires separately reviewed project subagents
and model/permission configuration. Follow the [Claude Code host reference](../skills/autonomous-ai-agents/autonomous-implementation-review/references/claude-code-host.md)
and [role protocol](../skills/autonomous-ai-agents/autonomous-implementation-review/references/claude-code-roles.md).
Installing a plugin neither creates those project files nor authorizes commits,
checkout creation, publication, or unattended execution.

Anthropic documents account skills and plugins syncing into Claude Code v2.1.273+
when signed in with the same Claude account. API-key and cloud-provider sign-ins
do not use that sync. Account installation is not the same as a local CLI plugin
installation, and CLI installs do not sync back into the account. Check the
actual inventory after starting a new session; account sync and Desktop UI upload
have not been verified by this repository's automated tests.

Sources: [Plugin platform behavior](https://claude.com/docs/plugins/overview),
[skill sync](https://support.claude.com/en/articles/12512180-use-skills-in-claude#use-skills-in-claude-code),
and [plugin sync](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).

## Updates and removal

Marketplace plugins update from their source. Anthropic documents **Check for
updates** and, for personally added GitHub marketplaces, **Sync automatically**.
Once a new version syncs, account updates are automatic: enabling automatic sync
means trusting future source changes, not approving each update individually.
Manage this deliberately, especially for orchestration.

Uploaded ZIPs are snapshots, not a subscription to this repository. Download and
review a new package when updating; preserve customizations and resolve any
replacement prompt explicitly. Do not assume a local source edit or a new Pages
build updates an uploaded copy.

Use the plugin's toggle to disable it, or its menu's **Remove** action to remove
it. Individual uploaded skills have their own toggle and delete action under
**Customize → Skills**. Organization-required items may not be removable by members.

Sources: [Manage installed plugins](https://claude.com/docs/plugins/overview#manage-installed-plugins)
and [manage skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude).

## Maintainer verification

`npm test` and `npm run build` validate the repository catalog and produce:

- Five individual ZIPs, each preserving every canonical package file byte-for-byte.
- Two plugin ZIPs, with the OpenSpec companion skills separated from opt-in orchestration.
- `dist/downloads/index.html` and `index.json`, including SHA-256 checksums.
- The unchanged-format Hermes `.well-known/skills/` endpoint.

`.claude-plugin/marketplace.json` is the checked-in source catalog. Its root-source,
explicit-skill-list layout follows [Anthropic's own skills marketplace](https://github.com/anthropics/skills/blob/main/.claude-plugin/marketplace.json).
There is deliberately no root `.claude-plugin/plugin.json`: that would conflict
with the two entry-defined plugins. ZIP wrappers are generated from the same
catalog and canonical files; generated output stays untracked. The Git marketplace
uses a repository checkout, while ZIP exports contain only allowlisted package
files plus their generated plugin metadata, README, and license.

Bump the affected plugin version in the catalog whenever its selected skills or
support files change; skill versions alone do not update the enclosing plugin.
Tests reject omitted/duplicate packages, implicit orchestration or OpenSpec
inclusion, unshared packages in multiple bundles, added active plugin components,
unsafe paths, and symlinks, and verify archive bytes, repeatability, checksums,
and Pages artifact inclusion. They do not prove model obedience, cloud acceptance,
or scanner approval.

Validate the marketplace and both plugin exports with a disposable HOME and
CLAUDE_CONFIG_DIR, without account credentials. Check exact inventories: four
companion skills and one optional orchestration skill; no active agents, hooks
or servers. Desktop acceptance and end-to-end workflow
execution are not verified by package validation and require separate checks.

Before release, repeat native validation with `claude plugin validate <path>` and
install into an isolated scratch home, never a real agent profile. Run the
repository's separate Hermes release security gate. A native validator pass is
not a directory listing, Anthropic policy review, or Hermes scanner verdict.
After an authorized publication, fetch the download inventory and every ZIP,
verify their checksums, and test both GUI upload and repository installation in
Claude Desktop with the intended plan and organization policy. Record actual
skill loading separately from any execution tests. Public repository installation
requires this revision on GitHub; downloads require the matching Pages deployment.
A local build does not publish either surface.

Packaging references: [Marketplace schema](https://code.claude.com/docs/en/plugins/marketplace-reference)
and [plugin manifest schema](https://code.claude.com/docs/en/plugins/manifest-reference).
