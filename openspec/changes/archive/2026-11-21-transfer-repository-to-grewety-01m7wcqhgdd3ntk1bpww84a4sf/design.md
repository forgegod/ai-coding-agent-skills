---
metadata_version: 1
artifact: design
change: transfer-repository-to-grewety-01m7wcqhgdd3ntk1bpww84a4sf
---
# Design

## Context

See `proposal.md` for motivation and the `local-skill-installation` delta for the
observable migration rule. The current repository is public
`forgegod/ai-coding-agent-skills` (ID `R_kgDOVCmNiw`) with default branch `main`,
workflow-backed Pages at `https://forgegod.github.io/ai-coding-agent-skills/`, one
active `main` ruleset requiring the `verify` check, two Actions workflows, 13 branch
refs, no tag refs, seven issues, 17 pull requests, and no releases reported by the
preflight inventory. The destination organization exists and the authenticated
operator is an admin of both source repository and destination organization; the
unscoped destination repository GET returned 404, which is not by itself proof that
the name is available or transferable.

Active source contains owner-bound URLs in repository/Pages/marketplace/Hermes
installation content, provenance code, tests, and generated HTML templates. Archived
OpenSpec plans/evidence contain historical old-owner links and must remain historical
records. `scripts/hermes-skill-provenance.mjs` currently accepts only the exact old
well-known identifier, so an owner change is a durable local-installation behavior
change rather than a documentation-only migration.

## Goals / Non-Goals

**Goals:**

- Use GitHub native transfer and prove continuity using immutable repository ID plus
  captured refs and representative record identifiers.
- Update only active canonical owner-dependent sources and classify every remaining
  old-owner reference as active compatibility, historical record, external listing,
  or intentionally preserved attribution.
- Make the new Pages destination canonical only after it serves the complete built
  distribution and separately preserve a minimal, safe path for exact legacy Hermes
  registrations.
- Make transfer, Pages, and external-listing outcomes independently observable and
  recoverable.

**Non-Goals:**

- Recreating/forking/mirroring the repository, rewriting Git history, changing
  personal authorship/copyright/Blueprint attribution, rewriting archived evidence,
  silently editing user profiles, or treating third-party listing submission as an
  accomplished update.

## Decisions

### Treat native GitHub transfer as the identity-preserving operation

Capture source repository ID, visibility, default branch, all branch/tag refs,
release inventory, and representative issue/PR records before transfer; read the
same fields from `grewety/ai-coding-agent-skills` after transfer and require the
same repository ID and preserved records. Use GitHub redirect behavior only as a
compatibility observation, not a replacement for canonical-reference edits.

Alternatives rejected: a replacement repository, fork, or mirror changes the
repository identity and undermines records/redirect requirements.

### Separate source preparation from live cutover

First prepare and review two independently CI-passing source batches with
scratch-only tests:

- **Pages-only batch**: the minimum changes needed to build, deploy, and verify
  the destination Pages site (`scripts/build-distribution.mjs` and
  `scripts/build-well-known-skills.mjs` generated-page/README repository links,
  plus any matching build/template test assertions needed so the Pages-only batch
  independently passes `npm test` and `npm run build` under the required `verify`
  CI workflow before the second batch lands).
- **Canonical-route batch**: canonical repository/Pages/marketplace/Hermes
  guidance (`README.md`, `docs/claude-installation.md`, `AGENTS.md`, and any
  other active owner-bound docs from task 1.1), `scripts/hermes-skill-provenance.mjs`
  (`upstreamSkills` switch and opt-in legacy recognition) and
  `scripts/install-local-skills.mjs`, matching updates to existing current-owner
  test assertions (explicitly all four current-managed-URL fixtures/assertions at
  `tests/local-profile-installation.test.mjs:207, 251, 475, and 518` to
  `grewety.github.io`, plus all three active assertions in
  `tests/documentation.test.mjs`: GitHub repository paths at `:18` and `:132` to
  `grewety/ai-coding-agent-skills` and well-known URL at `:89` to
  `grewety.github.io`), and the new dedicated legacy-transition/purge tests.

Author the Pages recovery runbook (`evidence/pages-recovery-runbook.md`) alongside
source preparation. Preserve personal attribution unchanged, including
`.claude-plugin/marketplace.json` `owner.name` (`"Raphael (forgegod)"`) and its
matching assertion at `tests/claude-packaging.test.mjs:31`, skill `author` fields,
copyright notices, and AI Software Blueprint attribution. Then,
under separate live authority, preflight transfer permission, destination policy/name
availability, rulesets, required CI, Actions permissions, Pages configuration,
integrations, recovery ownership, and every checkout's remote/common-Git-directory
relationship, recording the gate artifact `evidence/transfer-preflight-checklist.md`
before any transfer write. Transfer admission clears only when every stop criterion
has its minimum evidence recorded in that checklist:

- **Destination policy**: live GitHub organization settings/policy readback (API or
  captured GitHub UI policy view) confirming `grewety` permits incoming public
  repository transfers without blocking required visibility, Actions, or Pages rules.
- **Transfer permission**: authenticated live API/UI readback confirming the
  executing operator holds both source repository admin on
  `forgegod/ai-coding-agent-skills` and destination organization owner/transfer
  permission on `grewety`.
- **Name availability**: authenticated destination-organization lookup or GitHub UI
  transfer pre-check (never an unscoped 404 alone) confirming
  `grewety/ai-coding-agent-skills` does not already exist privately or publicly and
  is accepted as a transfer target.
- **Recovery ownership**: named operator attestation in the checklist identifying
  who holds GitHub admin/owner recovery authority on `grewety/ai-coding-agent-skills`
  and who will execute `evidence/pages-recovery-runbook.md` if Pages deployment fails
  post-transfer.
- **Installed-integration reauthorization assessment**: explicit enumeration of
  every installed GitHub App and repository integration on
  `forgegod/ai-coding-agent-skills`, its expected post-transfer permission behavior
  (including owner-scoped permissions that do not automatically transfer), and any
  required post-transfer reauthorization steps.

After the transfer readback succeeds, land the Pages-only batch through the
protected PR route. Keep the canonical-route batch unpublished until Pages passes
verification. A linked worktree shares remotes/configuration and
must not receive `remote set-url`; update remotes only under separately authorized
remote-management steps, with every independent clone/worktree inventoried and read
back.

Alternatives rejected: changing remote URLs opportunistically from a linked
worktree, or combining source implementation and live transfer in one unverified
operation.

### Pages has an independent cutover and recovery track

After native-transfer readback and protected integration of the Pages-only batch,
use the existing publish workflow on `main`. Verify the landing page,
`.well-known/skills/index.json`, every advertised package file, ZIP download, and
checksum inventory at `https://grewety.github.io/ai-coding-agent-skills/`. Only
after those checks pass, land the canonical-route batch through the protected PR
route. Verify the deployment from the final integrated revision, then smoke-test
the public installation routes before accepting the cutover. The old Pages URL
has no assumed redirect guarantee. If either deployment fails, retain the
transferred repository, stop any remaining promotion or acceptance, and execute
the pre-authored recovery runbook `evidence/pages-recovery-runbook.md` (covering
the GitHub Pages restore path, the manual-download/GitHub-hosted user fallback,
and post-recovery verification steps). Do not transfer back or recreate the
repository.

Alternatives rejected: declaring GitHub redirects sufficient for Pages or treating
a failed Pages run as a failed transfer.

### Make Hermes legacy support exact and opt-in

Keep one current canonical public well-known constant. Define the prior
`forgegod.github.io` identifier as a narrow legacy value accepted in
`scripts/hermes-skill-provenance.mjs` (`checkRegistration` and `removeRegistration`,
gated by an explicit opt-in flag such as `{ allowLegacy }`) and
`scripts/install-local-skills.mjs` only for an explicit local-installer
`--update` of a current package or an explicit `--purge` of a retired historical
package (`application-records`, `phased-plan-*`) that carries an otherwise valid
managed registration at its expected install path. Fresh installs without
`--update` use the current value and refuse even an orphaned legacy lock entry
(directory absent) as a conflict until explicit `--update` authority is provided;
any unrelated source/path mismatch remains a hard conflict on install, update,
and purge. Test fresh install, orphaned legacy lock refusal without `--update`,
exact legacy update transition, explicit purge of a legacy-registered retired
package, collision/local-edit/backups, unrelated registration retention, and
arbitrary mismatch refusal in disposable scratch homes. Do not inspect or edit
real profiles during implementation or smoke checks.

Alternatives rejected: silently accepting arbitrary source changes, bulk rewriting
live HubLock files, or retaining the old URL as canonical indefinitely.

### Classify external ownership rather than claiming it changed

Treat skills.sh as a non-blocking external listing. Repository documentation may
update its link/instructions only after verifying that service's actual
canonical/listing behavior. Submission/indexing is recorded as pending until its
operator confirms it; it does not block repository transfer, Pages deployment, or
public skill-reachability checks. Preserve personal attribution and the AI Software
Blueprint reference because they are not ownership pointers for this repository
transfer.

## Risks / Trade-offs

- [Destination organization policy blocks or alters transfer] → stop before transfer;
  record the precise policy/permission result and require an owner decision.
- [Destination name 404 is private/unavailable rather than free] → treat it as
  inconclusive and verify transfer admission in GitHub UI/API before cutover.
- [Pages is unavailable after transfer] → retain transfer state, diagnose/deploy
  separately, execute the pre-authored `evidence/pages-recovery-runbook.md`
  (GitHub Pages restore path, manual-download fallback, and verification steps),
  and do not promise old Pages redirect behavior.
- [Ruleset/Actions/Pages permissions drift] → capture effective values before and
  after transfer and stop if required `verify`, workflow deployment, or Pages
  permissions are absent.
- [Local registration migration overwrites user state] → require explicit update
  or explicit purge, exact-match admission, preflight, backups, and scratch-only
  validation.
- [Historical links lose evidentiary meaning] → classify and preserve archived
  artifacts instead of global owner replacement.

## Migration Plan

1. Prepare active-reference inventory, provenance transition (covering both
   explicit `--update` and explicit `--purge` of legacy-registered retired
   packages), documentation, workflows/marketplace/test updates, the pre-authored
   Pages recovery runbook (`evidence/pages-recovery-runbook.md`), and a
   machine-readable old-URL audit; run both an isolated Pages-only CI-independence
   checkpoint (`npm test` and `npm run build` on the Pages-only batch alone) and
   full local project gates and scratch-home tests (including legacy-registered
   purge and conflicting/arbitrary source-or-path mismatch refusal). Keep the
   Pages-only and canonical-route batches local. Do not transfer or publish yet.
2. Under explicit live authorization, capture the source baseline and produce
   `evidence/transfer-preflight-checklist.md` verifying every transfer-admission
   criterion's minimum evidence (destination policy, transfer permission,
   authenticated name availability, named recovery ownership, and
   installed-integration reauthorization assessment); stop on any missing
   criterion or integration ambiguity before any transfer write.
3. Perform GitHub native transfer once; read back identity, refs, representative
   records, rulesets, Actions/Pages configuration, and integrations under the new
   owner. Do not recreate the old path.
4. Under separate remote-management authority (group 4), update remotes across
   shared linked worktrees and independent clones, verify fetch/push URLs, and
   preserve/resolve dirty work.
5. Only after transfer readback and group-4 remote updates succeed for every
   checkout used to publish, in the transferred repository under separate
   publication/deployment authority, integrate the Pages-only batch, deploy from
   `main`, and verify the complete public distribution. Only then integrate the
   canonical-route batch. Verify its final deployment and public installation
   routes before accepting the cutover; document any required legacy-registration
   or manual action.
6. Verify external listings independently and classify confirmed updates separately
   from pending operator submissions; they do not block the successful transfer or
   Pages cutover.

Rollback is not a second repository. For a failed transfer, stop and inspect the
live GitHub state before any further write. For a failed Pages deployment after a
successful transfer, retain the transferred repository and execute
`evidence/pages-recovery-runbook.md` (authored in task 1.2 and verified in task
2.1) to restore/retry the verified GitHub Pages deployment path, direct users to
the manual-download/GitHub-hosted fallback while Pages is unavailable, and run
post-recovery verification before resuming canonical promotion. For a legacy
registration failure, preserve backups and leave unrelated/live profile state
untouched.

## Open Questions

- Which exact GitHub API fields versus GitHub UI views `grewety`'s organization
  plan exposes when capturing the required preflight evidence and
  installed-integration reauthorization assessment in
  `evidence/transfer-preflight-checklist.md` (resolved in task 3.1; missing
  evidence for any criterion blocks transfer).
