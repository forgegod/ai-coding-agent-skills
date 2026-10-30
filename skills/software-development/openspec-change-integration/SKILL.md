---
name: openspec-change-integration
description: Review and integrate explicitly selected OpenSpec changes.
version: 0.7.0
author: Raphael (forgegod), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [OpenSpec, Git, Review, Evidence]
    related_skills: [git-commit-message, capability-wireframes, autonomous-implementation-review]
---

# OpenSpec change integration

Preserve a reviewed committed candidate and truthful post-merge evidence for one
OpenSpec change in a project that explicitly selects this workflow. This is an
orchestrator procedure, not a scheduler, distributed lock, approval service or
GitHub API client, and installing OpenSpec or this package never selects it.

## When to Use

- The project's contributor contract uses OpenSpec for the selected change.
  Installing this package does not select that workflow or transfer another
  project's records.
- An operator authorizes bounded specification, implementation, review,
  documentation or recovery. A planning-only request ends at
  proposal/spec/design/tasks plus a bounded issue write only when the project's
  explicitly selected proposal policy includes it.
- Do not use to create a second task tracker, or to require a GitHub issue
  before local specification can begin. The selected policy requires the verified
  issue before plan approval, not before drafting.

## Prerequisites

- Node 22+ and Git for the packaged read-only `scripts/change-guard.mjs` helper.
- A separately reviewed OpenSpec CLI/native workflow installation; this package
  does not install it or assert host execution support.
- Explicit project policy naming target, required gates, evidence retention and
  source/deployment completion boundaries.
- For a documentation or review record: a real issue or pull request with explicit
  authority. A project may include one issue in an authorized new proposal;
  installation alone never grants that authority. Offline work leaves the link
  pending and the proposal unready for approval. Never invent remote state. Follow
  [references/ticket.md](references/ticket.md): one risk-focused issue, no task
  list. The full OpenSpec change name is the identity; reuse it exactly.

## Authority and writers

The orchestrator is the sole Git and task-progress writer for this change.
Implementers edit implementation/tests and report results; reviewers are read-only.
The stock OpenSpec apply action normally updates tasks: mediate that behavior in
its handoff so it cannot compete with the designated writer. A checked task means
implementation progress, not merge, deployment or acceptance.

Use operator-serialized starts and handoffs per change. Assignees, comments and
refs detect observed conflicts; they are not a lock. Missing authority or an
unknown write outcome blocks the mutation. A selection snapshot never grants
permission for a later action.

## Parallel specification and documentation

When project policy selects collision-resistant naming, follow
[references/naming.md](references/naming.md) before upstream proposal scaffolding:
the operator supplies a slug; the agent runs `scripts/change-name.mjs` to generate
one `<slug>-<lowercase-ulid>` name. Use `change/<full-name>` for the authorized
branch through specification, implementation and review. Resolve existing changes
without generating another suffix; ambiguous short names require selection.
Existing names and branches stay unchanged. This is a project-instruction step,
not an upstream CLI hook, adapter modification, branch grant or second tracker.

OpenSpec owns the proposal, delta specs, design and `tasks.md`. This skill does
not author a second specification. Independent changes may be specified and
implemented concurrently in separate checkouts, one orchestrator each. A
dependent change may be specified against an explicit prerequisite; its
implementation waits for that prerequisite's accepted integrated revision, not
for a ticket state.

When two active changes touch the same capability spec, reconcile the overlap
before either merges. A clean Git merge is not compatibility evidence.

GitHub issues and pull requests are documentation and review records. Create or
reuse one issue during a new proposal only when project policy explicitly includes
that write. Otherwise use the separately authorized `document <name>` invocation
in `references/ticket.md`. PR creation and later issue updates need separate
authority. Link the OpenSpec change and, for a review, the exact
candidate SHA. Do not put the task list in the issue, and do not invent a ticket so a helper command will run. Do not write that the issue is ISO/IEC
27001 compliant. Closing an issue does not archive a change. Archiving a change
does not close an issue unless that documentation write is separately authorized.
For metadata-enabled projects, bind the verified issue URL in proposal frontmatter
before approval and keep it unchanged by default. No PR metadata or second index
is needed. Follow the project's metadata validator; keep identity metadata covered
by the plan digest. An authorized correction after approval requires reapproval.
Archive moves preserve change identity; current specs must not inherit it.
With OpenSpec 1.15.0, keep delta specs free of frontmatter: strict validation
rejects it. Proposal/design/tasks and current specs can carry the project's
identity schema. After spec sync, add the schema to newly created current specs
under the same authorized scope and revalidate; native OpenSpec does not add it.

Before a pull request is merged, and before its branch is deleted, require a
verdict from `/autonomous-implementation-review` by a reviewer that did not
implement that candidate. The verdict binds the exact SHA. Disposition every
finding. The implementer cannot review its own candidate. That verdict is not
a GitHub approving review and not risk acceptance. If the host cannot run a
different reviewer, stop.

The helper's review and receipt commands cite a documentation issue URL when
those evidence records are produced. That URL is not admission. Do not call
those commands without a verified, authorized issue.

## Short invocation

The operator does not repeat the documentation constraints. This skill applies
them. On Hermes the whole request is:

```text
/openspec-change-integration document <name>
```

`<name>` is the full OpenSpec change name, not its active/archive path. A short slug may be resolved
through `references/naming.md`; ambiguous matches require selection. Other hosts
use their spelling of this skill, then the same `document <name>` words.

That verb means: load `references/ticket.md`, create or reuse one issue for change
`<name>`, read back the issue and record its URL in the proposal when authorized,
then stop. Reuse does not authorize rewriting an existing issue. Use the full
change name as its durable reference; later issue updates need separate authority. Do not generate
another suffix. Do not copy `tasks.md`. Do not implement, commit, open a pull request, or assign the issue to lock the work. A longer prompt is not required and does not add authority.

## Procedure

1. If the request is `document <name>`, perform only the short invocation above.
   Read back the issue. Stop. Do not continue this procedure.
2. Read the contributor contract and selected native change artifacts. Confirm
   explicit authority, approved scope, dependencies, risk and gates. Do not invent
   a second task table or a GitHub ticket. The native `tasks.md` is the task authority.
3. Check recovery first: use `references/recovery.md` for dirty/unowned work,
   competing activation, an existing PR, an uncertain API outcome or a prior merge.
   Preserve work; do not start another executor or replay merged implementation.
4. Use a separate clone/worktree and isolated mutable test resources per change.
   Independent changes may run concurrently; dependent execution waits for accepted
   integrated prerequisite evidence. One implementation writer per change initially.
5. Prepare native proposal/spec/design/tasks and obtain approval bound to an
   immutable plan commit and digest. Only checkbox progress edits preserve that
   digest; scope, acceptance, gates and dependencies changing require reapproval.
   Only the orchestrator may create commits, with explicit local commit authority.
6. Implement only the authorized change/task group. Retain actual gate output and
   report failed prerequisites. If role orchestration is explicitly requested,
   load `autonomous-implementation-review` and its OpenSpec reference; unsupported
   hosts stop rather than inventing model/session commands.
7. Freeze a clean committed candidate. Use `references/guard.md` for candidate
   and review checks. Independently review its exact full SHA, delta specs,
   implementation, executable evidence and current-behavior changes. Review is a
   gate within this change, not a new change for every comment. Allow at most two
   correction/re-review cycles; then stop for operator disposition. A changed
   candidate invalidates review; confirmed defects are not silently waived.
8. Before an authorized publication, load `references/integration.md`. Re-read the
   actual target and shared capability specs. Reconcile semantic overlap. Include
   implemented behavior, specs and current visuals in the review record. A clean
   Git merge alone is not compatibility proof. A pull request is that review
   record, not the task list.
9. Publish or integrate only with separately explicit authority. When the project
   uses a protected pull request or merge queue, required up-to-date checks are
   project prerequisites, not supplied by this skill. The initial guard requires
   reviewed candidate ancestry: squash or rebase integration is unsupported, not
   a reason to weaken checks or silently change repository settings.
10. Read back the real integrated commit and containing target. Execute the actual
   required gates on a named integrated/containing revision and retain output.
   Failure blocks completion and requires an explicit repair/revert decision.
11. Only after successful integrated verification, prepare an append-only truthful
    receipt and record-only archive PR. Use the receipt check and independently
    review factual claims. Do not reapply deltas already incorporated in current
    specs; reconcile differing current specs explicitly. An archive requiring new
    current-spec changes needs renewed verification, not a record-only exception.
12. Verify closure and cleanup by exact readback. A documentation issue closes
    only when that write is authorized and its acceptance boundary is satisfied.
    Evidence publication ends here: no extra pull request solely attesting the
    previous receipt, no next change, automatic release or implied cleanup.

## Pitfalls

- Plan digests and JSON validate structure, not human approval or test truth.
  The helper does not authenticate a reviewer, execute gates or inspect GitHub.
- The helper fails closed on planning bytes that are not UTF-8, on replace refs,
  graft files and similar Git topology rewriting, and on task syntax it cannot
  classify unambiguously; fix the input instead of relaxing the check.
- OpenSpec verification is not a substitute for executable project gates,
  independent review or protected integration. Config guidance is not enforcement.
- Do not commit prospective merge results or put closing keywords on an
  intermediate implementation PR when later acceptance is still required.
- Preserve exact IDs, failures and rejected candidates. Never rename a conflicting run, unassign an operator or discard dirty work.
- A shared-profile package must not update/remove its installed copy while
  operating in a project. Source adoption is not installed-profile permission.

## Verification

Report the actual candidate/plan digest, independent review and executed gate
references. After authorized integration, report verified target SHA, post-merge
receipt/archive, the receipt file's SHA-256 and closure readbacks separately. A
local `ok: true` means only that the helper's structural checks passed; incomplete
or unperformed remote steps remain explicitly pending. Stop at the operator's
authorized boundary.
