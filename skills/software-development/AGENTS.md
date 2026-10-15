# Product-record development skills

## Purpose

Own optional, portable agent workflows for maintaining the canonical capability (CAP) and change-progress (CHG) record structure, CAP-linked wireframe artifacts, and CHG-backed phase execution.

## Ownership

| Path                              | Owns                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| `application-records/SKILL.md`    | Canonical CAP/CHG material-change lifecycle and wireframe handoff. |
| `capability-wireframes/SKILL.md`  | Static HTML/PNG wireframes for primary human-facing CAP surfaces. |
| `git-commit-message/SKILL.md` | Dependency-aware logical Git batches, a preview before apply (or autonomous execution), and tiered Conventional Commit messages. |
| `phased-plan-design/SKILL.md`     | CHG phase design for material changes and gates. |
| `phased-plan-execution/SKILL.md`  | One verified CAP/CHG phase at a time. |
| `phased-plan-overview/SKILL.md`   | Active-CHG inspection, resume selection, and next-goal command. |
| `phased-plan-refactoring/SKILL.md` | Verified CHG splitting and resequencing. |

## Local Contracts

- These skills use `docs/product/capabilities/CAP-*.md` for current behaviour and `docs/changes/{active,archive}/CHG-*.md` for implementation progress.
- `capability-wireframes` owns the portable canonical `docs/product/wireframes/` layout and explicit CAP surface declarations. Review packages stay separate under `docs/changes/reviews/CHG-<number>/`; `application-records` and the phase skills maintain their ownership, implementation handoff, and stable-path retention. Visual artifacts never replace executable behavior evidence.
- `application-records` decides when CAP/CHG records apply; the packaged `phased-plan-*` skills own their phase design, execution, overview, and restructuring.
- The active CHG phase table is the only mutable progress authority for material work. Profile-private plans, temporary notes, and tracker checklists do not schedule implementation.
- For worktree execution, the target ref must contain the matching phase-table transition before worktree removal or later-phase selection; scratch and narrative evidence cannot substitute for that readback.

## Work Guidance

Keep the skills complementary: use `application-records` when creating or revising CAP/CHG records, and use the relevant `phased-plan-*` entry point to select or execute an existing CHG. Do not require `application-records` merely to resume an existing record. Primary human-facing surface work also uses `capability-wireframes`. Keep the skills repository-portable: no profile-local paths or harness-only state.

## Verification

Run `npm test` and `npm run build`; check changed SKILL frontmatter, related skill names, and support-file references. The adopting project's declared CAP/CHG checks verify execution there.

## Child DOX Index

No child DOX documents. Parent contract: `../AGENTS.md`.
