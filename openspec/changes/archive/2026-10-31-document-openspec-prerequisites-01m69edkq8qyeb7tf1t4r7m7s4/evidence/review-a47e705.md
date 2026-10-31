# Independent review: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4

Verdict: fail

This review does not complete task 1.8, does not accept the change, and does not authorize integration, publication, installation, or issue closure. Task 1.8 remains unchecked. The candidate was not modified.

## Identity

- Repository: /home/raphael/src/ai-coding-agent-skills--document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
- Change: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
- Issue: https://github.com/forgegod/ai-coding-agent-skills/issues/5 (packet says OPEN; this review made no GitHub write)
- HEAD before and after reading: a47e705bdc0cdba036f9319db4fed8645a4344ca
- Parent: 0691642917a21965cfbaef6010b4481d0873b4c0
- Base: fc184fb1a5068b129c33017b8e8619c5334cf18a (ancestor)
- Plan: 70de9d4154eec93a32967f240ec9d94cb05115cb (ancestor)
- planDigest: 8a53bd6aaea8f3c8a37f4b0bce00b7a74d23dbed37c460766368d8b9a4b7fc80
- Tree at review start: clean (`git status --porcelain=v1 --untracked-files=all` empty)
- `git diff --check` base..HEAD: exit 0
- Tip-to-plan openspec diff: proposal.md, design.md, and .openspec.yaml unchanged. tasks.md differs only by checking 1.1-1.7. Task 1.8 stays `[ ]`. evidence/plan-approval.json is the approval snapshot (implementationStatus not started, reviewStatus not performed) and is not a plan rewrite.
- Reviewer: Grok 4.7 via xAI Grok OAuth; Hermes session local-9767ba0b55a0cc3d5af8aa5f73eafafa94eb7a84130315ddc63561e417936acd; profile hermes-dev-exec. Implementer was Astra. This session did not implement the candidate.

## Finding

Severity: warning

Path: docs/openspec-workflow.md:206-223, with the same unqualified spelling repeated at docs/openspec-workflow.md:352-357, docs/openspec-workflow.md:449, docs/openspec-workflow.md:530, and docs/openspec-workflow.md:541

Impact: The new prerequisite contract and the SDLC guide disagree on both the required inventory and the command a contributor should type. docs/openspec-installation.md:21-37 and docs/openspec-workflow.md:9-16 require seven setup skills, with verification mandatory to install and advisory in use. docs/openspec-workflow.md:211-223 then says "Core profile, which this document assumes" and lists only the six non-verify actions, calling `/openspec-verify-change` an expanded-profile check. A reader can treat verification as optional setup.

The same section says the pinned OpenSpec docs' `/opsx:propose` spelling is the canonical command. The new Claude Code route is a user-global directory copy, and docs/openspec-installation.md:116-118 says that route installs `/openspec-propose`, not `/opsx:propose`. `/opsx:*` applies only when `.claude/commands/opsx/` files were actually generated. The new guide also says not to run `openspec init` in this repository to acquire those adapters. The SDLC field notes still present `/opsx:explore` and `/opsx:propose` as the commands to type, and docs/openspec-workflow.md:356-357 tells Hermes users that the form is `/openspec-explore` (`/opsx:explore`). The intro caveat at docs/openspec-workflow.md:14-15 covers only verification. Nearby accurate sentences do not fix the unqualified canonical-command paragraph, the assumed core-profile table, or the later examples.

This is the coherence condition the new same-change rule exists to catch. The rule text itself is present and does not invent automation, archived-history rewrites, uninstall authority, or profile-write authority. This change does not satisfy that rule for the SDLC inventory and invocation surfaces it touched.

Trigger: Follow docs/openspec-installation.md Claude Code and Hermes routes, then read docs/openspec-workflow.md from the host-spelling section through the field-note commands. Reproduction is a read of those lines; no installer probe is required.

Minimal correction: In docs/openspec-workflow.md:206-223, state that this SDLC assumes the seven-skill setup inventory from docs/openspec-installation.md, not the upstream six-skill core profile alone. Keep verification advisory in use. State that `/opsx:*` is only the generated command-adapter spelling, and that the documented directory-copy, Hermes, and Codex routes invoke `/openspec-<action>` (Codex: `/skills` or `$openspec-<action>`). Apply that caveat to the field-note commands at lines 352-357, 449, 530, and 541 instead of leaving `/opsx:*` as the unqualified command, including the Hermes parenthetical. Do not rewrite archived plans. Re-review the resulting SHA; do not treat this review as already recorded.

## Dispositions

Maintenance rule text: not a finding. AGENTS.md:42, docs/openspec-installation.md:420-438, and docs/openspec-workflow.md:718-732 agree. Future skill, dependency, runtime, or route changes must update affected inventories, required/optional distinctions, commands, version/source pins, host prerequisites, install/enable/update/removal guidance, verification, counts, and cross-links in the same change before completion. The author owns the delta. The reviewer compares it with the resulting prerequisites and actual gate/probe evidence. Stale or contradictory affected instructions block completion before integration/publication. The text does not create automated enforcement, does not rewrite archived plans/evidence, and does not grant uninstall, installed-profile modification, scanner bypass, or account-installation authority.

docs/openspec-installation.md:434-435 ("change existing tests only when separately in scope"): not a finding. The owning sentence in AGENTS.md:42 still requires affected verification to be rerun and does not defer documentation to a follow-up. The guide sentence is readable as "do not add a new enforcement suite and do not edit unrelated tests," which matches design decision 5. It is narrower wording, not a license to leave tests that lock stale instructions.

Seven required skills: not a finding in the new guide. The authoritative table at docs/openspec-installation.md:26-34 lists exactly openspec-explore, openspec-propose, openspec-update-change, openspec-apply-change, openspec-sync-specs, openspec-archive-change, and openspec-verify-change. Verification is required in the inventory and advisory in use. Bulk archive, onboard, and maintainer workflows are excluded. The contradiction is the SDLC core-profile section above, not a second inventory in the new guide. The shell selection variable repeats those seven names as the operational selection, not a second catalog.

CLI 1.15.0, Node 22+, Git: not a finding. README.md, docs/claude-installation.md, docs/openspec-workflow.md:12-13, and docs/openspec-installation.md:6-7 and 44-65 align. The guide says stop on mismatch and does not silently upgrade. Skill metadata.version is distinguished from the CLI version. `context` and `store` are not treated as incompatibility evidence.

Release pin: not a finding. docs/openspec-installation.md:67-80 pins tag v1.15.0 at 8e0288df12d401b0e183e2f47254d22528c1dffb and stops if HEAD differs. skills.sh and `npx skills add Fission-AI/OpenSpec` are explicitly not that pin. I did not re-clone. The retained scratch checkout's seven selected packages each contain one SKILL.md. I remeasured description lengths from that checkout: 308, 289, 433, 220, 222, 222, 229. All exceed 200. I did not re-resolve workflow reference permalink 6d04a1b58dedc95729d34e4f223d9d483aae210a against 8e0288df; those links were pre-existing and are not cited as the v1.15.0 skill pin. That unresolved permalink is not a finding.

Hermes route: not a finding. docs/openspec-installation.md:123-207 is profile-scoped (`-p` on inspect, install, list, and config), does not hardcode the default profile, installs only a missing subset from the commit-qualified single-file URL, keeps the normal scan, stops on blocked or unresolved findings, and says `--yes` is confirmation only. Enablement removes only the seven names and preserves unrelated exclusions. Update ownership is separate from native copies, skills CLI copies, generated adapters, and uploaded snapshots. Removal is not automatic uninstall, and a running shared-profile skill must not modify its own package.

Scanner LOW notices: do not block this documentation candidate. They are not a risk acceptance and not a bypass. Scratch install logs for the pinned URLs show Verdict SAFE, Decision ALLOWED, and a LOW privilege_escalation / allowed_tools_field notice for `allowed-tools: Bash(openspec:*)` (example: hermes-install-openspec-propose.log:10-20). Parent gate 01.log records scanSafeAllowed 7 and scanLowToolAccessNotices 7. The guide does not call those scans finding-free, does not hide the notice, and does not authorize force, a different installer, or a scanner bypass. The notices are upstream skill metadata observed in scratch probes, not findings in this repository's files and not an install into a real profile. An operator policy that treats any notice as blocking would block a later real-profile install, not this documentation change. Actual profile installation remains outside this change.

Claude routes: not a finding in the new guide. Account ZIP preparation, Cowork, and Code-tab/CLI are distinct. Companion marketplace/ZIPs stay companion-only. No upstream marketplace or ready-made upstream ZIP is assumed. ZIPs are one complete skill folder each. docs/openspec-installation.md:350-367 correctly says upload compatibility is unverified, all seven descriptions exceed the documented 200-character limit, and account upload, sync, Cowork execution, and end-to-end Code execution were not established. I confirmed the length claim against the scratch v1.15.0 packages. I did not re-fetch Anthropic's article or exercise Desktop. Claude account upload/sync, Desktop acceptance, and native model loading/execution remain unverified. That limitation is labeled; it is not a documentation defect and not acceptance of those hosts.

Codex: not a finding. User-global destination is `$HOME/.agents/skills`, shared with other clients, not Codex-exclusive. Invocation is `/skills` or `$openspec-propose`. No `codex skills install` subcommand is invented. Collision refusal is in the helper.

Native helper and ZIP recipe: not a finding against the pinned tree. The helper refuses existing copies and symlink destination components before copy. At 8e0288df the selected packages are single real files, so the single-file Hermes URL recipe matches the reviewed tree. I did not re-run the helper.

No-vendoring and distribution inventory: not a finding. Base..HEAD does not change skills/, tests/, scripts/, manifests, .claude-plugin/, or .github/. The guide and README keep upstream packages out of this distribution. Gate 05.log reports "Built 5 skills and 2 Claude plugins". Parent 01.log records companionPackages 5 and plugins 2.

Loading and authority boundaries: not a finding in the new guide. Download, ZIP checks, and list output are not model loading or execution. Proposal/apply/archive are not installation smoke tests. Installing skills does not adopt the SDLC, grant Git/GitHub authority, or create orchestration roles. `openspec-delivery` boundaries remain. Ambient OpenSpec 1.16.0 was left untouched; retained strict validation used isolated 1.15.0 (gate 07.log). I did not alter the ambient install.

Parallel-change-workflow: untouched. Integration overlap remains reserved to separately authorized finish. No external write was made.

Content audit: not sufficient to clear the finding. Gate 02.log status PASS checked 48 local links and the seven-name inventory, and the five documentation SHA-256 values match the current files. Those checks did not catch the SDLC core-profile and `/opsx` contradiction. Passing tests, structural validation, lifecycle, and plan approval are not this review.

## Gate evidence read, not re-executed

Retained file: /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/openspec-prerequisites-gates-a47e705/gates.json

All nine commands record exitCode 0 at a47e705bdc0cdba036f9319db4fed8645a4344ca. cleanAfterGates is true. I read 01.log, 02.log, 03.log, 04.log, 05.log, 06.log, 07.log, and 09.log. I did not re-run them and did not re-run installer probes.

- 01 parent byte/package verification: verified true; seven-name scratch inventories byte-match; 7 SAFE/ALLOWED with 7 LOW notices; 5 companions; 2 plugins; desktopAcceptance and nativeClientModelLoading "not verified"
- 02 content/link audit: PASS, 48 local links
- 03 focused tests: 13 pass, 0 fail
- 04 npm test: 242 pass, 0 fail
- 05 build: 5 skills and 2 Claude plugins
- 06 metadata validation: ok true
- 07 isolated OpenSpec 1.15.0 strict validation: valid, skip_specs accepted
- 08 git diff --check: exit 0 in gates.json; I also ran `git diff --check` base HEAD, exit 0
- 09 change-guard candidate: ok true, planDigest matches, tasksComplete false

Documentation SHA-256 at review time matches gates.json and 01.log/02.log:

- AGENTS.md fe015001d5b2476afa68a60e692a4b772aa3a242cecca58fb242910bae33be45
- README.md d21e1f13f8d1803d541f7d6192ddf903c92520252f63c279fc1535469a27c1f1
- docs/openspec-installation.md def1588fba02e58af8c21c7d75b037819b5bc5ddf348cc389607c56f8427bb01
- docs/claude-installation.md d0866d7c5bf28d8ebacf22dcfea37b9b460b24ce119116c35896865360eb2748
- docs/openspec-workflow.md a0fc3c77b69ed56aa8fabfd862c6871090fc4faf9a5b3241fbed0f45e86a0281

## Files inspected

- AGENTS.md (maintenance rule at line 42)
- README.md diff
- docs/claude-installation.md diff
- docs/openspec-installation.md (full)
- docs/openspec-workflow.md (intro, host-spelling, field-note commands, verification/maintenance, references)
- openspec change proposal.md, design.md, tasks.md, .openspec.yaml presence via diff, evidence/plan-approval.json
- skills/autonomous-ai-agents/autonomous-implementation-review/references/herdr.md and claude-code-roles.md exist (link targets only)
- Retained gates.json and logs 01-07 and 09
- Implementer report and scratch probe SKILL.md descriptions plus one Hermes scan log

## Commands

- git rev-parse HEAD; git status --porcelain=v1 --untracked-files=all; merge-base ancestor checks for base and plan; git diff --name-status and git diff --check base..HEAD; git log -1
- git diff base..HEAD for AGENTS.md, README.md, docs/claude-installation.md, docs/openspec-workflow.md
- git diff plan..HEAD -- openspec (proposal/design unchanged; tasks.md checkbox-only; plan-approval.json added)
- sha256sum of the five documentation files
- python3 length count of the seven scratch v1.15.0 description fields
- No checkout writes, staging, commits, pushes, PRs, installs, profile writes, or skill-package changes

## Factual limitations

- Probe packages and scratch Hermes/Claude/Codex homes are not actual user installations. Parent byte verification of those scratch copies and ZIPs against 8e0288df is evidence I read, not a new probe.
- Hermes scans were SAFE/ALLOWED with LOW allowed-tools notices, not finding-free. That does not block this documentation candidate and is not risk acceptance.
- Claude account upload/sync, Desktop acceptance, and native model loading/execution are unverified. All seven descriptions exceed 200 characters.
- Ambient openspec is 1.16.0. Strict gate 07 used isolated 1.15.0. Ambient installation was not changed.
- Normal Hermes launcher isolation in an empty HOME is not claimed by the probes; the guide says to report that separately and not repair a real install.
- Workflow permalink 6d04a1b was not re-resolved against the v1.15.0 skill commit.
- Passing gates are not this verdict.
