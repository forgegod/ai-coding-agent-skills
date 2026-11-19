// Qualified terminal worker adapter checks, role/model bindings, non-argv prompt
// transport, process supervision, same-session human interaction, bootstrap
// exception admission/expiry, and legacy-route migration.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createAttempt, publishResult, readHandoff } from "./worker-handoff.mjs";

const need = (ok, message) => { if (!ok) throw new Error(message); };
const text = (v) => typeof v === "string" && v.trim().length > 0;
const list = (v) => Array.isArray(v) && v.length > 0 && v.every(text);
const sha = (v) => typeof v === "string" && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(v);
const digest = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const absolute = (p) => { need(text(p) && path.isAbsolute(p) && path.normalize(p) === p, "Unsafe absolute path"); return p; };
const within = (root, target) => target === root || (!path.relative(root, target).startsWith(`..${path.sep}`) && path.relative(root, target) !== ".." && !path.isAbsolute(path.relative(root, target)));

function parseSemver(v) {
  const m = typeof v === "string" ? v.trim().match(/^v?(\d+)\.(\d+)\.(\d+)/) : null;
  need(Boolean(m), `Invalid semantic version: ${v}`);
  return m.slice(1, 4).map(Number);
}
function compareSemver(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}
export function versionInRange(version, range) {
  if (!text(version) || !text(range)) return false;
  let actual;
  try { actual = parseSemver(version); } catch { return false; }
  for (const token of range.trim().split(/\s+/)) {
    const m = token.match(/^(>=|<=|>|<|=)?(\d+\.\d+\.\d+)$/);
    if (!m) return false;
    const op = m[1] ?? "=";
    const bound = parseSemver(m[2]);
    const cmp = compareSemver(actual, bound);
    if ((op === ">=" && cmp < 0) || (op === ">" && cmp <= 0) || (op === "<=" && cmp > 0) || (op === "<" && cmp >= 0) || (op === "=" && cmp !== 0)) return false;
  }
  return true;
}

export const DESIGN_CANDIDATES = Object.freeze([
  "hermes", "claude-code", "codex", "grok-build", "opencode", "kilo-modern", "kilo-legacy", "pi",
]);

const PROBE_MANIFEST_SHA256 = "62c09733f74a1d0a47660a64b2fcfcd9765cf5e644f5fd42e931f2cd321b2d6e";
const PROBE_SUMS_SHA256 = "0cf10b2cca356992ad3d7f3c777a697a70f4b3314c89b2d69ad8048b5353d547";

const BASE_QUALIFIED_CONTROLS = Object.freeze({
  prohibitMultiplexers: true,
  prohibitImplementerSubagents: true,
  prohibitReviewerSubagents: true,
  prohibitReviewerWrites: true,
  terminalFirstLaunch: true,
  effectiveIdentityVerified: true,
  artifactHandoffVerified: true,
});

export const CANDIDATE_RECORDS = Object.freeze({
  hermes: Object.freeze({
    client: "hermes", variant: "default", status: "qualified", supported: true,
    observedVersion: "0.23.2", versionRange: ">=0.23.0 <1.0.0",
    probeManifestSha256: PROBE_MANIFEST_SHA256, probeSumsSha256: PROBE_SUMS_SHA256,
    evidenceFiles: Object.freeze(["hermes-version", "hermes-chat-help"]),
    isolatedScratchRootVerified: true, credentialsMetadataOnly: true,
    roles: Object.freeze(["implementer", "reviewer", "approach-reviewer"]),
    nonArgvTransport: Object.freeze(["query-file", "stdin"]), profilePreparationSupported: true,
    interactionRoutes: Object.freeze(["native-cli", "herdr-fallback"]),
    controls: BASE_QUALIFIED_CONTROLS,
  }),
  "claude-code": Object.freeze({
    client: "claude-code", variant: "standalone-cli", status: "qualified", supported: true,
    observedVersion: "2.1.327", versionRange: ">=2.1.273 <3.0.0",
    probeManifestSha256: PROBE_MANIFEST_SHA256, probeSumsSha256: PROBE_SUMS_SHA256,
    evidenceFiles: Object.freeze(["claude-code-version", "claude-code-help"]),
    isolatedScratchRootVerified: true, credentialsMetadataOnly: true,
    roles: Object.freeze(["implementer", "reviewer", "approach-reviewer"]),
    nonArgvTransport: Object.freeze(["stdin"]), profilePreparationSupported: false,
    interactionRoutes: Object.freeze(["native-cli", "herdr-fallback"]), retiresLegacyRoute: "code-tab-phase-roles",
    controls: Object.freeze({ ...BASE_QUALIFIED_CONTROLS, excludesBackgroundAutoRespawn: true }),
  }),
  codex: Object.freeze({
    client: "codex", variant: "default", status: "qualified", supported: true,
    observedVersion: "0.169.0", versionRange: ">=0.167.0 <1.0.0",
    probeManifestSha256: PROBE_MANIFEST_SHA256, probeSumsSha256: PROBE_SUMS_SHA256,
    evidenceFiles: Object.freeze(["codex-version", "codex-help", "codex-exec-help", "codex-resume-help"]),
    isolatedScratchRootVerified: true, credentialsMetadataOnly: true,
    roles: Object.freeze(["implementer", "reviewer", "approach-reviewer"]),
    nonArgvTransport: Object.freeze(["stdin"]), profilePreparationSupported: false,
    interactionRoutes: Object.freeze(["native-cli", "herdr-fallback"]),
    controls: Object.freeze({ ...BASE_QUALIFIED_CONTROLS, preservesBuiltinProviderNamespace: true }),
  }),
  "grok-build": Object.freeze({
    client: "grok-build", variant: "default", status: "qualified", supported: true,
    observedVersion: "1.0.89", versionRange: ">=1.0.89 <2.0.0",
    probeManifestSha256: PROBE_MANIFEST_SHA256, probeSumsSha256: PROBE_SUMS_SHA256,
    evidenceFiles: Object.freeze(["grok-build-version", "grok-build-help", "grok-build-agent-help"]),
    isolatedScratchRootVerified: true, credentialsMetadataOnly: true,
    roles: Object.freeze(["implementer", "reviewer", "approach-reviewer"]),
    nonArgvTransport: Object.freeze(["prompt-file"]), profilePreparationSupported: false,
    interactionRoutes: Object.freeze(["native-cli", "herdr-fallback"]),
    controls: BASE_QUALIFIED_CONTROLS,
  }),
  opencode: Object.freeze({
    client: "opencode", variant: "default", status: "unsupported", supported: false,
    observedVersion: null, versionRange: null, roles: Object.freeze([]), nonArgvTransport: Object.freeze([]),
    profilePreparationSupported: false, interactionRoutes: Object.freeze([]),
    reason: "Executable opencode is not installed in the verification environment",
  }),
  "kilo-modern": Object.freeze({
    client: "kilo-modern", variant: "modern", status: "unsupported", supported: false,
    observedVersion: null, versionRange: null, roles: Object.freeze([]), nonArgvTransport: Object.freeze([]),
    profilePreparationSupported: false, interactionRoutes: Object.freeze([]),
    reason: "Independent modern variant (.kilo) is not installed in the verification environment",
  }),
  "kilo-legacy": Object.freeze({
    client: "kilo-legacy", variant: "legacy", status: "unsupported", supported: false,
    observedVersion: null, versionRange: null, roles: Object.freeze([]), nonArgvTransport: Object.freeze([]),
    profilePreparationSupported: false, interactionRoutes: Object.freeze([]),
    reason: "Independent legacy variant (.kilocode) is not installed in the verification environment",
  }),
  pi: Object.freeze({
    client: "pi", variant: "default", status: "unsupported", supported: false,
    observedVersion: null, versionRange: null, roles: Object.freeze([]), nonArgvTransport: Object.freeze([]),
    profilePreparationSupported: false, interactionRoutes: Object.freeze([]),
    reason: "Executable pi is not installed in the verification environment",
  }),
  "grok-bot": Object.freeze({
    client: "grok-bot", variant: "chat-only", status: "unsupported", supported: false,
    observedVersion: null, versionRange: null, roles: Object.freeze([]), nonArgvTransport: Object.freeze([]),
    profilePreparationSupported: false, interactionRoutes: Object.freeze([]),
    reason: "Chat-only surface / imported settings lack a local CLI execution or session control protocol",
  }),
});

export function isRecordQualified(record, expectedClient = null) {
  if (!record || typeof record !== "object") return false;
  if (expectedClient !== null && record.client !== expectedClient) return false;
  if (record.status !== "qualified" || record.supported !== true) return false;
  if (!digest(record.probeManifestSha256) || !digest(record.probeSumsSha256)) return false;
  if (!list(record.evidenceFiles) || record.isolatedScratchRootVerified !== true || record.credentialsMetadataOnly !== true) return false;
  if (!versionInRange(record.observedVersion, record.versionRange)) return false;
  if (!Array.isArray(record.roles) || !record.roles.includes("implementer") || !record.roles.includes("reviewer")) return false;
  if (!list(record.nonArgvTransport) || !record.nonArgvTransport.every((r) => ["stdin", "prompt-file", "query-file"].includes(r))) return false;
  if (record.client === "claude-code" && record.nonArgvTransport.includes("prompt-file")) return false;
  if (!list(record.interactionRoutes) || !record.interactionRoutes.every((r) => ["native-cli", "herdr-fallback"].includes(r))) return false;
  const c = record.controls;
  if (!c || c.prohibitMultiplexers !== true || c.prohibitImplementerSubagents !== true ||
      c.prohibitReviewerSubagents !== true || c.prohibitReviewerWrites !== true ||
      c.terminalFirstLaunch !== true || c.effectiveIdentityVerified !== true ||
      c.artifactHandoffVerified !== true) return false;
  if (record.client === "claude-code" && c.excludesBackgroundAutoRespawn !== true) return false;
  return true;
}

export function qualifyCandidateAdapter(probe) {
  const fail = (reason) => ({
    qualified: false, supported: false, status: "unsupported",
    client: probe?.client ?? null, variant: probe?.variant ?? null, version: probe?.version ?? null,
    roles: [], interactionRoute: null, herdrRequired: false, profilePreparationAllowed: false, reason,
  });
  if (!probe || !text(probe.client) || !text(probe.variant)) return fail("Missing candidate client or variant");
  if (probe.surface === "chat-only" || probe.client === "grok-bot") return fail("Chat-only surface cannot qualify as a terminal worker");
  if (probe.operationalReadinessOnly === true) return fail("Operational readiness alone is not adapter qualification");
  if ((probe.client === "kilo-modern" && probe.variant !== "modern") || (probe.client === "kilo-legacy" && probe.variant !== "legacy")) {
    return fail("Kilo modern and legacy variants must be evaluated independently");
  }
  if (probe.firstPartyDocsVerified !== true || !text(probe.versionRange) || !versionInRange(probe.version, probe.versionRange)) {
    return fail("Missing first-party interface evidence or version outside qualified range");
  }
  if (!text(probe.scratchStateRoot) || !path.isAbsolute(probe.scratchStateRoot) || probe.credentialsMetadataOnly !== true || probe.writesRealHome !== false) {
    return fail("Probe must use an isolated scratch state root and metadata-only credential checks");
  }
  if (Array.isArray(probe.excludedRoots) && probe.excludedRoots.some((r) => text(r) && path.isAbsolute(r) && (within(r, probe.scratchStateRoot) || within(probe.scratchStateRoot, r)))) {
    return fail("Scratch state root overlaps repository or shared profile root");
  }
  const c = probe.controls;
  if (!c || c.prohibitMultiplexers !== true || c.prohibitImplementerSubagents !== true ||
      c.prohibitReviewerSubagents !== true || c.prohibitReviewerWrites !== true ||
      !["stdin", "prompt-file", "query-file"].includes(c.nonArgvTransport) ||
      (probe.client === "claude-code" && c.nonArgvTransport !== "stdin") ||
      c.terminalFirstLaunch !== true || c.effectiveIdentityVerified !== true ||
      c.nativeFinalOutputCapture !== true || c.adapterOnlyPublication !== true ||
      c.atomicResultVisibility !== true || c.safeEvidencePaths !== true ||
      c.noPaneScrapingFallback !== true || c.paneScrapingFallback === true || c.reviewerWriteEscalation === true) {
    return fail("Missing required process, transport, read-only or artifact-first publisher controls");
  }
  if (probe.client === "claude-code" && c.excludesBackgroundAutoRespawn !== true) {
    return fail("Claude Code background auto-respawn violates the no-automatic-retry boundary");
  }
  const i = probe.interaction;
  let interactionRoute = null;
  let herdrRequired = false;
  if (i?.route === "native-cli") {
    if (i.nativeSameSessionVerified !== true || i.preservesHumanWait !== true) {
      return fail("Unverified native same-session human-input route");
    }
    interactionRoute = "native-cli";
    herdrRequired = false;
  } else if (i?.route === "herdr-fallback") {
    if (i.herdrAvailable !== true || i.orchestratorCreatedFreshPane !== true ||
        i.perPaneApprovalRequired !== false || i.operatorSetupRequired !== false ||
        i.sameSessionAttachmentOrResumeVerified !== true || i.oldProcessStoppedBeforeResume !== true ||
        i.noDuplicateWorkerOrReplay !== true || i.preservesOnFailure !== true) {
      return fail("Unverified Herdr same-session attachment/resume fallback");
    }
    interactionRoute = "herdr-fallback";
    herdrRequired = true;
  } else {
    return fail("Missing prequalified native same-session or Herdr fallback interaction route");
  }
  const roles = Array.isArray(probe.roles) && probe.roles.includes("implementer") && probe.roles.includes("reviewer")
    ? [...new Set(probe.roles)] : [];
  if (roles.length === 0) return fail("Adapter must support both implementer and fresh read-only reviewer");
  return {
    qualified: true, supported: true, status: "qualified",
    client: probe.client, variant: probe.variant, version: probe.version, versionRange: probe.versionRange,
    roles, nonArgvTransport: c.nonArgvTransport, interactionRoute, herdrRequired,
    profilePreparationAllowed: probe.client === "hermes", reason: null,
  };
}

export function replacementReadiness({ records = CANDIDATE_RECORDS } = {}) {
  need(records && typeof records === "object", "Missing candidate qualification records");
  for (const candidate of DESIGN_CANDIDATES) {
    const entry = records[candidate];
    need(entry && entry.client === candidate && ["qualified", "unsupported"].includes(entry.status) &&
      typeof entry.supported === "boolean" && (entry.status === "qualified") === entry.supported,
    `Missing or inconsistent qualification record for ${candidate}`);
    if (entry.status === "qualified") {
      need(isRecordQualified(entry, candidate), `Qualified record for ${candidate} lacks verified probe hash, version or launch-interface binding`);
    }
  }
  if (records["kilo-modern"]?.variant !== "modern" || records["kilo-legacy"]?.variant !== "legacy") {
    throw new Error("Kilo modern and legacy variants must retain separate records");
  }
  const qualifiedAdapters = DESIGN_CANDIDATES.filter((name) => isRecordQualified(records[name], name));
  const unsupportedCandidates = Object.keys(records).filter((name) => records[name]?.status === "unsupported");
  if (qualifiedAdapters.length === 0) {
    return {
      ready: false, action: "operator-disposition", qualifiedAdapters: [], unsupportedCandidates,
      retireLegacyRoutes: false, shipHermesProfilePreparation: false, bootstrapExceptionExpired: false,
    };
  }
  return {
    ready: true, action: "ready", qualifiedAdapters, unsupportedCandidates,
    retireLegacyRoutes: true, shipHermesProfilePreparation: qualifiedAdapters.includes("hermes"),
    bootstrapExceptionExpired: true,
  };
}

export function bootstrapSupervisorDecision({
  task, role, authority, supervisor, request, floor,
  records = CANDIDATE_RECORDS, qualifiedAdapters = null,
}) {
  const readiness = replacementReadiness({ records });
  const activeQualified = Array.isArray(qualifiedAdapters) ? qualifiedAdapters : readiness.qualifiedAdapters;
  const expired = readiness.ready || activeQualified.length > 0;
  const stop = (reason, extra = {}) => ({
    allowed: false, action: "stop", expired,
    advertisedAsSupported: false, establishesQualification: false, reason, ...extra,
  });
  if (expired) {
    return stop("Bootstrap exception expired once a qualified implementation/review adapter exists", { expired: true });
  }
  if (task !== "3.1" || !["implementer", "reviewer"].includes(role)) {
    return stop("Bootstrap exception applies only to initial task 3.1 implementation and fresh read-only review");
  }
  if (!authority || authority.freshPlanReviewVerified !== true || authority.planApproved !== true ||
      !sha(authority.plan) || !digest(authority.planDigest) || !text(authority.task3ExecutionReference)) {
    return stop("Missing fresh plan review, exact-plan approval or separate task-3 execution grant");
  }
  if (!supervisor || !text(supervisor.id) || supervisor.independentOfCandidateCode !== true ||
      supervisor.usesCandidateCode !== false || supervisor.selfAttested !== false ||
      supervisor.reusesHistoricalGroup2Session !== false ||
      !Number.isSafeInteger(supervisor.budget?.maxAttempts) || supervisor.budget.maxAttempts <= 0 ||
      !Number.isSafeInteger(supervisor.budget?.timeoutSeconds) || supervisor.budget.timeoutSeconds <= 0 ||
      !text(supervisor.budget?.stopCondition)) {
    return stop("Supervisor must be independent of candidate code with explicit false self-attestation/session-reuse flags and finite limits");
  }
  if (!request || !digest(request.requestSha256) || !text(request.workspace) || !path.isAbsolute(request.workspace) ||
      !text(request.client) || request.client === "grok-cli" || request.client === "grok-bot" ||
      !text(request.version) || !text(request.provider) || !text(request.model) || !text(request.session) ||
      (role === "reviewer" && (!text(request.implementerSession) || request.session === request.implementerSession))) {
    return stop("Missing or invalid bootstrap request, client/version/model or distinct session identity");
  }
  if (!floor || !["stdin", "prompt-file", "query-file"].includes(floor.nonArgvTransport) ||
      floor.implementerScopeEnforced !== true || floor.reviewerReadOnly !== true ||
      floor.supervisorOnlyPublication !== true || floor.coreVerificationRequired !== true ||
      floor.freshLiteralVerdictRequired !== true ||
      !["native-cli", "herdr-fallback"].includes(floor.interactionRoute)) {
    return stop("Bootstrap floor controls cannot be waived");
  }
  return {
    allowed: true, action: "launch-bootstrap-worker", expired: false,
    advertisedAsSupported: false, establishesQualification: false,
    role, client: request.client, version: request.version, session: request.session,
    supervisorId: supervisor.id, interactionRoute: floor.interactionRoute,
  };
}

export const HERMES_PROFILE_PREPARATION_KEYS = Object.freeze({
  "auxiliary.background_review.enabled": false,
  "curator.enabled": false,
  "curator.consolidate": false,
  "skills.write_approval": true,
  "memory.write_approval": true,
  "display.busy_input_mode": "queue",
});

export function verifyHermesProfilePreparation({
  hermesQualified = true, records = CANDIDATE_RECORDS, grantReference, profile, readbacks, livePaneSlashInjected = false,
}) {
  need(hermesQualified === true && isRecordQualified(records?.hermes, "hermes"), "Hermes profile preparation ships only when the Hermes adapter record is qualified");
  need(text(grantReference) && text(profile), "Missing separate profile-preparation grant or profile name");
  need(livePaneSlashInjected === false, "Do not inject /busy, /model or /status during role pane setup");
  need(readbacks && typeof readbacks === "object", "Missing two-process config readbacks");
  for (const [key, expected] of Object.entries(HERMES_PROFILE_PREPARATION_KEYS)) {
    const entry = readbacks[key];
    need(entry && entry.json === expected && entry.raw === expected, `Mismatched Hermes profile readback for ${key}`);
  }
  for (const key of ["model.default", "model.provider"]) {
    const entry = readbacks[key];
    need(entry && text(entry.json) && entry.json === entry.raw, `Missing or mismatched Hermes profile readback for ${key}`);
  }
  return {
    verified: true, profile, grantReference,
    model: readbacks["model.default"].json, provider: readbacks["model.provider"].json,
  };
}

export function resolveRoleConfiguration({
  role, orchestratorSession, implementerSession = null, session,
  perRunOverride = null, projectDefault = null, clientDefault = null,
  restrictions = {}, records = CANDIDATE_RECORDS, effectiveReadback,
  hermesFrontmatter = null,
}) {
  const stop = (reason) => ({ action: "stop", reason, fallbackUsed: false });
  if (!["orchestrator", "implementer", "reviewer", "approach-reviewer"].includes(role)) return stop("Invalid role");
  if (!text(session) || (role !== "orchestrator" && (!text(orchestratorSession) || session === orchestratorSession))) {
    return stop("Worker role requires a fresh session distinct from the orchestrator");
  }
  if (role === "reviewer" && (!text(implementerSession) || session === implementerSession)) {
    return stop("Reviewer session must be distinct from the implementer session");
  }
  const sources = [
    ["per-run-override", perRunOverride],
    ["project-default", projectDefault],
    ["client-default", clientDefault],
  ].filter(([, v]) => v !== null && v !== undefined);
  if (sources.length === 0) return stop("Missing role client/model configuration");
  if (perRunOverride && projectDefault && perRunOverride.contradictsAuthority === true) {
    return stop("Contradictory role configuration binding");
  }
  const [configurationSource, selected] = sources[0];
  if (!selected || !text(selected.client) || !text(selected.model) || !text(selected.provider)) {
    return stop("Incomplete role client/provider/model binding");
  }
  const record = records?.[selected.client];
  if (!isRecordQualified(record, selected.client)) {
    return stop(`Selected client ${selected.client} lacks a verified qualified adapter record; no fallback permitted`);
  }
  if (role !== "orchestrator" && (!Array.isArray(record.roles) || !record.roles.includes(role))) {
    return stop(`Client ${selected.client} is not qualified for role ${role}`);
  }
  if (Array.isArray(restrictions.allowedClients) && !restrictions.allowedClients.includes(selected.client)) {
    return stop("Selected client violates project client restrictions");
  }
  if (Array.isArray(restrictions.allowedModels) && !restrictions.allowedModels.includes(selected.model)) {
    return stop("Selected model violates project model restrictions");
  }
  if (Array.isArray(restrictions.allowedProviders) && !restrictions.allowedProviders.includes(selected.provider)) {
    return stop("Selected provider violates project provider restrictions");
  }
  if (restrictions.requireDistinctModels === true && role === "reviewer" && text(restrictions.implementerModel) &&
      selected.model === restrictions.implementerModel) {
    return stop("Project policy requires distinct implementer and reviewer models");
  }
  if (!effectiveReadback || effectiveReadback.verified !== true ||
      effectiveReadback.credentialsRead !== false || effectiveReadback.aliasOnly !== false ||
      effectiveReadback.entitlementOnly !== false || effectiveReadback.globalDefaultsModified !== false ||
      effectiveReadback.client !== selected.client || !versionInRange(effectiveReadback.version, record.versionRange) ||
      effectiveReadback.provider !== selected.provider || effectiveReadback.model !== selected.model ||
      effectiveReadback.session !== session) {
    return stop("Unverified or mismatched effective client/version/provider/model/session identity");
  }
  if (selected.client === "hermes") {
    if (!text(selected.profile) || !text(selected.cliMode) || hermesFrontmatter?.selectsProfileImplicitly === true) {
      return stop("Hermes role requires explicit launch-bound profile and CLI mode; frontmatter is declarative only");
    }
  } else if (selected.usesHermesProfile === true || effectiveReadback.usesHermesProfile === true) {
    return stop("External CLI role must not claim to use, configure or inherit a Hermes profile");
  }
  return {
    action: "bound",
    role,
    client: selected.client,
    version: effectiveReadback.version,
    provider: effectiveReadback.provider,
    model: effectiveReadback.model,
    session,
    configurationSource,
    configurationScope: "launch-scoped",
    readOnly: role !== "implementer" && role !== "orchestrator",
    usesHermesProfile: selected.client === "hermes",
    profile: selected.client === "hermes" ? selected.profile : null,
    herdrRequired: false,
    fallbackUsed: false,
  };
}

export function preparePromptTransport({
  client, version, role, session, workspace, prompt, captureDir,
  preferredRoute = null, safeArgvBytes = 4096, maxPayloadBytes = 8 * 1024 * 1024,
  failure = null, records = CANDIDATE_RECORDS,
}) {
  const record = records?.[client];
  need(isRecordQualified(record, client), `Client ${client} is not a verified qualified adapter`);
  need(versionInRange(version, record.versionRange), `Client ${client} version ${version} is outside ${record.versionRange}`);
  need(text(session) && ["implementer", "reviewer", "approach-reviewer"].includes(role), "Invalid role or session");
  absolute(workspace);
  absolute(captureDir);
  need(!within(workspace, captureDir) && !within(captureDir, workspace), "Transport captures must stay outside the repository");
  need(typeof prompt === "string" && prompt.length > 0, "Missing prompt payload");
  const bytes = Buffer.from(prompt, "utf8");
  const promptSha256 = hash(bytes);
  const route = preferredRoute ?? record.nonArgvTransport[0];
  need(record.nonArgvTransport.includes(route), `Unsupported non-argv prompt transport ${route} for ${client}`);
  if (bytes.length > maxPayloadBytes || failure?.oversized === true) {
    return {
      action: "stop", status: "host-block", reason: "Oversized prompt payload; retained and never retried",
      retryAllowed: false, maxRetries: 0, fallbackUsed: false,
      client, version, route, promptBytes: bytes.length, promptSha256,
    };
  }
  if (failure) {
    const priorRetries = Number.isSafeInteger(failure.priorRetries) ? failure.priorRetries : 0;
    if (failure.transient === true && priorRetries === 0) {
      return {
        action: "retry-once", status: "transient-failure",
        retryAllowed: true, maxRetries: 1, retryCount: 1, fallbackUsed: false,
        sameRoute: route, sameClient: client, sameSession: session,
        client, version, route, promptBytes: bytes.length, promptSha256,
      };
    }
    return {
      action: "stop", status: "host-block", reason: "Transport failure retained after permitted retry budget",
      retryAllowed: false, maxRetries: 1, fallbackUsed: false,
      client, version, route, promptBytes: bytes.length, promptSha256,
    };
  }
  const promptFilePath = route === "stdin" ? null : path.join(captureDir, "prompt.md");
  const stdoutPath = path.join(captureDir, "stdout.log");
  const stderrPath = path.join(captureDir, "stderr.log");
  const exitPath = path.join(captureDir, "exit.txt");
  const readOnly = role !== "implementer";
  let argv;
  if (client === "hermes") {
    argv = ["chat", "--query-file", route === "stdin" ? "-" : promptFilePath, "--oneshot", "--format", "stream-json", "--pass-session-id", "--in", workspace, "-t", readOnly ? "file" : "file,terminal"];
  } else if (client === "claude-code") {
    const disallowed = readOnly
      ? "Edit,Write,Bash,Task,Agent,NotebookEdit"
      : "Task,Agent,Bash(tmux *),Bash(screen *),Bash(zellij *),Bash(orca *),Bash(git commit*),Bash(git push*),Bash(git merge*)";
    argv = ["--print", "--output-format", "json", "--session-id", session, "--permission-mode", readOnly ? "plan" : "manual", "--tools", readOnly ? "Read,Glob,Grep" : "Read,Edit,Write,Glob,Grep,Bash", "--disallowed-tools", disallowed];
  } else if (client === "codex") {
    argv = ["exec", "-", "-C", workspace, "-s", readOnly ? "read-only" : "workspace-write", "--json", "-o", path.join(captureDir, "last-message.txt")];
  } else if (client === "grok-build") {
    const disallowed = readOnly ? "Edit,Write,Bash,Task,Agent" : "Task,Agent";
    argv = ["--prompt-file", promptFilePath, "--cwd", workspace, "-s", session, "--no-subagents", "--no-leader", "--output-format", "json", "--permission-mode", readOnly ? "plan" : "default", "--disallowed-tools", disallowed];
  }
  need(Array.isArray(argv) && !argv.includes(prompt), "Generated prompt must never be interpolated into argv");
  if (route === "stdin") {
    need(promptFilePath === null && bytes.length > 0, "stdin transport must carry non-empty stdinBytes without a promptFilePath");
  } else {
    need(text(promptFilePath) && argv.includes(promptFilePath), "File-based transport must bind promptFilePath in argv");
  }
  return {
    action: "ready",
    client, version, role, session, route,
    exceededSafeArgv: bytes.length > safeArgvBytes,
    promptBytes: bytes.length,
    promptSha256,
    promptFilePath,
    stdinBytes: route === "stdin" ? bytes : null,
    argv,
    captures: { stdoutPath, stderrPath, exitPath },
    retryAllowed: true,
    maxRetries: 1,
    fallbackUsed: false,
  };
}

export function superviseWorkerLaunch({
  adapter, role, workspace, session, pid, startIdentity, treeIdentity,
  scratchRoot, herdrEnvPresent = false, interactionRoute = "native-cli",
  delegatedSubagent = false, multiplexerStarted = false, records = CANDIDATE_RECORDS,
}) {
  const record = records?.[adapter];
  need(isRecordQualified(record, adapter), `Unqualified adapter ${adapter}`);
  need(["implementer", "reviewer", "approach-reviewer"].includes(role), "Invalid worker role");
  absolute(workspace);
  absolute(scratchRoot);
  need(!within(workspace, scratchRoot) && !within(scratchRoot, workspace), "Worker scratch must be outside the worktree");
  need(text(session) && Number.isSafeInteger(pid) && pid > 0 && text(startIdentity) && text(treeIdentity), "Missing worker process/session identity");
  need(delegatedSubagent === false && multiplexerStarted === false, "Subagents and worker-created multiplexers are prohibited");
  need(record.interactionRoutes.includes(interactionRoute), `Unsupported interaction route ${interactionRoute}`);
  return {
    launched: true,
    adapter,
    role,
    workspace,
    session,
    process: { session, pid, startIdentity, treeIdentity },
    scratchRoot,
    terminalFirst: true,
    herdrForcedByEnv: false,
    herdrEnvObserved: Boolean(herdrEnvPresent),
    interactionRoute,
    readOnly: role !== "implementer",
    prohibitions: ["tmux", "screen", "zellij", "orca", "delegate_task", "native-subagents", "git-writes", "tasks-writes"],
  };
}

export function handleWorkerStopOrViolation({
  role, reason, violation = null, process: proc, scratchRoot, identityReadback,
}) {
  need(proc && text(proc.session) && Number.isSafeInteger(proc.pid) && proc.pid > 0 && text(proc.startIdentity) && text(proc.treeIdentity), "Missing recorded process identity");
  absolute(scratchRoot);
  if (reason === "human-input-wait" && !violation) {
    return {
      action: "expose-interaction",
      stoppedProcessTree: false,
      cleanedScratchRoot: false,
      preserveProcess: true,
      preserveScratchRoot: true,
      verdictAccepted: false,
      evidenceAccepted: false,
    };
  }
  const verified = identityReadback?.verified === true && identityReadback.immediate === true &&
    identityReadback.process?.session === proc.session && identityReadback.process?.pid === proc.pid &&
    identityReadback.process?.startIdentity === proc.startIdentity &&
    identityReadback.process?.treeIdentity === proc.treeIdentity;
  if (!verified) {
    return {
      action: "preserve-unverified",
      reason: violation ? `violation:${violation}` : reason,
      stoppedProcessTree: false,
      cleanedScratchRoot: false,
      preserveProcess: true,
      preserveScratchRoot: true,
      verdictAccepted: false,
      evidenceAccepted: false,
      preservedPids: [proc.pid],
      preservedSession: proc.session,
      preservedScratchRoot: scratchRoot,
    };
  }
  if (violation) {
    return {
      action: "violation-stopped",
      role,
      violation,
      stoppedProcessTree: true,
      cleanedScratchRoot: false,
      preserveProcess: false,
      preserveScratchRoot: true,
      verdictAccepted: false,
      evidenceAccepted: false,
      preservedPids: [],
      preservedSession: proc.session,
      preservedScratchRoot: scratchRoot,
    };
  }
  return {
    action: "stopped-and-cleaned",
    role,
    reason,
    stoppedProcessTree: true,
    cleanedScratchRoot: true,
    preserveProcess: false,
    preserveScratchRoot: false,
    verdictAccepted: false,
    evidenceAccepted: false,
    preservedPids: [],
    preservedSession: proc.session,
    preservedScratchRoot: null,
  };
}

export function resolveLegacyRouteRequest({ route, records = CANDIDATE_RECORDS, herdrEnvPresent = false }) {
  const readiness = replacementReadiness({ records });
  if (!readiness.ready) {
    return {
      action: "operator-disposition",
      status: "replacement-unready",
      route,
      launched: false,
      reason: "Cannot retire legacy routes before at least one adapter qualifies for implementation and fresh review",
    };
  }
  if (route === "code-tab-phase-roles") {
    const claudeSupported = readiness.qualifiedAdapters.includes("claude-code");
    return {
      action: "stop",
      status: "retired-route",
      route: "code-tab-phase-roles",
      launched: false,
      fallbackLaunched: false,
      modifiedInstalledAgents: false,
      claudeCodeSupported: claudeSupported,
      redirectAdapter: claudeSupported ? "claude-code" : null,
      qualifiedAdapters: readiness.qualifiedAdapters,
    };
  }
  if (route === "herdr-pane-dispatch") {
    return {
      action: "stop",
      status: "retired-route",
      route: "herdr-pane-dispatch",
      launched: false,
      fallbackLaunched: false,
      paneReset: false,
      herdrForcedByEnv: false,
      herdrEnvObserved: Boolean(herdrEnvPresent),
      herdrRole: "interaction-fallback-only",
      qualifiedAdapters: readiness.qualifiedAdapters,
    };
  }
  throw new Error(`Unknown legacy route: ${route}`);
}

export function exposeOperatorInteraction({
  attempt, session, role, boundRoute, promptKind = "approval",
  nativeSurface = null, herdrFallback = null, decision = "pending",
}) {
  need(text(attempt) && text(session) && ["implementer", "reviewer", "approach-reviewer"].includes(role), "Missing attempt/session/role");
  need(["approval", "credentials", "clarify", "input"].includes(promptKind), "Invalid native prompt kind");
  const blocked = (reason) => ({
    action: "stop", status: "blocked", exposed: false, preserveState: true,
    chatNotificationSent: false, operatorAskedToOpen: false, cardAnsweredByAdapter: false,
    taskReplayed: false, workerSubstituted: false, permissionsChanged: false,
    groupAdvancement: "suspended", reason,
  });
  if (!["native-cli", "herdr-fallback"].includes(boundRoute)) {
    return blocked("Missing prequalified interaction route; launch/exposure blocked without fallback");
  }
  let viewId = null;
  let processLineage = null;
  if (boundRoute === "native-cli") {
    if (!nativeSurface || nativeSurface.available !== true || nativeSurface.sameSessionVerified !== true ||
        nativeSurface.session !== session) {
      return blocked("Qualified native same-session surface failed or drifted; no unqualified fallback permitted");
    }
    viewId = nativeSurface.viewId ?? `native:${session}`;
  } else {
    if (!herdrFallback || herdrFallback.herdrAvailable !== true || herdrFallback.freshPaneCreated !== true ||
        herdrFallback.perPaneApprovalRequired !== false || herdrFallback.operatorSetupRequired !== false ||
        !text(herdrFallback.paneId) || herdrFallback.historicalPaneReused === true ||
        herdrFallback.concurrentWorker === true || herdrFallback.taskReplayed === true ||
        herdrFallback.sameLogicalSessionVerified !== true || herdrFallback.pendingDecisionPreserved !== true ||
        herdrFallback.session !== session) {
      return blocked("Herdr fallback failed same-session, fresh-pane or no-replay verification");
    }
    if (herdrFallback.mode === "resume") {
      if (herdrFallback.previousProcessStopped !== true ||
          !Number.isSafeInteger(herdrFallback.oldPid) || !Number.isSafeInteger(herdrFallback.newPid) ||
          herdrFallback.oldPid === herdrFallback.newPid) {
        return blocked("Native resume in Herdr requires verified prior process termination and recorded old/new PIDs");
      }
      processLineage = { mode: "resume", oldPid: herdrFallback.oldPid, newPid: herdrFallback.newPid, session };
    } else if (herdrFallback.mode === "attach") {
      processLineage = { mode: "attach", pid: herdrFallback.pid ?? null, session };
    } else {
      return blocked("Unsupported Herdr interaction mode");
    }
    viewId = herdrFallback.paneId;
  }
  const waitingEvent = { schemaVersion: 1, attempt, session, event: "waiting", promptKind, route: boundRoute, viewId };
  if (decision === "pending") {
    return {
      action: "wait-for-operator", status: "waiting", exposed: true, route: boundRoute, viewId, session,
      processLineage, groupAdvancement: "suspended",
      chatNotificationSent: false, operatorAskedToOpen: false, cardAnsweredByAdapter: false,
      taskReplayed: false, workerSubstituted: false, permissionsChanged: false,
      lifecycleEvents: [waitingEvent],
    };
  }
  if (decision === "approved") {
    const resumedEvent = { schemaVersion: 1, attempt, session, event: "resumed", decision: "approved", route: boundRoute, viewId };
    return {
      action: "resume-attempt", status: "resumed", exposed: true, route: boundRoute, viewId, session,
      processLineage, groupAdvancement: "eligible-within-attempt",
      chatNotificationSent: false, operatorAskedToOpen: false, cardAnsweredByAdapter: false,
      taskReplayed: false, workerSubstituted: false, permissionsChanged: false,
      lifecycleEvents: [waitingEvent, resumedEvent],
    };
  }
  if (decision === "denied" || decision === "timeout") {
    return {
      action: "stop", status: decision === "denied" ? "blocked" : "stopped",
      exposed: true, route: boundRoute, viewId, session, processLineage,
      preserveState: true, reissued: false, workerSubstituted: false, permissionsChanged: false,
      groupAdvancement: "stopped", lifecycleEvents: [waitingEvent],
    };
  }
  throw new Error(`Invalid native decision state: ${decision}`);
}

export function cleanupInteractionView({
  viewId, orchestratorViewId, ownedByAdapter, preExistingView = false,
  activeWorkerSession = false, identityVerified = false, immediate = false,
  operatorInputPresent = false,
}) {
  if (!text(viewId) || !text(orchestratorViewId) || viewId === orchestratorViewId ||
      ownedByAdapter !== true || preExistingView !== false || activeWorkerSession !== false ||
      identityVerified !== true || immediate !== true || operatorInputPresent !== false) {
    return { removed: false, preserved: true, viewId: viewId ?? null };
  }
  return { removed: true, preserved: false, viewId };
}

function parseNativeReviewFindings(lines) {
  const parsed = [];
  for (const line of lines) {
    const m = line.match(/^(critical|high|medium|low)\s+([^\s:]+):(\d+)\s+([^;]+);\s*([^;]+);\s*(.+)$/i);
    if (m) {
      parsed.push({
        severity: m[1].toLowerCase(),
        path: m[2].trim(),
        line: Number(m[3]),
        impact: m[4].trim(),
        trigger: m[5].trim(),
        remedy: m[6].trim(),
      });
    }
  }
  return parsed;
}

export async function executeTerminalAdapterAttempt({
  directory, request, excludedRoots, runtime, scratchRoot,
  command = process.execPath, runnerPrefixArgs = [], args = null, promptText, transportRoute = null,
  completionKind = "exit", turnId = "turn-1", humanWait = null, records = CANDIDATE_RECORDS,
}) {
  const expected = await createAttempt({ directory, request, excludedRoots: [...excludedRoots, scratchRoot] });
  const captureDir = path.join(scratchRoot, "transport");
  await mkdir(captureDir, { recursive: true });
  const effectivePrompt = promptText ?? `# Assignment ${request.identity.attempt}\n${request.outcome}\n`;
  const transport = preparePromptTransport({
    client: runtime.client, version: runtime.version, role: request.identity.role,
    session: runtime.session, workspace: request.identity.workspace,
    prompt: effectivePrompt,
    captureDir, preferredRoute: transportRoute, records,
  });
  need(transport.action === "ready", `Transport preparation failed: ${transport.reason ?? transport.status}`);
  if (transport.promptFilePath) {
    await writeFile(transport.promptFilePath, Buffer.from(effectivePrompt, "utf8"), { mode: 0o600 });
  }
  const spawnedArgs = args === null ? [...runnerPrefixArgs, ...transport.argv] : args;
  need(Array.isArray(spawnedArgs) && !spawnedArgs.includes(effectivePrompt), "Spawned argv must never contain the prompt payload");
  const tail = spawnedArgs.slice(spawnedArgs.length - transport.argv.length);
  need(tail.length === transport.argv.length && tail.every((v, idx) => v === transport.argv[idx]), "Spawned argv must preserve transport.argv");
  const env = {
    PATH: process.env.PATH,
    HOME: scratchRoot,
    TMPDIR: scratchRoot,
    WORKER_ATTEMPT_DIR: directory,
    WORKER_PROMPT_FILE: transport.promptFilePath ?? "",
  };
  const proc = spawnSync(command, spawnedArgs, {
    cwd: request.identity.workspace,
    env,
    input: transport.stdinBytes ?? undefined,
    encoding: null,
    timeout: 30000,
  });
  const stdoutBytes = Buffer.from(proc.stdout ?? []);
  const stderrBytes = Buffer.from(proc.stderr ?? []);
  const exitCode = proc.status ?? 1;
  const signal = proc.signal ?? null;
  const exitBytes = Buffer.from(`${signal ?? exitCode}\n`, "utf8");
  await Promise.all([
    writeFile(transport.captures.stdoutPath, stdoutBytes, { mode: 0o600 }),
    writeFile(transport.captures.stderrPath, stderrBytes, { mode: 0o600 }),
    writeFile(transport.captures.exitPath, exitBytes, { mode: 0o600 }),
  ]);

  const hasNativeOutput = stdoutBytes.length > 0;
  const lines = hasNativeOutput ? stdoutBytes.toString("utf8").split(/\r?\n/) : [];
  const extractedFindings = request.identity.role === "implementer" ? [] : parseNativeReviewFindings(lines);
  const hasNoFindingsLine = lines.includes("Verdict: No findings");
  const explicitFindingsLine = lines.find((l) => l === "Verdict: findings" || l === "Findings") ?? null;

  let reviewOutputValid = true;
  let verdict = "unavailable";
  let nativeVerdict = null;
  let findings = [];
  if (hasNativeOutput && exitCode === 0 && signal === null && (!humanWait || humanWait.decision === "approved")) {
    if (request.identity.role === "implementer") {
      verdict = "not_applicable";
    } else if (hasNoFindingsLine && extractedFindings.length === 0) {
      verdict = "no_findings";
      nativeVerdict = "Verdict: No findings";
    } else if (!hasNoFindingsLine && explicitFindingsLine !== null && extractedFindings.length > 0) {
      verdict = "findings";
      nativeVerdict = explicitFindingsLine;
      findings = extractedFindings;
    } else {
      reviewOutputValid = false;
    }
  } else {
    reviewOutputValid = false;
  }

  const isCompleted = hasNativeOutput && reviewOutputValid && exitCode === 0 && signal === null && (!humanWait || humanWait.decision === "approved");
  const status = !isCompleted ? (humanWait?.decision === "denied" ? "blocked" : "failed") : "completed";
  const reportKind = isCompleted ? "native" : "adapter-diagnostic";
  const nativeBytes = hasNativeOutput ? stdoutBytes : Buffer.from("Adapter diagnostic: worker produced no native output.\n", "utf8");
  const reportBytes = isCompleted ? stdoutBytes : Buffer.from(`Adapter diagnostic: incomplete attempt (${status}).\n`, "utf8");

  const files = {
    "report.md": reportBytes,
    "native.txt": nativeBytes,
    "stderr.log": stderrBytes,
    "exit.txt": exitBytes,
  };
  let completion;
  if (completionKind === "turn-end" && isCompleted) {
    const turnBytes = Buffer.from(JSON.stringify({
      event: "turn-end",
      attempt: request.identity.attempt,
      session: runtime.session,
      turn: turnId,
      reportSha256: hash(reportBytes),
    }) + "\n", "utf8");
    files["turn.json"] = turnBytes;
    completion = { kind: "turn-end", turn: turnId, evidence: path.join(directory, "turn.json") };
  } else {
    completion = { kind: "exit", code: signal ? null : (isCompleted ? 0 : (exitCode === 0 ? 1 : exitCode)), signal };
  }
  const lifecycleEvents = [
    { schemaVersion: 1, attempt: request.identity.attempt, session: runtime.session, event: "launch" },
    { schemaVersion: 1, attempt: request.identity.attempt, session: runtime.session, event: "working" },
  ];
  if (humanWait) {
    const exp = exposeOperatorInteraction({
      attempt: request.identity.attempt, session: runtime.session, role: request.identity.role,
      boundRoute: humanWait.boundRoute, promptKind: humanWait.promptKind ?? "approval",
      nativeSurface: humanWait.nativeSurface, herdrFallback: humanWait.herdrFallback,
      decision: humanWait.decision,
    });
    need(exp.exposed === true, exp.reason ?? "Interaction exposure failed");
    lifecycleEvents.push(...exp.lifecycleEvents);
  }
  lifecycleEvents.push({
    schemaVersion: 1, attempt: request.identity.attempt, session: runtime.session,
    event: "terminal", status, completion,
  });
  files["lifecycle.jsonl"] = Buffer.from(lifecycleEvents.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf8");
  const desc = (name) => ({ path: path.join(directory, name), sha256: hash(files[name]), bytes: files[name].length });
  const evidence = Object.keys(files).filter((n) => n !== "report.md").map(desc);
  const result = {
    schemaVersion: 1,
    identity: structuredClone(request.identity),
    requestSha256: expected.requestSha256,
    runtime: structuredClone(runtime),
    status,
    verdict,
    nativeVerdict,
    findings,
    coverageLimitations: isCompleted ? [] : ["Attempt did not complete with valid native output or verdict"],
    report: desc("report.md"),
    reportKind,
    nativeReport: reportKind === "native" ? desc("native.txt") : null,
    evidence,
    outputs: {},
    completion,
  };
  await publishResult({ expected, runtime, result, files });
  const admitted = await readHandoff({ expected, runtime });
  return { expected, transport, admitted };
}
