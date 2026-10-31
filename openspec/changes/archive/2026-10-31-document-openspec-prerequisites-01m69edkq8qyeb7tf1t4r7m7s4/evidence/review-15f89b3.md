# Independent review: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4

Verdict: pass

No findings.

This review does not complete task 1.8, does not accept the change, and does not authorize integration, publication, installation, or issue closure. Task 1.8 remains unchecked. The candidate was not modified.

## Identity

- Repository: /home/raphael/src/ai-coding-agent-skills--document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
- Change: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
- Issue: https://github.com/forgegod/ai-coding-agent-skills/issues/5 (no GitHub write)
- HEAD before reading: 15f89b39967f74e08fdeb98fa32fdb296bdfe001
- Parent: a47e705bdc0cdba036f9319db4fed8645a4344ca (rejected review candidate, not the plan)
- Base: fc184fb1a5068b129c33017b8e8619c5334cf18a (ancestor)
- Plan: 70de9d4154eec93a32967f240ec9d94cb05115cb (ancestor)
- planDigest: 8a53bd6aaea8f3c8a37f4b0bce00b7a74d23dbed37c460766368d8b9a4b7fc80
- Tree at review start: clean (`git status --porcelain=v1 --untracked-files=all` empty)
- `git diff --check` base..HEAD: exit 0
- Correction scope versus parent: only docs/openspec-workflow.md. Full base..HEAD still reviewed.
- Reviewer: Grok 4.7 via xAI Grok OAuth; Hermes session local-4e5f50c2011d8e25c80e932f856ace5a059b03ed16eaf8c963639c7edc3c2a58; profile hermes-dev-exec. Implementer was Astra. This session did not implement the candidate.

## Prior finding

Resolved. The sole warning on a47e705bdc0cdba036f9319db4fed8645a4344ca is not present on this SHA.

The rejected SDLC section assumed a six-skill core profile and presented `/opsx:*` as the command to type, including field notes. The corrected guide now states the seven-skill setup inventory, advisory verification, exact direct-directory Claude Code/Hermes and Codex invocations, and conditional generated adapters. Sibling field notes no longer use unqualified `/opsx` commands.

- Seven setup skills: docs/openspec-workflow.md:214-229 assumes all seven skills from docs/openspec-installation.md:26-34, not the upstream six-skill core profile. The phrase "Core profile, which this document assumes" is gone. The table lists openspec-explore, openspec-propose, openspec-update-change, openspec-apply-change, openspec-sync-specs, openspec-archive-change, and openspec-verify-change. It is a host map, not a second inventory.
- Advisory verification: docs/openspec-workflow.md:13-16 and 231-233, with docs/openspec-installation.md:36-37. Required at setup, advisory in use, not an `openspec verify` CLI gate, and not an independent archive block.
- Exact invocations: docs/openspec-workflow.md:206-208. Direct-directory Claude Code and Hermes use `/openspec-<action>` with the exact skill name. Codex uses `/skills` or `$openspec-<action>` with that same name. docs/openspec-workflow.md:217-219 says examples use the Claude Code/Hermes spelling and Codex users select `/skills` or replace the leading `/` with `$`.
- Conditional adapters only: docs/openspec-workflow.md:209-212 and the column header at line 221, "Generated adapter only, if installed". Adapter spellings are the short generated names (`/opsx:update`, not a shortened skill id). A directory copy does not install them. `openspec init` is still forbidden in this repository just to acquire them. No `/opsx:` remains after `### Specify pin-note`.
- Sibling field notes: docs/openspec-workflow.md:362-367 uses `/openspec-explore` and `/openspec-propose pin-note` and restates the Codex forms. docs/openspec-workflow.md:460, 541, and 552 use `/openspec-apply-change`, `/openspec-sync-specs`, and `/openspec-archive-change` with the old `/opsx` parentheticals removed. Those later lines follow the document-wide example rule; they are not unqualified adapter commands.

The intro at docs/openspec-workflow.md:14-15 still exemplifies verification as `/openspec-verify-change` for a direct Claude skill, or `/opsx:verify` only with that adapter installed. That is narrower than the table, but it does not restore a six-skill inventory or an unqualified adapter command. Hermes uses the same slash form. Codex translation is stated at lines 217-219 and 366-367. Not a finding.

docs/openspec-installation.md:116-118 still illustrates `/openspec-propose` versus conditional `/opsx:propose` and `/opsx:verify`. It does not contradict the full conditional adapter column. Not a finding.

## Same-change maintenance

Not a finding. The obligation is present and aligned:

- AGENTS.md:42
- docs/openspec-installation.md:420-438
- docs/openspec-workflow.md:729-743, linking the installation contract

Author ownership covers future skill, dependency, runtime, and route changes, including affected inventories, required/optional distinctions, commands, version/source pins, host prerequisites, install/enable/update/removal guidance, verification, counts, and cross-links in the README and installation/SDLC guides, in the same change before completion. The reviewer compares that delta with the resulting prerequisites and actual gate/probe evidence. Stale or contradictory affected instructions block completion before integration/publication. The text does not claim automated enforcement, rewrite archived plans/evidence, or grant uninstall, installed-profile modification, scanner bypass, or account-installation authority.

docs/openspec-installation.md:434-435 ("change existing tests only when separately in scope") remains the narrower wording already dispositioned on the rejected candidate. Those bytes are unchanged. AGENTS.md:42 still requires affected verification to be rerun. This change did not edit tests. Not a finding.

## Coherence of the full candidate

Not a finding. Correction-unchanged files match the rejected-candidate hashes and still agree with the corrected SDLC:

- Inventory: docs/openspec-installation.md:26-34 and the seven-name selection at line 77. README.md and docs/claude-installation.md point at that inventory and say seven skills, including advisory verification. They do not keep a six-skill table.
- CLI 1.15.0, Node 22+, Git: README.md, docs/claude-installation.md, docs/openspec-workflow.md:12-13, docs/openspec-installation.md:6-7 and 44-65. Stop on mismatch. Skill metadata.version is distinct. `context` and `store` are not treated as incompatibility.
- Hermes: docs/openspec-installation.md:123-207 is profile-scoped, does not hardcode the default profile, installs a missing subset from the commit-qualified URL, keeps the normal scan, stops on blocked or unresolved findings, and treats `--yes` as confirmation only.
- Claude: account ZIP, Cowork, and Code-tab/CLI stay distinct. Companion marketplace/ZIPs stay companion-only. Upload compatibility remains labeled unverified. Descriptions are still stated to exceed the documented 200-character limit.
- Codex: `$HOME/.agents/skills`, shared with other clients. Invocation is `/skills` or `$openspec-propose`. No `codex skills install` subcommand.
- No vendoring. Base..HEAD does not change skills/, tests/, scripts/, manifests, .claude-plugin/, or .github/. Distribution remains five companions and two plugins.
- Loading is not execution. Proposal/apply/archive are not installation smoke tests. Installing skills does not adopt the SDLC or grant Git/GitHub authority.
- tasks.md 1.8 stays `[ ]`. change-guard reports tasksComplete false. Tip-to-plan planning content was not rewritten by the correction commit.

Scanner LOW notices do not block this documentation candidate. Gate 01.log records scanSafeAllowed 7 and scanLowToolAccessNotices 7. The guide does not call those scans finding-free and does not authorize force or a bypass. They are not a candidate defect and not risk acceptance.

Passing tests, the 49-link audit, metadata validation, and plan approval are not this verdict. The coherence read above is.

## Gate evidence read, not re-executed

Retained file: /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/openspec-prerequisites-gates-15f89b3/gates.json

Parent harness read, not re-run: /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/run-openspec-prerequisites-correction-1-gates.py. It asserts the seven exact slash and dollar names, short adapter suffixes explore/propose/update/apply/sync/archive/verify, no `/opsx:` after the pin-note field notes, authority-section preservation against a47e705, and preserved historical a47e705 gate hashes. I verified current log SHA-256 values match gates.json. I did not re-run installers or live-host probes.

All nine commands record exitCode 0 at 15f89b39967f74e08fdeb98fa32fdb296bdfe001. cleanAfterGates is true.

- 01 parent byte/package verification: verified true; seven-name scratch inventories byte-match; 7 SAFE/ALLOWED with 7 LOW notices; 5 companions; 2 plugins; desktopAcceptance and nativeClientModelLoading "not verified"
- 02 content/link audit: PASS, 49 local links, seven-name inventory; note says ad-hoc assertions, not permanent automated enforcement
- 03 focused tests: 13 pass, 0 fail
- 04 npm test: 242 pass, 0 fail
- 05 build: 5 skills and 2 Claude plugins
- 06 metadata validation: ok true
- 07 isolated OpenSpec 1.15.0 strict validation: valid, skip_specs accepted
- 08 git diff --check base..HEAD: exit 0; I also ran that check, exit 0
- 09 change-guard candidate: ok true, planDigest matches, tasksComplete false

Documentation SHA-256 at review time matches gates.json and 01.log/02.log:

- AGENTS.md fe015001d5b2476afa68a60e692a4b772aa3a242cecca58fb242910bae33be45
- README.md d21e1f13f8d1803d541f7d6192ddf903c92520252f63c279fc1535469a27c1f1
- docs/openspec-installation.md def1588fba02e58af8c21c7d75b037819b5bc5ddf348cc389607c56f8427bb01
- docs/claude-installation.md d0866d7c5bf28d8ebacf22dcfea37b9b460b24ce119116c35896865360eb2748
- docs/openspec-workflow.md 0123e99b7de23fe530333b78a626546a18530f89ad0577b0182177c049352e22

The first four match the rejected-candidate review. The workflow hash matches the correction report's final document hash.

## Files inspected

- AGENTS.md maintenance rule
- README.md and docs/claude-installation.md base..HEAD diffs
- docs/openspec-installation.md inventory, init/adapters, Hermes, Claude Code, Codex, Desktop/Cowork, updates, maintenance
- docs/openspec-workflow.md intro, host spelling, field notes, sync/archive, maintenance
- proposal.md, design.md, tasks.md
- Preserved failed review and correction report
- Retained gates.json, logs 01-09, and the parent harness assertions
- No checkout writes, staging, commits, pushes, PRs, installs, profile writes, or skill-package changes

## Commands

- git rev-parse HEAD; git status --porcelain=v1 --untracked-files=all; merge-base ancestor checks for base and plan; git log -1; git diff --name-status and git diff --check base..HEAD; git diff --name-status parent..HEAD
- sha256sum of the five documentation files; SHA-256 compare of retained gate logs to gates.json
- Content search for /opsx, core profile, and maintenance wording in the five changed documents
- No installer, account, Desktop, or live-host probe

## Factual limitations

- Probe packages and scratch homes are not actual user installations. Parent byte verification of those scratch copies against 8e0288df12d401b0e183e2f47254d22528c1dffb is evidence I read, not a new probe.
- Hermes scans were SAFE/ALLOWED with LOW allowed-tools notices, not finding-free. That does not block this documentation candidate and is not risk acceptance or a bypass.
- Claude account upload/sync, Desktop acceptance, and native model loading/execution are unverified. The guide still says all seven descriptions exceed 200 characters. I did not remeasure those lengths.
- Ambient OpenSpec was not changed. Strict gate 07 used isolated 1.15.0. I did not re-probe the ambient CLI.
- Workflow permalink 6d04a1b58dedc95729d34e4f223d9d483aae210a was not re-resolved against skill pin 8e0288df12d401b0e183e2f47254d22528c1dffb.
- Task 1.8 remains pending. This review is not change or integration completion.
- Passing gates are not this verdict.
