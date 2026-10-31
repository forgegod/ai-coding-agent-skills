import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
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
