# OpenSpec change orchestration

Load this when the operator has authorized execution of one OpenSpec change.
Selecting or approving a change grants nothing by itself.

## Unit and hosts

- The unit is one authorized native OpenSpec change and one named task group from
  its `tasks.md`. Never a second change, an unapproved task, or a whole backlog.
- Reuse only the hosts already supported by `SKILL.md`: Herdr (`$HERDR_ENV=1`,
  see `references/herdr.md`) or the operator-sent `code-tab-phase-roles` command
  (see `references/claude-code-roles.md` and `references/claude-code-host.md`).
  This reference defines no new host, CLI launcher, wrapper script or apply driver.
  A missing or unclear host is a blocker.
- The Herdr launch template in `SKILL.md` is the only `/goal draft` example.
  Print the Code-tab command only from `references/claude-code-host.md`, and only
  when that host is selected. Do not print both.

## Roles and writes

- The orchestrator is the sole Git and `tasks.md` writer, and it uses
  `openspec-change-integration` for committed candidate, review and receipt
  checks. Stock OpenSpec apply checkbox writes are mediated: the implementer
  reports evidence and never edits `tasks.md`; the orchestrator checks a task only
  after verifying it in the frozen candidate.
- Review binds the immutable candidate commit and the approved plan content
  digest. The reviewer is a different session and a different model from the
  implementer. A changed head, changed planning content or changed gate evidence
  invalidates review. Correct confirmed in-scope findings in the same unit and
  stop at two correction/review cycles before operator escalation.
- A pull request must not be merged, and its branch must not be deleted, until
  this independent verdict exists for that SHA and findings are dispositioned.
  The verdict is not a GitHub approval and not risk acceptance. This loop does
  not merge or delete the branch.
- GitHub issues and pull requests, when the operator asks for them, document and
  review the change. They are not the task list and not permission to start.
- Integration, receipts and archival stay with the orchestrator through the
  integration skill. This loop stops after the named task group; push, merge,
  documentation writes and any next change need new authority.
