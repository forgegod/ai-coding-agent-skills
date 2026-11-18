import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { parse } from "yaml";

const coreUrl = new URL("../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/orchestration-core.mjs", import.meta.url);
const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
async function core() {
  assert.equal(await access(coreUrl).then(() => true, () => false), true, "portable orchestration core is available");
  return import(coreUrl);
}
const group = () => ({ change: "fixture-change", group: "2", outcome: "Deliver a bounded feature", acceptance: ["Focused feature tests pass"], scope: ["feature and tests"], nonGoals: ["publication"], workspace: "/synthetic/worktree", budget: { limit: 2, unit: "correction-review-cycles" }, stop: "Stop after this outcome or any failed gate" });
const authority = () => ({ change: "fixture-change", group: "2", plan: "a".repeat(40), planDigest: "b".repeat(64), approvalReference: "retained:approval", executionReference: "retained:invocation", orchestrator: "owner-session", writer: "owner-session", ownershipVerified: true });
const inputs = () => Object.fromEntries(["openspec/config.yaml", ...[".openspec.yaml", "proposal.md", "tasks.md", "design.md", "specs/example/spec.md"].map((name) => `openspec/changes/fixture-change/${name}`)].map((name) => [name, "c".repeat(64)]));

test("minimum outcome authoring carries generated instructions and reviews fragmentation and over-merging", async () => {
  const skill = await read("skills/software-development/openspec-delivery/SKILL.md");
  assert.match(skill, /references\/task-authoring\.md/);
  const guidance = await read("skills/software-development/openspec-delivery/references/task-authoring.md");
  const config = parse(await read("openspec/config.yaml"));
  const generatedInstructions = config.rules.tasks.join("\n");
  for (const source of [generatedInstructions, guidance]) {
    assert.match(source, /fewest goal-oriented tasks/);
    for (const boundary of ["dependency", "authority", "ownership", "safety", "independently verifiable"]) assert.ok(source.includes(boundary), boundary);
  }
  for (const pattern of [/no fixed task-count/i, /files, functions, commands, agent roles/i, /tests and documentation/i, /already-approved frozen plans/i, /native checkbox syntax/i, /not.*semantic.*proof/i, /unnecessary fragmentation/i, /harmful over-merging/i]) assert.match(guidance, pattern);
  const coherent = guidance.split("## Coherent outcome example")[1].split("## Necessary boundary example")[0];
  const split = guidance.split("## Necessary boundary example")[1].split("## Review examples")[0];
  assert.equal((coherent.match(/^- \[ \]/gm) ?? []).length, 1);
  assert.equal((split.match(/^- \[ \]/gm) ?? []).length, 2);
  assert.match(split, /Reason:.*authority/);
  for (const file of ["docs/openspec-workflow.md", "skills/software-development/AGENTS.md"]) assert.match(await read(file), /task-authoring\.md/);
});

test("portable protocol is connected to delivery and next without retiring unqualified replacement routes", async () => {
  const orchestration = await read("skills/autonomous-ai-agents/autonomous-implementation-review/SKILL.md");
  assert.match(orchestration, /references\/portable-core\.md/);
  assert.match(orchestration, /without Hermes or Herdr/);
  assert.match(orchestration, /Legacy host execution/);
  const coreReference = await read("skills/autonomous-ai-agents/autonomous-implementation-review/references/portable-core.md");
  for (const term of ["outcomePacket", "approachPacket", "acceptApproachReview", "reviewReadiness", "planningCorrection", "candidateReviewPacket", "acceptCandidateReview", "approach-review.json", "eight", "per-cycle", "first plan freeze", "same-session", "qualified", "does not authenticate"]) assert.ok(coreReference.includes(term), term);
  const delivery = await read("skills/software-development/openspec-delivery/SKILL.md");
  const next = await read("skills/software-development/openspec-next/SKILL.md");
  for (const source of [delivery, next]) {
    assert.match(source, /delivery-policy\.md/);
    assert.match(source, /continuous-goal/);
    assert.match(source, /single-group/);
  }
  const policyReference = await read("skills/software-development/openspec-delivery/references/delivery-policy.md");
  for (const term of ["planning-worktree", "policy-context", "resolveDeliveryPolicy", "contractChangePaths", "bindContractGrant", "verifyContractGrant", "continuationDecision", "integrated", "child-contract", "README", "legacy", "no commits", "native", "raw", "normalized", "next change"]) assert.ok(policyReference.includes(term), term);
  for (const file of ["README.md", "docs/openspec-workflow.md", "docs/openspec-installation.md", "skills/software-development/openspec-delivery/references/continuation.md", "skills/software-development/openspec-delivery/references/guard.md", "skills/software-development/AGENTS.md"]) assert.match(await read(file), /delivery-policy\.md/);
  for (const file of ["skills/AGENTS.md", "skills/autonomous-ai-agents/AGENTS.md"]) assert.match(await read(file), /portable-core\.md/);
});

test("approach review binds the complete inventory and rejects drift without approving execution", async () => {
  const api = await core();
  assert.equal(typeof api.approachPacket, "function", "approach-review protocol exists");
  const request = { change: "fixture-change", workspace: "/synthetic/worktree", inputs: inputs(), authorSession: "author", reviewerSession: "reviewer" };
  const packet = api.approachPacket(request);
  assert.deepEqual(packet.inputs, inputs());
  for (const denied of ["edits", "shell", "git", "profiles", "persistence", "implementation", "subagents", "multiplexers"]) assert.ok(packet.forbidden.includes(denied));
  const review = { inputs: inputs(), reviewerSession: "reviewer", readOnly: true, reference: "retained:review-1", verdict: "Verdict: No findings", findings: [], coverageLimitations: [] };
  const accepted = api.acceptApproachReview({ packet, review, currentInputs: inputs() });
  assert.equal(accepted.readyForFreeze, true);
  assert.equal(accepted.planApproved, false);
  assert.equal(accepted.executionAuthorized, false);
  for (const override of [{ verdict: "No findings" }, { verdict: "No blocking findings" }, { coverageLimitations: undefined }, { coverageLimitations: ["Specs not reviewed"] }]) {
    assert.throws(() => api.acceptApproachReview({ packet, review: { ...review, ...override }, currentInputs: inputs() }), /complete.*review/);
  }
  const changed = { ...inputs(), "openspec/config.yaml": "d".repeat(64) };
  for (const currentInputs of [changed, { ...inputs(), "openspec/changes/fixture-change/specs/new/spec.md": "e".repeat(64) }]) assert.throws(() => api.acceptApproachReview({ packet, review, currentInputs }), /input|drift/);
  const partial = inputs();
  delete partial["openspec/changes/fixture-change/design.md"];
  assert.throws(() => api.acceptApproachReview({ packet, review: { ...review, inputs: partial }, currentInputs: inputs() }), /input/);
  assert.throws(() => api.approachPacket({ ...request, reviewerSession: "author" }), /independent/);
  assert.throws(() => api.acceptApproachReview({ packet, review: { ...review, reviewerSession: "other" }, currentInputs: inputs() }), /reviewer/);
  assert.throws(() => api.acceptApproachReview({ packet, review: { ...review, readOnly: false }, currentInputs: inputs() }), /read-only/);
  for (const missing of ["openspec/config.yaml", "openspec/changes/fixture-change/tasks.md"]) {
    const invalid = inputs(); delete invalid[missing];
    assert.throws(() => api.approachPacket({ ...request, inputs: invalid }), /inventory/);
  }
  assert.throws(() => api.approachPacket({ ...request, inputs: { ...inputs(), "openspec/changes/fixture-change/evidence/approach-review.json": "a".repeat(64) } }), /inventory/);
});

test("review-record continuity never resets an unavailable cumulative count or reuses stale acceptance", async () => {
  const api = await core();
  assert.equal(typeof api.reviewReadiness, "function", "review-record continuity exists");
  const entry = { inputs: inputs(), verdict: "Verdict: No findings", findings: [], coverageLimitations: [], reference: "retained:review", reviewerSession: "reviewer", authorSession: "author", readOnly: true, automaticCycle: false };
  const record = { schemaVersion: 1, change: "fixture-change", goal: "Deliver the requested outcome", cumulativeCycles: 3, countReference: "retained:count-chain", entries: [entry] };
  const request = { change: "fixture-change", inputs: inputs(), record, recordIntegrityVerified: true };
  assert.equal(api.reviewReadiness(request).action, "freeze-ready");
  assert.equal(api.reviewReadiness(request).cumulativeCycles, 3);
  for (const override of [{ verdict: "No findings" }, { coverageLimitations: undefined }, { coverageLimitations: ["Partial review"] }]) {
    assert.equal(api.reviewReadiness({ ...request, record: { ...record, entries: [{ ...entry, ...override }] } }).action, "resolve-findings");
  }
  for (const invalid of [undefined, "unreadable", { ...record, entries: [{ ...entry, inputs: { ...inputs(), "openspec/config.yaml": "d".repeat(64) } }] }]) {
    assert.equal(api.reviewReadiness({ ...request, record: invalid }).action, "operator-disposition");
    const recovered = api.reviewReadiness({ ...request, record: invalid, recovery: { cumulativeCycles: 5, reference: "retained:external-reports", verified: true } });
    assert.equal(recovered.action, "validate-and-review");
    assert.equal(recovered.cumulativeCycles, 5);
  }
  assert.equal(api.reviewReadiness({ ...request, recordIntegrityVerified: false }).action, "operator-disposition");
  assert.equal(api.reviewReadiness({ ...request, record: null, recovery: { cumulativeCycles: 0, reference: "unverified", verified: false } }).action, "operator-disposition");
  const perCycle = api.reviewReadiness({ ...request, record: null, recovery: { mode: "per-cycle", reference: "retained:operator-decision", verified: true } });
  assert.equal(perCycle.action, "validate-and-review");
  assert.equal(perCycle.cumulativeCycles, null);
  assert.equal(perCycle.requireCycleAuthorization, true);
  const newer = { ...record, entries: [entry, { ...entry, verdict: "Findings", findings: [{ blocking: true }] }] };
  assert.equal(api.reviewReadiness({ ...request, record: newer }).action, "resolve-findings");
  assert.equal(api.reviewReadiness({ ...request, record: { ...record, cumulativeCycles: 8 }, inputs: { ...inputs(), "openspec/config.yaml": "e".repeat(64) }, recovery: { cumulativeCycles: 8, reference: "retained:chain", verified: true } }).cumulativeCycles, 8);
});

test("review readiness retains dispositions and permits a reviewed unavailable-count record without resetting it", async () => {
  const api = await core();
  const finding = { blocking: false, disposition: "unfounded", evidence: "proposal.md:9", reason: "The requirement already exists" };
  const entry = { inputs: inputs(), verdict: "No blocking findings", findings: [finding], reference: "retained:review", reviewerSession: "reviewer", authorSession: "author", readOnly: true, automaticCycle: false };
  const record = { schemaVersion: 1, change: "fixture-change", goal: "Preserved goal", cumulativeCycles: null, countDisposition: { mode: "per-cycle", reference: "retained:operator-decision" }, entries: [entry] };
  const request = { change: "fixture-change", inputs: inputs(), record, recordIntegrityVerified: true };
  assert.equal(api.reviewReadiness(request).action, "resolve-findings", "disposition is not a fresh literal verdict");
  const fresh = { ...entry, reference: "retained:fresh-review", verdict: "Verdict: No findings", findings: [], coverageLimitations: [] };
  const result = api.reviewReadiness({ ...request, record: { ...record, entries: [entry, fresh] } });
  assert.equal(result.action, "freeze-ready");
  assert.equal(result.cumulativeCycles, null);
  assert.equal(result.requireCycleAuthorization, true);
  assert.deepEqual(result.inputs, inputs(), "delivery receives the exact reviewed input identity");
  assert.equal(api.reviewReadiness({ ...request, record: { ...record, entries: [{ ...entry, findings: [{ blocking: false }] }] } }).action, "resolve-findings");
  assert.equal(api.reviewReadiness({ ...request, record: { ...record, countDisposition: undefined } }).action, "operator-disposition");
});

test("a later empty verdict cannot erase an unresolved historical planning finding", async () => {
  const api = await core();
  const finding = { id: "retained-finding", blocking: true, evidence: "design.md:12" };
  const common = { inputs: inputs(), reference: "retained:review", reviewerSession: "reviewer", authorSession: "author", readOnly: true, automaticCycle: false };
  const record = { schemaVersion: 1, change: "fixture-change", goal: "Preserved goal", cumulativeCycles: 2, countReference: "retained:count", entries: [{ ...common, verdict: "Findings", findings: [finding] }, { ...common, reference: "retained:review-2", verdict: "Verdict: No findings", findings: [], coverageLimitations: [] }] };
  const request = { change: record.change, inputs: inputs(), record, recordIntegrityVerified: true };
  assert.equal(api.reviewReadiness(request).action, "resolve-findings");
  const resolved = structuredClone(record);
  resolved.entries[1] = { ...resolved.entries[1], verdict: "No blocking findings", findings: [{ ...finding, blocking: false, disposition: "applied", evidence: "retained:amended-hashes", reReviewReference: "retained:review-2" }] };
  assert.equal(api.reviewReadiness({ ...request, record: resolved }).action, "resolve-findings");
  resolved.entries.push({ ...common, reference: "retained:review-3", verdict: "Verdict: No findings", findings: [], coverageLimitations: [] });
  assert.equal(api.reviewReadiness({ ...request, record: resolved }).action, "freeze-ready");
  const missing = structuredClone(resolved); delete missing.entries[1].findings[0].reReviewReference;
  assert.equal(api.reviewReadiness({ ...request, record: missing }).action, "resolve-findings");
});

test("review records require retained automatic correction hashes and per-cycle authority when the count is unavailable", async () => {
  const api = await core();
  const finding = { id: "routine-1", classification: "routine", inputs: inputs(), evidence: "design.md:8", remedy: "Correct wording", paths: ["openspec/changes/fixture-change/design.md"] };
  const entry = { inputs: inputs(), reference: "retained:review", reviewerSession: "reviewer", authorSession: "author", readOnly: true, automaticCycle: true, verdict: "No blocking findings", findings: [{ ...finding, blocking: false, disposition: "applied", reReviewReference: "retained:review" }] };
  const record = { schemaVersion: 1, change: "fixture-change", goal: "Preserved goal", cumulativeCycles: 1, countReference: "retained:count", entries: [entry] };
  const request = { change: record.change, inputs: inputs(), record, recordIntegrityVerified: true };
  assert.equal(api.reviewReadiness(request).action, "operator-disposition");
  const corrected = { ...entry, correction: { finding, beforeInputs: inputs(), amendedInputs: inputs(), reReviewReference: entry.reference } };
  const fresh = { ...entry, automaticCycle: false, reference: "retained:fresh-review", verdict: "Verdict: No findings", findings: [], coverageLimitations: [] };
  assert.equal(api.reviewReadiness({ ...request, record: { ...record, entries: [corrected] } }).action, "resolve-findings");
  assert.equal(api.reviewReadiness({ ...request, record: { ...record, entries: [corrected, fresh] } }).action, "freeze-ready");
  const unknown = { ...record, cumulativeCycles: null, countDisposition: { mode: "per-cycle", reference: "retained:operator" }, entries: [corrected] };
  assert.equal(api.reviewReadiness({ ...request, record: unknown }).action, "operator-disposition");
  unknown.entries = [{ ...corrected, cycleAuthorization: { findingId: finding.id, inputs: inputs(), reference: "retained:cycle-1" } }];
  assert.equal(api.reviewReadiness({ ...request, record: unknown }).action, "resolve-findings");
  unknown.entries.push(fresh);
  assert.equal(api.reviewReadiness({ ...request, record: unknown }).action, "freeze-ready");
  assert.equal(api.reviewReadiness({ ...request, record: { ...record, entries: [null] } }).action, "operator-disposition");
});

test("routine planning correction preserves the goal and stops at disposition or non-convergence boundaries", async () => {
  const api = await core();
  assert.equal(typeof api.planningCorrection, "function", "bounded correction protocol exists");
  const finding = { id: "finding-1", classification: "routine", inputs: inputs(), paths: ["openspec/changes/fixture-change/design.md"], evidence: "design.md:12 contradicts proposal.md:8", remedy: "Replace stale acceptance wording with the agreed condition" };
  const request = { goal: "The unchanged operator goal", frozen: false, finding, currentInputs: inputs(), authorizedPaths: Object.keys(inputs()), cumulativeCycles: 2, repeated: false, contradictory: false };
  const result = api.planningCorrection(request);
  assert.equal(result.action, "apply-validate-review");
  assert.equal(result.goal, request.goal);
  assert.equal(result.cumulativeCycles, 3);
  assert.equal(result.finding.blocking, true, "a suggested correction is not an applied and re-reviewed correction");
  assert.deepEqual(result.finding.inputs, inputs());
  for (const classification of ["scope", "client-topology", "authority", "safety", "dependencies", "external-state", "security", "host", "accepted-contract", "unknown"]) {
    assert.equal(api.planningCorrection({ ...request, finding: { ...finding, classification } }).action, "operator-disposition", classification);
  }
  for (const override of [{ frozen: true }, { repeated: true }, { contradictory: true }, { cumulativeCycles: 8 }, { cumulativeCycles: null }, { authorizedPaths: [] }, { currentInputs: { ...inputs(), "openspec/config.yaml": "d".repeat(64) } }, { finding: { ...finding, remedy: "" } }]) assert.equal(api.planningCorrection({ ...request, ...override }).action, "operator-disposition");
  const authorized = api.planningCorrection({ ...request, cumulativeCycles: null, cycleAuthorization: { findingId: finding.id, inputs: inputs(), reference: "retained:one-cycle", verified: true } });
  assert.equal(authorized.action, "apply-validate-review");
  assert.equal(authorized.cumulativeCycles, null);
  assert.equal(api.planningCorrection({ ...request, cumulativeCycles: null, cycleAuthorization: { findingId: "other", inputs: inputs(), reference: "retained:one-cycle", verified: true } }).action, "operator-disposition");
  const unfounded = api.planningCorrection({ ...request, finding: { ...finding, disposition: "unfounded", reason: "Current acceptance already includes the requirement" } });
  assert.equal(unfounded.action, "retain-unfounded");
  assert.equal(unfounded.finding.blocking, false);
  assert.equal(unfounded.cumulativeCycles, 2);
  for (const override of [{ repeated: true }, { contradictory: true }, { cumulativeCycles: 8 }]) {
    assert.equal(api.planningCorrection({ ...request, ...override, finding: { ...finding, disposition: "unfounded", reason: "Disputed" } }).action, "operator-disposition");
  }
});

test("candidate review requires a fresh read-only session and exact candidate and gate identities", async () => {
  const api = await core();
  assert.equal(typeof api.candidateReviewPacket, "function", "candidate review packet exists");
  const head = "d".repeat(40);
  const request = { group: group(), authority: authority(), implementerSession: "implementer", reviewerSession: "reviewer", head, base: "e".repeat(40), gates: [{ command: "node --test", commit: head, exitCode: 0, evidence: "retained:gate" }] };
  const packet = api.candidateReviewPacket(request);
  assert.equal(packet.head, head);
  assert.ok(packet.forbidden.includes("edits"));
  const review = { head, planDigest: authority().planDigest, reviewerSession: "reviewer", readOnly: true, reference: "retained:verdict", verdict: "Verdict: No findings", findings: [], coverageLimitations: [] };
  const acceptance = { packet, review, currentHead: head, currentPlanDigest: authority().planDigest };
  assert.equal(api.acceptCandidateReview(acceptance).accepted, true);
  for (const override of [{ verdict: "No blocking findings" }, { coverageLimitations: undefined }, { coverageLimitations: ["Unreviewed outputs"] }]) {
    assert.throws(() => api.acceptCandidateReview({ ...acceptance, review: { ...review, ...override } }), /complete.*review/);
  }
  for (const reviewerSession of ["implementer", "owner-session", ""]) assert.throws(() => api.candidateReviewPacket({ ...request, reviewerSession }), /independent|distinct/);
  assert.throws(() => api.candidateReviewPacket({ ...request, gates: [{ ...request.gates[0], commit: "f".repeat(40) }] }), /gate/);
  assert.throws(() => api.candidateReviewPacket({ ...request, gates: [{ ...request.gates[0], exitCode: 1 }] }), /gate/);
  for (const override of [{ currentHead: "f".repeat(40) }, { currentPlanDigest: "f".repeat(64) }, { review: { ...review, readOnly: false } }, { review: { ...review, reviewerSession: "implementer" } }, { review: { ...review, findings: [{ blocking: true }] } }]) assert.throws(() => api.acceptCandidateReview({ ...acceptance, ...override }), /review|candidate|plan|finding/i);
});

test("portable outcome packet bounds one worker without client tools or a second writer", async () => {
  const { outcomePacket } = await core();
  const input = { group: group(), authority: authority(), workerSession: "worker-session" };
  const before = structuredClone(input);
  const packet = outcomePacket(input);
  assert.deepEqual(input, before);
  assert.equal(packet.taskAuthority, "openspec/changes/fixture-change/tasks.md");
  assert.equal(packet.progressWriter, "owner-session");
  assert.deepEqual(packet.outcome, input.group);
  for (const denied of ["tasks", "git", "profiles", "remote", "subagents", "multiplexers"]) assert.ok(packet.forbidden.includes(denied));
  for (const field of ["outcome", "acceptance", "scope", "nonGoals", "workspace", "budget", "stop"]) {
    const invalid = structuredClone(input);
    delete invalid.group[field];
    assert.throws(() => outcomePacket(invalid), /outcome|acceptance|scope|nonGoals|workspace|budget|stop/);
  }
  for (const field of ["approvalReference", "executionReference", "plan", "planDigest"]) {
    const invalid = structuredClone(input);
    delete invalid.authority[field];
    assert.throws(() => outcomePacket(invalid), /authority|plan/);
  }
  assert.throws(() => outcomePacket({ ...input, workerSession: "owner-session" }), /distinct/);
  assert.throws(() => outcomePacket({ ...input, authority: { ...authority(), writer: "other" } }), /writer/);
  assert.throws(() => outcomePacket({ ...input, authority: { ...authority(), ownershipVerified: false } }), /ownership/);
  assert.throws(() => outcomePacket({ ...input, authority: { ...authority(), group: "3" } }), /scope/);
  const inherited = group();
  delete inherited.budget;
  assert.deepEqual(outcomePacket({ ...input, group: inherited, authority: { ...authority(), budget: group().budget } }).outcome.budget, group().budget);
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `const {outcomePacket}=await import(${JSON.stringify(coreUrl.href)}); console.log(outcomePacket(${JSON.stringify(input)}).progressWriter)`], { env: {}, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "owner-session");
});
