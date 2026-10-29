import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const skills = new URL("../skills/", import.meta.url);
const read = async (relative) => readFile(new URL(relative, skills), "utf8");
const entry = { commit: "software-development/git-commit-message/", wireframes: "software-development/capability-wireframes/", orchestration: "autonomous-ai-agents/autonomous-implementation-review/" };

// Instruction-contract regressions, not proof of model obedience. Each shared
// skill keeps its legacy CAP/CHG procedure and adds one explicit early opt-in
// route to a bounded OpenSpec reference.
test("shared skills route explicitly adopted OpenSpec scope before their legacy procedure", async () => {
  for (const [name, directory] of Object.entries(entry)) {
    const source = await read(`${directory}SKILL.md`);
    const version = source.match(/^version:\s*(\d+)\.(\d+)\.(\d+)$/m);
    assert.ok(version, `${name} needs a semantic version`);
    assert.match(source, new RegExp(`references/openspec\\.md`), `${name} does not route to its OpenSpec reference`);
    assert.match(source, /explicit(?:ly)?\b[^.]*OpenSpec|OpenSpec[^.]*explicit(?:ly)?\b/i, `${name} route is not conditioned on explicit project policy`);
    const route = source.indexOf("references/openspec.md");
    const legacy = name === "commit" ? source.indexOf("## Preview") : name === "wireframes" ? source.indexOf("## Procedure") : source.indexOf("## Procedure");
    assert.ok(route > 0 && route < legacy, `${name} must route before the legacy procedure`);
  }
});

test("git-commit-message keeps its legacy preview and CHG boundaries while adding OpenSpec batches", async () => {
  const source = await read(`${entry.commit}SKILL.md`);
  assert.match(source, /^version: 4\.6\.0$/m);
  assert.match(source, /phased-plan-closeout.*controls/s);
  assert.match(source, /In normal operation, present a preview and stop/i);
  assert.match(source, /Outside\s+explicitly enabled autonomous mode, a preview is not permission to commit/i);
  const reference = await read(`${entry.commit}references/openspec.md`);
  assert.ok(reference.length > 900, "OpenSpec commit reference must stay substantive");
  for (const expected of [
    /explicitly selects OpenSpec/i,
    /openspec-change-integration/,
    /sole Git and `openspec\/changes\/<name>\/tasks\.md` writer/,
    /path allowlists/,
    /Do not create a CHG record, phase table, phase-guard preflight/,
    /preview, its single-turn stop, explicit acceptance/,
    /never opted a project in|never opts a project in/,
    /push, PR creation, merge/,
  ]) assert.match(reference, expected);
  assert.doesNotMatch(reference, /~(?:[A-Za-z0-9._-]+)?\/\.hermes|\/home\//);
});

test("capability-wireframes keeps CAP output and adds stable OpenSpec keys", async () => {
  const source = await read(`${entry.wireframes}SKILL.md`);
  assert.match(source, /^version: 1\.3\.0$/m);
  assert.match(source.replace(/\s+/g, " "), /Keep pre-implementation visual work in the CHG review package/);
  assert.match(source, /docs\/product\/wireframes\//);
  assert.match(source, /CAP-NNNN/);
  const reference = await read(`${entry.wireframes}references/openspec.md`);
  assert.ok(reference.length > 900, "OpenSpec wireframe reference must stay substantive");
  for (const expected of [
    /explicitly selects OpenSpec/i,
    /docs\/product\/wireframes\/<capability>\//,
    /stable (?:capability|screen|key)/i,
    /change-owned/,
    /openspec\/changes\/<name>\//,
    /openspec\/specs\//,
    /no fabricated CAP|not allocate `CAP-NNNN`|no CAP record is required/i,
    /manifest/,
    /PNG/,
    /generate\.mjs/,
    /inspect (?:the|its) actual interface|read its actual interface/i,
  ]) assert.match(reference, expected);
  assert.doesNotMatch(reference, /~(?:[A-Za-z0-9._-]+)?\/\.hermes|\/home\//);
});

test("autonomous-implementation-review bounds OpenSpec orchestration to supported hosts", async () => {
  const source = await read(`${entry.orchestration}SKILL.md`);
  assert.match(source, /^version: 0\.11\.0$/m);
  assert.match(source, /A planning-only request stops after design; do not reserve or dispatch phase 1/);
  assert.match(source, /This automated role loop is Herdr-only/);
  assert.match(source, /orchestrator follows `phased-plan-closeout`/);
  assert.match(source, /\/goal draft Execute only phase <phase-number> of <active-chg-path>/);
  assert.equal([...source.matchAll(/^\s*\/goal draft Execute only phase .+$/gm)].length, 1, "the legacy launch template stays the only phase template");
  const reference = await read(`${entry.orchestration}references/openspec.md`);
  assert.ok(reference.length > 900, "OpenSpec orchestration reference must stay substantive");
  for (const expected of [
    /explicitly selects OpenSpec/i,
    /one authorized native OpenSpec change/,
    /task group/,
    /\$HERDR_ENV=1/,
    /code-tab-phase-roles/,
    /no new host,\s*\n?\s*CLI launcher|defines no new host/i,
    /openspec-change-integration/,
    /phased-plan-closeout`, `phase-guard\.mjs`, reservations/,
    /sole Git and `tasks\.md` writer/,
    /apply. checkbox writes are mediated|checkbox writes are mediated/i,
    /stop(?:s)? after the named task group/,
  ]) assert.match(reference, expected);
  assert.doesNotMatch(reference, /~(?:[A-Za-z0-9._-]+)?\/\.hermes|\/home\//);
  assert.doesNotMatch(reference, /^\s*\/goal draft Execute only phase /m);
});

test("the autonomous category contract owns the OpenSpec orchestration boundary", async () => {
  const contract = await read("autonomous-ai-agents/AGENTS.md");
  assert.match(contract, /references\/openspec\.md/);
  assert.match(contract, /openspec-change-integration/);
  assert.match(contract, /sole\s+Git\/`tasks\.md`/);
  assert.match(contract, /`code-tab-phase-roles`/);
  assert.match(contract, /Herdr/);
  assert.match(contract, /no CHG record|never a CHG record/);
});