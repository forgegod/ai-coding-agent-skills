# Closure factual review

Change: document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4
Issue: https://github.com/forgegod/ai-coding-agent-skills/issues/5
Exact closure head reviewed: c6c6cdff9bdf516c9e1e3a45bcc281a84b995173
Verified integrated ancestor: 164603a76cc37bc1bbf89fc0bc08940f7dae5963
Plan: 70de9d4154eec93a32967f240ec9d94cb05115cb
Plan digest: 8a53bd6aaea8f3c8a37f4b0bce00b7a74d23dbed37c460766368d8b9a4b7fc80
Receipt SHA-256: d003e49d22afe333e909daf0ac6f5304bc6c22977f410abd8a40015d4631c057
Verdict: fail
Operator approval: w19:p2
Reviewer: Grok 4.7 (xai-oauth); profile hermes-dev-exec. Distinct from implementer Astra and from the 095d04c Grok reviewer session local-a524d5ecac689ce68abafb301b57abfad1c998df62d56de27f9cfef30b19862f. This turn was not given a separate session id; that prior hash is not reused.

This review approves nothing for publication, closure-PR merge, issue closure, or workspace retirement. It does not tick tasks. It did not implement, delegate, stage, commit, or write GitHub. Last observed candidate HEAD was clean at the closure SHA before these external reports. Reports are outside the repository.

## Finding

severity: low
path: openspec/changes/archive/2026-10-31-document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4/evidence/integrated-verification.md:17
trigger: The sentence asserts "Both actual PR verify checks passed, no review threads existed" in addition to the merge readback.
impact: A later reader can treat GitHub check conclusions and an empty review-thread set as archived facts. The retained PR object does not contain them. This review did not query GitHub and does not assert that the checks failed or that threads existed.
minimal correction: Retain the actual check-run and review-thread readback beside implementation-merge.json, or narrow line 17 to the retained merge state, ruleset, and ancestry. Do not invent check results.

Retained implementation-merge.json is only {"headRefOid":"095d04c6999f324c336ef9b68f50c1b94813aa92","mergeCommit":{"oid":"164603a76cc37bc1bbf89fc0bc08940f7dae5963"},"mergedAt":"2026-10-31T20:47:46Z","state":"MERGED"}. Those four fields match the prose and the dispatch readback. main-ruleset.json supports the adjacent ruleset sentence: enforcement active on refs/heads/main, bypass_actors empty, current_user_can_bypass never, required_approving_review_count 0, required_review_thread_resolution true, and no required_status_checks rule. allowed_merge_methods includes merge, squash, and rebase; the prose does not claim squash or rebase were disabled. Ancestry of 164603a from the closure head was checked locally. The receipt guard log also binds head 095d04c, integrated/verified 164603a, and target c6c6cdf with ok true.

No other unresolved finding.

## Evidence actually read

- Root AGENTS.md was already in session context. Delivery policy read: skills/software-development/openspec-delivery/references/guard.md and references/integration.md. Receipt checks require reviewed head ancestry through integrated and verified to target, append-only evidence, and byte/mode-identical archive movement. Receipt prose must not predeclare its own archive-PR merge. The helper does not authenticate PR state or gate execution.
- openspec/changes/archive/2026-10-31-document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4/evidence/receipt.json (full). Raw SHA-256 d003e49d22afe333e909daf0ac6f5304bc6c22977f410abd8a40015d4631c057, matching the closure gates inventory.
- evidence/integrated-verification.md (full).
- evidence/implementation-merge.json, evidence/main-ruleset.json, evidence/integrated-pages.json (Pages run 41240564935, headSha 164603a76cc37bc1bbf89fc0bc08940f7dae5963, conclusion success; build and deploy jobs success). The pages file is the existing auto Pages workflow at the verified revision, not a closure-gate execution and not a deployment-code change.
- evidence/live/summary.json (full). evidence/integrated/gates.json (through the first gate record; commit field 164603a76cc37bc1bbf89fc0bc08940f7dae5963). Those integrated gates are not relabeled as closure gates.
- evidence/live/hermes-2.log.json and the header plus truncated body of evidence/upstream-hermes-install-probe.log.json.
- Archive .openspec.yaml: skip_specs true. tasks.md:19 shows 1.8 already checked. Neither file was in the 47-file evidence append.
- Closure inventory /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/openspec-prerequisites-closure-gates-c6c6cdf/gates.json (full) and 06.log (full). 01.log through 05.log were not re-read and were not re-hashed in this session. They were not re-executed.
- Read-only verifier /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/verify-openspec-prerequisites-closure-records.py was read, then executed. It writes nothing. Result: {"ok": true, "head": "c6c6cdff9bdf516c9e1e3a45bcc281a84b995173", "retainedHashesVerified": 45, "losslessWrappersVerified": 7, "byteIdenticalArchiveFiles": 56, "unchangedProductAndSibling": true}.

Local Git, read-only: HEAD c6c6cdff9bdf516c9e1e3a45bcc281a84b995173, porcelain empty, 164603a76cc37bc1bbf89fc0bc08940f7dae5963 is an ancestor. 17cb35f8baed7bfcec1320ae60b3375a0c7ab45a appends 47 evidence files only (2747 insertions, no deletions). c6c6cdff9bdf516c9e1e3a45bcc281a84b995173 is 56 R100 renames, 0 insertions, 0 deletions. No active openspec/changes/document-openspec-prerequisites-01m69edkq8qyeb7tf1t4r7m7s4 copy remains. No product, docs, current-spec, skill, installer, dependency, manifest, CI, or parallel-change-workflow diff from 164603a to the closure SHA (verifier). Native plan and task bytes were not edited by either closure commit.

## Wrapper, archive, and prose checks

Receipt retainedEvidence has 45 mappings. The verifier hashed each archived file to entry.sha256 and, for all 7 lossless-utf8-log wrappers, hashed UTF-8 text to decodedSha256 and compared those bytes with the original scratch logs. Wrapper file bytes are the retention sha256; decoded text is the original raw log. This is not trimmed output, hidden scanner text, or a weakened whitespace gate.

The seven wrappers are live/hermes-2.log.json through live/hermes-7.log.json and upstream-hermes-install-probe.log.json. live/summary.json still names hermes-2.log through hermes-7.log. Those summary sha256 values match the wrapper decodedSha256 values in the receipt map, not the wrapper file hashes. hermes-1.log remains a direct copy and its summary hash matches the map. hermes-2.log.json was read as JSON: representation lossless-utf8-log, originalFile hermes-2.log, decodedSha256 09f98379b07b64d76c2b52cc2c6fdef2666c96f4c4a63980a2558644e90e417f. Visible scan text is SAFE / ALLOWED for autonomous-implementation-review. No LOW line was in that wrapper.

The upstream probe wrapper was read far enough to confirm the same wrapper shape and decodedSha256 ff457c991aa7143f22764313088432e531cb1e4baa9c4bd116b86cf59b818689. Its body was truncated in the read, so this review did not re-list the seven LOW allowed-tools notices. They stay non-blocking for this documentation record only. They are not risk acceptance and not a scanner bypass. They are not cleared.

Archive movement is byte-for-byte and mode-for-mode (56 R100). .openspec.yaml skip_specs true. No delta specs. Specs were not updated. Receipt embeds review-095d04c.json unchanged (verifier equality). Receipt head remains the reviewed candidate 095d04c6999f324c336ef9b68f50c1b94813aa92; integrated and verified remain 164603a76cc37bc1bbf89fc0bc08940f7dae5963. That split is required by the receipt guard. This review's head is the closure SHA, not a correction of receipt.head.

Receipt acceptance and limitations, and integrated-verification.md lines 5 and 45, do not predict this receipt's later publication, closure-PR merge, issue closure, or workspace cleanup. Historical review files review-15f89b3 and review-a47e705 were among the 56 identical moves and were not in the 47 appended files, so closure did not rewrite them. Their pending sentences were not re-read in this session.

Integrated receipt gates are eleven records at 164603a: ten core commands in integrated/gates.json plus the live probe at live/retry-output.log. They are not closure gates. Closure gates are the six scratch records below.

## Current-closure gates

Source inventory: /home/raphael/.hermes/profiles/hermes-dev/cache/scratch/openspec-prerequisites-closure-gates-c6c6cdf/gates.json
Not re-executed here. gatesReexecuted: false.

1. npm test at c6c6cdff9bdf516c9e1e3a45bcc281a84b995173, exit 0, 01.log, outputSha256 a1c65e12950ba4a1d7c4b86d531ad9b75f7e46bd334ffba0ef35d0ccd32b4fc2. Log body not re-read.
2. npm run build, exit 0, 02.log, outputSha256 0bf4cda39c1df6269d0100ab9a2b915000deb05a1bf739485bf64387a20f7f32. Log body not re-read.
3. npm run validate:openspec, exit 0, 03.log, outputSha256 6346af045ddd949c12e15725753c635ae99411b90144a746c86efbbe4d0d479a. Log body not re-read.
4. /home/raphael/.hermes/profiles/hermes-dev-exec/cache/scratch/openspec-prerequisites-probe/npm-global/bin/openspec validate --specs --strict, exit 0, 04.log, outputSha256 c4b61d8fed37b1764f2343ef26d5276c06020d975ef0849af4e080f60e7ff273. Log body not re-read.
5. git diff --check 164603a76cc37bc1bbf89fc0bc08940f7dae5963 c6c6cdff9bdf516c9e1e3a45bcc281a84b995173, exit 0, 05.log, outputSha256 5601171e5f248b1e779c3ff16f6df86af14d938219558c476a2ee75439b5cf2d. Log body not re-read.
6. change-guard.mjs receipt with published-byte binding, exit 0, 06.log read in full. Guard JSON ok true, tasksComplete true, receiptSha256 d003e49d22afe333e909daf0ac6f5304bc6c22977f410abd8a40015d4631c057, outputSha256 55dadeecea09a144333ab2955eb3ac2eca8c4f38bbb09795936e9b857f94a7d7.

Inventory also records cleanAfterGates true, retainedHashesVerified 45, losslessWrappersVerified 7, byteIdenticalArchiveFiles 56, unchangedProductAndSibling true. The separate verifier reproduced those four counts.

## Limitations, not findings

- Tests, installers, live probes, and the closure harness were not rerun.
- Closure log bodies 01-05 were not re-read or re-hashed here.
- No closure PR was queried. None was claimed at dispatch. Remote writes remain for the parent to verify.
- Claude account upload/sync, Desktop acceptance, real host loading, and end-to-end execution stay unverified. Isolated scratch Hermes discovery and scanner-managed installation are not those acceptances.
- Seven upstream LOW allowed-tools notices were not re-extracted from the truncated probe body. Disposition remains non-blocking documentation notice, not risk acceptance or bypass.
- Source orchestration package 0.14.0 versus installed host protocol 0.14.5 was not modified and is outside this record-fidelity review.
- The first live-probe harness parse failure and the later lossless wrappers are retained recovery records, not edited raw evidence and not product edits.
