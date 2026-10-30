---
name: openspec-next
description: Find and advance the next approved OpenSpec task group.
version: 0.1.0
author: Raphael (forgegod), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [OpenSpec, Continuation, Recovery]
    related_skills: [openspec-delivery]
---

# OpenSpec Next

Resolve the real unfinished boundary of one change and advance one approved local
task group. The operator need not remember its full name, worktree or Git recipe.
This is repository-grounded selection and recovery, not a scheduler or another
specification/task authority. OpenSpec owns native artifacts and `tasks.md`.

## When to Use

- `/openspec-next`, `/openspec-next <name>`, or `next` in verified OpenSpec context.
- `/openspec-next inspect [name]` to inspect without executing anything.
- Do not use to invent a new proposal, prioritize several independent changes,
  approve a plan, infer remote authority or start the next change after closure.

## Prerequisites and authority

Read the project's contributor contract and selected short-invocation policy.
Installation alone grants nothing. In an explicitly adopting project, the normal
invocation grants the same bounded local execution/commit authority as
`openspec-delivery <name>`; `inspect` is read-only. Operator restrictions override
defaults and persist across a bare `next`. Do not push, open PRs, merge, close an
issue, remove a worktree or start another change under this invocation alone.
An existing explicitly authorized finish operation can be resumed, but do not
convert a local-only request into finish authority.

## Procedure

1. Through `terminal`, batch root, branch, full HEAD, status, worktree inventory
   and relevant local refs. Read the root/owning contracts. Confirm the named
   repository/target instead of inferring them from a skill-installation path.
2. Resolve an explicit full name or unique short slug with delivery's packaged
   naming helper. Otherwise inspect the current branch and its actual package;
   if that is not verified context, inspect active packages and registered change
   workspaces. Prefer the known current change over other independent work. If
   several remain plausible, show their full names and proposal summaries and
   ask once. Never select newest. No match does not authorize new scaffolding.
3. Read the selected workspace's proposal/design/deltas/`tasks.md`, committed
   approval/digest, gate/review evidence and actual PR/receipt state when relevant.
   Inspect exact archived identity if the active package is absent; reject duplicate
   active/archive copies or conflicting ownership. Do not require GitHub for local
   task discovery, but do not call an unreachable remote "not merged".
4. Establish one concrete boundary: missing plan/approval, owned interrupted group,
   pending implementation group, frozen candidate awaiting verification/review,
   already merged implementation awaiting closeout, closure awaiting cleanup,
   or fully complete. Read native task syntax and headings, not a scratch task list.
   Retain exact group, target/base, workspace and evidence. Missing task grouping,
   ambiguous approval or unknown ownership blocks execution.
5. Select the first unfinished approved implementation group in document order,
   honoring dependencies and existing restrictions. Resume an incomplete candidate's
   checks/review first. Release/remote acceptance boxes are not local implementation.
   Do not skip blocked dependencies or turn checked tasks into merge evidence.
6. For `inspect`, report selected change/group, workspace/branch/base, approval,
   dependency and evidence state, blocker or next short invocation, then stop.
   Do not bootstrap, create a checkout, stage, commit or dispatch a role.
7. For normal execution, load `openspec-delivery` and its continuation/workspace
   recipes, pass the verified selection and constraints, and execute the remaining
   local boundary without a second permission prompt. Stop after one task group,
   or a real approval/review/authority blocker. If already merged, do not replay
   implementation; request `finish` only when that authority is absent. Fully
   complete means report completion with no next change.

## Pitfalls

- A matching branch name is not ownership, plan approval or a distributed lock.
- A copied task file, stale target or remote timeout is not absence/completion.
- `next` does not cancel `no commits`, `group 1 only` or other operator restrictions.
- Do not print a long authorization paragraph as the normal next step; the selected
  project contract already defines the short invocation's effects.

## Verification

Report the selected full identity, actual group and workspace, approval/dependency
checks, executed verification and candidate/review identities or the exact blocker.
In inspect mode report no mutations. In execution mode preserve uncompleted work,
keep `tasks.md` as the sole task authority and stop at the authorized boundary.
