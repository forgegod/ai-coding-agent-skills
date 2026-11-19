import { test } from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as core from "../skills/autonomous-ai-agents/autonomous-implementation-review/scripts/orchestration-core.mjs";

const validProbe = (overrides = {}) => ({
  client: "hermes",
  variant: "default",
  version: "0.23.2",
  versionRange: ">=0.23.0 <1.0.0",
  firstPartyDocsVerified: true,
  scratchStateRoot: "/tmp/isolated-probe-scratch",
  excludedRoots: ["/workspace/repo", "/home/operator/.hermes"],
  credentialsMetadataOnly: true,
  writesRealHome: false,
  roles: ["implementer", "reviewer", "approach-reviewer"],
  controls: {
    prohibitMultiplexers: true,
    prohibitImplementerSubagents: true,
    prohibitReviewerSubagents: true,
    prohibitReviewerWrites: true,
    nonArgvTransport: "query-file",
    terminalFirstLaunch: true,
    effectiveIdentityVerified: true,
    nativeFinalOutputCapture: true,
    adapterOnlyPublication: true,
    atomicResultVisibility: true,
    safeEvidencePaths: true,
    noPaneScrapingFallback: true,
    excludesBackgroundAutoRespawn: true,
  },
  interaction: {
    route: "native-cli",
    nativeSameSessionVerified: true,
    preservesHumanWait: true,
  },
  ...overrides,
});

test("candidate qualification records cover all eight design candidates plus chat-only grok-bot", async () => {
  assert.deepEqual(
    core.DESIGN_CANDIDATES,
    ["hermes", "claude-code", "codex", "grok-build", "opencode", "kilo-modern", "kilo-legacy", "pi"],
  );
  const readiness = core.replacementReadiness();
  assert.equal(readiness.ready, true);
  assert.deepEqual(readiness.qualifiedAdapters, ["hermes", "claude-code", "codex", "grok-build"]);
  assert.deepEqual(
    readiness.unsupportedCandidates.sort(),
    ["grok-bot", "kilo-legacy", "kilo-modern", "opencode", "pi"].sort(),
  );
  assert.equal(readiness.retireLegacyRoutes, true);
  assert.equal(readiness.shipHermesProfilePreparation, true);
  assert.equal(readiness.bootstrapExceptionExpired, true);

  const evidenceRaw = await readFile(
    new URL(
      "../openspec/changes/profile-oriented-autonomous-orchestration-01m7d0f7jvv3wyg9ng26fq2w99/evidence/group-3-candidate-qualification-20261119.json",
      import.meta.url,
    ),
    "utf8",
  );
  const evidence = JSON.parse(evidenceRaw);
  for (const name of [...core.DESIGN_CANDIDATES, "grok-bot"]) {
    assert.ok(evidence.candidates[name], `missing candidate evidence for ${name}`);
    assert.equal(evidence.candidates[name].status, core.CANDIDATE_RECORDS[name].status, name);
    assert.equal(evidence.candidates[name].supported, core.CANDIDATE_RECORDS[name].supported, name);
  }
});

test("qualifyCandidateAdapter enforces scratch isolation, Kilo variant separation, and native vs Herdr interaction proof", () => {
  const nativePass = core.qualifyCandidateAdapter(validProbe());
  assert.equal(nativePass.qualified, true);
  assert.equal(nativePass.herdrRequired, false);
  assert.equal(nativePass.profilePreparationAllowed, true);

  const claudePass = core.qualifyCandidateAdapter(
    validProbe({
      client: "claude-code",
      variant: "standalone-cli",
      version: "2.1.327",
      versionRange: ">=2.1.273 <3.0.0",
      controls: { ...validProbe().controls, nonArgvTransport: "stdin", excludesBackgroundAutoRespawn: true },
    }),
  );
  assert.equal(claudePass.qualified, true);
  assert.equal(claudePass.profilePreparationAllowed, false);

  const claudeBgFail = core.qualifyCandidateAdapter(
    validProbe({
      client: "claude-code",
      variant: "standalone-cli",
      version: "2.1.327",
      versionRange: ">=2.1.273 <3.0.0",
      controls: { ...validProbe().controls, excludesBackgroundAutoRespawn: false },
    }),
  );
  assert.equal(claudeBgFail.qualified, false);

  // Separate Kilo variants: modern pass does not qualify legacy and vice versa
  const kiloModernPass = core.qualifyCandidateAdapter(
    validProbe({ client: "kilo-modern", variant: "modern", version: "1.0.0", versionRange: ">=1.0.0 <2.0.0" }),
  );
  assert.equal(kiloModernPass.qualified, true);
  assert.equal(
    core.qualifyCandidateAdapter(
      validProbe({ client: "kilo-modern", variant: "legacy", version: "1.0.0", versionRange: ">=1.0.0 <2.0.0" }),
    ).qualified,
    false,
  );
  assert.equal(
    core.qualifyCandidateAdapter(
      validProbe({ client: "kilo-legacy", variant: "modern", version: "1.0.0", versionRange: ">=1.0.0 <2.0.0" }),
    ).qualified,
    false,
  );

  // Herdr fallback requires full orchestrator fresh-pane and old-process stop proof
  const herdrPass = core.qualifyCandidateAdapter(
    validProbe({
      interaction: {
        route: "herdr-fallback",
        herdrAvailable: true,
        orchestratorCreatedFreshPane: true,
        perPaneApprovalRequired: false,
        operatorSetupRequired: false,
        sameSessionAttachmentOrResumeVerified: true,
        oldProcessStoppedBeforeResume: true,
        noDuplicateWorkerOrReplay: true,
        preservesOnFailure: true,
      },
    }),
  );
  assert.equal(herdrPass.qualified, true);
  assert.equal(herdrPass.herdrRequired, true);

  for (const badOverride of [
    { operationalReadinessOnly: true },
    { surface: "chat-only" },
    { client: "grok-bot" },
    { version: "0.20.0" },
    { firstPartyDocsVerified: false },
    { credentialsMetadataOnly: false },
    { writesRealHome: true },
    { scratchStateRoot: "/workspace/repo/scratch" },
    { roles: ["implementer"] },
    { controls: { ...validProbe().controls, prohibitMultiplexers: false } },
    { controls: { ...validProbe().controls, prohibitReviewerWrites: false } },
    { controls: { ...validProbe().controls, paneScrapingFallback: true } },
    { controls: { ...validProbe().controls, reviewerWriteEscalation: true } },
    { interaction: { route: "native-cli", nativeSameSessionVerified: false, preservesHumanWait: true } },
    { interaction: { route: "herdr-fallback", herdrAvailable: true, orchestratorCreatedFreshPane: false } },
  ]) {
    assert.equal(core.qualifyCandidateAdapter(validProbe(badOverride)).qualified, false);
  }
});

test("replacementReadiness stops for operator disposition if no candidate qualifies for both implementation and review", () => {
  const allUnsupported = Object.fromEntries(
    core.DESIGN_CANDIDATES.map((c) => [
      c,
      {
        client: c,
        variant: c === "kilo-modern" ? "modern" : c === "kilo-legacy" ? "legacy" : "default",
        status: "unsupported",
        supported: false,
        roles: [],
      },
    ]),
  );
  const unready = core.replacementReadiness({ records: allUnsupported });
  assert.equal(unready.ready, false);
  assert.equal(unready.action, "operator-disposition");
  assert.equal(unready.retireLegacyRoutes, false);
  assert.equal(unready.shipHermesProfilePreparation, false);
  assert.equal(unready.bootstrapExceptionExpired, false);
});

test("bootstrapSupervisorDecision admits only initial task 3.1 with an independent supervisor and expires once an adapter qualifies", () => {
  const base = {
    task: "3.1",
    role: "implementer",
    authority: {
      freshPlanReviewVerified: true,
      planApproved: true,
      plan: "a".repeat(40),
      planDigest: "b".repeat(64),
      task3ExecutionReference: "retained:task-3-grant",
    },
    supervisor: {
      id: "bootstrap-supervisor-1",
      independentOfCandidateCode: true,
      usesCandidateCode: false,
      selfAttested: false,
      reusesHistoricalGroup2Session: false,
      budget: { maxAttempts: 2, timeoutSeconds: 600, stopCondition: "Stop on any failed control or gate" },
    },
    request: {
      requestSha256: "c".repeat(64),
      workspace: "/synthetic/worktree",
      client: "claude-code",
      version: "2.1.327",
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      session: "bootstrap-impl-1",
      implementerSession: null,
    },
    floor: {
      nonArgvTransport: "stdin",
      implementerScopeEnforced: true,
      reviewerReadOnly: true,
      supervisorOnlyPublication: true,
      coreVerificationRequired: true,
      freshLiteralVerdictRequired: true,
      interactionRoute: "native-cli",
    },
    qualifiedAdapters: [],
  };

  const admitted = core.bootstrapSupervisorDecision(base);
  assert.equal(admitted.allowed, true);
  assert.equal(admitted.expired, false);
  assert.equal(admitted.advertisedAsSupported, false);
  assert.equal(admitted.establishesQualification, false);

  // Expires immediately when at least one adapter qualifies
  const expired = core.bootstrapSupervisorDecision({ ...base, qualifiedAdapters: ["hermes"] });
  assert.equal(expired.allowed, false);
  assert.equal(expired.expired, true);

  // Refuses other tasks, candidate-code self-attestation, historical session reuse, and missing floor controls
  for (const override of [
    { task: "2.1" },
    { task: "4.1" },
    { role: "orchestrator" },
    { authority: { ...base.authority, task3ExecutionReference: "" } },
    { supervisor: { ...base.supervisor, independentOfCandidateCode: false } },
    { supervisor: { ...base.supervisor, usesCandidateCode: true } },
    { supervisor: { ...base.supervisor, selfAttested: true } },
    { supervisor: { ...base.supervisor, reusesHistoricalGroup2Session: true } },
    { request: { ...base.request, client: "grok-cli" } },
    { request: { ...base.request, client: "grok-bot" } },
    { role: "reviewer", request: { ...base.request, implementerSession: "bootstrap-impl-1", session: "bootstrap-impl-1" } },
    { floor: { ...base.floor, supervisorOnlyPublication: false } },
    { floor: { ...base.floor, nonArgvTransport: "argv" } },
  ]) {
    assert.equal(core.bootstrapSupervisorDecision({ ...base, ...override }).allowed, false);
  }
});

test("resolveRoleConfiguration enforces precedence, one-client sequential sessions, model-diversity options, and Hermes vs external CLI boundaries", () => {
  const readback = (overrides = {}) => ({
    verified: true,
    credentialsRead: false,
    aliasOnly: false,
    entitlementOnly: false,
    globalDefaultsModified: false,
    client: "codex",
    version: "0.169.0",
    provider: "openai",
    model: "gpt-5.4",
    session: "worker-session-1",
    usesHermesProfile: false,
    ...overrides,
  });

  // Precedence: per-run override beats project default and client default
  const resolved = core.resolveRoleConfiguration({
    role: "implementer",
    orchestratorSession: "orch-1",
    session: "worker-session-1",
    perRunOverride: { client: "codex", provider: "openai", model: "gpt-5.4" },
    projectDefault: { client: "claude-code", provider: "anthropic", model: "claude-sonnet-4-6" },
    clientDefault: { client: "hermes", provider: "nous", model: "gemini-4-argon", profile: "hermes-dev-exec", cliMode: "cli" },
    effectiveReadback: readback(),
  });
  assert.equal(resolved.action, "bound");
  assert.equal(resolved.configurationSource, "per-run-override");
  assert.equal(resolved.configurationScope, "launch-scoped");
  assert.equal(resolved.usesHermesProfile, false);
  assert.equal(resolved.herdrRequired, false);

  // One-client sequential workflow with same model allowed by default, refused only if project requires distinct models
  const sameModelReview = core.resolveRoleConfiguration({
    role: "reviewer",
    orchestratorSession: "orch-1",
    implementerSession: "worker-session-1",
    session: "reviewer-session-2",
    projectDefault: { client: "codex", provider: "openai", model: "gpt-5.4" },
    effectiveReadback: readback({ session: "reviewer-session-2" }),
  });
  assert.equal(sameModelReview.action, "bound");
  assert.equal(sameModelReview.readOnly, true);

  const distinctRequired = core.resolveRoleConfiguration({
    role: "reviewer",
    orchestratorSession: "orch-1",
    implementerSession: "worker-session-1",
    session: "reviewer-session-2",
    projectDefault: { client: "codex", provider: "openai", model: "gpt-5.4" },
    restrictions: { requireDistinctModels: true, implementerModel: "gpt-5.4" },
    effectiveReadback: readback({ session: "reviewer-session-2" }),
  });
  assert.equal(distinctRequired.action, "stop");

  // External CLI claiming Hermes profile is rejected; unqualified client is rejected without fallback
  assert.equal(
    core.resolveRoleConfiguration({
      role: "implementer",
      orchestratorSession: "orch-1",
      session: "worker-session-1",
      projectDefault: { client: "codex", provider: "openai", model: "gpt-5.4", usesHermesProfile: true },
      effectiveReadback: readback(),
    }).action,
    "stop",
  );
  assert.equal(
    core.resolveRoleConfiguration({
      role: "implementer",
      orchestratorSession: "orch-1",
      session: "worker-session-1",
      projectDefault: { client: "opencode", provider: "openai", model: "gpt-5.4" },
      effectiveReadback: readback({ client: "opencode" }),
    }).action,
    "stop",
  );

  // Hermes declarative frontmatter cannot select profile implicitly
  assert.equal(
    core.resolveRoleConfiguration({
      role: "implementer",
      orchestratorSession: "orch-1",
      session: "worker-session-1",
      projectDefault: { client: "hermes", provider: "nous", model: "gemini-4-argon", profile: "hermes-dev-exec", cliMode: "cli" },
      hermesFrontmatter: { selectsProfileImplicitly: true },
      effectiveReadback: readback({ client: "hermes", version: "0.23.2", provider: "nous", model: "gemini-4-argon" }),
    }).action,
    "stop",
  );
});

test("verifyHermesProfilePreparation ships only when Hermes qualifies and two-process readbacks match", () => {
  const readbacks = {
    "auxiliary.background_review.enabled": { json: false, raw: false },
    "curator.enabled": { json: false, raw: false },
    "curator.consolidate": { json: false, raw: false },
    "skills.write_approval": { json: true, raw: true },
    "memory.write_approval": { json: true, raw: true },
    "display.busy_input_mode": { json: "queue", raw: "queue" },
    "model.default": { json: "grok-4.7", raw: "grok-4.7" },
    "model.provider": { json: "xai-oauth", raw: "xai-oauth" },
  };
  const ok = core.verifyHermesProfilePreparation({
    hermesQualified: true,
    grantReference: "retained:profile-prep-grant",
    profile: "hermes-dev-review",
    readbacks,
  });
  assert.equal(ok.verified, true);
  assert.throws(() =>
    core.verifyHermesProfilePreparation({
      hermesQualified: false,
      grantReference: "retained:profile-prep-grant",
      profile: "hermes-dev-review",
      readbacks,
    }),
  );
  assert.throws(() =>
    core.verifyHermesProfilePreparation({
      hermesQualified: true,
      grantReference: "retained:profile-prep-grant",
      profile: "hermes-dev-review",
      readbacks,
      livePaneSlashInjected: true,
    }),
  );
});

test("preparePromptTransport uses non-argv routes for all four qualified clients, never retries oversized payloads, and retries transient failures at most once", () => {
  const prompt = "A".repeat(8192);
  for (const [client, version, expectedRoute] of [
    ["hermes", "0.23.2", "query-file"],
    ["claude-code", "2.1.327", "stdin"],
    ["codex", "0.169.0", "stdin"],
    ["grok-build", "1.0.89", "prompt-file"],
  ]) {
    const t = core.preparePromptTransport({
      client,
      version,
      role: "reviewer",
      session: "rev-1",
      workspace: "/synthetic/worktree",
      prompt,
      captureDir: "/tmp/transport-captures",
    });
    assert.equal(t.action, "ready");
    assert.equal(t.route, expectedRoute);
    assert.equal(t.exceededSafeArgv, true);
    assert.ok(!t.argv.includes(prompt), `${client} leaked prompt into argv`);
  }

  const oversized = core.preparePromptTransport({
    client: "claude-code",
    version: "2.1.327",
    role: "reviewer",
    session: "rev-1",
    workspace: "/synthetic/worktree",
    prompt,
    captureDir: "/tmp/transport-captures",
    maxPayloadBytes: 1024,
  });
  assert.equal(oversized.action, "stop");
  assert.equal(oversized.retryAllowed, false);

  const retryOnce = core.preparePromptTransport({
    client: "codex",
    version: "0.169.0",
    role: "implementer",
    session: "impl-1",
    workspace: "/synthetic/worktree",
    prompt: "Short assignment",
    captureDir: "/tmp/transport-captures",
    failure: { transient: true, priorRetries: 0 },
  });
  assert.equal(retryOnce.action, "retry-once");
  assert.equal(retryOnce.retryAllowed, true);

  const exhausted = core.preparePromptTransport({
    client: "codex",
    version: "0.169.0",
    role: "implementer",
    session: "impl-1",
    workspace: "/synthetic/worktree",
    prompt: "Short assignment",
    captureDir: "/tmp/transport-captures",
    failure: { transient: true, priorRetries: 1 },
  });
  assert.equal(exhausted.action, "stop");
  assert.equal(exhausted.retryAllowed, false);
});

test("supervision, process-boundary violations, interaction exposure, view cleanup, and legacy route retirement obey all safety guards", () => {
  const proc = { session: "w-1", pid: 4242, startIdentity: "boot-1", treeIdentity: "tree-4242" };
  const launched = core.superviseWorkerLaunch({
    adapter: "hermes",
    role: "implementer",
    workspace: "/synthetic/worktree",
    ...proc,
    scratchRoot: "/tmp/worker-scratch",
    herdrEnvPresent: true,
  });
  assert.equal(launched.terminalFirst, true);
  assert.equal(launched.herdrForcedByEnv, false);

  // Violation with verified readback stops process tree and preserves scratchRoot as evidence
  const violation = core.handleWorkerStopOrViolation({
    role: "reviewer",
    reason: "violation",
    violation: "reviewer-write-escalation",
    process: proc,
    scratchRoot: "/tmp/worker-scratch",
    identityReadback: { verified: true, immediate: true, process: proc },
  });
  assert.equal(violation.action, "violation-stopped");
  assert.equal(violation.stoppedProcessTree, true);
  assert.equal(violation.cleanedScratchRoot, false);
  assert.equal(violation.preserveScratchRoot, true);
  assert.equal(violation.verdictAccepted, false);

  // Failed identity readback preserves both process tree and scratchRoot
  const unverified = core.handleWorkerStopOrViolation({
    role: "implementer",
    reason: "budget-exhausted",
    process: proc,
    scratchRoot: "/tmp/worker-scratch",
    identityReadback: { verified: false, immediate: true, process: proc },
  });
  assert.equal(unverified.action, "preserve-unverified");
  assert.equal(unverified.stoppedProcessTree, false);
  assert.equal(unverified.cleanedScratchRoot, false);

  // Automatic same-session interaction exposure (native-cli and herdr-fallback resume)
  const nativeWait = core.exposeOperatorInteraction({
    attempt: "att-1",
    session: "w-1",
    role: "implementer",
    boundRoute: "native-cli",
    nativeSurface: { available: true, sameSessionVerified: true, session: "w-1", viewId: "tty-1" },
    decision: "pending",
  });
  assert.equal(nativeWait.action, "wait-for-operator");
  assert.equal(nativeWait.chatNotificationSent, false);
  assert.equal(nativeWait.cardAnsweredByAdapter, false);

  const herdrResumeApproved = core.exposeOperatorInteraction({
    attempt: "att-1",
    session: "w-1",
    role: "implementer",
    boundRoute: "herdr-fallback",
    herdrFallback: {
      herdrAvailable: true,
      freshPaneCreated: true,
      perPaneApprovalRequired: false,
      operatorSetupRequired: false,
      paneId: "w1G:p9",
      mode: "resume",
      previousProcessStopped: true,
      oldPid: 4242,
      newPid: 4343,
      sameLogicalSessionVerified: true,
      pendingDecisionPreserved: true,
      concurrentWorker: false,
      taskReplayed: false,
      historicalPaneReused: false,
      session: "w-1",
    },
    decision: "approved",
  });
  assert.equal(herdrResumeApproved.action, "resume-attempt");
  assert.equal(herdrResumeApproved.lifecycleEvents.length, 2);

  // Owned interaction view cleanup
  assert.equal(
    core.cleanupInteractionView({
      viewId: "w1G:p9",
      orchestratorViewId: "w1G:p2",
      ownedByAdapter: true,
      preExistingView: false,
      activeWorkerSession: false,
      identityVerified: true,
      immediate: true,
      operatorInputPresent: false,
    }).removed,
    true,
  );
  assert.equal(
    core.cleanupInteractionView({
      viewId: "w1G:p2",
      orchestratorViewId: "w1G:p2",
      ownedByAdapter: true,
      identityVerified: true,
      immediate: true,
    }).removed,
    false,
  );

  // Retired routes
  const retiredClaude = core.resolveLegacyRouteRequest({ route: "code-tab-phase-roles" });
  assert.equal(retiredClaude.status, "retired-route");
  assert.equal(retiredClaude.redirectAdapter, "claude-code");
  assert.equal(retiredClaude.modifiedInstalledAgents, false);

  const withoutClaude = { ...core.CANDIDATE_RECORDS, "claude-code": { ...core.CANDIDATE_RECORDS["claude-code"], status: "unsupported", supported: false, roles: [] } };
  const retiredNoClaude = core.resolveLegacyRouteRequest({ route: "code-tab-phase-roles", records: withoutClaude });
  assert.equal(retiredNoClaude.claudeCodeSupported, false);
  assert.equal(retiredNoClaude.redirectAdapter, null);

  const retiredHerdr = core.resolveLegacyRouteRequest({ route: "herdr-pane-dispatch", herdrEnvPresent: true });
  assert.equal(retiredHerdr.status, "retired-route");
  assert.equal(retiredHerdr.herdrRole, "interaction-fallback-only");
  assert.equal(retiredHerdr.herdrForcedByEnv, false);
});

test("executeTerminalAdapterAttempt proves non-argv delivery, protected request/evidence files, persistent turn-end, and resolved native waits", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "terminal-adapter-exec-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = path.join(root, "worktree");
  const profile = path.join(root, "profile");
  const scratchRoot = path.join(root, "scratch");
  await Promise.all([workspace, profile, scratchRoot].map((p) => mkdir(p, { recursive: true })));

  const inputs = Object.fromEntries(
    ["openspec/config.yaml", ...[".openspec.yaml", "proposal.md", "tasks.md", "specs/a/spec.md"].map((p) => `openspec/changes/fixture-change/${p}`)].map((p) => [p, "a".repeat(64)]),
  );
  const request = {
    schemaVersion: 1,
    identity: {
      attempt: "attempt-review-1",
      predecessor: null,
      role: "reviewer",
      change: "fixture-change",
      group: "3",
      task: "3.1",
      action: "3.1",
      workspace,
      plan: "a".repeat(40),
      planDigest: "b".repeat(64),
      candidate: "c".repeat(40),
      inputs,
      implementerSession: "impl-session-1",
    },
    outcome: "Review terminal worker adapters",
    acceptance: ["Focused adapter tests pass"],
    scope: ["skills/autonomous-ai-agents/autonomous-implementation-review/scripts/terminal-adapters.mjs"],
    nonGoals: ["remote publication"],
    authority: {
      orchestrator: "orch-1",
      writer: "orch-1",
      authorSession: "author-1",
      approvalReference: "retained:approval",
      executionReference: "retained:exec",
    },
    restrictions: ["no Git writes", "no tasks.md writes", "no profile writes", "no subagents", "no multiplexers", "read-only"],
    budget: { limit: 2, unit: "cycles" },
    stop: "Stop on failed gate",
    evidenceRoots: [path.join(root, "attempt-1")],
    requiredEvidence: ["native.txt", "lifecycle.jsonl", "turn.json"],
    mutablePaths: [],
  };
  const runtime = {
    adapter: "grok-build",
    client: "grok-build",
    version: "1.0.89",
    session: "rev-session-1",
    provider: "xai",
    model: "grok-4.7",
    configurationSource: "per-run-override",
    configurationScope: "launch-scoped",
    readOnly: true,
  };

  // Worker script verifies it received the prompt via prompt-file (not argv), confirms request.md is read-only (0400), and emits Verdict: No findings
  const workerScript = path.join(scratchRoot, "synthetic-worker.mjs");
  await writeFile(
    workerScript,
    [
      'import { readFileSync, writeFileSync } from "node:fs";',
      'import path from "node:path";',
      'const reqPath = path.join(process.env.WORKER_ATTEMPT_DIR, "request.md");',
      'let blockedWrite = false;',
      'try { writeFileSync(reqPath, "tamper"); } catch { blockedWrite = true; }',
      'if (!blockedWrite) process.exit(2);',
      'const prompt = readFileSync(process.env.WORKER_PROMPT_FILE, "utf8");',
      'if (!prompt.includes("Assignment attempt-review-1")) process.exit(3);',
      'process.stdout.write("Reviewed candidate.\\nVerdict: No findings\\n");',
    ].join("\n"),
  );

  const run = await core.executeTerminalAdapterAttempt({
    directory: path.join(root, "attempt-1"),
    request,
    excludedRoots: [workspace, profile],
    runtime,
    scratchRoot,
    command: process.execPath,
    args: [workerScript],
    transportRoute: "prompt-file",
    completionKind: "turn-end",
    turnId: "turn-42",
    humanWait: {
      boundRoute: "native-cli",
      promptKind: "approval",
      nativeSurface: { available: true, sameSessionVerified: true, session: "rev-session-1", viewId: "tty-rev-1" },
      decision: "approved",
    },
  });

  assert.equal(run.admitted.executionCompleted, true);
  assert.equal(run.admitted.result.verdict, "no_findings");
  assert.equal(run.admitted.result.nativeVerdict, "Verdict: No findings");
  assert.equal(run.admitted.result.completion.kind, "turn-end");
  for (const f of ["request.md", "report.md", "native.txt", "lifecycle.jsonl", "turn.json", "result.json"]) {
    const st = await stat(path.join(root, "attempt-1", f));
    assert.equal(st.mode & 0o222, 0, `${f} must be sealed 0400`);
    await chmod(path.join(root, "attempt-1", f), 0o400);
  }
});
