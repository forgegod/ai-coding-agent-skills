# OpenSpec companion skills

## Purpose

Own the portable boundaries OpenSpec does not enforce: one orchestrator for Git and task progress, logical commits, and stable visual review.

## Ownership

| Path | Owns |
| --- | --- |
| `openspec-delivery/` | Change naming, orchestrator-only review, integration, receipt and recovery protocol, plus read-only naming, workspace-preview and committed-evidence helpers. |
| `openspec-next/` | Grounded change/task-group selection and bounded continuation, with read-only inspect mode. |
| `git-commit-message/SKILL.md` | Dependency-aware logical Git batches, a preview before apply, and tiered Conventional Commit messages. |
| `capability-wireframes/SKILL.md` | Static HTML/PNG wireframes for primary human-facing surfaces, with stable screen keys. |

## Local Contracts

- OpenSpec `openspec/specs/` and native change `tasks.md` are the specification and task authorities. These skills do not add a second mutable plan.
- GitHub issues and pull requests are documentation and review records. A project may explicitly include one issue in an authorized new proposal; otherwise require `/openspec-delivery document <name>`. PRs and later issue updates need separate authority. A new issue uses the risk-focused body in `openspec-delivery/references/ticket.md`; read it back and bind its stable URL before plan approval. It is not an admission lock, not the task list, and not an ISO/IEC 27001 certificate. Identity frontmatter never duplicates progress or PR state and remains hashed. The full OpenSpec change name is the identity; documentation reuses it without generating another suffix.
- Projects selecting the naming convention generate `<slug>-<lowercase-ulid>` once before proposal scaffolding, using the packaged naming helper. The authorized branch is `change/<full-name>` through specification, implementation and review. Existing names remain valid and unchanged; short-name ambiguity requires operator selection. Naming is not a lock, branch permission, or a substitute for spec reconciliation. Do not fork or modify installed OpenSpec adapters.
- `openspec-delivery` owns the Git and progress boundary. Its read-only guard checks committed planning, candidate and evidence inputs. It neither acquires a lock nor proves GitHub authority. Starts and handoffs are operator-serialized per change. Independent changes may run in separate checkouts. Overlapping capability specs require explicit reconciliation.
- The orchestrator is the only Git and `tasks.md` writer. Implementers report evidence. Reviewers are read-only. Stock OpenSpec apply checkbox writes are mediated.
- `git-commit-message` shapes and commits accepted batches. An OpenSpec change alone does not enable autonomous commits. Local commit authority excludes push, pull-request creation and merge. A project-selected short delivery/next invocation explicitly enables autonomous local commits with previews; a finish invocation separately authorizes its named protected publication and terminal closeout.
- `capability-wireframes` owns stable capability/screen keys and change-owned proposal assets. Its default current-product layout is `docs/product/wireframes/<capability>/`, not an OpenSpec requirement; existing target-project layouts win. Cross-document change references use the full name, not moving active/archive paths. Package-relative links must move with both endpoints; archive closure never repairs frozen content. Visual artifacts never replace executable behavior evidence. Two changes do not share a working manifest.
- Planning ends at the requested artifacts. Approval is not execution or publication authority.
- A package installed in a shared profile must not update or remove its installed copy while operating in a project.
- Launch examples state the exact operator-authorized local Git scope and stay identical in the README and `autonomous-implementation-review`. Displaying a template is not authorization.

## Work Guidance

Use `openspec-delivery` for an authorized change. Use `git-commit-message` when committing. Use `capability-wireframes` when a primary human-facing surface changes. Do not reimplement OpenSpec propose, apply or archive.

## Verification

Run `npm test` and `npm run build`. Check changed frontmatter, related skill names, and support-file references.

## Child DOX Index

No child DOX documents. Parent contract: `../AGENTS.md`.
