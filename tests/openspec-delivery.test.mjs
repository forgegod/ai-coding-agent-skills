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
