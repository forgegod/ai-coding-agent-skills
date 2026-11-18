import { test } from "node:test";
import assert from "node:assert/strict";
import * as core from "../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/orchestration-core.mjs";
const inputs = { "openspec/config.yaml": "a".repeat(64), ...Object.fromEntries([".openspec.yaml", "proposal.md", "tasks.md", "design.md"].map((p) => [`openspec/changes/fixture-change/${p}`, "a".repeat(64)])) };
const request = () => ({ goal: "Preserve the agreed outcome", actor: "owner", orchestrator: "owner", kind: "source", frozen: true, finding: { id: "F1", classification: "routine", severity: "high", inputs, paths: ["src/feature.mjs"], evidence: "retained:failed-gate", remedy: "Restore the specified safety check" }, currentInputs: inputs, authorizedPaths: ["src/feature.mjs"], cumulativeCycles: 2, repeated: false, contradictory: false, groupBudgetRemaining: 2, authorityBudgetRemaining: 3, nativeInput: false, identityVerified: true, qualifiedImplementer: "worker", grant: { write: true, validate: true, review: true, launch: true, planningAmendment: false, successorFreeze: false } });

test("routine source and gate repairs belong to the implementer without per-fix approval", () => {
  assert.equal(typeof core.correctionDecision, "function");
  const input = request();
  const result = core.correctionDecision(input);
  assert.equal(result.action, "dispatch-implementer");
  assert.equal(result.writer, "worker");
  assert.equal(result.cumulativeCycles, 3);
  assert.equal(result.executionAuthorized, false);
  assert.equal(result.finding.blocking, true);
  assert.equal(result.goal, input.goal);
  for (const kind of ["source", "test", "implementation-documentation"]) assert.equal(core.correctionDecision({ ...input, kind }).writer, "worker");
  for (const override of [{ actor: "worker" }, { qualifiedImplementer: null }, { qualifiedImplementer: "owner" }, { groupBudgetRemaining: 0 }, { authorityBudgetRemaining: 0 }, { nativeInput: true }, { identityVerified: false }, { cumulativeCycles: 8 }, { repeated: true }, { contradictory: true }]) assert.equal(core.correctionDecision({ ...input, ...override }).action, "operator-disposition");
  for (const classification of ["authority", "security", "external-state", "scope", "unknown"]) assert.equal(core.correctionDecision({ ...input, finding: { ...input.finding, classification } }).action, "operator-disposition");
  for (const key of ["write", "validate", "review", "launch"]) assert.equal(core.correctionDecision({ ...input, grant: { ...input.grant, [key]: false } }).action, "operator-disposition");
});

test("authorized frozen planning repair pauses implementation and requires fresh exact-plan approval", () => {
  assert.equal(typeof core.correctionDecision, "function");
  const input = request();
  Object.assign(input, { kind: "planning", authorizedPaths: Object.keys(inputs), grant: { ...input.grant, planningAmendment: true, successorFreeze: true } });
  input.finding.paths = ["openspec/changes/fixture-change/design.md"];
  const result = core.correctionDecision(input);
  assert.equal(result.action, "amend-validate-freeze-review");
  assert.equal(result.writer, "owner");
  assert.equal(result.requiresExactPlanApproval, true);
  assert.equal(result.executionAuthorized, false);
  assert.equal(result.cumulativeCycles, 3, "a freeze does not reset the shared correction count");
  assert.equal(core.correctionDecision({ ...input, frozen: false }).action, "apply-validate-review");
  for (const key of ["planningAmendment", "successorFreeze"]) assert.equal(core.correctionDecision({ ...input, grant: { ...input.grant, [key]: false } }).action, "operator-disposition");
  const unknown = { ...input, cumulativeCycles: null };
  assert.equal(core.correctionDecision(unknown).action, "operator-disposition");
  const cycleAuthorization = { verified: true, findingId: input.finding.id, inputs, reference: "retained:one-cycle" };
  assert.equal(core.correctionDecision({ ...unknown, cycleAuthorization }).cumulativeCycles, null);
});

test("historical successor acceptance binds exact identity, append-only chain and complete post-review captures", () => {
  assert.equal(typeof core.acceptSuccessorReview, "function");
  const identity = { plan: "a".repeat(40), tree: "b".repeat(40), planDigest: "c".repeat(64), inputs };
  const packageHashes = { "review.json": "d".repeat(64), "report.md": "e".repeat(64) };
  const receipt = { ...identity, reviewerSession: "reviewer", authorSession: "author", model: "fixture", readOnly: true, verdict: "Verdict: No findings", findings: [], coverageLimitations: [], reference: "retained:fresh-review", packageHashes };
  const input = { change: "fixture-change", identity, receipt, currentInputs: inputs, currentPackageHashes: packageHashes, chain: { verified: true, reference: "retained:append-only-chain", superseded: { "old-review.json": "f".repeat(64) }, preservationVerified: true }, validation: { plan: identity.plan, inputs, exitCode: 0, reference: "retained:validation" } };
  assert.equal(core.acceptSuccessorReview(input).action, "freeze-ready");
  assert.equal(core.acceptSuccessorReview(input).planApproved, false);
  for (const disposition of ["applied", "unfounded", "operator-disposed"]) {
    const finding = { blocking: false, disposition, evidence: "retained:remedy", reason: "Disposed", reReviewReference: "retained:review", operatorReference: "retained:operator" };
    assert.throws(() => core.acceptSuccessorReview({ ...input, receipt: { ...receipt, verdict: "No blocking findings", findings: [finding] } }), /complete.*verdict/);
  }
  for (const override of [{ verdict: "No findings" }, { coverageLimitations: undefined }, { coverageLimitations: ["Config unread"] }]) {
    assert.throws(() => core.acceptSuccessorReview({ ...input, receipt: { ...receipt, ...override } }), /complete.*verdict/);
  }
  for (const override of [{ receipt: { ...receipt, plan: "f".repeat(40) } }, { receipt: { ...receipt, reviewerSession: "author" } }, { receipt: { ...receipt, model: "" } }, { currentPackageHashes: { ...packageHashes, "report.md": "f".repeat(64) } }, { validation: { ...input.validation, exitCode: 1 } }, { chain: { ...input.chain, preservationVerified: false } }, { currentInputs: { ...inputs, "openspec/config.yaml": "d".repeat(64) } }]) assert.throws(() => core.acceptSuccessorReview({ ...input, ...override }));
});
