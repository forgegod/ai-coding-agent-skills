# OpenSpec metadata and Obsidian

## Contract

YAML frontmatter describes identity and navigation, not workflow state. Native
`tasks.md` remains the sole mutable task authority. GitHub owns issue/PR state;
committed evidence owns approval and verification. Do not add status, progress,
approval, merge state, PR lists, or auto-updated timestamps to frontmatter.

Use these fields at the very start of proposals, designs, task files and current
specs. Delta specs are the exception described below:

| Field | Type | Applies to |
| --- | --- | --- |
| `metadata_version` | integer `1` | Every frontmatter-bearing artifact; our convention, not the OpenSpec schema |
| `artifact` | `proposal`, `design`, `tasks`, or `spec` | Every frontmatter-bearing artifact |
| `change` | string | Proposal, design and tasks; exact directory identity, unchanged on archive |
| `capability` | string | Current specs; exact relative capability path |
| `github_issue` | HTTPS GitHub issue URL or `null` | Proposal only; one canonical documentation issue |

Example (synthetic identity and URL; not an existing ticket):

```yaml
---
metadata_version: 1
artifact: proposal
change: add-dark-mode-01arz3ndektsv4rrffq69g5fav
github_issue: https://github.com/example/project/issues/40
---
```

Design and tasks carry only version, artifact and change.
Current specs carry only version, artifact `spec` and capability:
a capability outlives individual changes. Never copy change/issue metadata from
a delta into the current spec. Keep OpenSpec's Markdown headings and task syntax.
`.openspec.yaml` remains OpenSpec-owned; do not duplicate its schema/created fields.

Delta specs deliberately have **no frontmatter**. OpenSpec 1.15.0 strict validation
rejects text above the first `## ` section as content archive will not carry into
the main spec. The compatibility probe locks in this negative control. Keep native
delta headings; derive change/capability from their directory paths instead. Do
not disable strict validation, hide YAML in comments, or patch upstream adapters.
The local checker rejects frontmatter on deltas and still inventories those files.

This convention uses plain YAML scalars and is compatible with Dataview fields
and Obsidian properties. It is not the Agent Skills `SKILL.md` metadata schema.
The checker rejects unknown fields, duplicate YAML keys, aliases, malformed YAML,
incorrect types, identity/path mismatches and symlinked source entries. Supporting
Markdown outside native proposal/design/tasks/spec paths is not part of this schema.

## Proposal-time issue

For projects explicitly selecting this policy, a new proposal includes creating
or reusing one risk-focused GitHub issue before plan approval. Use the existing
`openspec-delivery/references/ticket.md` procedure, search for an
existing issue first, and read back the exact issue after a write. Record the
verified full URL only in `proposal.md`. Do not create a second issue on retry.
The corresponding PR links the issue in GitHub; frontmatter does not track PRs.

A proposal request in a project that explicitly grants proposal-time issue
creation includes that bounded write. Installation, a metadata migration, or
reading this document does not grant it. A repository or permission ambiguity,
offline session, failed authentication or unknown write outcome leaves
`github_issue: null`; preserve the local draft and report the blocked issue step.
Do not fabricate a URL or claim that the proposal is ready for approval.
Existing local changes may remain pending rather than creating tickets as a
migration side effect. This session's metadata work does not authorize live tickets.

The issue identity stays unchanged by default. Its body may need separately
authorized factual corrections or risk reassessment; stable identity does not
mean freezing inaccurate content. Any correction to the frontmatter after plan
approval changes the existing plan digest and requires reapproval. There is no
metadata hashing exemption and no extra Markdown index.

## Validation

- `npm run validate:openspec` checks the repository's native artifacts, including
  archived ones. A null issue is permitted for a draft, not evidence of readiness.
- `npm run validate:openspec -- --require-issue` additionally requires a non-null
  issue on every active proposal. URL syntax validation does not prove that the
  issue exists, is in the intended repository, or was authorized; exact GitHub
  readback remains the operator's responsibility.
- `npm test` runs offline metadata fixtures and checks the actual repository.
- `npm run test:openspec` is an opt-in pinned OpenSpec 1.15.0 compatibility probe
  in an isolated scratch HOME/project. It exercises strict validation, task
  discovery and real spec-update/archive behavior with synthetic completed work.
  It is not validation of real implementation, permission to archive this change,
  or a test of the Obsidian GUI. It requires npm/network access to the pinned CLI.
  Pinning a version and redirecting HOME is not an OS sandbox or a supply-chain
  integrity guarantee. Review/trust the upstream package before running it.

Run both the metadata checker and upstream strict validation before approval.
After sync/archive, validate again: moving a change preserves its frontmatter;
syncing requirements must preserve current-spec identity. If upstream creates a
current spec without frontmatter, add its
`spec`/capability header as part of the explicitly authorized spec-sync work,
then run both checks. New capability deltas should include a meaningful
`## Purpose` section so native spec creation does not leave a placeholder that
fails strict validation. Do not patch installed OpenSpec adapters.

## Vault integration

Prefer one set of files: open the repository (or its `openspec/` directory) as an
Obsidian vault. OpenSpec then moves the same files Obsidian indexes, instead of
maintaining a second editable copy. Keep Obsidian configuration outside published
skill packages. Do not configure a real vault as part of metadata validation.
Choose one vault root, not nested vaults. Keep `.obsidian/` and `.trash/` out of
versioned product records when configuring the vault. Obsidian documents automatic
refresh for external changes, but cache desynchronization can require rebuilding
the vault cache; there is no refresh-latency guarantee here.

Use display-only `TABLE`/`LIST` navigation. Do not expose interactive Dataview
`TASK` queries for the project's task files: checking a task through Dataview
writes back to the source and would bypass the designated progress writer.

Query by stable `change` and `artifact`, not a hardcoded active-change path.
`file.link` and `file.path` represent the indexed current location. Search both
active and archive directories; archive state is derived from the directory,
not stored in a mutable status property. For a repository-root vault:

```dataview
TABLE WITHOUT ID change AS Change, file.link AS Proposal, github_issue AS Issue
FROM "openspec/changes"
WHERE artifact = "proposal"
SORT change ASC
```

For an `openspec/`-root vault use `FROM "changes"` instead. These are query
examples, not proof that Dataview has indexed a particular machine's files.
Externally performed moves must not be assumed to repair static wikilinks or
bookmarks. Prefer query-generated links for change navigation and verify the
client's filesystem refresh after a real archive.

Using an existing separate knowledge vault needs a separately selected storage
arrangement. Do not silently create symlinks, junctions, bidirectional sync or a
mirror with deletion enabled. Windows Obsidian watching a WSL checkout requires
an actual client/filesystem probe; metadata and local CLI tests cannot prove it.
Prefer an arrangement where Obsidian and the checkout use the same local
filesystem. A Windows-local checkout accessible from WSL is one option, but moving
the checkout changes the development environment and needs separate authorization.
Do not treat a Windows UNC path into WSL as verified local-file watching. Using
Linux Obsidian against WSL files is another setup to evaluate, not a tested result.
Obsidian explicitly discourages symlinks/junctions because of data-loss and
indexing risks, so they are not the default bridge into an existing knowledge vault.

The client acceptance probe, after separately authorized vault setup, is: index
a synthetic change; record its query-generated proposal link; archive that fixture
with OpenSpec; verify that exactly one proposal remains, its `change` and issue
values are unchanged, and `file.path`/`file.link` point into `changes/archive/`.
Do not use a real unfinished change for this test. A separate KB mirror, if later
requested, needs its own explicit one-way/derived-data contract; none is installed
or maintained by these helpers.

## References

- [Dataview: adding metadata](https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/)
- [Dataview: page metadata](https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-pages/)
- [Dataview: display-only behavior and task-write exception](https://blacksmithgu.github.io/obsidian-dataview/)
- [Obsidian: data storage and external refresh](https://obsidian.md/help/data-storage)
- [Obsidian: symbolic links and junction risks](https://obsidian.md/help/symlinks)
- [OpenSpec SDLC](openspec-workflow.md)
