import { createHash } from "node:crypto";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const canonicalBytes = (value) => Buffer.from(JSON.stringify(value), "utf8");

function requireString(value, field) {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  return value;
}

function requireText(value, field) {
  if (requireString(value, field).trim().length === 0) throw new Error(`${field} must be a non-empty string`);
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
  for (const field of ["source", "environmentScope", "observedAt", "revision", "scope"]) {
    requireText(provenance[field], `provenance.${field}`);
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
  if (labels.representation !== "lossless-representation") throw new Error("labels.representation must be lossless-representation");
  if (!new Set(["complete", "partial", "not-applicable"]).has(labels.completeness)) {
    throw new Error("labels.completeness must be complete, partial, or not-applicable");
  }
  if (!new Set(["publishable", "restricted", "redacted"]).has(labels.confidentiality)) {
    throw new Error("labels.confidentiality must be publishable, restricted, or redacted");
  }
  return labels;
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
  return { ...representation, wrapperSha256: sha256(canonicalBytes(wrapperPayload(representation))) };
}

export function verifyRepresentation(representation) {
  if (!representation || typeof representation !== "object" || Array.isArray(representation)) {
    throw new Error("representation must be an object");
  }
  if (representation.schemaVersion !== 1) throw new Error("schemaVersion must be 1");
  if (representation.kind !== "lossless-evidence-representation") {
    throw new Error("kind must be lossless-evidence-representation");
  }
  validateProvenance(representation.provenance);
  validateLabels(representation.labels);
  requireSha256(representation.storedArtifactSha256, "storedArtifactSha256");
  requireSha256(representation.decodedOriginalSha256, "decodedOriginalSha256");
  requireSha256(representation.wrapperSha256, "wrapperSha256");
  if (sha256(canonicalBytes(wrapperPayload(representation))) !== representation.wrapperSha256) {
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

export function assessClaimSupport({ kind, pagination, mergedAt, completionTimes = [] }) {
  if (!new Set(["original-response", "historical-extract", "fresh-corroboration", "merge-snapshot"]).has(kind)) {
    throw new Error("kind must identify the readback type");
  }
  if (!new Set(["complete", "partial"]).has(pagination)) throw new Error("pagination must be complete or partial");
  if (pagination === "partial" || kind === "fresh-corroboration" || kind === "merge-snapshot") return "narrowed";
  if (!Array.isArray(completionTimes)) throw new Error("completionTimes must be an array");
  if (mergedAt !== undefined) {
    const mergeTime = Date.parse(mergedAt);
    if (Number.isNaN(mergeTime) || completionTimes.some((time) => Number.isNaN(Date.parse(time)) || Date.parse(time) >= mergeTime)) {
      return "blocked";
    }
  }
  return "supported";
}
