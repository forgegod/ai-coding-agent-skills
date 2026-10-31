# Change names and branches

## Activation and authority

This procedure applies only when the target project's contributor instructions
explicitly select it. Installation does not activate it. Read those instructions
before the upstream propose workflow invokes `openspec new change`; artifact
context from `openspec/config.yaml` alone is not a pre-creation hook. Do not modify
installed adapters or add a competing propose skill. OpenSpec owns scaffolding.

The operator still types `/openspec-propose add-dark-mode` (or `/opsx:propose`
on hosts using that spelling). The agent handles the identifier; the operator
does not have to type or memorize a ULID. Natural-language requests first yield
a readable lowercase kebab-case slug. Do not silently repair an explicit invalid
identifier; ask for a corrected slug.

## New proposal

1. Confirm this is new work, not a resume or retry. Inspect visible existing
   changes and related requests for the same work. A local inventory cannot see
   unpushed proposals in another clone. If intent is unclear, ask whether to
   resume the existing change or propose an independent one.
2. Resolve `<naming>` to this package's `scripts/change-name.mjs`. Use the host's
   terminal tool to run the following read-only command (Node 22+, no dependencies):

   ```sh
   node <naming> generate --slug add-dark-mode
   ```

   Require exit zero and JSON `ok: true`. Retain its `name`, `path` and `branch`.
   The helper uses a cryptographic random source for the ULID randomness and
   emits lowercase Crockford base32. It never fabricates randomness with a model.
   Slugs must start with a letter, use lowercase kebab-case, and be at most 173
   characters so the hyphen and ULID fit OpenSpec's 200-character full-name limit.
   `archive` is reserved. A slug already ending in a ULID is refused:
   resolve that full name instead, never append another suffix.
3. Pass the returned full `name` verbatim to `openspec new change <full-name>`,
   then continue the native propose procedure with that same name. Read back the
   exact created directory. If creation fails or its outcome is unknown, inspect
   that path before retrying with the same name. Never silently generate a new
   identity to escape a collision or a partial operation.
4. The canonical directory is `openspec/changes/<slug>-<ulid>/`. Its full name
   is immutable; editing the proposal's display title does not rename it. Issues,
   PRs, dependencies, evidence and handoffs all reuse the full name. No second
   identifier field, allocator, or registry is needed.

Generation emits a candidate identity only. It does not reserve the name, inspect
Git, create a folder or branch, write a ticket, commit, or authorize execution.
A supplied full name is never normalized or silently given a different suffix.
For an explicitly supplied new full name, confirm its valid lowercase ULID and
absence before using it unchanged; the automatic generation path is for slugs.

## Resume and short names

Use an explicitly selected change first. Otherwise, verified current context may
supply the full name (for example, an existing `change/<full-name>` branch with
its matching package). Conflicting context requires a question, not guessing.
Resolve the name against the selected checkout through the host terminal tool:

```sh
node <naming> resolve --repo <absolute-repo> --name add-dark-mode
```

The read-only resolver examines active directories under `openspec/changes/`.
It matches either an exact name or the exact slug followed by a valid lowercase
ULID; `add-dark-mode-extra` is not a fuzzy match. It does not search the network,
other worktrees, or archived packages. Missing roots are errors, not empty success.
Symlinked discovery paths, malformed options, and malformed active directory
names are refused with `code: "invalid-input"`. This includes unrelated malformed
directories: preserve them and ask for operator reconciliation, never silently
delete or rename them to make lookup pass. Missing roots also return `invalid-input`.
Results are a local snapshot, not a lock or proof that the proposal is complete.

- One match: reuse the returned full name and read its actual proposal.
- Multiple matches: exit nonzero with `code: "ambiguous"` and `matches`. Show the
  full names and proposal summaries, then ask the operator. Never choose newest.
- No match: exit nonzero with `code: "not-found"`. Do not create a change on resume.
  Check whether the change must be fetched or was archived, under separate authority.
- An explicitly selected full directory name can use `--exact` to disable slug
  matching, including when a legacy unsuffixed name shares a slug with new names.
  Do not use `--exact` to bypass an unresolved operator choice.

Existing unsuffixed names remain valid and unchanged. Never rename an existing
change, branch or archived package to bring it into this convention. If an existing
branch differs from the derived convention, use its confirmed actual mapping;
the resolver's `branch` field is a naming suggestion, not inspected Git state.

## Branch lifecycle

For new changes the branch is `change/<full-name>`, using the same suffix as the
folder. Keep it through specification, implementation and review. No phase numbers,
per-person IDs, or renaming from proposal to feature status. Work on the same change
reuses its identity and coordinates one writer; independent changes get independent
identities. Unique names do not resolve semantic overlap between specifications.

Create or switch branches only with operator authority. Before doing so, inspect
local/remote refs and worktree ownership. Reuse the confirmed existing branch or
stop for reconciliation; never force/reset a conflicting branch or generate a new
suffix to bypass ownership. Creation, push, integration and deletion have separate
authority boundaries. The naming helper performs none of them.

## Verification

Check that the returned name, created directory, authorized branch and later links
share the exact full name. Read back the directory/branch after an authorized write.
A helper test proves deterministic formatting and selection, not model compliance,
upstream slash-command execution, distributed locking or installed-profile updates.
