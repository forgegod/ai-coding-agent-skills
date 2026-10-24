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
| `phased-plan-closeout/`   | Orchestrator-only Git/CHG protocol, read-only phase guard, and next-goal handoff. |
| `phased-plan-overview/SKILL.md`   | Active-CHG inspection, resume selection, and next-goal command. |
| `phased-plan-next/` | Overview-based selection and an explicitly authorized, ordered current-pane Herdr handoff. |
| `phased-plan-refactoring/SKILL.md` | Verified CHG splitting and resequencing. |

## Local Contracts

- These skills use `docs/product/capabilities/CAP-*.md` for current behaviour and `docs/changes/{active,archive}/CHG-*.md` for implementation progress.
- `capability-wireframes` owns the portable canonical `docs/product/wireframes/` layout and explicit CAP surface declarations. Review packages stay separate under `docs/changes/reviews/CHG-<number>/`; `application-records` and the phase skills maintain their ownership, implementation handoff, and stable-path retention. Visual artifacts never replace executable behavior evidence.
- `application-records` decides when CAP/CHG records apply and their artifact semantics; the packaged `phased-plan-*` skills exclusively own CHG phase design, lifecycle transitions, execution, closeout, overview, and restructuring.
- The active CHG phase table is the only mutable progress authority for material work. Profile-private plans, temporary notes, and tracker checklists do not schedule implementation.
- Design ends at a validated plan/proposal, not phase 1. Record-edit/commit consent and execution/reservation authority are separate; routing or loading a related skill never supplies the latter. Specification/test phases are execution too. `tests/planning-boundary.test.mjs` guards these instruction boundaries, not model obedience.
- The orchestrator follows `phased-plan-closeout` as the single Git/CHG writer. Its `references/record-writes.md` recipe also governs target-only creation/restructuring before phases; executors never stage, commit, or edit the CHG path. Other skills delegate rather than copying its protocol.
- `phased-plan-closeout/scripts/phase-guard.mjs` is a read-only Node 22+/Git helper. Real Git fixtures verify reservation-derived worktree identity, blob/history/topology refusal, exact path/content/parent readback across hooks, and completion evidence tied to the reviewed tip. It does not acquire a lock, authorize writes, or repair failures.
- Worktree creation uses the guard's `create-preview` argument array after reservation; it refuses collisions and stale/dirty targets, never creates anything, and does not replace authorization or recovery. Keep `.mjs` packaging independent of a consumer's module settings.
- The guard's `candidate` boundaries bind raw worktree content (including untracked source) to the reviewed index and commit; mismatches preserve work and invalidate approval. `references/review-boundary.md` owns that recipe. Preview precedes any index write.
- Candidate hashing uses Git-compatible raw blob framing for the repository's SHA-1/SHA-256 format without per-file Git processes. Preserve full content/mode/symlink coverage; digest-equivalence and subprocess-count tests guard optimization, not timestamp shortcuts.
- `phased-plan-closeout/references/recovery.md` owns interrupted/reserved/completed recovery. Keep normal entry points compact, load recovery only on its stated conditions, and preserve the requirement-location map in `tests/workflow-optimization.test.mjs` when moving guidance.
- Derive fresh-worktree bootstrap from project exports/scripts/CI and record it separately from acceptance gates. Completion prose needs factual review distinct from implementation approval; receipts never predeclare cleanup or erase failed attempts.
- Launch examples state the exact operator-authorized local Git scope and stay identical across README, overview, and orchestration. Displaying them is not authorization. Missing/competing ownership or invalid readback preserves work and requires an explicit recovery handoff.
- Overview is bounded read-only selection: one Git snapshot and record-validation pass, conditional recovery of the relevant phase, and named Herdr environment checks. It does not rerun implementation gates or inspect host/source trees to prove transport support; unresolved evidence ends in a blocker, not broader discovery.
- `phased-plan-next` reuses overview's selection rules but owns an explicit-invocation-only current-pane handoff: fresh session, busy queue, then the canonical single-phase goal. Its bounded helper survives the selecting session, requires caller identity and fresh lifecycle settlement, verifies ordered acknowledgments, and never falls back to focus or retries uncertain delivery. Scratch receipts are transport evidence only. Overview remains print-only; routing or installing next grants no launch authority.

## Work Guidance

Keep the skills complementary: use `application-records` when creating or revising CAP/CHG records, and use the relevant `phased-plan-*` entry point to select or execute an existing CHG. Do not require `application-records` merely to resume an existing record. Primary human-facing surface work also uses `capability-wireframes`. Keep the skills repository-portable: no profile-local paths or harness-only state.

## Verification

Run `npm test` and `npm run build`; check changed SKILL frontmatter, related skill names, and support-file references. The adopting project's declared CAP/CHG checks verify execution there.

## Child DOX Index

No child DOX documents. Parent contract: `../AGENTS.md`.
