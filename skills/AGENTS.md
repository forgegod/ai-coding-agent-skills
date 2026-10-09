# Repository agent skills

## Purpose

Own optional, versioned agent playbooks that contributors can install and reuse across software projects.

## Ownership

| Path                  | Owns                                                          |
| --------------------- | ------------------------------------------------------------- |
| `software-development/` | Blueprint initialization, product-record, wireframe, and CAP/CHG phase-workflow playbooks. |

## Local Contracts

- A skill is an execution aid, not a source of product behaviour, progress, or architectural authority.
- Durable product policy lives in the adopting project's DOX chain and owning documentation contracts. A portable skill may define a canonical artifact layout and lifecycle, but not project-specific behaviour or policy.
- Skills follow the Agent Skills `SKILL.md` format and remain safe to read without a Hermes installation.
- Do not add credentials, profile-local paths, or agent-private state to repository skills.

## Work Guidance

Add a skill only when it provides a reusable, checkable procedure beyond this repository's local contracts. Keep project-specific behaviour, commands, and lifecycle exceptions in the adopting project; a portable skill may define stable names, paths, and lifecycle rules.

## Verification

Run `npm test` and `npm run build` in this repository. Validate changed skill metadata, support-file references, and completion criteria. Before publishing, probe discovery and installation through the public well-known endpoint with Hermes in an isolated scratch home.

## Child DOX Index

| Child                            | Owns                                          | Read when editing…                                     |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| `software-development/AGENTS.md` | Blueprint initialization, product-record, wireframe, and phase-workflow skills. | Adoption initialization, capability/change-record workflows, CHG sequencing, or wireframe output. |

Parent contract: `../AGENTS.md`.
