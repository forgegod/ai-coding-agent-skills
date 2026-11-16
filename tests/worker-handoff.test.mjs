import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile, symlink, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import * as core from "../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/orchestration-core.mjs";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function fixture(t, role = "implementer") {
  const root = await mkdtemp(path.join(tmpdir(), "handoff-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = path.join(root, "checkout");
  const scratch = path.join(root, "worker-scratch");
  const profile = path.join(root, "profile");
  await Promise.all([workspace, scratch, profile].map((p) => mkdir(p)));
  const directory = path.join(root, "attempt-1");
  const inputs = Object.fromEntries(["openspec/config.yaml", ...[".openspec.yaml", "proposal.md", "tasks.md", "specs/a/spec.md"].map((p) => `openspec/changes/fixture-change/${p}`)].map((p) => [p, "a".repeat(64)]));
  const request = {
    schemaVersion: 1,
    identity: { attempt: "attempt-1", predecessor: null, role, change: "fixture-change", group: "2", task: "2.1", action: "2.1", workspace, plan: "a".repeat(40), planDigest: "b".repeat(64), candidate: role === "reviewer" ? "c".repeat(40) : null, inputs },
    outcome: "Deliver the bounded feature", acceptance: ["Focused tests pass"], scope: ["src/feature.mjs"], nonGoals: ["release"],
    authority: { orchestrator: "owner", writer: "owner", authorSession: "author", approvalReference: "retained:approval", executionReference: "retained:execution" },
    restrictions: ["no Git writes", "no tasks.md writes", "no profile writes", "no subagents", "no multiplexers", ...(role === "implementer" ? [] : ["read-only"])],
    budget: { limit: 8, unit: "cycles" }, stop: "Stop on identity failure", evidenceRoots: [directory],
    requiredEvidence: ["native.txt", "lifecycle.jsonl"], mutablePaths: role === "implementer" ? ["src/feature.mjs"] : [],
  };
  const runtime = { adapter: "synthetic", client: "synthetic", version: "1", session: "worker-1", provider: "synthetic", model: "fixture", configurationSource: "test", configurationScope: "attempt", readOnly: role !== "implementer" };
  const report = Buffer.from(role === "implementer" ? "Implemented feature; tests pass.\n" : "No findings\n");
  const lifecycle = Buffer.from(JSON.stringify({ schemaVersion: 1, attempt: "attempt-1", session: "worker-1", event: "terminal", status: "completed", completion: { kind: "exit", code: 0, signal: null } }) + "\n");
  const files = { "report.md": report, "native.txt": report, "lifecycle.jsonl": lifecycle };
  const descriptor = (name) => ({ path: path.join(directory, name), sha256: hash(files[name]), bytes: files[name].length });
  const result = { schemaVersion: 1, identity: structuredClone(request.identity), requestSha256: null, runtime, status: "completed", verdict: role === "implementer" ? "not_applicable" : "no_findings", nativeVerdict: role === "implementer" ? null : "No findings", findings: [], coverageLimitations: [], report: descriptor("report.md"), reportKind: "native", evidence: [descriptor("native.txt"), descriptor("lifecycle.jsonl")], outputs: role === "implementer" ? { "src/feature.mjs": "d".repeat(64) } : {}, completion: { kind: "exit", code: 0, signal: null }, nativeReport: descriptor("native.txt") };
  return { root, workspace, scratch, profile, directory, request, runtime, files, result };
}
async function prepare(f) {
  const expected = await core.createAttempt({ directory: f.directory, request: f.request, excludedRoots: [f.workspace, f.scratch, f.profile] });
  f.result.requestSha256 = expected.requestSha256;
  return expected;
}

test("portable adapter publication binds immutable request and complete retained output without granting acceptance", async (t) => {
  assert.equal(typeof core.createAttempt, "function", "artifact-first request publisher exists");
  const f = await fixture(t);
  const expected = await prepare(f);
  assert.ok(Object.isFrozen(expected.request.identity));
  await core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files });
  await rm(f.scratch, { recursive: true });
  const admitted = await core.readHandoff({ expected, runtime: f.runtime });
  assert.equal(admitted.executionCompleted, true);
  assert.equal(admitted.deliveryAccepted, false);
  assert.equal(admitted.planApproved, false);
  assert.equal(admitted.result.verdict, "not_applicable");
  assert.deepEqual(await readFile(path.join(f.directory, "report.md")), f.files["report.md"]);
  await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files }), /exist|collision/i);
  await assert.rejects(prepare(f), /exist/i);
});

function replaceFile(f, name, bytes) {
  f.files[name] = Buffer.from(bytes);
  for (const d of [f.result.report, f.result.nativeReport, ...f.result.evidence].filter(Boolean)) {
    if (d.path === path.join(f.directory, name)) { d.bytes = f.files[name].length; d.sha256 = hash(f.files[name]); }
  }
}

test("review verdict and process completion must occur in the retained native observations", async (t) => {
  const f = await fixture(t, "reviewer");
  const expected = await prepare(f);
  replaceFile(f, "report.md", "Review is still in progress\n");
  replaceFile(f, "native.txt", "Review is still in progress\n");
  await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files }), /native verdict/);
  assert.ok(!(await readdir(f.directory)).includes("result.json"));
});

test("schema identity does not coerce numeric ids or authorize Git-control outputs", async (t) => {
  const f = await fixture(t);
  for (const request of [
    { ...f.request, identity: { ...f.request.identity, group: 2 } },
    { ...f.request, identity: { ...f.request.identity, task: 2.1, action: 2.1 } },
    { ...f.request, mutablePaths: [".git/config"] },
  ]) await assert.rejects(core.createAttempt({ directory: f.directory, request, excludedRoots: [f.workspace] }));
});

test("authorized current-spec outputs remain distinct from immutable change planning", async (t) => {
  const f = await fixture(t);
  f.request.mutablePaths = ["openspec/specs/example/spec.md"];
  f.result.outputs = { "openspec/specs/example/spec.md": "d".repeat(64) };
  const expected = await prepare(f);
  await core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files });
  assert.equal((await core.readHandoff({ expected, runtime: f.runtime })).deliveryAccepted, false);
});

test("publication is invisible before atomic link and collisions preserve the existing result", async (t) => {
  const f = await fixture(t);
  const expected = await prepare(f);
  const realLink = fs.link;
  let atLink = false;
  t.mock.method(fs, "link", async (source, destination) => {
    atLink = true;
    await assert.rejects(readFile(destination), /ENOENT/);
    assert.deepEqual(await readFile(path.join(f.directory, "report.md")), f.files["report.md"]);
    await writeFile(destination, "collision", { flag: "wx" });
    return realLink(source, destination);
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files }), /EEXIST/);
    assert.equal(atLink, true);
    assert.equal(await readFile(path.join(f.directory, "result.json"), "utf8"), "collision");
  } finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
});

test("runtime reviewer independence, strict request schema and terminal identity are enforced", async (t) => {
  const f = await fixture(t, "reviewer");
  for (const request of [{ ...f.request, schemaVersion: 9 }, { ...f.request, extra: true }, { ...f.request, mutablePaths: ["src/feature.mjs"] }]) await assert.rejects(core.createAttempt({ directory: f.directory, request, excludedRoots: [f.workspace] }));
  const expected = await prepare(f);
  const runtime = { ...f.runtime, session: "author" };
  await assert.rejects(core.publishResult({ expected, runtime, result: { ...f.result, runtime }, files: f.files }), /independent/);
  replaceFile(f, "lifecycle.jsonl", JSON.stringify({ schemaVersion: 1, attempt: "attempt-1", session: "worker-1", event: "terminal", status: "completed", completion: { kind: "exit", code: 1, signal: null } }) + "\n");
  await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files }), /terminal/);
  assert.ok(!(await readdir(f.directory)).includes("result.json"));
});

test("complete findings are valid execution, never delivery acceptance", async (t) => {
  const f = await fixture(t, "reviewer");
  const expected = await prepare(f);
  f.result.verdict = "findings";
  f.result.nativeVerdict = "Findings";
  f.result.findings = [{ severity: "high", path: "src/feature.mjs", line: 8, impact: "Data loss", trigger: "Empty input", remedy: "Reject empty input" }];
  replaceFile(f, "report.md", "Findings\nHigh src/feature.mjs:8 Data loss; empty input; reject empty input.\n");
  replaceFile(f, "native.txt", f.files["report.md"]);
  await core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files });
  const admitted = await core.readHandoff({ expected, runtime: f.runtime });
  assert.equal(admitted.executionCompleted, true);
  assert.equal(admitted.deliveryAccepted, false);
  assert.equal(admitted.result.findings.length, 1);
});

test("missing, partial, stale, unsafe and truncated handoffs remain incomplete", async (t) => {
  const f = await fixture(t);
  const expected = await prepare(f);
  await assert.rejects(core.readHandoff({ expected, runtime: f.runtime }), /ENOENT/);
  for (const mutate of [
    (r) => { r.schemaVersion = 2; }, (r) => { r.extra = true; },
    (r) => { r.identity.attempt = "stale"; }, (r) => { r.identity.planDigest = "f".repeat(64); },
    (r) => { r.identity.inputs["openspec/config.yaml"] = "f".repeat(64); },
    (r) => { r.runtime.session = "other"; }, (r) => { r.requestSha256 = "e".repeat(64); },
    (r) => { r.evidence.pop(); }, (r) => { r.outputs["tasks.md"] = "d".repeat(64); },
    (r) => { r.evidence[0].path = path.join(f.workspace, "secret"); },
    (r) => { r.evidence[0].sha256 = "f".repeat(64); },
    (r) => { r.completion.code = 1; }, (r) => { r.verdict = "no_findings"; },
  ]) {
    const result = structuredClone(f.result); mutate(result);
    await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result, files: f.files }));
    assert.ok(!(await readdir(f.directory)).includes("result.json"));
  }
  await core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files });
  await writeFile(path.join(f.directory, "report.md"), "truncated");
  await assert.rejects(core.readHandoff({ expected, runtime: f.runtime }), /truncated/);
  await writeFile(path.join(f.directory, "report.md"), f.files["report.md"]);
  await writeFile(path.join(f.directory, "result.json"), '{"schemaVersion":');
  await assert.rejects(core.readHandoff({ expected, runtime: f.runtime }), /JSON/);
});

test("changed requests, symlinks, evidence collisions and excluded roots are refused", async (t) => {
  const f = await fixture(t);
  const expected = await prepare(f);
  const bytes = await readFile(path.join(f.directory, "request.md"));
  await writeFile(path.join(f.directory, "request.md"), Buffer.concat([bytes, Buffer.from("changed")]));
  await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files }), /request identity/);
  await writeFile(path.join(f.directory, "request.md"), bytes);
  await symlink(path.join(f.root, "outside"), path.join(f.directory, "native.txt"));
  await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files }), /symlink|exist/i);
  assert.ok(!(await readdir(f.directory)).includes("result.json"));
  for (const root of [f.workspace, f.profile, f.scratch]) {
    const directory = path.join(root, "attempt");
    await assert.rejects(core.createAttempt({ directory, request: { ...f.request, evidenceRoots: [directory] }, excludedRoots: [f.workspace, f.profile, f.scratch] }), /overlap/);
  }
  const linked = path.join(f.root, "linked");
  await symlink(f.scratch, linked);
  const directory = path.join(linked, "attempt");
  await assert.rejects(core.createAttempt({ directory, request: { ...f.request, evidenceRoots: [directory] }, excludedRoots: [f.workspace] }), /symlink/);
});

test("persistent turn end uses matching native identity rather than fabricated exit zero", async (t) => {
  const f = await fixture(t, "reviewer");
  f.request.requiredEvidence.push("turn.json");
  const expected = await prepare(f);
  f.result.completion = { kind: "turn-end", turn: "turn-1", evidence: path.join(f.directory, "turn.json") };
  const bytes = Buffer.from(JSON.stringify({ event: "turn-end", attempt: "attempt-1", session: "worker-1", turn: "turn-1", reportSha256: f.result.report.sha256 }));
  f.files["turn.json"] = bytes;
  f.result.evidence.push({ path: path.join(f.directory, "turn.json"), sha256: hash(bytes), bytes: bytes.length });
  replaceFile(f, "lifecycle.jsonl", JSON.stringify({ schemaVersion: 1, attempt: "attempt-1", session: "worker-1", event: "terminal", status: "completed", completion: f.result.completion }) + "\n");
  await core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files });
  assert.equal((await core.readHandoff({ expected, runtime: f.runtime })).result.completion.kind, "turn-end");
});

test("draft approach review needs review authority but not a fabricated plan approval", async (t) => {
  const f = await fixture(t, "approach-reviewer");
  f.request.identity.plan = null;
  f.request.identity.planDigest = null;
  f.request.authority.approvalReference = null;
  f.result.identity = structuredClone(f.request.identity);
  const expected = await prepare(f);
  await core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files });
  assert.equal((await core.readHandoff({ expected, runtime: f.runtime })).planApproved, false);
});

test("unresolved native wait cannot become a completed result", async (t) => {
  const f = await fixture(t);
  const expected = await prepare(f);
  const wait = { schemaVersion: 1, attempt: "attempt-1", session: "worker-1", event: "waiting" };
  replaceFile(f, "lifecycle.jsonl", JSON.stringify(wait) + "\n" + f.files["lifecycle.jsonl"].toString());
  await assert.rejects(core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files }), /wait/);
});

test("capped attempts retain diagnostics and limitations without manufacturing a review verdict", async (t) => {
  const f = await fixture(t, "reviewer");
  const expected = await prepare(f);
  Object.assign(f.result, { status: "capped", verdict: "unavailable", nativeVerdict: null, coverageLimitations: ["Iteration cap before review finished"], reportKind: "adapter-diagnostic", nativeReport: null });
  replaceFile(f, "report.md", "Adapter diagnostic: native final report unavailable at iteration cap.\n");
  replaceFile(f, "native.txt", "Partial captured output\n");
  replaceFile(f, "lifecycle.jsonl", JSON.stringify({ schemaVersion: 1, attempt: "attempt-1", session: "worker-1", event: "terminal", status: "capped", completion: f.result.completion }) + "\n");
  await core.publishResult({ expected, runtime: f.runtime, result: f.result, files: f.files });
  const result = await core.readHandoff({ expected, runtime: f.runtime });
  assert.equal(result.executionCompleted, false);
  assert.equal(result.deliveryAccepted, false);
});
