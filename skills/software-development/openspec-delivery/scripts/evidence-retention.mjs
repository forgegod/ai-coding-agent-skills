import { createHash } from "node:crypto";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const storedArtifactSha256 = (content) => sha256(Buffer.from(requireString(content, "content"), "utf8"));
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
};
const canonicalBytes = (value) => Buffer.from(JSON.stringify(canonicalize(value)), "utf8");

function requireString(value, field) {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  return value;
}

function requireText(value, field) {
  if (requireString(value, field).trim().length === 0) throw new Error(`${field} must be a non-empty string`);
  return value;
}

function parseUtcInstant(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) {
    return Number.NaN;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return Number.NaN;
  const expected = value.includes(".") ? value : value.replace("Z", ".000Z");
  return new Date(timestamp).toISOString() === expected ? timestamp : Number.NaN;
}

function requireUtcInstant(value, field) {
  requireText(value, field);
  if (Number.isNaN(parseUtcInstant(value))) throw new Error(`${field} must be a strict UTC instant`);
  return value;
}

function requireSha256(value, field) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) {
    throw new Error(`${field} must be a lowercase SHA-256 hex digest`);
  }
  return value;
}

function validateProvenance(provenance) {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    throw new Error("provenance must be an object");
  }
  const allowed = new Set(["source", "command", "environmentScope", "exitStatus", "observedAt", "extractedAt", "revision", "scope", "pagination", "readbackType"]);
  if (Object.keys(provenance).some((field) => !allowed.has(field))) throw new Error("unknown provenance field");
  for (const field of ["source", "environmentScope", "revision", "scope"]) {
    requireText(provenance[field], `provenance.${field}`);
  }
  if (provenance.readbackType !== "historical-extract" || Object.hasOwn(provenance, "observedAt")) {
    requireUtcInstant(provenance.observedAt, "provenance.observedAt");
  }
  if (!new Set(["original-response", "lossless-representation", "redacted-transformed", "historical-extract", "fresh-corroboration", "merge-snapshot"]).has(provenance.readbackType)) {
    throw new Error("provenance.readbackType must identify the readback type");
  }
  if (provenance.readbackType === "historical-extract") {
    requireUtcInstant(provenance.extractedAt, "provenance.extractedAt");
  } else if (Object.hasOwn(provenance, "extractedAt")) {
    throw new Error("provenance.extractedAt is only valid for historical-extract evidence");
  }
  if (!Array.isArray(provenance.command) || provenance.command.length === 0 || provenance.command.some((part) => typeof part !== "string" || part.length === 0)) {
    throw new Error("provenance.command must be a non-empty string array");
  }
  if (!Number.isInteger(provenance.exitStatus)) throw new Error("provenance.exitStatus must be an integer");
  if (!new Set(["complete", "partial", "not-applicable"]).has(provenance.pagination)) {
    throw new Error("provenance.pagination must be complete, partial, or not-applicable");
  }
  return provenance;
}

function validateLabels(labels) {
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) {
    throw new Error("labels must be an object");
  }
  const allowed = new Set(["representation", "completeness", "confidentiality"]);
  if (Object.keys(labels).some((field) => !allowed.has(field))) throw new Error("unknown labels field");
  if (!new Set(["original-response", "lossless-representation", "redacted-transformed", "historical-extract", "fresh-corroboration", "merge-snapshot"]).has(labels.representation)) {
    throw new Error("labels.representation must identify the readback type");
  }
  if (!new Set(["complete", "partial", "not-applicable"]).has(labels.completeness)) {
    throw new Error("labels.completeness must be complete, partial, or not-applicable");
  }
  if (!new Set(["publishable", "restricted", "redacted"]).has(labels.confidentiality)) {
    throw new Error("labels.confidentiality must be publishable, restricted, or redacted");
  }
  return labels;
}

function validateCoherence(provenance, labels) {
  if (provenance.readbackType !== labels.representation) {
    throw new Error("readback type must match labels.representation");
  }
  if (provenance.pagination !== labels.completeness) {
    throw new Error("provenance.pagination must match labels.completeness");
  }
  if (provenance.readbackType === "redacted-transformed" && labels.confidentiality !== "redacted") {
    throw new Error("redacted-transformed evidence must be labeled redacted");
  }
  if (labels.confidentiality === "redacted" && provenance.readbackType !== "redacted-transformed") {
    throw new Error("redacted evidence must use redacted-transformed provenance");
  }
}

function wrapperPayload(representation) {
  return {
    schemaVersion: representation.schemaVersion,
    kind: representation.kind,
    encoding: representation.encoding,
    content: representation.content,
    storedArtifactSha256: representation.storedArtifactSha256,
    decodedOriginalSha256: representation.decodedOriginalSha256,
    provenance: representation.provenance,
    labels: representation.labels,
  };
}

export function sealRepresentation(representation) {
  return sha256(canonicalBytes(wrapperPayload(representation)));
}

function decodedBytes(representation) {
  requireText(representation.encoding, "encoding");
  requireString(representation.content, "content");
  if (representation.encoding === "utf8") {
    const bytes = Buffer.from(representation.content, "utf8");
    if (bytes.toString("utf8") !== representation.content) {
      throw new Error("utf8 content does not round-trip exactly");
    }
    return bytes;
  }
  if (representation.encoding === "base64") {
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(representation.content)) {
      throw new Error("base64 content is invalid");
    }
    return Buffer.from(representation.content, "base64");
  }
  throw new Error(`unsupported encoding: ${representation.encoding}`);
}

export function createRepresentation({ original, provenance, labels }) {
  if (!Buffer.isBuffer(original)) throw new Error("original must be a Buffer");
  validateProvenance(provenance);
  validateLabels(labels);
  validateCoherence(provenance, labels);

  const asUtf8 = original.toString("utf8");
  const utf8Bytes = Buffer.from(asUtf8, "utf8");
  const encoding = utf8Bytes.equals(original) ? "utf8" : "base64";
  const content = encoding === "utf8" ? asUtf8 : original.toString("base64");
  const storedBytes = Buffer.from(content, "utf8");

  const representation = {
    schemaVersion: 1,
    kind: "lossless-evidence-representation",
    encoding,
    content,
    storedArtifactSha256: sha256(storedBytes),
    decodedOriginalSha256: sha256(original),
    provenance: { ...provenance },
    labels: { ...labels },
  };
  return { ...representation, wrapperSha256: sealRepresentation(representation) };
}

export function verifyRepresentation(representation) {
  if (!representation || typeof representation !== "object" || Array.isArray(representation)) {
    throw new Error("representation must be an object");
  }
  const allowedFields = new Set(["schemaVersion", "kind", "encoding", "content", "storedArtifactSha256", "decodedOriginalSha256", "provenance", "labels", "wrapperSha256"]);
  if (Object.keys(representation).some((field) => !allowedFields.has(field))) throw new Error("unknown representation field");
  if (representation.schemaVersion !== 1) throw new Error("schemaVersion must be 1");
  if (representation.kind !== "lossless-evidence-representation") {
    throw new Error("kind must be lossless-evidence-representation");
  }
  validateProvenance(representation.provenance);
  validateLabels(representation.labels);
  validateCoherence(representation.provenance, representation.labels);
  requireSha256(representation.storedArtifactSha256, "storedArtifactSha256");
  requireSha256(representation.decodedOriginalSha256, "decodedOriginalSha256");
  requireSha256(representation.wrapperSha256, "wrapperSha256");
  if (sealRepresentation(representation) !== representation.wrapperSha256) {
    throw new Error("wrapper SHA-256 mismatch");
  }

  const storedBytes = Buffer.from(requireString(representation.content, "content"), "utf8");
  if (sha256(storedBytes) !== representation.storedArtifactSha256) {
    throw new Error("stored artifact SHA-256 mismatch");
  }
  const original = decodedBytes(representation);
  if (sha256(original) !== representation.decodedOriginalSha256) {
    throw new Error("decoded original SHA-256 mismatch");
  }
  return original;
}

function parsePrCheckPayload(original) {
  let payload;
  try {
    payload = JSON.parse(original.toString("utf8"));
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || typeof payload.head !== "string" || !Array.isArray(payload.checks)) return null;
  if (payload.checks.some((check) => !check || typeof check !== "object" || Array.isArray(check) || typeof check.id !== "string" || typeof check.conclusion !== "string" || typeof check.completedAt !== "string")) return null;
  return payload;
}

function hasSupportedChecks(payload, expectedHead, applicableCheckIds, mergeTime) {
  if (typeof expectedHead !== "string" || expectedHead.length === 0 || !Array.isArray(applicableCheckIds) || applicableCheckIds.length === 0 || applicableCheckIds.some((id) => typeof id !== "string" || id.length === 0)) return false;
  if (payload.head !== expectedHead || new Set(applicableCheckIds).size !== applicableCheckIds.length) return false;
  const checksById = new Map();
  for (const check of payload.checks) {
    if (checksById.has(check.id)) return false;
    checksById.set(check.id, check);
  }
  return applicableCheckIds.every((id) => {
    const check = checksById.get(id);
    const completedAt = check && parseUtcInstant(check.completedAt);
    return check && check.conclusion === "success" && !Number.isNaN(completedAt) && completedAt < mergeTime;
  });
}

export function assessClaimSupport({ representation, mergedAt, expectedHead, applicableCheckIds }) {
  const original = verifyRepresentation(representation);
  const { readbackType: kind, pagination, exitStatus } = representation.provenance;
  if (exitStatus !== 0 || representation.labels.confidentiality !== "publishable") return "blocked";
  if (!new Set(["original-response", "historical-extract", "fresh-corroboration", "merge-snapshot"]).has(kind)) {
    throw new Error("kind must identify the readback type");
  }
  if (!new Set(["complete", "partial"]).has(pagination)) throw new Error("pagination must be complete or partial");
  const mergeTime = parseUtcInstant(mergedAt);
  if (Number.isNaN(mergeTime)) return "blocked";
  const payload = parsePrCheckPayload(original);
  const observedTime = parseUtcInstant(representation.provenance.observedAt);
  if (!payload || !hasSupportedChecks(payload, expectedHead, applicableCheckIds, mergeTime)) return "blocked";
  if (pagination === "partial") {
    return kind === "original-response" && !Number.isNaN(observedTime) && observedTime < mergeTime ? "narrowed" : "blocked";
  }
  if (kind === "fresh-corroboration" || kind === "merge-snapshot") {
    return "narrowed";
  }
  if (Number.isNaN(observedTime) || observedTime >= mergeTime) return "blocked";
  return "supported";
}
