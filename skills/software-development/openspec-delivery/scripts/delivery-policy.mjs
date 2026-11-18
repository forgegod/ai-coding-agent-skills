// Read-only policy decisions from retained observations. No scheduler or authority service.
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const text = (value) => typeof value === "string" && value.trim().length > 0;
const digest = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const sha = (value) => typeof value === "string" && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value);
const sameInputs = (a, b) => a && b && JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());
const safePath = (value) => text(value) && !value.includes("\\") && !value.includes(":") && value.split("/").every((part) => part && part !== "." && part !== "..");
const canonicalPaths = (paths) => {
  requireThat(Array.isArray(paths) && paths.every(safePath) && new Set(paths).size === paths.length, "Invalid or duplicate contract path");
  return [...paths].sort();
};
const nativeContract = (name) => ["AGENTS.md", "CLAUDE.md"].includes(name.split("/").at(-1));

function planningInputs(change, inputs) {
  requireThat(typeof change === "string" && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(change), "Invalid planning inventory identity");
  requireThat(inputs && typeof inputs === "object" && !Array.isArray(inputs), "Missing planning inputs");
  const prefix = `openspec/changes/${change}/`;
  const required = ["openspec/config.yaml", ...[".openspec.yaml", "proposal.md", "tasks.md"].map((file) => prefix + file)];
  requireThat(required.every((file) => Object.hasOwn(inputs, file)), "Incomplete planning inventory inputs");
  requireThat(Object.entries(inputs).every(([file, hash]) => safePath(file) && digest(hash) &&
    (required.includes(file) || file === `${prefix}design.md` || file.startsWith(`${prefix}specs/`))), "Invalid planning inventory inputs");
}

export function contractChangePaths({ declared, changed, designations }) {
  const candidates = new Set([...canonicalPaths(declared), ...canonicalPaths(changed)]);
  requireThat(Array.isArray(designations) && designations.every((edge) => safePath(edge?.parent) && safePath(edge?.path)), "Invalid contract designation path");
  const known = new Set([...candidates, ...designations.map((edge) => edge.parent)].filter(nativeContract));
  let added = true;
  while (added) {
    added = false;
    for (const edge of designations) if (known.has(edge.parent) && !known.has(edge.path)) { known.add(edge.path); added = true; }
  }
  return [...candidates].filter((name) => nativeContract(name) || known.has(name)).sort();
}

function checkGrant({ change, inputs, paths, grant }) {
  const declared = canonicalPaths(paths);
  planningInputs(change, inputs);
  requireThat(grant?.stage === "pre-freeze" && grant.change === change && text(grant.reference), "Missing separate pre-freeze contributor grant");
  requireThat(sameInputs(inputs, grant.inputs) && JSON.stringify(declared) === JSON.stringify(canonicalPaths(grant.paths)), "Contributor grant input/path mismatch");
  return declared;
}

export function bindContractGrant({ change, inputs, paths, grant, plan, planDigest }) {
  requireThat(sha(plan) && digest(planDigest), "Invalid grant freeze identity");
  const declared = checkGrant({ change, inputs, paths, grant });
  return structuredClone({ change, plan, planDigest, inputs, paths: declared, grantReference: grant.reference });
}

export function verifyContractGrant(request) {
  const expected = bindContractGrant(request);
  const binding = request.binding;
  requireThat(binding && binding.change === expected.change && binding.plan === expected.plan && binding.planDigest === expected.planDigest &&
    binding.grantReference === expected.grantReference && sameInputs(binding.inputs, expected.inputs) &&
    JSON.stringify(canonicalPaths(binding.paths)) === JSON.stringify(expected.paths), "Contributor grant binding changed; refreeze requires a new grant");
  return true;
}

export function resolveDeliveryPolicy({ phase, context, selection, contractPaths, declaredContractPaths, legacy, recovery, orchestrationAvailable, reviewAcceptance }) {
  requireThat(["freeze", "execute"].includes(phase), "Unknown delivery policy phase");
  requireThat(context && sha(context.parent) && sha(context.target), "Missing integrated parent identity");
  planningInputs(context.change, context.inputs);
  if (phase === "execute") requireThat(sha(context.plan) && digest(context.planDigest), "Missing frozen plan identity");
  const exempt = phase === "execute" && legacy?.verified === true && legacy.predatesIntegrityGuards === true &&
    legacy.plan === context.plan && legacy.planDigest === context.planDigest && text(legacy.reference);
  const recoveryChange = "profile-oriented-autonomous-orchestration-01m7d0f7jvv3wyg9ng26fq2w99";
  const recoveryBase = "ae6488e23414a07d12959bf22bcd283b84d9d8a3";
  let policyRevision = context.parent;
  if (recovery !== undefined) {
    // This named, expiring recovery is not a generic unintegrated-parent bypass.
    // All values are independently retained observations, never inferred grants.
    requireThat(!exempt && context.change === recoveryChange && recovery?.change === recoveryChange &&
      recovery.policyBase === recoveryBase && recovery.integratedBaseVerified === true &&
      recovery.changeIntegrated === false && recovery.identityVerified === true &&
      recovery.preservationVerified === true && recovery.parent === context.parent &&
      recovery.target === context.target && recovery.plan === context.plan &&
      recovery.planDigest === context.planDigest && sameInputs(recovery.inputs, context.inputs) &&
      text(recovery.reference) && text(recovery.recoveryReference) &&
      (phase !== "execute" || (text(recovery.approvalReference) && text(recovery.executionReference))),
    "Missing, mismatched or expired named recovery evidence/grants");
    policyRevision = recoveryBase;
  }
  requireThat(exempt || recovery !== undefined || context.ok === true, "Plan parent is not a verified integrated target revision");
  requireThat(selection?.revision === policyRevision && text(selection.reference) &&
    typeof selection.preExecutionReview === "boolean" && typeof selection.continuousGoal === "boolean", "Policy must come from the plan parent contributor contract");
  const paths = canonicalPaths(contractPaths);
  if (!exempt && paths.length) {
    requireThat(Array.isArray(declaredContractPaths), "Missing declared contributor-contract path set");
    const declared = canonicalPaths(declaredContractPaths);
    requireThat(paths.every((p) => declared.includes(p)), "Undeclared contributor-contract edit requires operator disposition");
  }
  if (selection.preExecutionReview || selection.continuousGoal) requireThat(orchestrationAvailable === true, "Selected policy requires the orchestration package");
  if (selection.preExecutionReview) requireThat(reviewAcceptance?.action === "freeze-ready" && text(reviewAcceptance.reference) &&
    sameInputs(reviewAcceptance.inputs, context.inputs), "Missing matching complete approach-review acceptance");
  return { continuation: selection.continuousGoal ? "continuous-goal" : "single-group", requireApproachReview: selection.preExecutionReview,
    integrityGuards: !exempt, policyRevision, planApproved: false, executionAuthorized: false };
}

export function continuationDecision({ policy, change, group, authority, restrictions, observed }) {
  const stop = (reason) => ({ action: "stop", reason, commits: false, remoteWrites: false });
  if (restrictions?.inspect === true) return { ...stop("Read-only inspection"), action: "inspect" };
  if (observed?.workerStatus === "capped") return stop("Worker cap requires workerContinuationDecision; current group remains incomplete");
  if (!restrictions || restrictions.inspect !== false || typeof restrictions.noCommits !== "boolean" ||
      !(restrictions.group === null || text(restrictions.group))) return stop("Missing retained operator restrictions");
  if (!authority || authority.change !== change || !sha(authority.plan) || !digest(authority.planDigest) ||
      !text(authority.reference) || !text(authority.approvalReference)) return stop("Missing approval or execution authority");
  if (!observed || observed.plan !== authority.plan || observed.planDigest !== authority.planDigest) return stop("Approved-plan/digest mismatch");
  if (!text(group?.id) || (restrictions.group !== null && restrictions.group !== group.id)) return stop("Narrower group restriction");
  for (const [key, expected] of Object.entries({ ownership: "exclusive", dependencies: "accepted", gates: "pass", review: "pass", host: "ready", humanInput: "none", stopReached: false, remoteRequired: false, nextChange: false })) {
    if (observed[key] !== expected) return stop(`Unresolved ${key} boundary`);
  }
  const budget = group.budget ?? authority.budget;
  if (!text(group.stop)) return stop("Missing declared stop condition");
  if (!budget || !Number.isSafeInteger(budget.limit) || budget.limit <= 0 || !text(budget.unit) ||
      !Number.isFinite(observed.budgetUsed) || observed.budgetUsed < 0 || observed.budgetUsed >= budget.limit) return stop("Missing or exhausted budget");
  if (group.budget && authority.budget && (!Number.isSafeInteger(authority.budget.limit) || authority.budget.limit <= 0 || !text(authority.budget.unit) ||
      !Number.isFinite(observed.authorityBudgetUsed) || observed.authorityBudgetUsed < 0 || observed.authorityBudgetUsed >= authority.budget.limit)) return stop("Missing or exhausted authority budget");
  if (!Number.isSafeInteger(observed.completedGroups) || observed.completedGroups < 0) return stop("Missing group completion evidence");
  if (!["single-group", "continuous-goal"].includes(policy?.continuation)) return stop("Missing selected continuation policy");
  if ((policy.continuation === "single-group" || restrictions.group !== null) && observed.completedGroups > 0) return stop("Authorized group completed");
  return { action: "advance", group: group.id, commits: !restrictions.noCommits, remoteWrites: false };
}

export function contractAlignment({ declared, changed, head, review }) {
  const stop = { action: "operator-disposition", policyChanged: false };
  const paths = canonicalPaths(changed);
  if (!paths.every((p) => canonicalPaths(declared).includes(p)) || !sha(head) || review?.head !== head ||
      !text(review.reference) || review.readOnly !== true || !text(review.reviewerSession) ||
      !text(review.implementerSession) || review.reviewerSession === review.implementerSession ||
      review.goalAligned !== true || review.materialConflict !== false ||
      JSON.stringify(paths) !== JSON.stringify(canonicalPaths(review.paths))) return stop;
  return { action: "aligned", policyChanged: false, reference: review.reference };
}

// Observations must come from retained history and fresh adapter identity readback.
// This returns one record to retain BEFORE launch; it never launches or resumes.
export function workerContinuationDecision({ actor, orchestrator, before, after, nativeTasks, history, historyVerified, previousSession, nextSession, cappedProcess, observed }) {
  const stop = (reason) => ({ action: "stop", reason, progressComplete: false, preserveProcess: true });
  if (!text(orchestrator) || actor !== orchestrator) return stop("Only the orchestrator may continue a worker");
  if (!before || !after || !sameInputs(before, after)) return stop("Changed continuation boundary");
  for (const field of ["change", "group", "task", "workspace", "outcome", "stop", "authorityReference"]) if (!text(before[field])) return stop("Incomplete bounded assignment");
  if (!sha(before.plan) || !digest(before.planDigest) || !["implementer", "reviewer", "approach-reviewer"].includes(before.role) ||
      ![before.acceptance, before.scope, before.restrictions].every((v) => Array.isArray(v) && v.length && v.every(text)) ||
      !Number.isSafeInteger(before.budget?.limit) || before.budget.limit <= 0 || !text(before.budget.unit)) return stop("Missing identity or budget");
  // Use the native task id itself as the canonical unfinished-action key. Labels
  // and session IDs are not keys and can never mint another allowance.
  if (!/^\d+$/.test(before.group) || !new RegExp(`^${before.group}\\.\\d+$`).test(before.task) ||
      before.action !== before.task || !Array.isArray(nativeTasks) ||
      nativeTasks.filter((t) => t.id === before.task).length !== 1 ||
      !nativeTasks.some((t) => t.id === before.task && t.group === before.group && t.completed === false)) return stop("No unique unfinished in-group native action");
  if (historyVerified !== true || !Array.isArray(history) || history.some((r) =>
    r?.schemaVersion !== 1 || ![r.change, r.group, r.task, r.previousSession, r.nextSession, r.progressReference].every(text))) return stop("Missing retained continuation history");
  if (history.some((r) => r.change === before.change && r.group === before.group && r.task === before.task)) return stop("Native action continuation already consumed");
  if (![previousSession, nextSession].every(text) || previousSession === nextSession ||
      [previousSession, nextSession].includes(orchestrator) || history.some((r) => [r.previousSession, r.nextSession].includes(nextSession))) return stop("Continuation requires a fresh distinct session");
  const required = { status: "capped", identityVerified: true, session: previousSession, onTrack: true, unfinishedAction: before.task,
    freshSession: true, nativePrompt: false, failedGate: false, drift: false, contradictory: false, stopReached: false };
  if (!observed || Object.entries(required).some(([key, value]) => observed[key] !== value) ||
      !text(observed.progressReference) || JSON.stringify(observed.acceptance) !== JSON.stringify(before.acceptance) ||
      !text(observed.qualifiedRoute) || observed.nextQualifiedRoute !== observed.qualifiedRoute ||
      typeof observed.readOnly !== "boolean" || (before.role !== "implementer" && observed.readOnly !== true) ||
      ![observed.groupBudgetRemaining, observed.authorityBudgetRemaining].every((v) => Number.isFinite(v) && v > 0)) return stop("Unproved progress, identity, route or stop boundary");
  // The adapter retains the original process-tree binding independently. A PID,
  // idle client or capped turn alone cannot establish that no writer remains.
  const proof = observed.quiescence;
  if (!cappedProcess || cappedProcess.session !== previousSession ||
      !Number.isSafeInteger(cappedProcess.pid) || cappedProcess.pid <= 0 ||
      !text(cappedProcess.startIdentity) || !text(cappedProcess.treeIdentity) ||
      !proof || !sameInputs(proof.process, cappedProcess) ||
      proof.identityReadback?.verified !== true || proof.identityReadback.immediate !== true ||
      !text(proof.identityReadback.reference) || !sameInputs(proof.identityReadback.process, cappedProcess) ||
      !text(proof.reference) ||
      !((proof.method === "terminated" && proof.terminationVerified === true) ||
        (proof.method === "non-writing" && proof.cannotWriteVerified === true))) return stop("Unverified capped process-tree quiescence; preserve process and evidence");
  return { action: "continue-worker", progressComplete: false, record: structuredClone({ schemaVersion: 1,
    change: before.change, group: before.group, task: before.task, action: before.task,
    previousSession, nextSession, boundary: before, route: observed.qualifiedRoute, progressReference: observed.progressReference,
    quiescence: proof }) };
}
