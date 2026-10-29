# OpenSpec commit batches

Load this when the commit belongs to an OpenSpec change. Finding an `openspec/`
directory, a GitHub remote, or an installed package does not by itself authorize
a commit. Work that is not part of a change uses the grouping rule in `SKILL.md`
and does not invent a change package.

## Ownership

- One orchestrator is the sole Git and `openspec/changes/<name>/tasks.md` writer for
  a change. Implementers and reviewers stage nothing, commit nothing, and never
  edit planning files or task checkboxes.
- `openspec-change-integration` owns the OpenSpec batch adapter and its path allowlists.
  The orchestrator declares exact allowed paths from approved scope and project
  policy; the read-only helper does not generate an implementation allowlist.
  Planning edits, the implementation candidate, and a later documentation or
  evidence batch stay separate.
- `change-guard.mjs` supplies the committed-evidence check when that check is in
  scope. This skill only shapes, previews and commits accepted batches.

## Commit gates

- The preview, its single-turn stop, explicit acceptance, the staged readback
  before committing, and the hook-preserving `git commit -F` sequence are
  required. Autonomous mode needs explicit environment or
  governing-instruction enablement; an OpenSpec change or an orchestrator role
  never enables it.
- Name every changed path left out of a batch and why. If staging produced by
  another actor does not match the accepted batch, stop and present a new preview.
- Local commit authority never includes push, pull-request creation, merge,
  protection changes, issue writes or archival notification. Those need separate
  authorization and orchestrator readback. A checked task is progress, not
  integrated behavior. An issue or pull request is a documentation or review
  record, not a batch boundary.
