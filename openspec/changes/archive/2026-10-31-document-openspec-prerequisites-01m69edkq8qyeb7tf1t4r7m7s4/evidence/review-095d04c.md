# Independent review: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4

Verdict: pass

No findings.

This review approves the frozen local candidate 095d04c6999f324c336ef9b68f50c1b94813aa92 only. It does not authorize integration, publication, deployment, host acceptance, real installation, or issue closure. Task 1.8 was already checked before this review, as the orchestrator's record of the historical 15f89b3 pass. This review did not tick it and did not modify the candidate. The pre-checked box is not evidence that this review happened.

## Identity

- Repository: /home/raphael/src/ai-coding-agent-skills--document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
- Change: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
- Issue: https://github.com/forgegod/ai-coding-agent-skills/issues/5 (no GitHub write)
- HEAD before reading: 095d04c6999f324c336ef9b68f50c1b94813aa92
- Parent: 15f89b39967f74e08fdeb98fa32fdb296bdfe001 (passing documentation candidate, not the plan)
- Base: fc184fb1a5068b129c33017b8e8619c5334cf18a (ancestor)
- Plan: 70de9d4154eec93a32967f240ec9d94cb05115cb (ancestor)
- planDigest: 8a53bd6aaea8f3c8a37f4b0bce00b7a74d23dbed37c460766368d8b9a4b7fc80
- Tree at review start: clean (`git status --porcelain=v1 --untracked-files=all` empty)
- `git diff --check` base..HEAD: exit 0
- Reviewer: Grok 4.7 via xAI Grok OAuth; Hermes session local-a524d5ecac689ce68abafb301b57abfad1c998df62d56de27f9cfef30b19862f; profile hermes-dev-exec. Implementer was Astra. This session did not implement the candidate.

## Record-only successor

Not a finding. 095d04c is a record-only successor to 15f89b39967f74e08fdeb98fa32fdb296bdfe001. `git diff --name-status 15f89b3..HEAD` lists exactly five paths:

- openspec/changes/document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4/tasks.md
- evidence/review-15f89b3.md
- evidence/review-15f89b3.json
- evidence/review-a47e705.md
- evidence/review-a47e705.json

The tasks.md diff is only `- [ ] 1.8` to `- [x] 1.8`. All eight task checkboxes are checked. `git diff --name-only 15f89b3..HEAD` on AGENTS.md, README.md, and docs/ is empty. Current documentation SHA-256 matches both retained 01.log/02.log and the historical 15f89b3 review:

- AGENTS.md fe015001d5b2476afa68a60e692a4b772aa3a242cecca58fb242910bae33be45
- README.md d21e1f13f8d1803d541f7d6192ddf903c92520252f63c279fc1535469a27c1f1
- docs/openspec-installation.md def1588fba02e58af8c21c7d75b037819b5bc5ddf348cc389607c56f8427bb01
- docs/claude-installation.md d0866d7c5bf28d8ebacf22dcfea37b9b460b24ce119116c35896865360eb2748
- docs/openspec-workflow.md 0123e99b7de23fe530333b78a626546a18530f89ad0577b0182177c049352e22

No skill source, test, dependency, manifest, installer, or CI/deployment path is in base..HEAD. Distribution remains five companion packages and two plugins.

## Historical reviews were copied, not rewritten

Not a finding. Evidence files are byte-identical to the original scratch reports and still bind their own reviewed SHAs. They still say task 1.8 was pending at those commits. They were not edited to look current.

- Passing review MD c77485148298573af4e61ee9ce8c0462918c70a482408a342a632d55e48d0283 binds 15f89b39967f74e08fdeb98fa32fdb296bdfe001, verdict pass, task18 pending, findings empty.
- Passing review JSON 96f64ea9045a1c93f9bcc35c9d27997e79ffab6594d224be8e6bc808a33f408e matches that scratch original.
- Failed review MD 4174f5870558b880811f66828b301d551fe3cc2413ec4f907169b42660ce911a and JSON 3e64fdd88bceb5d32e78328be05c0ddd690011c8ebfabb3fba5848936af305d4 bind a47e705bdc0cdba036f9319db4fed8645a4344ca, verdict fail, task18 pending. The sole warning is preserved.

The 1.8 checkbox is a factual record of that earlier pass, not a rewrite of those reports and not this review.

## Prior finding still resolved

Not a finding. The a47e705 contradiction is absent on this SHA because docs/openspec-workflow.md is byte-identical to the passing correction.

- docs/openspec-workflow.md:214-229 assumes all seven setup skills, not a six-skill core profile. "Core profile, which this document assumes" is absent. The table is a host map: `/openspec-<action>` for direct-directory Claude Code and Hermes, `$openspec-<action>` for Codex, and `/opsx:*` only in the column "Generated adapter only, if installed".
- Advisory verification remains at docs/openspec-workflow.md:231-233 and docs/openspec-installation.md:36-37.
- Field notes do not restore unqualified `/opsx` commands. A whole-file search finds `/opsx` only at lines 15, 209, 211, and 223-229. docs/openspec-workflow.md:362-367 uses `/openspec-explore` and `/openspec-propose pin-note` and restates Codex `/skills` or `$`. Lines 460, 541, and 552 use `/openspec-apply-change`, `/openspec-sync-specs`, and `/openspec-archive-change`.
- The conditional intro at docs/openspec-workflow.md:14-15 and the install-guide illustration at docs/openspec-installation.md:116-118 were already dispositioned. Those bytes did not change. Not re-filed.

## Same-change maintenance

Not a finding. The obligation is present and aligned, and this record commit did not alter it:

- AGENTS.md:42
- docs/openspec-installation.md:420-438
- docs/openspec-workflow.md:729-743

Author ownership covers future skill, prerequisite, dependency, runtime, and route changes, including affected inventories, required/optional distinctions, commands, version/source pins, host prerequisites, install/enable/update/removal guidance, verification, counts, and cross-links, in the same change before completion. The reviewer compares that delta with the resulting prerequisites and actual gate/probe evidence. Stale or contradictory affected instructions block completion before integration/publication. The text does not claim automated enforcement, archived-plan rewrites, uninstall authority, installed-profile modification, scanner bypass, or account-installation authority.

docs/openspec-installation.md:434-435 ("change existing tests only when separately in scope") remains the narrower wording already dispositioned. Those bytes are unchanged. AGENTS.md:42 still requires affected verification to be rerun. This change did not edit tests.

## Gate evidence read, not re-executed

Retained file: /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/openspec-prerequisites-gates-095d04c/gates.json

Parent harness read, not re-run: /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/run-openspec-prerequisites-final-gates.py. It asserts HEAD 095d04c, the exact five record-only paths since 15f89b3, the sole 1.8 checkbox mutation, all eight tasks checked, byte-identical historical review copies, the workflow hash above, and the seven invocation mappings. All nine retained log SHA-256 values match gates.json. head, planDigest, and cleanAfterGates match. I did not re-run the harness, installers, or live-host probes.

01.log and 02.log hashes match the 15f89b3 retained logs. That is expected: those commands hash unchanged documentation and do not embed the commit. They are not relabelled. 08.log and 09.log name 095d04c. 03.log and 04.log hashes differ from the 15f89b3 run.

All nine commands record exitCode 0 at 095d04c6999f324c336ef9b68f50c1b94813aa92. cleanAfterGates is true.

- 01 parent byte/package verification: verified true; seven-name scratch inventories byte-match; 7 SAFE/ALLOWED with 7 LOW notices; 5 companions; 2 plugins; desktopAcceptance and nativeClientModelLoading "not verified"
- 02 content/link audit: PASS, 49 local links, seven-name inventory; note says ad-hoc assertions, not permanent automated enforcement
- 03 focused tests: 13 pass, 0 fail
- 04 npm test: 242 pass, 0 fail
- 05 build: 5 skills and 2 Claude plugins
- 06 metadata validation: ok true
- 07 isolated OpenSpec strict validation: valid, skip_specs accepted. The harness asserts that probe binary is 1.15.0 before the command. I did not re-probe the version.
- 08 git diff --check base..095d04c: exit 0; I also ran that check, exit 0
- 09 change-guard candidate: ok true, planDigest matches, tasksComplete true, tree d895da335bff4b1fd4ed5dc1062572a3e2d18c55

Passing tests, the 49-link audit, metadata validation, and plan approval are not this verdict. The record-only and coherence reads above are.

## Files inspected

- proposal.md, design.md, tasks.md
- AGENTS.md:42 maintenance rule
- docs/openspec-installation.md inventory and maintenance sections
- docs/openspec-workflow.md host spelling, field notes, sync/archive commands, maintenance
- evidence/review-15f89b3.md, evidence/review-15f89b3.json, evidence/review-a47e705.md, evidence/review-a47e705.json
- Retained gates.json, logs 01, 02, 05, 07, 08, 09, and pass/fail lines in 03, 04, and 06
- Parent harness source, not re-executed
- No checkout writes, staging, commits, pushes, PRs, installs, profile writes, or skill-package changes

## Commands

- git rev-parse HEAD; git status --porcelain and --porcelain=v1 --untracked-files=all; git log -1; merge-base ancestor checks for base and plan; git diff --name-status base..HEAD and 15f89b3..HEAD; git diff --check base..HEAD; git diff tasks.md 15f89b3..HEAD
- sha256sum of the five documentation files, nine current gate logs, four evidence copies, and four scratch originals
- Content search for /opsx in docs/openspec-workflow.md
- No installer, account, Desktop, or live-host probe

## Factual limitations

- Probe packages and scratch homes are not actual user installations or native model loading. Parent byte verification of those scratch copies is evidence I read, not a new probe.
- Hermes scans were SAFE/ALLOWED with LOW allowed-tools notices, not finding-free. That does not block this documentation candidate and is not risk acceptance or a bypass.
- Claude account upload/sync, Desktop acceptance, and end-to-end execution are unverified. The guide still says all seven descriptions exceed the documented 200-character limit. I did not remeasure those lengths.
- Ambient OpenSpec was not changed. Strict gate 07 used the isolated probe CLI. I did not re-probe the ambient CLI.
- Workflow permalink 6d04a1b58dedc95729d34e4f223d9d483aae210a was not re-resolved against skill pin 8e0288df12d401b0e183e2f47254d22528c1dffb.
- Candidate-class notices above are limitations, not silent approval.
- parallel-change-workflow was not edited. Overlap reconciliation belongs to separately authorized finish.
- This pass does not publish, close issue 5, or accept integration, deployment, or host execution.
