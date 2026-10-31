# Integrated source verification

Change: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4

This is a factual record of accepted documentation source, not a second task list or an attestation of this record's own later publication, archive merge, issue closure or workspace retirement.

## Identity and protected integration

- Issue: https://github.com/forgegod/ai-coding-agent-skills/issues/5
- Implementation PR: https://github.com/forgegod/ai-coding-agent-skills/pull/6
- Base: fc184fb1a5068b129c33017b8e8619c5334cf18a
- Approved plan: 70de9d4154eec93a32967f240ec9d94cb05115cb
- Plan digest: 8a53bd6aaea8f3c8a37f4b0bce00b7a74d23dbed37c460766368d8b9a4b7fc80
- Reviewed candidate: 095d04c6999f324c336ef9b68f50c1b94813aa92
- Actual integrated and verified revision: 164603a76cc37bc1bbf89fc0bc08940f7dae5963

PR 6 was read back as MERGED at 2026-10-31T20:47:46Z, with the candidate reachable in the merge commit. The integrated tree is byte-identical to the reviewed candidate. Main's active PR-only ruleset had no bypass actors, required thread resolution and zero human approvals; it configured no named required status check. Both actual PR verify checks passed, no review threads existed, and the head remained the reviewed SHA before the ancestry-preserving protected merge. No direct main push, forced update, bypass or branch deletion was used.

The live target was still the base before integration, so there were no intervening documentation changes to reconcile. The sibling parallel-change-workflow package remains byte-identical. This change has native skip_specs true and no deltas; the sole current local-skill-installation spec is unchanged and passed strict validation. No spec synchronization is necessary.

## Independent review and retained evidence

The distinct Grok 4.7 final reviewer passed the exact candidate with no findings. Parent read both reports and checked the candidate/digest with the review guard. The [final report](review-095d04c.md) and [JSON](review-095d04c.json) are byte-identical retained copies. Earlier failed and corrected passing reviews remain preserved with their own SHAs; their historical pending checkbox statements were not rewritten.

[receipt.json](receipt.json) embeds the accepted review, actual integration identity, eleven successful verified-revision gate records, environment, output hashes and a retention map. All references in that map are relative to this evidence directory, which moves together with the complete native change package. Original scratch paths in historical reports remain historical execution identifiers, not the only retained evidence locations.

Seven raw Hermes outputs contain significant trailing whitespace from terminal rendering. They are retained in lossless UTF-8 JSON wrappers rather than trimmed or exempted from whitespace checks. Each wrapper's `text` recovers the exact original bytes when encoded as UTF-8; `decodedSha256` checks those bytes, while the retention map's `sha256` checks the wrapper file. Historical inventories still name the original logs; the map resolves their retained wrappers. The remaining reports and logs are direct byte-identical copies.

## Executed integrated verification

The detached verification checkout was bootstrapped with npm ci (two packages, zero vulnerabilities). Environment: Linux, Node v24.21.0, npm 11.19.0, Git 2.43.0. OpenSpec strict checks used isolated CLI 1.15.0; the ambient CLI was not modified.

[Integrated gate inventory](integrated/gates.json) retains the ten core commands and logs: build, parent package/byte audit, documentation/coherence audit, focused tests (13 passed), npm test (242 passed), metadata validation, strict native change validation, base-to-integrated whitespace check, reviewed-candidate tree equality and strict current-spec validation. All exited zero at the verified revision; tracked source stayed clean. [Candidate gate evidence](candidate/gates.json) preserves the prior nine commands at the reviewed candidate rather than relabelling them as integrated executions. Scratch harness source is retained as non-executable text for factual review, not as new project tooling.

The existing automatic [Pages run](https://github.com/forgegod/ai-coding-agent-skills/actions/runs/41240564935) completed successfully at the verified revision. The [live probe](live/summary.json) fetched and byte-matched all 37 checked HTTP files, including every one of the 28 advertised package files, both inventories and seven ZIPs. It then used real Hermes discovery and normal scanner-managed installation for all five companion packages in an isolated scratch home, verifying installed bytes and inventory. No real profile was modified. The package inventory remains five companion skills and two plugins; no upstream package was vendored.

The first optional live-probe harness attempt failed to parse launcher bootstrap lines before valid discovery JSON; CLI discovery itself exited zero and no installation had started. Its [failure](live/initial-harness-failure.log) and [actual discovery output](live/initial-discovery.log) are retained. The corrected harness parsed and validated the JSON array; the [full retry](live/retry-output.log) passed without product changes or scanner bypass.

## Limits and acceptance boundary

This change delivers reviewed documentation source. Earlier upstream Hermes installation probes were SAFE/ALLOWED with LOW allowed-tools notices, not finding-free; their [losslessly retained original output](upstream-hermes-install-probe.log.json) is retained. Those notices do not block this documentation-only candidate and do not grant risk acceptance or bypass authority.

Isolated package bytes and CLI checks do not establish actual user installations, native model loading, Claude account upload/sync, Desktop acceptance or end-to-end workflow execution. Those remain explicitly unverified. The seven upstream descriptions still exceed the documented account-upload description limit; no upstream metadata was silently rewritten. The separate optional orchestration prerequisites and existing trust/collision boundaries remain unchanged.

The operator's finish invocation authorizes the named record-only receipt/archive PR, acceptance-bound issue closure and retirement of clean dedicated worktrees through the existing policy. This record makes no prediction about those later outcomes. No next change or release is authorized.
