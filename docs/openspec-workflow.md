# OpenSpec SDLC

This distribution supports one lifecycle: OpenSpec for specification and task
progress, plus four companion skills for the boundaries OpenSpec does not
enforce. Installing a package does not select the workflow for another project,
transfer that project's records, or grant Git or GitHub authority. Projects that
already keep older records leave those records in place.

OpenSpec's own CLI and native workflows remain a separate prerequisite. This
repository does not vendor them. Use Node 22+, Git and OpenSpec 1.15.0. Review
upstream packages before executing them. Select a profile that contains the
verification workflow (for example Claude's `/opsx:verify`). That workflow is
advisory. It is not an `openspec verify` CLI command and it does not block
archival by itself.

The picture and the field-notes walk-through below are unexecuted examples.
Displaying them grants no Git or GitHub authority.

## Lifecycle picture

OpenSpec skills own the change package. The four companion skills own the
boundaries OpenSpec does not enforce. A GitHub issue or pull request is written
only when the operator asks, and it never becomes the task list.

```text
idea
  |
  | optional                         documentation, only if asked
  v                                  |
openspec-explore                     v
  |                              GitHub issue
  |                              links the change
  v                              does not copy tasks.md
openspec-propose
  writes proposal, delta specs, design, tasks.md
  |
  +-- human-facing surface --> /capability-wireframes
  |                            proposal image stays in the change
  |
  v
isolated checkout
  /openspec-change-integration     one orchestrator, one writer
  |
  +-- required before merge --> /autonomous-implementation-review
  |                             a reviewer that did not implement
  |
  v
openspec-apply-change
  implementer reports evidence
  orchestrator checks tasks.md
  /git-commit-message commits accepted batches
  |
  v
frozen candidate SHA
  |
  | review record, only if asked
  v
pull request reviews that SHA
  a new SHA needs a new review
  |
  | separate integration authority
  v
read back the integrated revision
  run the required gates on that revision
  |
  v
openspec-sync-specs, when current specs are not already correct
openspec-archive-change
  |
  v
close the issue only if that documentation write is authorized
```

Parallel changes are two of these pictures at once, in separate checkouts.
They share neither an index nor a `tasks.md`. A parent issue may list both
links. It does not own either task list.

Host spelling differs. The pinned OpenSpec docs use `/opsx:propose` as the
canonical command. Hermes loads the same action as `/openspec-propose`. The
skill file is `openspec-propose`. `/opsx:apply` is the `openspec-apply-change`
skill. Do not assume one spelling works in every host.

Core profile, which this document assumes:

| Action | Skill | Command name in the OpenSpec docs |
| --- | --- | --- |
| Think before a plan | `openspec-explore` | `/opsx:explore` |
| Create the change and its planning artifacts | `openspec-propose` | `/opsx:propose` |
| Revise planning artifacts | `openspec-update-change` | `/opsx:update` |
| Implement tasks | `openspec-apply-change` | `/opsx:apply` |
| Merge accepted delta specs into current specs | `openspec-sync-specs` | `/opsx:sync` |
| Move the finished change to the archive | `openspec-archive-change` | `/opsx:archive` |

`openspec-verify-change` (`/opsx:verify`) is an expanded-profile check. It is
advisory. It does not replace project gates and it does not archive.

## Demo: field-notes

`field-notes` is a synthetic notes application. It is not this repository, and
the issue and pull-request numbers below are placeholders. Do not create them
unless the operator of that project asks.

The operator wants two deliveries that can be specified at the same time:

| Change | What it is | Depends on |
| --- | --- | --- |
| `pin-note` | A person can pin one note from the note screen | nothing |
| `export-notes` | A command writes the notes to a file | nothing |
| `pin-note-sync` | A second device receives the pin | integrated `pin-note` |

`pin-note` and `export-notes` are parallel. `pin-note-sync` may be specified
immediately, against the `pin-note` proposal, but its implementation waits for
the accepted integrated revision of `pin-note`. A closed issue is not that
revision.

### Specify `pin-note`

The operator asks to explore the pin interaction, then to propose it.

```text
/opsx:explore
/opsx:propose pin-note
```

On Hermes those are `/openspec-explore` and `/openspec-propose`. The propose
skill scaffolds `openspec/changes/pin-note/` and writes the proposal, the delta
spec, the design, and `tasks.md`. That is planning. It does not authorize
implementation, a commit, or a ticket.

The note screen is a primary human-facing surface. The operator asks for a
wireframe with a prompt, which loads `/capability-wireframes`:

```text
/capability-wireframes
Draft a proposal wireframe for the note screen of openspec/changes/pin-note.
Keep it in the change package. Do not update the product manifest.
```

The proposal image stays under `openspec/changes/pin-note/` and outside the
product manifest. The stable screen key is `notes` / `note-screen`. The
implementation slice later updates `docs/product/wireframes/notes/` and links
that page from `openspec/specs/notes/spec.md`. A second change must not mint
another key for the same screen.

Documentation is a separate short invocation. It does not happen because a
change exists, and the operator does not repeat the ticket rules:

```text
/openspec-change-integration document pin-note
```

`/openspec-change-integration` applies the risk-focused body, links
`openspec/changes/pin-note/` by that change name, and stops. It does not
generate a ULID, copy `tasks.md`, implement, commit, open a pull request, or
assign the issue to lock the work.

The body is the template in
`skills/software-development/openspec-change-integration/references/ticket.md`.
It records request, blast radius, confidentiality, integrity, availability,
authorization and recovery. That supports change-control evidence. It does not
establish ISO/IEC 27001 conformity. Do not label the issue compliant.

The OpenSpec change name is the identity. It correlates the issue, the pull
request and the evidence. Do not generate a ULID. If `export-notes` is a
different request, it gets its own change name in its own checkout. If another
clone is already editing `openspec/specs/notes/spec.md`, stop and reconcile. A
new name is not permission to continue.

Do not paste the task list into the issue. A second session that sees the
issue unassigned has not acquired a lock.

`export-notes` is specified the same way in another checkout, with
`openspec-propose` and its own `tasks.md`. It does not edit the pin-note
working tree. If both changes are documented, a parent issue may link the two
child issues. The parent is a group label, not a third plan.

### Implement one task group

The operator authorizes only task group 1 of `pin-note`, in an isolated
checkout, by naming the skill:

```text
/openspec-change-integration
Implement only task group 1 of openspec/changes/pin-note in this isolated
checkout. You are the only writer. Do not push, open a pull request, or merge.
```

It confirms recovery and refuses a second writer for that change.

The implementer follows `/openspec-apply-change` for that group and reports
commands, paths, and results. The orchestrator checks the matching boxes in
`tasks.md` only after that evidence is in the frozen candidate. Stock apply
must not tick those boxes itself.

Commits use `/git-commit-message`: preview the batch, stop, and commit only
after the preview is accepted. The implementation batch does not include a
later evidence file or the issue text.

Before a pull request may be merged, and before its branch may be deleted, a
reviewer that did not implement the candidate must review that exact SHA.
The operator starts that review with `/autonomous-implementation-review`:

```text
/autonomous-implementation-review
Review only candidate abc1111 of openspec/changes/pin-note.
Use a reviewer session and model that did not implement this candidate.
Read-only. Do not merge the pull request and do not delete the branch.
```

The loop stops after the named group. It does not open a pull request and it
does not start `export-notes`. If no different reviewer can run, stop. The
implementer must not review its own candidate.

### Review on a pull request

When the candidate is a clean commit, for example `abc1111`, and the operator
asks for review, open a pull request whose body names that SHA and the change:

```text
Title: pin-note
Body:  Change: openspec/changes/pin-note/
       Candidate: abc1111
       Documents: https://github.com/example/field-notes/issues/40
```

The pull request is the review record of `abc1111`. It is not a copy of
`tasks.md`. If the candidate becomes `def2222`, the previous review does not
count. Do not put a closing keyword in the pull-request body while later
acceptance is still required.

`/openspec-change-integration` then uses its read-only guard. The review record
cites issue 40 because the operator already created that documentation issue.
The citation is not a reason to create an issue, and the guard does not call
GitHub.

Merge is another prompt, and only after the independent verdict on `abc1111`
and a disposition of every finding:

```text
/openspec-change-integration
The independent review of abc1111 is accepted and every finding is dispositioned.
Merge that pull request by the protected route and read back the result.
Do not delete the branch.
```

Deleting the branch waits until the integrated evidence is recoverable and the
operator authorizes deletion. Review alone is not that authorization. Do not
restore a ULID directory or the old `change/<ULID>/phase-<n>` branch scheme. One OpenSpec change
uses one checkout and one review pull request.

### Integrate, sync, archive

Integration is a separate authorization. Read back the merge and the containing
target revision. Run the project's required gates on that named revision and
keep the output. A failed gate keeps the change open. It does not close issue
40, and it does not mean the merge should be replayed.

After that verification succeeds:

1. `/git-commit-message` commits the factual receipt as its own batch.
2. `openspec-sync-specs` updates `openspec/specs/notes/spec.md` only if the
   delta is not already there. Do not reapply a delta over a newer spec.
3. `openspec-archive-change` moves the package to
   `openspec/changes/archive/YYYY-MM-DD-pin-note/`.
4. Close issue 40 only if the operator authorizes that documentation write and
   the declared acceptance boundary is met. Archival does not close it.
   Closing it does not archive the change.

`export-notes` continues in its own checkout through the same picture. It does
not wait for issue 40. `pin-note-sync` may now be implemented, because the
integrated revision of `pin-note` exists. Its specification did not need to
wait for that revision, and it still does not share `pin-note`'s `tasks.md`.

If `pin-note` and another active change both edit `openspec/specs/notes/spec.md`,
stop before either merges and reconcile the overlap. A clean Git merge of the
two files is not combined-system evidence.

## Authorities

| Concern | Authority |
| --- | --- |
| Current behavior | `openspec/specs/<capability>/spec.md`, backed by code and tests |
| Proposed scope and behavior | `openspec/changes/<name>/proposal.md` and delta specs |
| Technical approach | Change-owned `design.md` where needed |
| Implementation progress | Change-owned `tasks.md`, written only by the orchestrator |
| Specification actions | OpenSpec propose, apply, sync and archive |
| Commits | `/git-commit-message` |
| Human-facing visuals | `/capability-wireframes` |
| Independent review before merge | `/autonomous-implementation-review` |
| Candidate identity, recovery and integrated evidence | `/openspec-change-integration` |
| Documentation and human review | GitHub issue and pull request, only when the operator asks |

One concern has one authority. `tasks.md` is the only mutable task list. An
issue is not a second plan. A pull request is not a progress file. A checked
task is implementation progress, not a merged or deployed result.

A change is one independently mergeable delivery. A larger feature is several
changes. A parent issue may group them as documentation. Each change keeps its
own identity, scope, gates and acceptance boundary.

## What each skill adds

OpenSpec does not commit, isolate writers, bind review to an exact candidate,
or keep a visual identity across archival. Its collaboration rules are
convention, not enforcement.

- `/openspec-change-integration` is the orchestrator boundary: one writer, an
  isolated checkout, candidate and plan identity, recovery, and Git-tracked
  evidence after integrated verification. It is not a scheduler and not a
  GitHub client. Invoke it by name when documenting, implementing, or merging.
- `/git-commit-message` keeps logical batches, a preview, exact staging and
  separate commit authority. An orchestrator role does not enable autonomous
  commits.
- `/capability-wireframes` keeps a stable screen key and a generated HTML/PNG
  review. Proposal images stay change-owned. They are not current behavior.
- `/autonomous-implementation-review` is the independent reviewer. It must be a
  different session and model from the implementer. Its verdict on the exact
  SHA is required before that pull request is merged and before the branch is
  deleted. It does not select the next change, accept risk, or approve the
  GitHub review.

No skill in this set replaces OpenSpec propose, apply or archive. Stock apply
may tick checkboxes; the orchestrator mediates that write. The implementer
reports evidence and does not edit `tasks.md`.

## Parallel specification

Independent changes may be specified and implemented at the same time.

1. Each change gets its own OpenSpec package and its own checkout. Changes do
   not share an index, working directory or mutable test environment.
2. One operator-designated orchestrator owns each change. Starts and handoffs
   for that change are operator-serialized. Two sessions that both observe no
   active run have not acquired a lock. Comments, assignees and refs only show
   a conflict that was already observed.
3. A dependent change may be specified before its prerequisite is integrated.
   Its implementation waits for the prerequisite's accepted integrated revision,
   not for a checked task or a closed issue.
4. Two changes that edit the same capability spec must reconcile that overlap
   before either merges. Record the source revision they were specified against.
   A later rebase does not silently redefine that baseline. A clean Git merge
   is not combined-system evidence.
5. One implementation writer per change. Parallelism is across changes, not
   across writers inside one change.

## Documentation and review

GitHub is the documentation and review surface. It is not the specification
system and not an execution lock.

- Create or update an issue only when the operator asks to document a request.
  Link the OpenSpec change. Do not copy `tasks.md` into the issue, and do not
  invent a ticket.
- Open a pull request only when the operator asks to review or integrate a
  frozen candidate. The review binds the exact commit, not the evolving request
  body. A changed candidate invalidates review.
- Closing an issue does not archive a change. Archiving a change does not close
  an issue unless that documentation write is separately authorized.
- Protected checks and a merge queue, where the project uses them, are
  repository settings. This package neither creates nor proves them. If they
  are missing, stop. Do not change protection to make a pull request mergeable.
- The helper's review and receipt commands cite a documentation issue URL when
  those evidence records are produced. That citation is not permission to
  specify, and it is not a reason to create an issue.

## Integration and completion

1. Refresh against the current target and shared capability specs. Reconcile
   overlaps. Include implemented behavior, tests, specs and current visuals
   together.
2. Integrate only with explicit authority. Read back the exact result and the
   containing target revision. Squash or rebase mapping is unsupported by the
   packaged guard; do not weaken that check to force a merge style.
3. Run the required acceptance gates on a named integrated revision. Retain the
   commands, environment, exit statuses and output. Failure blocks completion
   and needs an explicit repair or revert decision. Never replay an already
   merged implementation.
4. After successful integrated verification, commit the factual receipt and
   archive the change. Do not reapply delta specs that are already in current
   specs. A receipt names completed verification. It does not predict the merge
   of the commit that contains it.
5. Stop at the authorized change. No next change, release or cleanup is implied.

Planning permission ends at the requested artifacts. Approval of a plan is not
permission to implement, commit, open a pull request or merge.

## Guard

`openspec-change-integration` ships the read-only `scripts/change-guard.mjs`
helper. Its [guard](../skills/software-development/openspec-change-integration/references/guard.md),
[integration](../skills/software-development/openspec-change-integration/references/integration.md)
and [recovery](../skills/software-development/openspec-change-integration/references/recovery.md)
references own the commands and recovery table.

The helper validates committed identities, plan continuity, review binding and
receipt structure. It does not authenticate a reviewer, discover every required
gate, execute tests, call GitHub, acquire a lock or authorize a write. Full
object IDs must already be local. Independent clones are supported. Preserve
dirty work and uncertain API outcomes. Read back before retrying a write.

## Packages

| Plugin | Skills |
| --- | --- |
| `openspec-development` | `openspec-change-integration`, `git-commit-message`, `capability-wireframes` |
| `autonomous-orchestration` | `autonomous-implementation-review` |

Orchestration is optional. It requires the workflow plugin, explicit role and
model configuration, and a supported host. Package installation does not create
those roles.

## Verification

Run `npm test` and `npm run build`. Tests cover Git fixtures, package inventories
and native-copy collision safety. Artifact validation does not prove model
execution, protected integration or deployment acceptance. Publication, live
issues, protection settings and installed profiles need separate authorization.

## References

Local authority is defined above, not attributed to upstream:

- [OpenSpec team workflow](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/team-workflow.md)
- [OpenSpec actions](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/workflows.md)
- [OpenSpec verification](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/reviewing-changes.md)
- [OpenSpec configuration](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/customization.md)
