import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const skills = new URL("../skills/", import.meta.url);
const read = async (relative) => readFile(new URL(relative, skills), "utf8");
const entry = {
  commit: "software-development/git-commit-message/",
  wireframes: "software-development/capability-wireframes/",
  orchestration: "autonomous-ai-agents/autonomous-implementation-review/",
  integration: "software-development/openspec-delivery/",
};

test("companion skills route OpenSpec work before generic procedure", async () => {
  for (const [name, directory] of Object.entries(entry)) {
    if (name === "integration") continue;
    const source = await read(`${directory}SKILL.md`);
    assert.match(source, /references\/openspec\.md/, `${name} does not route to its OpenSpec reference`);
    const route = source.indexOf("references/openspec.md");
    const procedure = source.indexOf("## Procedure");
    assert.ok(route > 0 && route < procedure, `${name} must route before its procedure`);
    assert.doesNotMatch(source, /phased-plan-|application-records/);
  }
});

test("git-commit-message keeps its preview and uses the integration skill for change batches", async () => {
  const source = await read(`${entry.commit}SKILL.md`);
  assert.match(source, /^version: 4\.8\.0$/m);
  assert.match(source, /openspec-delivery/);
  assert.match(source, /In normal operation, present a preview and stop/i);
  assert.match(source, /Outside\s+explicitly enabled autonomous mode, a preview is not permission to commit/i);
  assert.doesNotMatch(source, /phased-plan-closeout/);
  const reference = await read(`${entry.commit}references/openspec.md`);
  assert.ok(reference.length > 900, "OpenSpec commit reference must stay substantive");
  for (const expected of [
    /openspec-delivery/,
    /sole Git and `openspec\/changes\/<name>\/tasks\.md` writer/,
    /path allowlists/,
    /preview, its single-turn stop, explicit acceptance/,
    /push, pull-request creation, merge/,
    /documentation or review/,
  ]) assert.match(reference, expected);
  assert.doesNotMatch(reference, /~(?:[A-Za-z0-9._-]+)?\/\.hermes|\/home\//);
});

test("capability-wireframes uses stable keys and change-owned proposals", async () => {
  const source = await read(`${entry.wireframes}SKILL.md`);
  assert.match(source, /^version: 1\.5\.1$/m);
  assert.match(source, /docs\/product\/wireframes\//);
  assert.match(source, /within their change package/);
  assert.doesNotMatch(source, /CAP-NNNN|application-records/);
  const reference = await read(`${entry.wireframes}references/openspec.md`);
  assert.ok(reference.length > 900, "OpenSpec wireframe reference must stay substantive");
  for (const expected of [
    /docs\/product\/wireframes\//,
    /stable (?:capability|screen|key)/i,
    /change-owned|openspec\/changes\/<name>\//,
    /openspec\/specs\//,
    /no fabricated CAP|Do not allocate `CAP-NNNN`|No capability record is required/i,
    /manifest/,
    /PNG/,
    /generate\.mjs/,
    /inspect (?:the|its) actual interface|read its actual interface/i,
  ]) assert.match(reference, expected);
  assert.doesNotMatch(reference, /~(?:[A-Za-z0-9._-]+)?\/\.hermes|\/home\//);
});

test("autonomous-implementation-review bounds orchestration to one change and supported hosts", async () => {
  const source = await read(`${entry.orchestration}SKILL.md`);
  assert.match(source, /^version: 0\.14\.0$/m);
  assert.match(source, /A planning-only request stops after proposal\/spec\/design\/tasks/);
  assert.match(source, /This automated role loop is Herdr-only/);
  assert.match(source, /openspec-delivery/);
  assert.match(source, /\/goal draft \/openspec-delivery <name>/);
  assert.equal([...source.matchAll(/^\s*\/goal draft \/openspec-delivery .+$/gm)].length, 1);
  assert.doesNotMatch(source, /phased-plan-|application-records/);
  const reference = await read(`${entry.orchestration}references/openspec.md`);
  assert.ok(reference.length > 900, "OpenSpec orchestration reference must stay substantive");
  for (const expected of [
    /one authorized native OpenSpec change/,
    /task group/,
    /\$HERDR_ENV=1/,
    /code-tab-phase-roles/,
    /defines no new host/,
    /openspec-delivery/,
    /sole Git and `tasks\.md` writer/,
    /checkbox writes are mediated/i,
    /stops after the named task group/,
  ]) assert.match(reference, expected);
  assert.doesNotMatch(reference, /~(?:[A-Za-z0-9._-]+)?\/\.hermes|\/home\//);
  assert.doesNotMatch(reference, /^\s*\/goal draft Execute only /m);
});

test("integration treats GitHub as documentation and review, not a task lock", async () => {
  const source = await read(`${entry.integration}SKILL.md`);
  assert.match(source, /Parallel specification and documentation/);
  assert.match(source, /not an execution lock|not a lock|not admission/i);
  assert.match(source, /document <name>/);
  assert.match(source, /A longer prompt is not required/);
  assert.match(source, /same capability spec/);
  assert.doesNotMatch(source, /phased-plan-|application-records/);
});

test("the autonomous category contract owns the OpenSpec orchestration boundary", async () => {
  const contract = await read("autonomous-ai-agents/AGENTS.md");
  assert.match(contract, /references\/openspec\.md/);
  assert.match(contract, /openspec-delivery/);
  assert.match(contract, /sole\s+Git\/`tasks\.md`/);
  assert.match(contract, /`code-tab-phase-roles`/);
  assert.match(contract, /Herdr/);
  assert.doesNotMatch(contract, /phased-plan-closeout/);
});
