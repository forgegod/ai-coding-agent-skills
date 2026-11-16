// Adapter-only local artifact I/O. No launch, task updates, cleanup or authority service.
// Callers must provide independently retained bindings and protected publisher roots.
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, link, unlink } from "node:fs/promises";
import path from "node:path";

const need = (ok, message) => { if (!ok) throw new Error(message); };
const text = (v) => typeof v === "string" && v.trim().length > 0;
const list = (v) => Array.isArray(v) && v.every(text);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const digest = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const sha = (v) => typeof v === "string" && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(v);
const plain = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
function keys(value, names, label) {
  need(plain(value) && Object.keys(value).length === names.length && names.every((n) => Object.hasOwn(value, n)), `Invalid ${label} schema fields`);
}
const canonical = (v) => JSON.stringify(v, (_, value) => plain(value) ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, "en"))) : value);
const same = (a, b) => canonical(a) === canonical(b);
function freeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function clean(value) {
  if (!text(value)) return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127 || (code >= 0xd800 && code <= 0xdfff)) return false;
  }
  return true;
}
const relative = (p) => clean(p) && !p.includes("\\") && !p.includes(":") && p.split("/").every((part) => part && part !== "." && part !== "..");
function absolute(p) {
  need(clean(p) && path.isAbsolute(p) && path.normalize(p) === p, "Unsafe absolute artifact path");
  return p;
}
const within = (root, target) => target === root || (!path.relative(root, target).startsWith(`..${path.sep}`) && path.relative(root, target) !== ".." && !path.isAbsolute(path.relative(root, target)));
async function safePath(p, leafMayBeAbsent = false) {
  absolute(p);
  const parts = p.slice(path.parse(p).root.length).split(path.sep).filter(Boolean);
  let current = path.parse(p).root;
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    let stat;
    try { stat = await lstat(current); } catch (error) {
      if (error.code === "ENOENT" && leafMayBeAbsent && i === parts.length - 1) return;
      throw error;
    }
    need(!stat.isSymbolicLink(), "Unsafe symlink artifact path");
    if (i < parts.length - 1) need(stat.isDirectory(), "Unsafe artifact ancestor");
  }
}
function inventory(inputs) {
  need(plain(inputs) && Object.keys(inputs).length > 0 && Object.entries(inputs).every(([p, h]) => relative(p) && digest(h)), "Invalid input/output hash inventory");
}
function validateRequest(r) {
  keys(r, ["schemaVersion", "identity", "outcome", "acceptance", "scope", "nonGoals", "authority", "restrictions", "budget", "stop", "evidenceRoots", "requiredEvidence", "mutablePaths"], "request");
  need(r.schemaVersion === 1, "Unsupported request schema");
  const id = r.identity;
  keys(id, ["attempt", "predecessor", "role", "change", "group", "task", "action", "workspace", "plan", "planDigest", "candidate", "inputs", "implementerSession"], "identity");
  need([id.attempt, id.role, id.change, id.group, id.task, id.action].every(text), "Invalid literal identity types");
  need(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id.attempt) && (id.predecessor === null || (text(id.predecessor) && id.predecessor !== id.attempt)), "Invalid attempt identity");
  need(["implementer", "reviewer", "approach-reviewer"].includes(id.role), "Invalid role");
  need(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id.change) && /^\d+$/.test(id.group) && new RegExp(`^${id.group}\\.\\d+$`).test(id.task) && id.action === id.task, "Invalid native task/action identity");
  absolute(id.workspace);
  need((sha(id.plan) && digest(id.planDigest)) || (id.role === "approach-reviewer" && id.plan === null && id.planDigest === null), "Invalid plan identity");
  need(id.role === "reviewer" ? sha(id.candidate) : id.candidate === null, "Invalid candidate identity");
  need(id.role === "reviewer" ? text(id.implementerSession) : id.implementerSession === null, "Missing or invalid explicit implementer session");
  inventory(id.inputs);
  const prefix = `openspec/changes/${id.change}/`;
  const required = ["openspec/config.yaml", ...[".openspec.yaml", "proposal.md", "tasks.md"].map((p) => prefix + p)];
  need(required.every((p) => Object.hasOwn(id.inputs, p)), "Incomplete planning input inventory");
  need(Object.keys(id.inputs).every((p) => required.includes(p) || p === `${prefix}design.md` || p.startsWith(`${prefix}specs/`)), "Unexpected planning input");
  need(text(r.outcome) && text(r.stop), "Missing outcome/stop");
  for (const field of ["acceptance", "scope", "nonGoals", "restrictions", "evidenceRoots", "requiredEvidence"]) need(list(r[field]) && r[field].length > 0 && new Set(r[field]).size === r[field].length, `Missing or duplicate ${field}`);
  r.evidenceRoots.forEach(absolute);
  need(r.requiredEvidence.includes("native.txt") && r.requiredEvidence.includes("lifecycle.jsonl") && r.requiredEvidence.every(relative), "Missing required native/lifecycle evidence");
  keys(r.authority, ["orchestrator", "writer", "authorSession", "approvalReference", "executionReference"], "authority");
  need(Object.entries(r.authority).every(([k, v]) => k === "approvalReference" && id.role === "approach-reviewer" ? v === null || text(v) : text(v)) && r.authority.orchestrator === r.authority.writer, "Missing authority or conflicting writer");
  keys(r.budget, ["limit", "unit"], "budget");
  need(Number.isSafeInteger(r.budget.limit) && r.budget.limit > 0 && text(r.budget.unit), "Invalid finite budget");
  need(["no Git writes", "no tasks.md writes", "no profile writes", "no subagents", "no multiplexers"].every((p) => r.restrictions.includes(p)), "Missing worker restrictions");
  need(Array.isArray(r.mutablePaths) && new Set(r.mutablePaths).size === r.mutablePaths.length && r.mutablePaths.every((p) =>
    relative(p) && !p.split("/").some((part) => part.toLowerCase() === ".git") && !Object.hasOwn(id.inputs, p) &&
    !p.startsWith("openspec/changes/") && p !== "openspec/config.yaml"), "Unsafe mutable output path");
  if (id.role !== "implementer") need(r.mutablePaths.length === 0 && r.restrictions.includes("read-only"), "Reviewer must remain read-only");
}
const requestBytes = (request) => Buffer.from(`# Worker request\n\n\`\`\`json\n${canonical(request)}\n\`\`\`\n`);
const jsonBytes = (value) => Buffer.from(canonical(value) + "\n");
async function readClosed(p, maxBytes = 64 * 1024 * 1024, sealed = false) {
  await safePath(p);
  const handle = await open(p, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const before = await handle.stat();
    need(before.isFile() && before.size <= maxBytes, "Unsafe or oversized artifact");
    if (sealed) need((before.mode & 0o222) === 0 && before.nlink === 1, "Result is not sealed or still has a publication alias");
    const bytes = await handle.readFile();
    const after = await handle.stat();
    need(bytes.length === before.size && after.size === before.size && after.mtimeMs === before.mtimeMs && after.ctimeMs === before.ctimeMs, "Artifact changed during read");
    return bytes;
  } finally { await handle.close(); }
}
async function writeClosed(p, bytes, sealed = false) {
  await safePath(p, true);
  const handle = await open(p, "wx", 0o600);
  try {
    await handle.writeFile(bytes);
    if (sealed) await handle.chmod(0o400);
    await handle.sync();
  } finally { await handle.close(); }
}
export async function createAttempt({ directory, request, excludedRoots }) {
  request = structuredClone(request);
  validateRequest(request);
  absolute(directory);
  need(Array.isArray(excludedRoots) && excludedRoots.includes(request.identity.workspace), "Missing excluded workspace roots");
  for (const root of excludedRoots) {
    absolute(root);
    need(!within(root, directory) && !within(directory, root), "Attempt overlaps repository/profile/worker scratch");
  }
  need(request.evidenceRoots.includes(directory), "Attempt must be a declared evidence root");
  for (const root of request.evidenceRoots) {
    need(!excludedRoots.some((excluded) => within(excluded, root) || within(root, excluded)), "Evidence root overlaps excluded root");
    if (root !== directory) await safePath(root);
  }
  await safePath(directory, true);
  await mkdir(directory, { mode: 0o700 }); // Deliberately non-recursive and no reuse.
  const bytes = requestBytes(request);
  await writeClosed(path.join(directory, "request.md"), bytes);
  return freeze({ directory, request, requestSha256: hash(bytes) });
}
async function checkExpected(expected) {
  validateRequest(expected.request);
  absolute(expected.directory);
  need(digest(expected.requestSha256) && expected.request.evidenceRoots.includes(expected.directory), "Invalid retained request binding");
  const bytes = await readClosed(path.join(expected.directory, "request.md"));
  need(hash(bytes) === expected.requestSha256 && bytes.equals(requestBytes(expected.request)), "Changed or malformed request identity");
}
function descriptor(d, expected) {
  keys(d, ["path", "sha256", "bytes"], "evidence");
  absolute(d.path);
  need(expected.request.evidenceRoots.some((root) => within(root, d.path)) && !["request.md", "result.json"].includes(path.basename(d.path)), "Unsafe evidence reference");
  need(digest(d.sha256) && Number.isSafeInteger(d.bytes) && d.bytes >= 0, "Invalid complete evidence hash/size");
}
function validateResult(result, expected, runtime) {
  keys(result, ["schemaVersion", "identity", "requestSha256", "runtime", "status", "verdict", "nativeVerdict", "findings", "coverageLimitations", "report", "reportKind", "evidence", "outputs", "completion", "nativeReport"], "result");
  need(result.schemaVersion === 1, "Unsupported result schema");
  need(same(result.identity, expected.request.identity) && result.requestSha256 === expected.requestSha256, "Result request/input identity mismatch");
  keys(runtime, ["adapter", "client", "version", "session", "provider", "model", "configurationSource", "configurationScope", "readOnly"], "runtime");
  need(Object.entries(runtime).every(([k, v]) => k === "readOnly" ? typeof v === "boolean" : text(v)) && same(runtime, result.runtime), "Runtime identity mismatch");
  need(runtime.session !== expected.request.authority.orchestrator && (result.identity.role === "implementer" || runtime.readOnly === true), "Invalid worker/read-only runtime");
  if (result.identity.role !== "implementer") need(runtime.session !== expected.request.authority.authorSession, "Reviewer must be independent of the planning author session");
  if (result.identity.role === "reviewer") need(runtime.session !== expected.request.identity.implementerSession, "Reviewer must be independent of the candidate implementer session");
  need(["completed", "blocked", "failed", "capped", "stopped"].includes(result.status), "Invalid execution status");
  need(["no_findings", "findings", "unavailable", "not_applicable"].includes(result.verdict), "Invalid review verdict");
  need(list(result.coverageLimitations) && Array.isArray(result.findings), "Invalid coverage/findings");
  for (const finding of result.findings) {
    keys(finding, ["severity", "path", "line", "impact", "trigger", "remedy"], "finding");
    need(["critical", "high", "medium", "low"].includes(finding.severity) && relative(finding.path) && Number.isSafeInteger(finding.line) && finding.line > 0 && [finding.impact, finding.trigger, finding.remedy].every(text), "Incomplete finding");
  }
  if (result.status !== "completed") need(result.verdict === "unavailable" && result.nativeVerdict === null && result.findings.length === 0 && result.coverageLimitations.length > 0, "Incomplete attempt cannot claim a verdict");
  else if (result.identity.role === "implementer") need(result.verdict === "not_applicable" && result.nativeVerdict === null && result.findings.length === 0, "Implementer cannot review itself");
  else need((result.verdict === "no_findings" && result.nativeVerdict === "No findings" && result.findings.length === 0 && result.coverageLimitations.length === 0) || (result.verdict === "findings" && text(result.nativeVerdict) && result.findings.length > 0), "Missing complete explicit native review verdict");
  descriptor(result.report, expected);
  need(result.report.path === path.join(expected.directory, "report.md") && result.report.bytes > 0, "Missing complete report");
  need(["native", "adapter-diagnostic"].includes(result.reportKind), "Invalid report kind");
  if (result.reportKind === "adapter-diagnostic") need(result.status !== "completed" && result.nativeReport === null, "Diagnostic cannot be a completion verdict");
  else { descriptor(result.nativeReport, expected); need(result.nativeReport.sha256 === result.report.sha256 && result.nativeReport.bytes === result.report.bytes, "Report is not complete native output"); }
  need(Array.isArray(result.evidence), "Missing evidence inventory");
  const paths = new Set([result.report.path]);
  for (const entry of result.evidence) { descriptor(entry, expected); need(!paths.has(entry.path), "Duplicate evidence reference"); paths.add(entry.path); }
  need(expected.request.requiredEvidence.every((p) => paths.has(path.join(expected.directory, p))), "Missing required evidence capture");
  if (result.nativeReport) need(result.evidence.some((e) => same(e, result.nativeReport)), "Missing original native report capture");
  need(plain(result.outputs) && Object.entries(result.outputs).every(([p, h]) => expected.request.mutablePaths.includes(p) && (digest(h) || h === null)), "Unsafe changed output inventory");
  const end = result.completion;
  if (end?.kind === "exit") {
    keys(end, ["kind", "code", "signal"], "completion");
    need((Number.isSafeInteger(end.code) && end.code >= 0 && end.signal === null) || (end.code === null && text(end.signal)), "Invalid actual process exit");
    if (result.status === "completed") need(end.code === 0, "Failed process cannot claim completion");
  } else {
    keys(end, ["kind", "turn", "evidence"], "completion");
    need(end.kind === "turn-end" && text(end.turn) && result.evidence.some((e) => e.path === end.evidence), "Missing native turn-end evidence");
  }
}
async function verifyFiles(result, expected) {
  for (const d of [result.report, ...result.evidence]) {
    const bytes = await readClosed(d.path);
    need(bytes.length === d.bytes && hash(bytes) === d.sha256, "Missing, changed or truncated evidence");
  }
  if (result.nativeVerdict !== null) {
    const report = await readClosed(result.report.path);
    need(report.toString("utf8").split(/\r?\n/).includes(result.nativeVerdict), "Missing explicit native verdict in complete report");
  }
  const bytes = await readClosed(path.join(expected.directory, "lifecycle.jsonl"));
  need(bytes.at(-1) === 10, "Partial lifecycle capture");
  const events = bytes.toString("utf8").trimEnd().split("\n").map((line) => JSON.parse(line));
  need(events.length > 0 && events.every((e) => e.schemaVersion === 1 && e.attempt === result.identity.attempt && e.session === result.runtime.session && ["launch", "working", "waiting", "resumed", "terminal"].includes(e.event)), "Mismatched lifecycle identity");
  const terminal = events.at(-1);
  need(terminal.event === "terminal" && terminal.status === result.status && same(terminal.completion, result.completion) && events.filter((e) => e.event === "terminal").length === 1, "Missing or mismatched terminal lifecycle observation");
  let waiting = false;
  for (const event of events) {
    if (event.event === "waiting") waiting = true;
    if (event.event === "resumed") { need(waiting && event.decision === "approved", "Unproved native wait resolution"); waiting = false; }
  }
  need(!waiting || result.status !== "completed", "Unresolved native wait cannot complete");
  if (result.completion.kind === "turn-end") {
    const end = JSON.parse((await readClosed(result.completion.evidence)).toString("utf8"));
    need(end.attempt === result.identity.attempt && end.session === result.runtime.session && end.turn === result.completion.turn && end.reportSha256 === result.report.sha256 && end.event === "turn-end", "Native turn-end identity mismatch");
  }
}
export async function publishResult({ expected, runtime, result, files }) {
  // Snapshot all caller-owned values before the first asynchronous operation.
  expected = structuredClone(expected); runtime = structuredClone(runtime); result = structuredClone(result);
  need(plain(files), "Missing finalized captures");
  files = Object.fromEntries(Object.entries(files).map(([p, bytes]) => [p, Buffer.from(bytes)]));
  validateResult(result, expected, runtime);
  await checkExpected(expected);
  const descriptors = [result.report, ...result.evidence];
  for (const [name, bytes] of Object.entries(files)) {
    need(relative(name) && !name.includes("/"), "Unsafe publisher capture path");
    const p = path.join(expected.directory, name);
    const d = descriptors.find((entry) => entry.path === p);
    need(d && hash(bytes) === d.sha256 && bytes.length === d.bytes, "Unexpected or truncated capture");
  }
  for (const [name, bytes] of Object.entries(files)) await writeClosed(path.join(expected.directory, name), bytes);
  await verifyFiles(result, expected);
  await checkExpected(expected);
  const temporary = path.join(expected.directory, `.result-${randomUUID()}.json`);
  await writeClosed(temporary, jsonBytes(result), true);
  // Same-directory hard-link publication is atomic and fails if result.json exists.
  // Seal and close before linking: no writable handle/alias survives publication.
  // A collision retains the sealed staging file without touching the existing result.
  await safePath(path.join(expected.directory, "result.json"), true);
  await link(temporary, path.join(expected.directory, "result.json"));
  await unlink(temporary);
  // Admission fails closed if alias removal failed or the result became writable.
  await readClosed(path.join(expected.directory, "result.json"), undefined, true);
  return { published: true, deliveryAccepted: false };
}
export async function readHandoff({ expected, runtime }) {
  expected = structuredClone(expected); runtime = structuredClone(runtime);
  await checkExpected(expected);
  const bytes = await readClosed(path.join(expected.directory, "result.json"), undefined, true);
  const result = JSON.parse(bytes.toString("utf8"));
  need(bytes.equals(jsonBytes(result)), "Noncanonical or duplicate result schema fields");
  validateResult(result, expected, runtime);
  await verifyFiles(result, expected);
  await checkExpected(expected);
  return freeze({ executionCompleted: result.status === "completed", deliveryAccepted: false, planApproved: false, result });
}
