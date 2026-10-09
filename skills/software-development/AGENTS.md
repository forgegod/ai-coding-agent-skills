# Product-record development skills

## Purpose

Own optional, portable agent workflows for initializing a copied blueprint and maintaining the canonical capability (CAP) and change-progress (CHG) record structure, CAP-linked wireframe artifacts, and CHG-backed phase execution.

## Ownership

| Path                              | Owns                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| `application-records/SKILL.md`    | Canonical CAP/CHG material-change lifecycle and wireframe handoff. |
| `blueprint-initialization/SKILL.md` | One-time copied-blueprint initialization and cleanup. |
| `capability-wireframes/SKILL.md`  | Static HTML/PNG wireframes for primary human-facing CAP surfaces. |
| `git-commit-message/SKILL.md` | Tiered Conventional Commit messages from staged changes. |
| `phased-plan-design/SKILL.md`     | CHG phase design for material changes and gates. |
| `phased-plan-execution/SKILL.md`  | One verified CAP/CHG phase at a time. |
| `phased-plan-overview/SKILL.md`   | Active-CHG inspection and resume selection. |
| `phased-plan-refactoring/SKILL.md` | Verified CHG splitting and resequencing. |

## Local Contracts

- These skills use `docs/product/capabilities/CAP-*.md` for current behaviour and `docs/changes/{active,archive}/CHG-*.md` for implementation progress.
- `capability-wireframes` owns the portable canonical `docs/product/wireframes/` layout and explicit CAP surface declarations. Review packages stay separate under `docs/changes/reviews/CHG-<number>/`; `application-records` and the phase skills maintain their ownership, implementation handoff, and stable-path retention. Visual artifacts never replace executable behavior evidence.
- `application-records` decides when CAP/CHG records apply; the packaged `phased-plan-*` skills own their phase design, execution, overview, and restructuring.
- The active CHG phase table is the only mutable progress authority for material work. Profile-private plans, temporary notes, and tracker checklists do not schedule implementation.
- `blueprint-initialization` runs only on an explicit adoption request. It removes target-project-owned one-time routing and any verified legacy local copy after initialization; shared installed packages remain intact.

## Work Guidance

Keep the skills complementary: explicit adoption uses `blueprint-initialization`; normal material work uses `application-records` plus the relevant `phased-plan-*` entry point; primary human-facing surface work also uses `capability-wireframes`. Keep the skills repository-portable: no profile-local paths or harness-only state.

## Verification

Run `npm test` and `npm run build`; check changed SKILL frontmatter, related skill names, and support-file references. The adopting project's declared CAP/CHG checks verify execution there.

## Child DOX Index

No child DOX documents. Parent contract: `../AGENTS.md`.
