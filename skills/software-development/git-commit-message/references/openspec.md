# OpenSpec commit batches

Load this only when the adopting project's policy explicitly selects OpenSpec for
the work. Merely finding an `openspec/` directory, a GitHub remote, an installed
package, or an OpenSpec-aware host never opts a project in. Without that explicit
policy use the CAP/CHG procedure in `SKILL.md`, including its step 2 CHG exception.

## Ownership

- One orchestrator is the sole Git and `openspec/changes/<name>/tasks.md` writer for
  a change. Implementers and reviewers stage nothing, commit nothing, and never
  edit planning files or task checkboxes.
- `openspec-change-integration` owns the OpenSpec batch adapter and its path allowlists.
  The orchestrator declares exact allowed paths from approved scope and project
  policy; the read-only helper does not generate an implementation allowlist.
  Planning edits, the implementation candidate, and the record-only receipt/archive
  stay in separate batches.
- Do not create a CHG record, phase table, phase-guard preflight or synthetic
  `docs/changes/` record for OpenSpec scope. `change-guard.mjs` supplies the
  committed-evidence check; this skill only shapes, previews and commits accepted
  batches.

## Commit gates

- The preview, its single-turn stop, explicit acceptance, the staged readback
  before committing, and the hook-preserving `git commit -F` sequence are
  required. Autonomous mode needs explicit environment or
  governing-instruction enablement; an OpenSpec change or an orchestrator role
  never enables it.
- Name every changed path left out of a batch and why. If staging produced by
  another actor does not match the accepted batch, stop and present a new preview.
- Local commit authority never includes push, PR creation, merge, protection
  changes, issue closure or archival notification. Those need separate
  authorization and orchestrator readback. A checked task is progress, not
  integrated behavior.