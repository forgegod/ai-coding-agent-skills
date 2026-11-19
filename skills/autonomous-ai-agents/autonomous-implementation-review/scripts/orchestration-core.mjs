// Pure packet/evidence checks plus explicit adapter-only artifact I/O exports.
// No client launch, process control, Git or task-progress writes.
// Inputs are retained observations, not authenticated grants or a distributed lock.
export { createAttempt, publishResult, readHandoff } from "./worker-handoff.mjs";
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const text = (value) => typeof value === "string" && value.trim().length > 0;
const list = (value) => Array.isArray(value) && value.length > 0 && value.every(text);
const sha = (value) => typeof value === "string" && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value);
const digest = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

function inventory(change, inputs) {
  requireThat(typeof change === "string" && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(change), "Invalid inventory change");
  requireThat(inputs && typeof inputs === "object" && !Array.isArray(inputs), "Missing planning inventory");
  const prefix = `openspec/changes/${change}/`;
  const required = ["openspec/config.yaml", ...[".openspec.yaml", "proposal.md", "tasks.md"].map((name) => prefix + name)];
  requireThat(required.every((name) => Object.hasOwn(inputs, name)), "Incomplete planning inventory");
  for (const [name, hash] of Object.entries(inputs)) {
    requireThat(!name.includes("\\") && name.split("/").every((part) => part && part !== "." && part !== "..") &&
      (required.includes(name) || name === `${prefix}design.md` || name.startsWith(`${prefix}specs/`)) && digest(hash), "Invalid planning inventory input");
  }
}
const sameInputs = (a, b) => a && b && JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());
const resolvedFinding = (finding) => finding?.blocking === false && (
  (finding.disposition === "unfounded" && text(finding.evidence) && text(finding.reason)) ||
  (finding.disposition === "applied" && text(finding.evidence) && text(finding.reReviewReference)) ||
  (finding.disposition === "operator-disposed" && text(finding.operatorReference) && text(finding.reason))
);
// Dispositions preserve history; they are never a substitute for a fresh verdict.
const completeNoFindings = (entry) => entry?.verdict === "Verdict: No findings" &&
  Array.isArray(entry.findings) && entry.findings.length === 0 &&
  Array.isArray(entry.coverageLimitations) && entry.coverageLimitations.length === 0;

export function approachPacket({ change, workspace, inputs, authorSession, reviewerSession }) {
  inventory(change, inputs);
  requireThat(text(workspace), "Missing review workspace");
  requireThat(text(authorSession) && text(reviewerSession) && authorSession !== reviewerSession, "Missing independent reviewer session");
  return structuredClone({ change, workspace, inputs, authorSession, reviewerSession,
    forbidden: ["edits", "shell", "git", "profiles", "persistence", "implementation", "subagents", "multiplexers"],
    report: "Severity-ordered path:line findings with impact, trigger and minimal remedy, or literal Verdict: No findings; record coverage limitations",
  });
}

export function acceptApproachReview({ packet, review, currentInputs }) {
  approachPacket(packet);
  inventory(packet.change, currentInputs);
  requireThat(review?.reviewerSession === packet.reviewerSession, "Wrong reviewer session");
  requireThat(review.readOnly === true, "Review must remain read-only");
  requireThat(text(review.reference), "Missing retained review reference");
  requireThat(sameInputs(packet.inputs, review.inputs) && sameInputs(packet.inputs, currentInputs), "Planning input drift or incomplete review inputs");
  requireThat(completeNoFindings(review), "Missing complete literal no-findings approach review");
  return { readyForFreeze: true, planApproved: false, executionAuthorized: false, entry: structuredClone(review) };
}

export function reviewReadiness({ change, inputs, record, recordIntegrityVerified, recovery }) {
  inventory(change, inputs);
  const count = (value) => Number.isSafeInteger(value) && value >= 0;
  const latest = Array.isArray(record?.entries) ? record.entries.at(-1) : undefined;
  const perCycle = record?.cumulativeCycles === null && record.countDisposition?.mode === "per-cycle" && text(record.countDisposition.reference);
  const validEntry = (entry) => {
    if (!entry || !text(entry.reference) || !text(entry.authorSession) || !text(entry.reviewerSession) ||
        entry.authorSession === entry.reviewerSession || entry.readOnly !== true ||
        typeof entry.automaticCycle !== "boolean" || !Array.isArray(entry.findings)) return false;
    try { inventory(change, entry.inputs); } catch { return false; }
    if (!entry.automaticCycle) return true;
    const correction = entry.correction;
    if (!correction || !text(correction.finding?.id) || correction.finding.classification !== "routine" ||
        !text(correction.finding.evidence) || !text(correction.finding.remedy) ||
        !sameInputs(correction.finding.inputs, correction.beforeInputs) ||
        !sameInputs(correction.amendedInputs, entry.inputs) || correction.reReviewReference !== entry.reference) return false;
    try { inventory(change, correction.beforeInputs); } catch { return false; }
    return !perCycle || (text(entry.cycleAuthorization?.reference) &&
      entry.cycleAuthorization.findingId === correction.finding.id && sameInputs(entry.cycleAuthorization.inputs, correction.beforeInputs));
  };
  const intact = recordIntegrityVerified === true && record?.schemaVersion === 1 && record.change === change &&
    text(record.goal) && ((count(record.cumulativeCycles) && text(record.countReference)) || perCycle) &&
    latest && sameInputs(latest.inputs, inputs) && record.entries.every(validEntry);
  if (!intact) {
    if (recovery?.verified === true && text(recovery.reference)) {
      if (count(recovery.cumulativeCycles)) return { action: "validate-and-review", cumulativeCycles: recovery.cumulativeCycles, requireCycleAuthorization: false, reference: recovery.reference };
      if (recovery.mode === "per-cycle") return { action: "validate-and-review", cumulativeCycles: null, requireCycleAuthorization: true, reference: recovery.reference };
    }
    return { action: "operator-disposition", cumulativeCycles: null, reason: "Review acceptance invalid; recover cumulative count from retained external reports or retain an operator disposition" };
  }
  const findings = new Map();
  for (const entry of record.entries) {
    if (entry.correction?.finding) findings.set(entry.correction.finding.id, entry.correction.finding);
    for (const finding of entry.findings) {
      // Anonymous findings cannot be silently matched to a later disposition.
      findings.set(text(finding?.id) ? finding.id : Symbol(), finding);
    }
  }
  const ready = latest.automaticCycle === false && completeNoFindings(latest) && [...findings.values()].every(resolvedFinding);
  return { action: ready ? "freeze-ready" : "resolve-findings", cumulativeCycles: record.cumulativeCycles,
    requireCycleAuthorization: Boolean(perCycle), reference: latest.reference, inputs: structuredClone(inputs) };
}

export function planningCorrection({ goal, frozen, finding, currentInputs, authorizedPaths, cumulativeCycles, repeated, contradictory, cycleAuthorization }) {
  const result = { action: "operator-disposition", goal, cumulativeCycles, finding: { ...structuredClone(finding), blocking: true } };
  if (!text(goal) || frozen !== false || finding?.classification !== "routine" || !text(finding.id) ||
      !sameInputs(finding.inputs, currentInputs) || !text(finding.evidence)) return result;
  if (repeated !== false || contradictory !== false ||
      (cumulativeCycles !== null && (!Number.isSafeInteger(cumulativeCycles) || cumulativeCycles < 0 || cumulativeCycles >= 8))) return result;
  if (finding.disposition === "unfounded" && text(finding.reason)) {
    return { ...result, action: "retain-unfounded", finding: { ...result.finding, blocking: false } };
  }
  if (!text(finding.remedy) || !list(finding.paths) || !Array.isArray(authorizedPaths) ||
      !finding.paths.every((name) => authorizedPaths.includes(name)) || repeated !== false || contradictory !== false) return result;
  if (cumulativeCycles === null) {
    if (cycleAuthorization?.verified !== true || !text(cycleAuthorization.reference) ||
        cycleAuthorization.findingId !== finding.id || !sameInputs(cycleAuthorization.inputs, currentInputs)) return result;
  } else if (!Number.isSafeInteger(cumulativeCycles) || cumulativeCycles < 0 || cumulativeCycles >= 8) return result;
  return { ...result, action: "apply-validate-review", cumulativeCycles: cumulativeCycles === null ? null : cumulativeCycles + 1,
    cycleAuthorization: cumulativeCycles === null ? structuredClone(cycleAuthorization) : null };
}

export function outcomePacket({ group, authority, workerSession }) {
  requireThat(group && authority, "Missing outcome authority");
  requireThat(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(group.change ?? "") && text(group.group), "Missing outcome identity");
  for (const field of ["outcome", "workspace", "stop"]) requireThat(text(group[field]), `Missing outcome ${field}`);
  for (const field of ["acceptance", "scope", "nonGoals"]) requireThat(list(group[field]), `Missing outcome ${field}`);
  const budget = group.budget ?? authority.budget;
  requireThat(budget && Number.isSafeInteger(budget.limit) && budget.limit > 0 && text(budget.unit), "Missing finite outcome budget");
  requireThat(authority.change === group.change && authority.group === group.group, "Outcome authority scope mismatch");
  requireThat(sha(authority.plan) && digest(authority.planDigest), "Missing approved plan identity");
  requireThat(text(authority.approvalReference) && text(authority.executionReference), "Missing approval or execution authority");
  requireThat(text(authority.orchestrator) && authority.writer === authority.orchestrator, "Conflicting progress/Git writer");
  requireThat(authority.ownershipVerified === true, "Unverified ownership");
  requireThat(text(workerSession) && workerSession !== authority.orchestrator, "Worker must be a distinct session");
  return structuredClone({
    outcome: { ...group, budget }, authority, workerSession,
    taskAuthority: `openspec/changes/${group.change}/tasks.md`,
    progressWriter: authority.orchestrator,
    forbidden: ["tasks", "git", "profiles", "remote", "subagents", "multiplexers"],
  });
}

export function correctionDecision(request) {
  const { actor, orchestrator, kind, frozen, grant, qualifiedImplementer } = request;
  const stop = { action: "operator-disposition", goal: request.goal, cumulativeCycles: request.cumulativeCycles,
    executionAuthorized: false, finding: { ...structuredClone(request.finding), blocking: true } };
  if (!text(orchestrator) || actor !== orchestrator || !["planning", "source", "test", "implementation-documentation"].includes(kind) ||
      typeof frozen !== "boolean" || request.nativeInput !== false || request.identityVerified !== true ||
      ![request.groupBudgetRemaining, request.authorityBudgetRemaining].every((n) => Number.isFinite(n) && n > 0) ||
      !["write", "validate", "review"].every((p) => grant?.[p] === true)) return stop;
  if (kind === "planning" && frozen && (grant.planningAmendment !== true || grant.successorFreeze !== true)) return stop;
  if (kind !== "planning" && (!text(qualifiedImplementer) || qualifiedImplementer === orchestrator || grant.launch !== true)) return stop;
  const decision = planningCorrection({ ...request, frozen: false });
  if (decision.action === "operator-disposition") return stop;
  return { ...decision, writer: kind === "planning" ? orchestrator : qualifiedImplementer,
    action: decision.action === "retain-unfounded" ? decision.action : kind === "planning" ?
      (frozen ? "amend-validate-freeze-review" : "apply-validate-review") : "dispatch-implementer",
    requiresExactPlanApproval: kind === "planning", executionAuthorized: false };
}

export function acceptSuccessorReview({ change, identity, receipt, currentInputs, currentPackageHashes, chain, validation }) {
  inventory(change, identity?.inputs);
  requireThat(sha(identity.plan) && sha(identity.tree) && digest(identity.planDigest), "Missing successor identity");
  const hashes = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0 && Object.values(v).every(digest);
  requireThat(chain?.verified === true && chain.preservationVerified === true && text(chain.reference) && hashes(chain.superseded), "Missing verified append-only preservation chain");
  requireThat(receipt && ["plan", "tree", "planDigest"].every((k) => receipt[k] === identity[k]) &&
    sameInputs(receipt.inputs, identity.inputs) && sameInputs(currentInputs, identity.inputs), "Successor review identity/input drift");
  requireThat(hashes(receipt.packageHashes) && sameInputs(receipt.packageHashes, currentPackageHashes), "Review package hash drift");
  requireThat(text(receipt.model) && text(receipt.reference) && text(receipt.authorSession) && text(receipt.reviewerSession) &&
    receipt.authorSession !== receipt.reviewerSession && receipt.readOnly === true && completeNoFindings(receipt), "Missing complete independent successor verdict");
  requireThat(validation?.plan === identity.plan && validation.exitCode === 0 && text(validation.reference) &&
    sameInputs(validation.inputs, identity.inputs), "Missing retained successful successor validation");
  return { action: "freeze-ready", inputs: structuredClone(identity.inputs), reference: receipt.reference,
    plan: identity.plan, planDigest: identity.planDigest, planApproved: false, executionAuthorized: false };
}

export function candidateReviewPacket({ group, authority, implementerSession, reviewerSession, head, base, gates }) {
  requireThat(text(implementerSession) && text(reviewerSession) && implementerSession !== reviewerSession, "Missing independent reviewer session");
  const packet = outcomePacket({ group, authority, workerSession: reviewerSession });
  requireThat(sha(head) && sha(base), "Missing frozen candidate/base identity");
  requireThat(Array.isArray(gates) && gates.length > 0 && gates.every((gate) =>
    gate && text(gate.command) && gate.commit === head && gate.exitCode === 0 && text(gate.evidence)), "Missing, failed or wrong-candidate gate evidence");
  return { ...packet, head, base, implementerSession, reviewerSession, gates: structuredClone(gates), forbidden: [...packet.forbidden, "edits", "persistence"] };
}

export function acceptCandidateReview({ packet, review, currentHead, currentPlanDigest }) {
  candidateReviewPacket({ ...packet, group: packet.outcome });
  requireThat(review?.reviewerSession === packet.reviewerSession && review.readOnly === true && text(review.reference), "Missing independent read-only review evidence");
  requireThat(currentHead === packet.head && review.head === packet.head && currentPlanDigest === packet.authority.planDigest &&
    review.planDigest === packet.authority.planDigest, "Candidate or plan changed after review");
  requireThat(completeNoFindings(review), "Missing complete literal no-findings candidate review");
  return { accepted: true, head: packet.head, planDigest: packet.authority.planDigest, reference: review.reference, publicationAuthorized: false };
}
