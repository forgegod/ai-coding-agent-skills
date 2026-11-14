import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
test("proposal issue wording requires adoption and bounded operator authority without expanding planning", async () => {
  const source = await read("skills/software-development/openspec-delivery/SKILL.md");
  const paragraph = source.slice(source.indexOf("GitHub issues and pull requests are documentation"), source.indexOf("For metadata-enabled projects"));
  assert.match(paragraph, /requires both explicit project adoption/);
  assert.match(paragraph, /operator-authorized proposal that includes the bounded issue write/);
  assert.match(paragraph, /Otherwise use the separately authorized `document <name>`/);
  assert.match(paragraph, /PR creation and later issue updates need separate\s+authority/);
  assert.match(source, /planning-only request ends at\s+proposal\/spec\/design\/tasks plus a bounded issue write only when the project's\s+explicitly selected proposal policy includes it/);
  assert.match(source, /installation alone never grants that authority/);
  assert.match(source, /does not authorize push, a pull request, merge, issue closure or retirement/);
});
test("Git helper guidance preserves explicit selectors, trust boundaries and native completion blockers", async () => {
  const contract = await read("skills/software-development/openspec-delivery/references/git-environment.md");
  for (const name of ["GIT_CONFIG_GLOBAL", "GIT_CONFIG_SYSTEM", "GIT_CONFIG_NOSYSTEM", "GIT_NO_REPLACE_OBJECTS=1", "GIT_OPTIONAL_LOCKS=0", "LC_ALL=C"]) assert.ok(contract.includes(name), name);
  for (const pattern of [/Absent selectors stay absent/, /including deliberate empty values/, /case-insensitive/, /case-sensitive/, /before any value read/, /not a sandbox/, /Missing native platform evidence blocks hardening\s+completion/, /unchanged\s+trusted scanner/, /independent exact-candidate review/]) assert.match(contract, pattern);
  for (const file of ["references/guard.md", "references/workspace.md", "SKILL.md"]) assert.match(await read(`skills/software-development/openspec-delivery/${file}`), /git-environment\.md/);
  for (const file of ["README.md", "docs/openspec-workflow.md", "docs/openspec-installation.md"]) assert.match(await read(file), /git-environment\.md/);
});
test("short delivery invocations own local plumbing without granting remote or next-change authority", async () => {
  const source = await read("skills/software-development/openspec-delivery/SKILL.md");
  for (const pattern of [/\/openspec-delivery <name>/, /\/openspec-delivery finish <name>/, /\/openspec-delivery prepare <name>/, /Operator restrictions override/, /autonomous local commits/, /next unfinished task group/, /does not authorize push/, /plan approval/, /references\/workspace\.md/, /references\/continuation\.md/]) assert.match(source, pattern);
  assert.doesNotMatch(source, /A longer prompt is.*add authority/);
});
test("next advances only a grounded approved group and offers an inspect-only mode", async () => {
  const source = await read("skills/software-development/openspec-next/SKILL.md");
  for (const pattern of [/\/openspec-next/, /inspect/, /tasks\.md/, /approved/, /ambiguous/i, /already merged/i, /open pull request awaiting/, /do not push/i, /one task group/, /no next change/i]) assert.match(source, pattern);
});
test("workspace and continuation recipes cover bootstrap, exact argv, closeout and recoverable cleanup", async () => {
  const workspace = await read("skills/software-development/openspec-delivery/references/workspace.md");
  for (const pattern of [/change-workspace\.mjs prepare/, /change-workspace\.mjs locate/, /change-workspace\.mjs retire/, /argv/, /bootstrap/i, /no force/i, /ignored/i, /common.*Git|Git.*shared/i, /independent clone/i]) assert.match(workspace, pattern);
  const continuation = await read("skills/software-development/openspec-delivery/references/continuation.md");
  for (const pattern of [/already merged/i, /approval/i, /one task group/, /remote/i, /closure/i, /archive/i, /read.?back/i, /no second task/i, /Open implementation PR/, /Normal pause/, /changed SHA/]) assert.match(continuation, pattern);
});
test("delivery guidance retains approval and retry evidence and binds review after task updates", async () => {
  const continuation = await read("skills/software-development/openspec-delivery/references/continuation.md");
  for (const pattern of [/actual operator approval/i, /SHA\/digest/, /no mutable.*ledger/i, /ticks.*final candidate|final candidate[\s\S]*ticks/i, /after review.*SHA|after review[\s\S]*changes the SHA/i, /Per-group verdicts do not substitute/, /cycle evidence.*recovery blocker/i, /circular.*guard/i]) assert.match(continuation, pattern);
  const orchestration = await read("skills/autonomous-ai-agents/autonomous-implementation-review/references/openspec.md");
  assert.match(orchestration, /ticks in the final[\s\S]*reviewer/);
  assert.match(orchestration, /checkbox commit[\s\S]*renewed candidate review/);
});
test("workspace guidance distinguishes detached receipts, trusted hooks and retained source checkout", async () => {
  const guard = await read("skills/software-development/openspec-delivery/references/guard.md");
  assert.match(guard, /Candidate\/review checks require a clean attached/);
  assert.match(guard, /Receipt checks also allow a clean detached/);
  const workspace = await read("skills/software-development/openspec-delivery/references/workspace.md");
  for (const pattern of [/derive a retained source\/primary checkout/, /planning-directory[\s\S]*not symlinks/, /post-checkout hooks/, /never silently disables project hooks/]) assert.match(workspace, pattern);
});
test("old package is absent and installation rename is explicit rather than silently deleting a profile copy", async () => {
  assert.equal(await stat(new URL("../skills/software-development/openspec-change-integration", import.meta.url)).then(() => true, () => false), false);
  const source = await read("docs/openspec-workflow.md");
  assert.match(source, /openspec-change-integration/);
  assert.match(source, /installed.*(?:unchanged|not updated)|does not.*installed/s);
  assert.match(source, /\/openspec-next inspect/);
});

test("delivery routes lossless evidence retention without adding a gate runner or polling authority", async () => {
  const skill = await read("skills/software-development/openspec-delivery/SKILL.md");
  const reference = await read("skills/software-development/openspec-delivery/references/evidence-retention.md");
  const guard = await read("skills/software-development/openspec-delivery/references/guard.md");
  const integration = await read("skills/software-development/openspec-delivery/references/integration.md");
  const recovery = await read("skills/software-development/openspec-delivery/references/recovery.md");
  const continuation = await read("skills/software-development/openspec-delivery/references/continuation.md");

  for (const source of [skill, guard, integration, recovery, continuation]) assert.match(source, /evidence-retention\.md/);
  for (const pattern of [/original-byte/i, /storedArtifactSha256/, /decodedOriginalSha256/, /provenance/i, /completeness/i, /confidentiality/i, /partial\s+response/i, /fresh\s+corroboration/i, /merge\s+response/i, /unattended polling/i, /fail/i]) assert.match(reference, pattern);
  assert.match(reference, /completion time.*precede.*merge/is);
  assert.match(reference, /wrapperSha256/);
  assert.match(reference, /assessClaimSupport/);
  assert.match(reference, /not a command runner, scheduler, GitHub\s+client, polling loop, approval service, or publication authority/i);
});

test("lossless evidence guidance documents the fail-closed claim contract", async () => {
  const reference = await read("skills/software-development/openspec-delivery/references/evidence-retention.md");
  for (const pattern of [/coherence.*after deserialization/is, /strict UTC instant/i, /successful exit status/i, /publishable non-redacted/i, /completed before merge/i, /missing or contrary evidence blocks/i]) {
    assert.match(reference, pattern);
  }
});

test("policy/textual procedure retains successor history and inherits the two-cycle limit", async () => {
  const continuation = await read("skills/software-development/openspec-delivery/references/continuation.md");
  for (const pattern of [/distinct rejected-candidate, rejected-review and successor-disposition/, /names the rejected candidate\/review and the new\s+candidate/, /carries the consumed correction\/re-review cycles forward/, /fresh gates and review bound to that exact successor SHA/, /Retain the old bytes\s+and hashes after a later pass/, /never overwrite or relabel rejection as acceptance/, /two-cycle limit is inherited across successors and resumes/, /Missing attempt\s+or cycle evidence refuses continuation until a separately authorized recovery/, /new filename or reviewer does not restart the budget/, /not a product budget validator or persistent ledger/]) assert.match(continuation, pattern);
  // Synthetic procedure illustration only: no scheduler, ledger or runtime budget check.
  const first = { candidate: "synthetic-rejected-1", review: "synthetic-review-1", consumedCycles: 1 };
  const successor = { rejectedCandidate: first.candidate, rejectedReview: first.review, candidate: "synthetic-successor", consumedCycles: first.consumedCycles };
  const second = { ...successor, consumedCycles: 2 };
  assert.equal(successor.consumedCycles, first.consumedCycles);
  assert.equal(second.consumedCycles, 2, "a resume does not restart at zero");
  const missingCycle = { ...second, consumedCycles: undefined };
  assert.equal(missingCycle.consumedCycles, undefined);
  assert.match(continuation, /Missing cycle evidence is a recovery blocker, never\s+a reset to cycle zero/);
  assert.match(continuation, /at most two correction\/review cycles/);
});

test("policy/textual closure procedure separates exact identities and orders gates, fresh review and publication", async () => {
  const integration = await read("skills/software-development/openspec-delivery/references/integration.md");
  const continuation = await read("skills/software-development/openspec-delivery/references/continuation.md");
  const gates = integration.indexOf("Run the required local closure gates on the exact closure SHA");
  const review = integration.indexOf("Then obtain a fresh independent");
  const publication = integration.indexOf("Only after those gates");
  assert.ok(gates >= 0 && review > gates && publication > review);
  for (const pattern of [/factual closure review bound to that exact closure SHA/, /separately authorized publication\/integration/, /changed closure SHA requires\s+renewed local closure gates and fresh exact-SHA review/, /implementation candidate and gates plus its\s+implementation-review identity\/session/, /integrated verified revision and its\s+gates/, /closure SHA and local closure gates/, /fresh closure-review identity\/session/, /Never reuse the implementation-review session, packet or JSON/, /relabel\s+implementation\/integrated gates as closure evidence/, /Stored-artifact and original-byte hashes/, /decoded-original hashes and lossless wrapper round-trips/, /Exact archive identity and byte\/mode-identical movement without omitted records/, /Source\/claim completeness/, /partial\/missing\/contrary evidence/, /historical failures\/rejections remain retained/, /do not authenticate a real reviewer or implement\s+lifecycle-order enforcement/]) assert.match(integration, pattern);
  assert.match(continuation, /local closure gates, then fresh independent factual closure\s+review at the exact closure SHA, then separately authorized publication/);
  assert.match(continuation, /structural JSON\s+validation does not authenticate a real reviewer or enforce lifecycle ordering/);
});

test("policy/textual plan self-comparison never manufactures approval, commit authority or a reset", async () => {
  const guard = await read("skills/software-development/openspec-delivery/references/guard.md");
  const continuation = await read("skills/software-development/openspec-delivery/references/continuation.md");
  assert.match(guard, /setting `--plan` equal to `--head` computes identity only/);
  assert.match(guard, /neither approval nor commit authority and resets neither operator restrictions\s+nor the inherited correction\/re-review budget/);
  for (const pattern of [/evidence-only additions from actual checkbox-only progress and\s+covered planning-text changes/, /evidence additions do not approve a plan/, /drift refuses continuation pending separately approved recovery of the exact new\s+plan identity/, /Missing actual approval or unresolved operator restrictions still stop execution/]) assert.match(continuation, pattern);
});
