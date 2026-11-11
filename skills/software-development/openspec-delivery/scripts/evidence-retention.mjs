import { createHash } from "node:crypto";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function requireText(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
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
  for (const field of ["source", "observedAt", "revision", "scope"]) {
    requireText(provenance[field], `provenance.${field}`);
  }
  return provenance;
}

function validateLabels(labels) {
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) {
    throw new Error("labels must be an object");
  }
  for (const field of ["representation", "completeness", "confidentiality"]) {
    requireText(labels[field], `labels.${field}`);
  }
  return labels;
}

function decodedBytes(representation) {
  requireText(representation.encoding, "encoding");
  requireText(representation.content, "content");
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

  return {
    schemaVersion: 1,
    kind: "lossless-evidence-representation",
    encoding,
    content,
    storedArtifactSha256: sha256(storedBytes),
    decodedOriginalSha256: sha256(original),
    provenance: { ...provenance },
    labels: { ...labels },
  };
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

  const storedBytes = Buffer.from(requireText(representation.content, "content"), "utf8");
  if (sha256(storedBytes) !== representation.storedArtifactSha256) {
    throw new Error("stored artifact SHA-256 mismatch");
  }
  const original = decodedBytes(representation);
  if (sha256(original) !== representation.decodedOriginalSha256) {
    throw new Error("decoded original SHA-256 mismatch");
  }
  return original;
}
