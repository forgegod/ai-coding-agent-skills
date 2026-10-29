# OpenSpec parallel-change workflow

## Scope and project selection

This workflow supports small independently mergeable changes, isolated execution,
independent review and Git-tracked post-merge evidence. It requires explicit project
selection in the project's contributor contract. Installation alone does not select
OpenSpec, convert records or grant Git/GitHub authority.

CAP/CHG projects use the `software-development` bundle and their blueprint-owned
record contracts. OpenSpec projects select `openspec-development` and use native
OpenSpec artifacts. These are alternative record workflows, not successive versions
that every environment is assumed to have adopted. Do not run both for the same scope.
The blueprint repository and installed skill set retain their own contracts; this
repository's source files do not change that environment.

## Authorities and artifacts

| Concern | Authority in an OpenSpec-selected project |
| --- | --- |
| Request, accountability, risk, permissions | Issue and attributable operator approvals |
| Current behavior | `openspec/specs/<capability>/spec.md`, backed by code/tests |
| Proposed scope and behavior | `openspec/changes/<name>/proposal.md` and delta specs |
| Technical approach | Change-owned `design.md` where applicable |
| Implementation progress | Change-owned `tasks.md`, written only by the orchestrator |
| Candidate review and integration | Exact Git revisions, protected PRs and executed gates |
| Accepted completion | Git-tracked post-merge evidence and archived change package |

A change is one independently mergeable delivery, not a multi-phase CHG translated
into a second format. A parent issue may group dependent deliveries. Each delivery
has its own change identity, scope, gates and acceptance boundary.

## Prerequisites and package choice

Use Node 22+, Git and OpenSpec 1.15.0. OpenSpec is an external prerequisite, not a
build dependency or a vendored part of the skill bundle. Review upstream packages
before executing them. Ordinary repository tests do not require network access.

The `openspec-development` bundle contains `openspec-change-integration`,
`git-commit-message` and `capability-wireframes`. Install OpenSpec's own CLI/native
workflows separately. Select an expanded/custom profile containing the verification
workflow (for example Claude's `/opsx:verify`), not an `openspec verify` CLI command.
Check actual host discovery and execution
capabilities. Do not enable duplicate commit/wireframe packages from both bundles.

`autonomous-orchestration` is a separate option for either workflow. It requires
explicit role/model configuration and a supported host. Package installation does
not create execution roles or provide an unattended scheduler.

| Responsibility | OpenSpec-selected scope | CAP/CHG scope |
| --- | --- | --- |
| Planning and progress | Native proposal/spec/design/tasks actions | `application-records` and the selected phase skills |
| Git and completion boundary | `openspec-change-integration` | `phased-plan-closeout` |
| Commit batches | `git-commit-message` OpenSpec reference | Its CAP/CHG procedure |
| Human-facing visuals | Stable capability/screen keys; change-owned proposals | CAP-owned canonical visuals and CHG review packages |
| Execution/review roles | One authorized change/task group | One authorized CHG phase |
| Work selection | Explicit native change selection | `phased-plan-overview` / `phased-plan-next` |

## Authority and parallel execution

1. Link each delivery to a real issue and full change ULID. Keep correlation identity
   distinct from stable capability/screen keys. An explicitly authorized local
   implementation may leave issue binding pending; it cannot claim collaborative
   admission, publish, integrate or close a ticket without that prerequisite.
2. Approve scope, behavior scenarios, design, tasks, dependencies, gates and risk.
   Bind approval to an immutable plan commit/content digest and the risk snapshot.
   Only task-status checkbox edits preserve approval; changed scope needs reapproval.
3. Name one accountable operator and one orchestrator per change. Operator-serialize
   starts and handoffs. Assignment, comments and refs detect observed conflicts;
   they are not distributed mutual exclusion. Re-read exact state before shared
   writes. Missing permission, conflicting ownership or unknown outcomes block them.
4. Use separate clones/worktrees and isolated mutable test resources per executing
   change. Independent changes may run concurrently. Dependent implementation waits
   for accepted integrated prerequisite evidence, not a checked task or closed issue.
5. Only the orchestrator writes task progress, Git and GitHub state. Implementers
   edit implementation/tests and report results; reviewers are read-only. Mediate
   stock OpenSpec apply's checkbox writes so it cannot become a competing writer.
   A checked task is implementation progress, not merged or deployed completion.
6. Run actual project gates and independent review on a clean committed candidate.
   Creating commits requires explicit local commit authority. Changed candidate SHA
   invalidates review. Correct in-scope findings within the change; after at most
   two correction/review cycles, escalate rather than starting an unbounded loop.

Planning-only permission ends at the requested artifacts. Approval of a plan is not
permission to execute tasks, create commits, write an issue, publish or merge.

## Integration and completion

1. Refresh against the actual current target and shared capability specifications.
   Reconcile semantic overlaps explicitly; a clean Git merge is not compatibility
   proof. Include implemented behavior, tests, specs and current visuals together.
2. Use authorized protected PRs with required up-to-date combined checks, or a
   configured merge queue with `merge_group` CI. Verify entitlement, checks and
   bypass restrictions. The package neither creates nor proves those settings.
3. Read back the exact publication/merge result and containing target revision.
   Run every required acceptance gate on a named integrated/containing revision,
   retaining actual commands, environment, exit statuses and output references.
   Failed integrated verification blocks completion and needs explicit repair/revert
   authority. Never replay an already merged implementation.
4. After successful integrated verification, prepare one record-only receipt/archive
   PR. Preserve failed/rejected evidence. Independently review factual claims and
   exact paths. Do not reapply incorporated delta specs over newer current specs.
   If archival requires product/current-spec changes, obtain renewed verification.
5. Verify closure merge and authorized cleanup by exact readback. Close the issue
   only when its source/deployment acceptance boundary is satisfied. A receipt names
   completed integrated verification, never the outcome of its own future merge.
   Closure CI checks the closure diff; no extra PR solely attests the previous receipt
   PR. Stop at the authorized change, without implied release or next-task dispatch.

One implementation PR and one receipt/archive PR are the default evidence topology.
This is project policy, not an OpenSpec requirement.

## Guard boundary and recovery

The integration package contains the read-only Node/Git `change-guard.mjs` helper.
Its [guard reference](../skills/software-development/openspec-change-integration/references/guard.md)
defines exact commands, planning digest inputs, supported task grammar, evidence
shapes and freshness checks. Its
[integration](../skills/software-development/openspec-change-integration/references/integration.md)
and [recovery](../skills/software-development/openspec-change-integration/references/recovery.md)
references own the bounded procedures.

The helper validates committed identities, plan continuity, review binding and
receipt structure/history. It does not authenticate approval/review, discover all
required gates, execute tests, call GitHub, acquire locks or authorize writes.
Full literal object IDs and present local objects are required. Independent clones
are supported; shared Git common-directory identity is not required. Candidate
reachability is required, so squash/rebase integration mapping is unsupported.

Preserve dirty/unowned work, exact IDs, failure output and uncertain API outcomes.
Read back before retrying a write. Reconcile ownership explicitly, never by silent
unassignment, force-cleanup or a retry name. Recovery after a merge verifies that
merge and prepares missing evidence rather than replaying implementation.

## Verification and rollout

Run `npm test` and `npm run build`. Tests cover real Git fixtures, package inventories,
workflow boundaries and native-copy collision safety. Exercise the pinned OpenSpec
CLI in isolated homes/projects; artifact validation and generated adapter files do
not prove model execution, protected integration or deployment acceptance.

Production use requires an authorized sandbox covering independent/dependent changes,
duplicate starts, owner changes, timeout readback, failed integrated gates and an
interruption between merge and receipt. Publication requires the real-scanner release
gate and native-client validation. Installed profiles, sibling repositories, live
issues/PRs, protection settings and public endpoints require separate authorization.

## References

Local authority/evidence policy is defined above, not attributed to upstream:

- [OpenSpec team workflow](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/team-workflow.md)
- [OpenSpec actions](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/workflows.md)
- [OpenSpec verification](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/reviewing-changes.md)
- [OpenSpec configuration](https://github.com/Fission-AI/OpenSpec/blob/6d04a1b58dedc95729d34e4f223d9d483aae210a/docs/customization.md)
