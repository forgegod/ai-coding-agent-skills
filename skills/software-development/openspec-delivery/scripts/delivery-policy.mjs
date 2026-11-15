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

export function resolveDeliveryPolicy({ phase, context, selection, contractPaths, grant, binding, legacy, orchestrationAvailable, reviewAcceptance }) {
  requireThat(["freeze", "execute"].includes(phase), "Unknown delivery policy phase");
  requireThat(context && sha(context.parent) && sha(context.target), "Missing integrated parent identity");
  planningInputs(context.change, context.inputs);
  if (phase === "execute") requireThat(sha(context.plan) && digest(context.planDigest), "Missing frozen plan identity");
  const exempt = phase === "execute" && legacy?.verified === true && legacy.predatesIntegrityGuards === true &&
    legacy.plan === context.plan && legacy.planDigest === context.planDigest && text(legacy.reference);
  requireThat(exempt || context.ok === true, "Plan parent is not a verified integrated target revision");
  requireThat(selection?.revision === context.parent && text(selection.reference) &&
    typeof selection.preExecutionReview === "boolean" && typeof selection.continuousGoal === "boolean", "Policy must come from the plan parent contributor contract");
  const paths = canonicalPaths(contractPaths);
  if (!exempt && paths.length) {
    const request = { ...context, paths, grant, binding };
    if (phase === "freeze") checkGrant(request);
    else verifyContractGrant(request);
  }
  if (selection.preExecutionReview || selection.continuousGoal) requireThat(orchestrationAvailable === true, "Selected policy requires the orchestration package");
  if (selection.preExecutionReview) requireThat(reviewAcceptance?.action === "freeze-ready" && text(reviewAcceptance.reference) &&
    sameInputs(reviewAcceptance.inputs, context.inputs), "Missing matching complete approach-review acceptance");
  return { continuation: selection.continuousGoal ? "continuous-goal" : "single-group", requireApproachReview: selection.preExecutionReview,
    integrityGuards: !exempt, policyRevision: context.parent, planApproved: false, executionAuthorized: false };
}

export function continuationDecision({ policy, change, group, authority, restrictions, observed }) {
  const stop = (reason) => ({ action: "stop", reason, commits: false, remoteWrites: false });
  if (restrictions?.inspect === true) return { ...stop("Read-only inspection"), action: "inspect" };
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
  if (!Number.isSafeInteger(observed.completedGroups) || observed.completedGroups < 0) return stop("Missing group completion evidence");
  if (!["single-group", "continuous-goal"].includes(policy?.continuation)) return stop("Missing selected continuation policy");
  if ((policy.continuation === "single-group" || restrictions.group !== null) && observed.completedGroups > 0) return stop("Authorized group completed");
  return { action: "advance", group: group.id, commits: !restrictions.noCommits, remoteWrites: false };
}
