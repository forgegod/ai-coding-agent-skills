# Independent review: update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr

No findings.

This review does not accept the change, tick tasks, or authorize integration, publication, merge, archive, profile updates, or issue closure.

## Identity

- Change: update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr
- Issue: https://github.com/forgegod/ai-coding-agent-skills/issues/9
- Repository: /home/raphael/src/ai-coding-agent-skills--update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr
- Base: 4cd6ff73e9a8bf5bc9e1a102a8554b4ccdf96a7a (ancestor)
- Approved plan commit: c36a219e4bd74e4fbd73d53597228adfae476fe2 (ancestor; also HEAD parent)
- Head: 3947991840394e66f6181fff31d44b882d3fbbef
- Approved plan digest: 0c93a4154b5543c59cd72daaccba3db370ed2e99f9f87eb0209232b2a91ac1d6
- Tree at review: clean. Parent is the approved plan commit, which is the expected shape, not a stop.
- Reviewer: Grok 4.7 (xai-oauth); Hermes session local-96a3618398d3a40bfa012c85e4e6414790916da3121c570d63088baa8576d9cb; profile hermes-dev-exec

The tip commit only adds openspec/changes/update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr/evidence/plan-reapproval.md. The review scope is the full base..head diff, not only that file. change-guard candidate at this head returned ok true, the stated plan digest, and tasksComplete true. That checkbox state is not this review. There is no independent-review task checkbox, and this review did not edit tasks.md.

## Findings

No findings.

## What was checked

Current release pins agree on OpenSpec 1.16.0 and commit 27c0515724decc633818c735ee596481eec78a8b:

- README.md:12
- docs/claude-installation.md:11
- docs/openspec-installation.md:6, 53, 60, 64, 68, 69, 76, 79, 103, 268, 310, 394
- docs/openspec-workflow.md:12
- docs/openspec-metadata.md:38, 84
- openspec/config.yaml:22
- skills/software-development/openspec-delivery/SKILL.md:106
- tests/openspec-cli-compatibility.mjs:13

git grep 1.15.0 at the candidate, excluding openspec/changes/archive, hits only this change's proposal, design, and tasks. Those sentences describe the pre-change pin or the audit task. They are not current operator install pins. Archive paths are unchanged from base (empty name-only diff).

Node floor stays scoped to the npm package. npm view @fission-ai/openspec@1.16.0 reports engines.node >=22.12.0, matching the install/workflow/README sentences. Unchanged and still Node 22 / >=22, not 22.12.0: package.json engines.node >=22, .github/workflows/ci.yml:18 and publish-skills.yml:23 node-version 22, AGENTS.md:48, docs/claude-installation.md:104 (packaged guards), skills/software-development/openspec-delivery/SKILL.md:37, references/guard.md:4, references/naming.md:24, and scripts/build-distribution.mjs:156. None of those paths are in the diff.

Probe isolation: the only base..head change in tests/openspec-cli-compatibility.mjs is pinned from 1.15.0 to 1.16.0. Scratch HOME, XDG, telemetry disablement, credential allowlist, npm exec --cache, --ignore-scripts, and the version assertion at tests/openspec-cli-compatibility.mjs:58 are unchanged. The retained probe log reports stdout 1.16.0 and the expected strict-validation, frontmatter rejection, task discovery, archive, and post-sync validation statuses. Its copied openspec tree is byte-identical to this head (83 files, 0 mismatches), including plan-reapproval.md.

Release source: git ls-remote and a scratch clone of tag v1.16.0 both resolve to 27c0515724decc633818c735ee596481eec78a8b. Each of the seven selected packages is one non-symlink SKILL.md. git diff --stat v1.15.0 v1.16.0 for those seven paths is empty, so the identical package-content claim is accurate. Description lengths at that commit are 308, 289, 433, 220, 222, 222, 229. All exceed 200, so docs/openspec-installation.md:353-354 still holds. The seven-name inventory string was not edited.

Zero-delta shape holds: skip_specs true, no specs directory under this change, and the probe's strict validate of the copied tree accepted the change with the skip_specs info. parallel-change-workflow versus the same base touches only its own change directory, so there is no shared documentation or config hunk to reconcile. That is overlap inspection, not integration.

Policy boundaries in the diff do not grant publication, merge, archive, profile writes, upstream vendoring, or a standalone installer. Generated dist/ is untracked and not in the commit. package.json, lockfile, CI, and skill package bytes other than the one delivery-skill sentence are untouched.

## Gates

Orchestrator packet states these ran at the exact candidate. This review did not re-run npm test, npm run build, npm run validate:openspec, or npm run test:openspec. No retained gates.json was found, so those packet commands have no outputSha256 checked here. npm test is recorded as 242 passed only from that packet.

Reviewed directly:

- git diff --check 4cd6ff73e9a8bf5bc9e1a102a8554b4ccdf96a7a 3947991840394e66f6181fff31d44b882d3fbbef exited 0.
- change-guard candidate with the stated base, head, plan, and plan digest exited 0. Output: /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/update-openspec-review-3947991-guard.json
- Probe log /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/openspec-compatibility-ll5DDY/probe-log.json sha256 549b082456d12d7dcaef910c4a17af36e0e133fca59036af6b89647fb9f6a151. It includes openspec --version 1.16.0 and validate --all --strict --json --no-interactive status 0 against the byte-identical openspec copy.

## Commands

- git rev-parse, status --porcelain=v1 --untracked-files=all, log -1, merge-base --is-ancestor, diff --name-status, diff --check, diff --stat, diff for the scoped paths, grep 1.15.0, show tasks at 9ae4ef7 and c36a219
- node skills/software-development/openspec-delivery/scripts/change-guard.mjs candidate with the stated base, head, plan, and expect-plan
- git ls-remote https://github.com/Fission-AI/OpenSpec.git refs/tags/v1.16.0
- npm view @fission-ai/openspec@1.16.0 version engines
- scratch clone of tag v1.16.0, ls-tree of the seven skills, description lengths, diff --stat against v1.15.0 (8e0288df12d401b0e183e2f47254d22528c1dffb)
- byte compare of the retained probe openspec copy to git show HEAD
- git -C parallel-change-workflow diff --name-only against the same base

## Files inspected

- openspec/changes/update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr/proposal.md
- openspec/changes/update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr/design.md
- openspec/changes/update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr/tasks.md
- openspec/changes/update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr/.openspec.yaml
- openspec/changes/update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr/evidence/plan-approval.md
- openspec/changes/update-openspec-1-16-prerequisites-01m69z5ccp3mt47qa6d7g6bdjr/evidence/plan-reapproval.md
- README.md
- docs/claude-installation.md
- docs/openspec-installation.md
- docs/openspec-metadata.md
- docs/openspec-workflow.md
- openspec/config.yaml
- skills/software-development/openspec-delivery/SKILL.md
- tests/openspec-cli-compatibility.mjs
- package.json
- .github/workflows/ci.yml
- .github/workflows/publish-skills.yml
- retained probe log openspec-compatibility-ll5DDY/probe-log.json

## Caveats

- Passing gates are not acceptance. This pass approves neither integration nor publication.
- Workflow reference permalinks at docs/openspec-workflow.md:755-758 still point at 6d04a1b58dedc95729d34e4f223d9d483aae210a. Those bytes did not change, the section says local authority is not attributed to them, and prior reviews left them as a caveat. They were not re-resolved against 27c0515724decc633818c735ee596481eec78a8b.
- npm test does not lock documentation version strings. The current non-archive inventory has no stale install pin. No documentation test was weakened; the only test edit is the probe constant.
- The scratch upstream clone and npm view are reviewer checks of documented facts. They are not an installer run, a host execution probe, or authority to install.
- Ambient OpenSpec and installed profiles were not modified.
