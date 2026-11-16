import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";

const policyUrl = new URL("../skills/software-development/openspec-delivery/scripts/delivery-policy.mjs", import.meta.url);
async function policy() {
  assert.equal(await access(policyUrl).then(() => true, () => false), true, "delivery policy checks are available");
  return import(policyUrl);
}
const inputs = Object.fromEntries(["openspec/config.yaml", ...[".openspec.yaml", "proposal.md", "tasks.md", "design.md", "specs/example/spec.md"].map((name) => `openspec/changes/fixture-change/${name}`)].map((name) => [name, "a".repeat(64)]));
const plan = "c".repeat(40);
const planDigest = "d".repeat(64);
const context = () => ({ ok: true, change: "fixture-change", plan, planDigest, parent: "e".repeat(40), target: "e".repeat(40), inputs });
const selection = () => ({ revision: "e".repeat(40), reference: "retained:parent-contract-readback", preExecutionReview: false, continuousGoal: false });

test("delivery policy comes only from the integrated plan parent and preserves verified legacy approval", async () => {
  const api = await policy();
  assert.equal(typeof api.resolveDeliveryPolicy, "function", "delivery policy selection exists");
  const request = { phase: "execute", context: context(), selection: selection(), contractPaths: [] };
  const defaults = api.resolveDeliveryPolicy(request);
  assert.equal(defaults.continuation, "single-group");
  assert.equal(defaults.requireApproachReview, false);
  assert.equal(defaults.integrityGuards, true);
  assert.throws(() => api.resolveDeliveryPolicy({ ...request, context: { ...context(), ok: false } }), /integrated/);
  assert.throws(() => api.resolveDeliveryPolicy({ ...request, selection: { ...selection(), revision: plan, continuousGoal: true } }), /parent/);
  const selected = { ...selection(), preExecutionReview: true, continuousGoal: true };
  assert.throws(() => api.resolveDeliveryPolicy({ ...request, selection: selected }), /package/);
  assert.throws(() => api.resolveDeliveryPolicy({ ...request, selection: selected, orchestrationAvailable: true }), /review/);
  const reviewAcceptance = { action: "freeze-ready", inputs, reference: "retained:approach-review" };
  assert.equal(api.resolveDeliveryPolicy({ ...request, selection: selected, orchestrationAvailable: true, reviewAcceptance }).continuation, "continuous-goal");
  const partial = { ...inputs }; delete partial["openspec/config.yaml"];
  assert.throws(() => api.resolveDeliveryPolicy({ ...request, selection: selected, orchestrationAvailable: true, reviewAcceptance: { ...reviewAcceptance, inputs: partial } }), /review/);
  assert.throws(() => api.resolveDeliveryPolicy({ ...request, contractPaths: ["AGENTS.md"] }), /declared/);
  const grant = { stage: "pre-freeze", change: "fixture-change", inputs, paths: ["AGENTS.md"], reference: "retained:contract-grant" };
  assert.equal(api.resolveDeliveryPolicy({ ...request, phase: "freeze", context: { ...context(), plan: null, planDigest: null }, contractPaths: grant.paths, declaredContractPaths: grant.paths }).integrityGuards, true);
  const legacy = { plan, planDigest, reference: "retained:pre-adoption-freeze", verified: true, predatesIntegrityGuards: true };
  const old = { ...request, legacy, context: { ...context(), ok: false }, contractPaths: ["AGENTS.md"] };
  assert.equal(api.resolveDeliveryPolicy(old).integrityGuards, false);
  assert.equal(api.resolveDeliveryPolicy(old).continuation, "single-group");
  assert.throws(() => api.resolveDeliveryPolicy({ ...old, phase: "freeze" }), /integrated/);
  assert.throws(() => api.resolveDeliveryPolicy({ ...old, legacy: { ...legacy, plan: "f".repeat(40) } }), /integrated/);
});

test("policy and grants reject structurally incomplete planning inventories even when supplied records agree", async () => {
  const api = await policy();
  const partial = { "openspec/config.yaml": "a".repeat(64) };
  const grant = { stage: "pre-freeze", change: "fixture-change", inputs: partial, paths: ["AGENTS.md"], reference: "retained:grant" };
  assert.throws(() => api.bindContractGrant({ change: "fixture-change", inputs: partial, paths: grant.paths, grant, plan, planDigest }), /inventory|inputs/);
  assert.throws(() => api.resolveDeliveryPolicy({ phase: "execute", context: { ...context(), inputs: partial }, selection: selection(), contractPaths: [] }), /inventory|inputs/);
  const extra = { ...inputs, "unrelated.txt": "b".repeat(64) };
  assert.throws(() => api.resolveDeliveryPolicy({ phase: "execute", context: { ...context(), inputs: extra }, selection: selection(), contractPaths: [] }), /inventory|inputs/);
});

test("continuation advances eligible groups only within policy, persistent restrictions and all stop boundaries", async () => {
  const api = await policy();
  assert.equal(typeof api.continuationDecision, "function", "continuation decisions exist");
  const request = { policy: { continuation: "continuous-goal" }, change: "fixture-change", group: { id: "2", budget: { limit: 8, unit: "cycles" }, stop: "Stop on failed gate" }, authority: { change: "fixture-change", plan, planDigest, reference: "retained:execution", approvalReference: "retained:approval" }, restrictions: { inspect: false, noCommits: false, group: null }, observed: { plan, planDigest, ownership: "exclusive", dependencies: "accepted", gates: "pass", review: "pass", host: "ready", humanInput: "none", budgetUsed: 1, stopReached: false, completedGroups: 1, remoteRequired: false, nextChange: false } };
  const next = api.continuationDecision(request);
  assert.equal(next.action, "advance");
  assert.equal(next.commits, true);
  assert.equal(next.remoteWrites, false);
  const capped = api.continuationDecision({ ...request, observed: { ...request.observed, workerStatus: "capped" } });
  assert.equal(capped.action, "stop");
  assert.match(capped.reason, /workerContinuationDecision/);
  assert.equal(api.continuationDecision({ ...request, policy: { continuation: "single-group" } }).action, "stop");
  assert.equal(api.continuationDecision({ ...request, policy: { continuation: "single-group" }, observed: { ...request.observed, completedGroups: 0 } }).action, "advance");
  assert.equal(api.continuationDecision({ ...request, restrictions: { ...request.restrictions, noCommits: true } }).commits, false);
  assert.equal(api.continuationDecision({ ...request, restrictions: { ...request.restrictions, inspect: true } }).action, "inspect");
  assert.equal(api.continuationDecision({ ...request, restrictions: { ...request.restrictions, group: "1" } }).action, "stop");
  for (const override of [{ ownership: "conflict" }, { dependencies: "blocked" }, { gates: "fail" }, { review: "finding" }, { host: "blocked" }, { humanInput: "waiting-exposed" }, { humanInput: "exposure-failed" }, { humanInput: "denied" }, { humanInput: "timeout" }, { budgetUsed: 8 }, { stopReached: true }, { remoteRequired: true }, { nextChange: true }, { plan: "f".repeat(40) }, { planDigest: "f".repeat(64) }]) assert.notEqual(api.continuationDecision({ ...request, observed: { ...request.observed, ...override } }).action, "advance", JSON.stringify(override));
  for (const field of Object.keys(request.observed)) {
    const observed = { ...request.observed }; delete observed[field];
    assert.notEqual(api.continuationDecision({ ...request, observed }).action, "advance", field);
  }
  assert.equal(api.continuationDecision({ ...request, authority: { ...request.authority, reference: "" } }).action, "stop");
  assert.equal(api.continuationDecision({ ...request, group: { ...request.group, budget: undefined } }).action, "stop");
  assert.equal(api.continuationDecision({ ...request, group: { ...request.group, budget: undefined }, authority: { ...request.authority, budget: request.group.budget } }).action, "advance");
  assert.equal(api.continuationDecision({ ...request, group: { ...request.group, stop: undefined } }).action, "stop");
  const bounded = { ...request, authority: { ...request.authority, budget: { limit: 2, unit: "cycles" } } };
  assert.equal(api.continuationDecision(bounded).action, "stop", "separate authority consumption cannot be omitted when a group has its own budget");
  assert.equal(api.continuationDecision({ ...bounded, observed: { ...request.observed, authorityBudgetUsed: 2 } }).action, "stop");
  assert.equal(api.continuationDecision({ ...bounded, observed: { ...request.observed, authorityBudgetUsed: 1 } }).action, "advance");
});

test("contributor grant binds all declared or changed contracts to exact pre-freeze inputs and freeze identity", async () => {
  const api = await policy();
  const paths = api.contractChangePaths({ declared: ["AGENTS.md", "docs/custom-policy.md"], changed: ["nested/CLAUDE.md", "docs/child-policy.md", "README.md"], designations: [{ parent: "AGENTS.md", path: "docs/custom-policy.md" }, { parent: "docs/custom-policy.md", path: "docs/child-policy.md" }] });
  assert.deepEqual(paths, ["AGENTS.md", "docs/child-policy.md", "docs/custom-policy.md", "nested/CLAUDE.md"]);
  assert.deepEqual(api.contractChangePaths({ declared: ["README.md"], changed: ["README.md"], designations: [] }), []);
  const grant = { stage: "pre-freeze", change: "fixture-change", inputs, paths, reference: "retained:operator-grant" };
  const request = { change: "fixture-change", inputs, paths, grant, plan, planDigest };
  const binding = api.bindContractGrant(request);
  assert.equal(binding.plan, plan);
  assert.equal(binding.planDigest, planDigest);
  assert.equal(api.verifyContractGrant({ ...request, binding }), true);
  for (const replacement of [{ ...grant, stage: "execution" }, { ...grant, paths: paths.slice(1) }, { ...grant, inputs: { ...inputs, "openspec/config.yaml": "e".repeat(64) } }, { ...grant, change: "other" }, { ...grant, reference: "" }]) assert.throws(() => api.bindContractGrant({ ...request, grant: replacement }), /grant/);
  for (const override of [{ plan: "f".repeat(40) }, { planDigest: "e".repeat(64) }, { paths: [...paths, "extra/AGENTS.md"] }]) assert.throws(() => api.verifyContractGrant({ ...request, binding, ...override }), /grant|binding/);
  assert.throws(() => api.contractChangePaths({ declared: ["../AGENTS.md"], changed: [], designations: [] }), /path/);
});
