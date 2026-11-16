import { test } from "node:test";
import assert from "node:assert/strict";
import * as api from "../skills/software-development/openspec-delivery/scripts/delivery-policy.mjs";
const plan = "c".repeat(40), planDigest = "d".repeat(64);
const boundary = () => ({ change: "fixture-change", group: "2", task: "2.1", action: "2.1", workspace: "/synthetic/worktree", plan, planDigest, role: "reviewer", outcome: "Verify feature", acceptance: ["Complete review"], scope: ["feature"], restrictions: ["read-only"], stop: "Identity drift", authorityReference: "retained:execution", budget: { limit: 8, unit: "cycles" } });
const request = () => ({ actor: "owner", orchestrator: "owner", before: boundary(), after: boundary(), nativeTasks: [{ id: "2.1", group: "2", completed: false }], history: [], historyVerified: true, previousSession: "worker-1", nextSession: "worker-2", observed: { status: "capped", identityVerified: true, session: "worker-1", onTrack: true, progressReference: "retained:acceptance-progress", acceptance: boundary().acceptance, unfinishedAction: "2.1", qualifiedRoute: "synthetic-v1", nextQualifiedRoute: "synthetic-v1", freshSession: true, readOnly: true, nativePrompt: false, failedGate: false, drift: false, contradictory: false, stopReached: false, groupBudgetRemaining: 1, authorityBudgetRemaining: 1 } });

test("iteration cap permits one fresh same-role continuation per native task, not per session or label", () => {
  assert.equal(typeof api.workerContinuationDecision, "function");
  const input = request();
  const allowed = api.workerContinuationDecision(input);
  assert.equal(allowed.action, "continue-worker");
  assert.equal(allowed.record.task, "2.1");
  assert.equal(allowed.record.previousSession, "worker-1");
  assert.equal(allowed.record.nextSession, "worker-2");
  assert.equal(api.workerContinuationDecision({ ...input, history: [allowed.record], previousSession: "worker-2", nextSession: "worker-3", observed: { ...input.observed, session: "worker-2" } }).action, "stop");
  assert.equal(api.workerContinuationDecision({ ...input, history: [allowed.record], before: { ...boundary(), action: "renamed" }, after: { ...boundary(), action: "renamed" } }).action, "stop");
});

test("continuation is fail-closed on every observation and unchanged authority boundary", () => {
  assert.equal(typeof api.workerContinuationDecision, "function");
  const input = request();
  for (const override of [{ nativePrompt: true }, { failedGate: true }, { drift: true }, { contradictory: true }, { stopReached: true }, { groupBudgetRemaining: 0 }, { authorityBudgetRemaining: 0 }, { onTrack: false }, { identityVerified: false }, { readOnly: false }, { freshSession: false }, { status: "failed" }, { acceptance: ["different"] }, { nextQualifiedRoute: "fallback" }]) assert.equal(api.workerContinuationDecision({ ...input, observed: { ...input.observed, ...override } }).action, "stop", JSON.stringify(override));
  for (const key of Object.keys(input.observed)) { const observed = { ...input.observed }; delete observed[key]; assert.equal(api.workerContinuationDecision({ ...input, observed }).action, "stop", key); }
  for (const key of ["plan", "planDigest", "scope", "restrictions", "stop", "outcome", "acceptance", "role", "workspace", "authorityReference"]) assert.equal(api.workerContinuationDecision({ ...input, after: { ...boundary(), [key]: "changed" } }).action, "stop", key);
  for (const override of [{ actor: "worker-1" }, { historyVerified: false }, { nextSession: "worker-1" }, { nativeTasks: [{ id: "2.1", group: "3", completed: false }] }, { nativeTasks: [{ id: "2.1", group: "2", completed: true }] }]) assert.equal(api.workerContinuationDecision({ ...input, ...override }).action, "stop");
});

test("declared contract edits need independent alignment review, not a separate operator checkpoint", () => {
  assert.equal(typeof api.contractAlignment, "function");
  const input = { declared: ["AGENTS.md"], changed: ["AGENTS.md"], head: plan, review: { head: plan, paths: ["AGENTS.md"], reviewerSession: "reviewer", implementerSession: "worker", readOnly: true, goalAligned: true, materialConflict: false, reference: "retained:alignment" } };
  assert.equal(api.contractAlignment(input).action, "aligned");
  for (const override of [{ goalAligned: false }, { materialConflict: true }, { reviewerSession: "worker" }, { head: "a".repeat(40) }]) assert.equal(api.contractAlignment({ ...input, review: { ...input.review, ...override } }).action, "operator-disposition");
  assert.equal(api.contractAlignment({ ...input, declared: [] }).action, "operator-disposition");
});
