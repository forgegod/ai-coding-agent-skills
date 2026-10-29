# Repository agent skills

## Purpose

Own optional, versioned agent playbooks that contributors can install and reuse across software projects that use OpenSpec.

## Ownership

| Path | Owns |
| --- | --- |
| `autonomous-ai-agents/` | Optional implementation-and-review loop. |
| `software-development/` | OpenSpec integration boundary, commit batches, and wireframes. |

## Local Contracts

- A skill is an execution aid, not a source of product behaviour, progress, or architectural authority.
- Durable product policy lives in the adopting project's DOX chain. OpenSpec artifacts own specification and task progress. These skills do not replace them.
- Skills follow the Agent Skills `SKILL.md` format and remain safe to read without a Hermes installation.
- Do not add credentials, profile-local paths, or agent-private state to repository skills.
- Installing a package does not select OpenSpec for a project, transfer another project's records, or grant Git or GitHub authority. GitHub issues and pull requests document and review; they are not the task list.
- A skill installed in a shared agent profile must not remove or modify its installed package while operating on a target project.

## Work Guidance

Add a skill only when it provides a reusable, checkable procedure beyond this repository's local contracts. Do not add a second specification or progress tracker beside OpenSpec.

## Verification

Run `npm test` and `npm run build` in this repository. Validate changed skill metadata, support-file references, and completion criteria. Before publishing, probe discovery and installation through the public well-known endpoint with Hermes in an isolated scratch home.

## Child DOX Index

| Child | Owns | Read when editing… |
| --- | --- | --- |
| `autonomous-ai-agents/AGENTS.md` | Autonomous implementation and review workflow. | Autonomous orchestration skill or support files. |
| `software-development/AGENTS.md` | Integration, commit, and wireframe skills. | OpenSpec integration, commits, or wireframe output. |

Parent contract: `../AGENTS.md`.
