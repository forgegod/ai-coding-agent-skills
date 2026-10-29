# OpenSpec companion skills

## Purpose

Own the portable boundaries OpenSpec does not enforce: one orchestrator for Git and task progress, logical commits, and stable visual review.

## Ownership

| Path | Owns |
| --- | --- |
| `openspec-change-integration/` | Orchestrator-only review, integration, receipt and recovery protocol, plus the read-only committed-evidence guard. |
| `git-commit-message/SKILL.md` | Dependency-aware logical Git batches, a preview before apply, and tiered Conventional Commit messages. |
| `capability-wireframes/SKILL.md` | Static HTML/PNG wireframes for primary human-facing surfaces, with stable screen keys. |

## Local Contracts

- OpenSpec `openspec/specs/` and native change `tasks.md` are the specification and task authorities. These skills do not add a second mutable plan.
- GitHub issues and pull requests are documentation and review records. Create them only when the operator names `/openspec-change-integration` and asks. A new issue uses the risk-focused body in `openspec-change-integration/references/ticket.md`. It is not an admission lock, not the task list, and not an ISO/IEC 27001 certificate. The OpenSpec change name is the identity. Do not generate a ULID.
- `openspec-change-integration` owns the Git and progress boundary. Its read-only guard checks committed planning, candidate and evidence inputs. It neither acquires a lock nor proves GitHub authority. Starts and handoffs are operator-serialized per change. Independent changes may run in separate checkouts. Overlapping capability specs require explicit reconciliation.
- The orchestrator is the only Git and `tasks.md` writer. Implementers report evidence. Reviewers are read-only. Stock OpenSpec apply checkbox writes are mediated.
- `git-commit-message` shapes and commits accepted batches. An OpenSpec change does not enable autonomous commits. Local commit authority excludes push, pull-request creation and merge.
- `capability-wireframes` owns stable keys under `docs/product/wireframes/<capability>/` and change-owned proposal assets. Visual artifacts never replace executable behavior evidence. Two changes do not share a working manifest.
- Planning ends at the requested artifacts. Approval is not execution or publication authority.
- A package installed in a shared profile must not update or remove its installed copy while operating in a project.
- Launch examples state the exact operator-authorized local Git scope and stay identical in the README and `autonomous-implementation-review`. Displaying a template is not authorization.

## Work Guidance

Use `openspec-change-integration` for an authorized change. Use `git-commit-message` when committing. Use `capability-wireframes` when a primary human-facing surface changes. Do not reimplement OpenSpec propose, apply or archive.

## Verification

Run `npm test` and `npm run build`. Check changed frontmatter, related skill names, and support-file references.

## Child DOX Index

No child DOX documents. Parent contract: `../AGENTS.md`.
