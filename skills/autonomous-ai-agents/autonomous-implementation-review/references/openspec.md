# OpenSpec change orchestration

Load this only when project policy explicitly selects OpenSpec for the scope and
the operator has authorized execution of that change. Selecting, approving and
starting a change remains an operator decision; routing here grants nothing.

## Unit and hosts

- The unit is one authorized native OpenSpec change and one named task group from
  its `tasks.md`. Never a second change, an unapproved task, a whole backlog, or a
  CHG phase.
- Reuse only the hosts already supported by `SKILL.md`: Herdr (`$HERDR_ENV=1`,
  see `references/herdr.md`) or the operator-sent `code-tab-phase-roles` command
  (see `references/claude-code-roles.md`). This reference defines no new host, CLI
  launcher, wrapper script or apply driver. A missing or unclear host is a
  blocker.
- The operator supplies the change-scoped launch instruction. Print no phase
  launch template for OpenSpec scope; the CAP/CHG example in `SKILL.md` stays the
  CAP/CHG template only.

## Roles and writes

- The orchestrator is the sole Git and `tasks.md` writer, and it uses
  `openspec-change-integration` for committed candidate, review and receipt
  checks. `phased-plan-closeout`, `phase-guard.mjs`, reservations and phase tables
  do not apply; no CHG record is created for this scope.
- Stock OpenSpec apply checkbox writes are mediated by that split: the implementer
  reports evidence and never edits `tasks.md`; the orchestrator checks a task only
  after verifying it in the frozen candidate.
- Review binds the immutable candidate commit and the approved plan content
  digest. A changed head, changed planning content or changed gate evidence
  invalidates review. Correct confirmed in-scope findings in the same unit and
  stop at two correction/review cycles before operator escalation.
- Integration, receipts and archival stay with the orchestrator through the
  integration skill. This loop stops after the named task group; push, merge,
  issue closure, archival PRs and any next change need new authority.