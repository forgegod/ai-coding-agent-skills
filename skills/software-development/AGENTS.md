# Product-record development skills

## Purpose

Own optional, portable CAP/CHG workflows, shared wireframe/commit disciplines, and explicitly selected OpenSpec integration. Workflow selection belongs to the adopting project, not installed package presence.

## Ownership

| Path                              | Owns                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| `application-records/SKILL.md`    | Canonical CAP/CHG material-change lifecycle and wireframe handoff. |
| `capability-wireframes/SKILL.md`  | Static HTML/PNG wireframes for primary human-facing CAP surfaces. |
| `git-commit-message/SKILL.md` | Dependency-aware logical Git batches, a preview before apply (or autonomous execution), and tiered Conventional Commit messages. |
| `openspec-change-integration/` | Opt-in orchestrator-only OpenSpec review/integration/receipt protocol and read-only committed-evidence guard. |
| `phased-plan-design/SKILL.md`     | CHG phase design for material changes and gates. |
| `phased-plan-execution/SKILL.md`  | One verified CAP/CHG phase at a time. |
| `phased-plan-closeout/`   | Orchestrator-only Git/CHG protocol, read-only phase guard, and next-goal handoff. |
| `phased-plan-overview/SKILL.md`   | Active-CHG inspection and resume selection. It does not print a launch command. |
| `phased-plan-next/SKILL.md` | Explicit or unambiguous CHG selection and the next goal for operator submission. |
| `phased-plan-refactoring/SKILL.md` | Verified CHG splitting and resequencing. |

## Local Contracts

- CAP/CHG skills use `docs/product/capabilities/CAP-*.md` for current behaviour and `docs/changes/{active,archive}/CHG-*.md` for implementation progress. Explicitly selected OpenSpec scope instead uses `openspec/specs/` and native change `tasks.md`; never both mutable authorities.
- `openspec-change-integration` owns the OpenSpec Git/progress boundary. Its read-only guard checks immutable committed planning/candidate/evidence inputs and ancestry across independent clones; it neither acquires a lock nor proves GitHub authority or execution truth. Starts/handoffs are operator-serialized per change. Actual remote review, CI, merge and ownership need exact readback; post-merge receipts remain Git-tracked.
- Shared commits and wireframes select their OpenSpec references only under explicit project policy; otherwise use the CAP/CHG recipes below. OpenSpec proposal assets are change-owned; current visuals use stable capability keys and links, not fabricated CAP records.
- `capability-wireframes` owns the portable canonical `docs/product/wireframes/` layout and explicit CAP surface declarations. Review packages stay separate under `docs/changes/reviews/CHG-<number>/`; `application-records` and the phase skills maintain their ownership, implementation handoff, and stable-path retention. Visual artifacts never replace executable behavior evidence.
- `application-records` decides when CAP/CHG records apply and their artifact semantics; the packaged `phased-plan-*` skills exclusively own CHG phase design, lifecycle transitions, execution, closeout, overview, and restructuring.
- For CAP/CHG scope, the active CHG phase table is the only mutable progress authority for material work. For explicitly selected OpenSpec scope, native tasks are that authority. Profile-private plans, temporary notes, and tracker checklists do not schedule implementation.
- Design ends at a validated plan/proposal, not phase 1. Record-edit/commit consent and execution/reservation authority are separate; routing or loading a related skill never supplies the latter. Specification/test phases are execution too. `tests/planning-boundary.test.mjs` guards these instruction boundaries, not model obedience.
- For CAP/CHG scope, the orchestrator follows `phased-plan-closeout` as the single Git/CHG writer. Its `references/record-writes.md` recipe also governs target-only creation/restructuring before phases; executors never stage, commit, or edit the CHG path. OpenSpec-selected scope uses `openspec-change-integration` instead. Other skills delegate rather than copying either protocol.
- `phased-plan-closeout/scripts/phase-guard.mjs` is a read-only Node 22+/Git helper. Real Git fixtures verify reservation-derived worktree identity, blob/history/topology refusal, exact path/content/parent readback across hooks, and completion evidence tied to the reviewed tip. It does not acquire a lock, authorize writes, or repair failures.
- Worktree creation uses the guard's `create-preview` argument array after reservation; it refuses collisions and stale/dirty targets, never creates anything, and does not replace authorization or recovery. Keep `.mjs` packaging independent of a consumer's module settings.
- The guard's `candidate` boundaries bind raw worktree content (including untracked source) to the reviewed index and commit; mismatches preserve work and invalidate approval. `references/review-boundary.md` owns that recipe. Preview precedes any index write.
- Candidate hashing resolves regular files through Git's own clean filter in one batched subprocess, so a checkout conversion (`eol=crlf`, `text`) fingerprints as the blob Git would stage; symlinks keep raw target hashing. Preserve full content/mode/symlink coverage; digest-equivalence and subprocess-count tests guard optimization, not timestamp shortcuts. A candidate that edits `.gitattributes` changes how every other file normalizes, so refuse it rather than letting the allowlist comparison change meaning silently.
- `phased-plan-closeout/references/recovery.md` owns interrupted/reserved/completed recovery. Keep normal entry points compact, load recovery only on its stated conditions, and preserve the requirement-location map in `tests/workflow-optimization.test.mjs` when moving guidance.
- Recovery classifies phase rows and registration before choosing guards. Use captured full SHAs and exact reservation-derived refs; a retained integrated branch is not a worktree, and `locate` is not an absence test. Report invocation/query errors, unresolved ownership, and transport blockers separately. `tests/phase-recovery-guidance.test.mjs` executes the canonical read-only recipes in isolated Git fixtures and checks instruction boundaries, not model obedience.
- Derive fresh-worktree bootstrap from project exports/scripts/CI and record it separately from acceptance gates. Completion prose needs factual review distinct from implementation approval; receipts never predeclare cleanup or erase failed attempts.
- Launch examples state the exact operator-authorized local Git scope and stay identical across README, `phased-plan-next`, and orchestration. Overview does not print a launch command. Displaying a template is not authorization. Missing/competing ownership or invalid readback preserves work and requires an explicit recovery handoff.
- Overview is bounded read-only selection: one Git snapshot and record-validation pass, conditional recovery of the relevant phase, and one host classification. `$HERDR_ENV=1` with a non-empty `$HERDR_WORKSPACE_ID` is the Herdr class. Exactly one of those set is a transport blocker and does not invalidate selection. Neither set is not a blocker. It reports armed Code-tab status and prints no launch command. It does not rerun implementation gates, install files, or inspect host/source trees to prove transport support.
- `phased-plan-next` accepts an explicit active CHG path or unique id, otherwise reuses overview's repository-selection and recovery rules, and presents one goal for the operator to send. A named CHG does not override another record's reservation or cleanup. Transport blockers and cleanup-only recovery get no goal. Missing Herdr context does not block the Herdr-shaped goal. Next requires no session reset, pane monitoring, dispatch helper, or receipt. Invoking it grants no execution authority. Autonomous orchestration alone owns role handoff to an explicitly selected non-orchestrator Herdr pane.

## Work Guidance

Keep the skills complementary: use `application-records` when creating or revising CAP/CHG records, and use the relevant `phased-plan-*` entry point to select or execute an existing CHG. Do not require `application-records` merely to resume an existing record. Primary human-facing surface work also uses `capability-wireframes`. Keep the skills repository-portable: no profile-local paths or harness-only state.

## Verification

Run `npm test` and `npm run build`; check changed SKILL frontmatter, related skill names, and support-file references. The adopting project's declared CAP/CHG checks verify execution there.

## Child DOX Index

No child DOX documents. Parent contract: `../AGENTS.md`.
