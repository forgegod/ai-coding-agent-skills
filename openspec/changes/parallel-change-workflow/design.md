---
metadata_version: 1
artifact: design
change: parallel-change-workflow
---
# Design

## Decision

Use native OpenSpec artifacts as the task/specification authority for migrated scope.
Keep one operator-designated orchestrator per change. Shared source packages route to
on-demand OpenSpec references only under explicit project adoption. Operator-facing
commands define short bounded defaults; explicit restrictions override them.

## Integration boundary

Proposal, design, tasks and current specs use the identity-only schema in
`docs/openspec-metadata.md`. Delta specs remain native Markdown: upstream strict
validation rejects frontmatter there, so their identities are path-derived.
One verified proposal-time issue URL lives on the proposal, null while blocked;
no PR metadata or separate index is needed. Metadata remains inside the plan
digest. A read-only YAML checker validates types and path identities, including
archive moves. Current specs use capability identity, not a change/issue link.
The opt-in pinned CLI probe tests validation, task parsing and actual spec-update
and archive operations in scratch. Same-files vault views follow file locations;
static link repair and Windows/WSL watcher behavior need separate client probes.

Cross-document references use the full change name and, when needed, artifact
role rather than active/archive paths. Resolve locations only for tool use;
same-package relative links move together. Current visual paths are a companion
default, not native OpenSpec policy. Spec-sync links are resolved from their
destination before final verification; archived packages remain byte-identical.
The documentation issue is a proposal-time risk snapshot. Later reviews and
outcomes are separately authorized factual records, not blank future evidence
fields or an editable issue-body permalink presented as an immutable revision.

This legacy change is recovered rather than treated as a new proposal. Issue #8 is
the bounded recovery/closure record. It explicitly preserves that the original
implementation was admitted and integrated without a dedicated issue or retained
pre-admission approval. The correction plan binds this fact to its new plan digest;
it does not backfill the historical gap or relabel the bundled implementation PR as
a dedicated review. The accepted main baseline is
`a85ceff2e461a70fbeca1e8e2abf6ff5fddd7007`, which includes the integrated OpenSpec
1.16.0 / Node 22.12.0+ prerequisite change. Reconciliation keeps that complete
accepted state, including its archived records, while preserving the unfinished local
Git-environment hardening bytes independently. Earlier approval and failed-gate
evidence remain historical and cannot approve this successor plan.

New changes in projects selecting this naming convention use a readable slug and
one lowercase ULID. The agent generates it before upstream proposal scaffolding;
the operator supplies only the slug. A read-only package helper emits the name,
directory and `change/<full-name>` branch, or resolves existing active changes.
Ambiguous short names require selection. Existing identities stay unchanged.
The full name is the only identity; no second registry or issue-time ULID exists.
Project instructions activate this pre-scaffold step, not an installed adapter
fork or a claim that OpenSpec config is a pre-creation hook. Branch creation
remains separately authorized. Unique names do not resolve semantic spec overlap.

Add a self-contained Node 22+/Git read-only helper to the new integration package.
Review a committed candidate, not a mutable index. A plan digest covers config,
proposal, design, tasks (checkbox-only changes excluded outside fences), metadata and
all change delta specs, with regular-file modes. A changed task or gate invalidates
approval; changed candidate SHA invalidates review.

Receipt checks bind change name, issue, candidate/review, merged revision and verified
target, require successful exact-revision gates and evidence references, and refuse
unverified intervening product changes. Merge ancestry initially requires candidate
reachability; squash/rebase content mapping is not implemented. No helper authenticates
a reviewer, verifies GitHub state, runs tests, obtains a lock or grants writes.

## Git child environment and scanner findings

### Context and evidence limits

The retained recovery scan reports four findings in `openspec-delivery` and a
blocked community verdict. The supplied Secure Git environment feasibility probe
report is PARTIAL: it reports six passing Node tests, exhaustive UTF-16 code-unit
and selected multicharacter path comparisons, and a safe two-file prototype scan
with unchanged `skills-guard-v10` scanner SHA-256
`2b39ae73585709c51af62cbf8c3f23c5330ca1e297ac01453e9328996e281562`.
It also reports that rescanning the existing complete packages reproduced all
four findings. These are attributed scratch results, not production regression,
full-package success, native Windows/macOS validation or independent review.

The environment presence checks do not demonstrate exfiltration. Broad child
environment inheritance is the hardening opportunity. The inspected prose and
hex-escape findings are heuristic false positives, not demonstrated vulnerabilities;
clarification must retain the original safeguards rather than disguise behavior.

### Decisions

Use one pure, package-local environment constructor for every Git subprocess in
the evidence and workspace helpers. Inspect inherited names first and reject the
existing forbidden set even when a value is empty: `GIT_DIR`, `GIT_WORK_TREE`,
`GIT_COMMON_DIR`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`,
`GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_NAMESPACE`, `GIT_GRAFT_FILE`,
`GIT_SHALLOW_FILE`, `GIT_REPLACE_REF_BASE`, `GIT_CONFIG_COUNT` and
`GIT_CONFIG_PARAMETERS`. Do not read forbidden values to decide presence. Do not
spread the inherited environment or enumerate its arbitrary values.

Read and forward only present values from this execution allowlist:

- Runtime locations: `PATH`, `HOME`, `XDG_CONFIG_HOME`, `TMPDIR`, `TMP`, `TEMP`.
- Windows runtime locations: `SystemRoot`, `WINDIR`, `ComSpec`, `PATHEXT`,
  `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, only on Windows.
- Trusted Git configuration selectors: `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`,
  `GIT_CONFIG_NOSYSTEM`, on all supported platforms.

Absent configuration selectors stay absent, preserving normal Git configuration
discovery. Present selectors retain their values, including deliberate empty
values; Git interprets them. This explicitly differs from the prototype, which
drops these selectors. Test selector behavior and isolation using synthetic config
files, not host credentials. On Windows, compare environment names without case
and reject duplicate aliases for an allowlisted name; use case-sensitive matching
on Linux/macOS. Never read or forward unrelated credential or execution-injection
values. Set `GIT_NO_REPLACE_OBJECTS=1`, `GIT_OPTIONAL_LOCKS=0` and `LC_ALL=C`
independently of inherited values. Preserve the existing Git argument controls,
including fsmonitor neutralization and disabled optional locks, and all topology,
replacement-ref/graft, ancestry, identity and dirty-work checks.

Reject broad inheritance because it exposes unnecessary child capabilities.
Reject silent selector removal because it can re-enable host configuration in
fixtures that explicitly disabled it. Blanket disabling of global/system config
would be a different compatibility contract; it is not selected here. PATH,
home/config locations, selected configuration files and repository configuration
remain trusted inputs. This does not sandbox Git, make arbitrary config safe or
claim that all subprocess execution is impossible.

Replace only the workspace control-character regex with the explicit numeric
predicate for character codes below 32 or equal to 127. Prove equivalence over
every UTF-16 code unit and representative multicharacter paths, including Unicode.
Keep absolute/normalized/canonical-path, symlink and overlap checks unchanged.
Clarify the flagged issue-authorization wording while retaining explicit project
adoption and bounded issue-write authority. No scanner patch, exclusion, suppression,
encoded workaround or bypass flag is an acceptable remediation.

### Risks, verification and rollout

- Configuration compatibility risk: retain the documented selectors and exercise
  both helpers with isolated global/system config, unset/empty selectors and
  existing Git fixtures; a passing environment unit test alone is insufficient.
- Platform risk: retain native Linux, macOS and Windows command/results evidence;
  case simulation is supplementary, and unavailable native coverage blocks
  hardening completion instead of becoming a support claim.
- Regression risk: test synthetic getters for unread unrelated values, actual
  child inheritance, every refused override and all existing integrity safeguards.
- Distribution risk: synchronize affected contracts/docs, complete support-file
  inventories and skill/plugin versions; validate generated packages and scratch
  native packaging after the final edit without modifying installed profiles.
- Scanner risk: retain the historical failure, require unchanged-scanner negative
  controls and safe community verdicts for all five complete packages, then obtain
  independent review of the actual candidate. Prototype success is not acceptance.

Complete the hardening group before resuming recovery task 2.2. Retain prior
approval and gate records unchanged. The changed scope, tasks and acceptance gates
require a new immutable plan revision/digest and operator approval before execution;
the earlier recovery approval does not cover this revision. Lossless closeout
evidence remains sequenced behind an accepted integrated group-10 result; its
planning workspace is untouched. Later source changes remain local until independently
reviewed and separately authorized for protected integration. Failed verification
leaves the change open; no automatic deployment, profile update or rollback is implied.

## Distribution

Publish two bundles: OpenSpec delivery, next-step execution, commits and wireframes
in `openspec-development`, and the separate opt-in orchestration package. Every
canonical package belongs to exactly one bundle. Duplicates within an entry,
unselected canonical packages and implicit orchestration remain invalid.

## Automatic local plumbing

`openspec-next` resolves actual change/task/approval/dependency state and advances
one approved group, with an inspect-only mode. `openspec-delivery` owns preparation,
local execution and terminal finish. A project explicitly adopts the invocation
contract; installation alone never enables it. An execution invocation grants
workspace creation/bootstrap and autonomous local commits with batch previews,
not remote writes. Finish separately grants named protected publication and
verified receipt/archive/acceptance-bound issue closure/clean-tree retirement.
Restrictions persist on next; plan approval and reviewer host controls remain.

A read-only workspace helper emits creation/reuse/removal previews and checks
canonical paths, branch registration, exact base/head, cleanliness and ancestry.
The authorized orchestrator executes exact argv and verifies resulting state.
Bootstrap comes from project exports/CI and is not an acceptance gate. Worktrees
share Git refs/config and may share services/agent identity; isolate those inputs
separately. Independent-clone evidence checks do not depend on this linked-worktree
helper. Integrated verification uses a named detached checkout; record-only closure
uses a separate `closure/<full-name>` branch from the verified target, preserving
implementation review identity. Cleanup never deletes branches or discards work.

## Recovery and boundaries

Native tasks track implementation progress, not merge completion. Only actual target
verification permits a Git-tracked receipt/archive PR. An unknown write outcome needs
exact readback; already merged implementation is never replayed. The recovery
implements and verifies the newly approved hardening before resuming task 2.2,
then synchronizes the delta for both previously shipped behavior and newly
implemented requirements into a current capability spec. It reviews and publishes
that correction as a normal protected implementation candidate. Current scanner,
native-client and sandbox results are new evidence, not claims about the original
delivery. Terminal integration, verified receipt/archive and cleanup remain finish
obligations rather than candidate checkboxes, so the receipt guard is not made
circular. Target-project migration remains outside scope.

### Strict-CI sequencing

Tasks 2.3 and 2.4 must complete their candidate-local scope before final candidate
freeze and independent exact-SHA review. Task 2.3's retained pilot/ruleset evidence
remains partial until assessed against that scope; this repair completes neither
task. Commit evidence-supported task progress before final freeze/review, not after
the future PR's CI results. Required CI is a protected-integration acceptance
prerequisite rather than a candidate checkbox.

The correction must descend from integrated target
`ec622395f4b0b26a5803181bae83ff02ab3e4f2e`. R2's retained passing gates verify
that exact target only and must not be rerun for this repair. PR #13's successful
non-required `verify` result remains historical, not strict required-CI acceptance.
Before a separately authorized correction merge, read back the applicable live
rules and require strict, successful required `verify` from GitHub Actions
integration `15368` on the up-to-date PR head equal to the independently reviewed
candidate. Missing, pending, failed or wrong-head required checks block merge;
a changed candidate requires renewed applicable gates and independent review.
No rule weakening or bypass is permitted.

Actual correction-target verification follows protected integration; R2 cannot
verify that later revision. Receipt/archive and acceptance-bound issue closure
remain subsequent, distinct outcomes. These planning-byte changes require a
separately authorized plan freeze and explicit approval of the new SHA/digest
before recovery resumes; confirmation of edits is neither approval nor execution.
