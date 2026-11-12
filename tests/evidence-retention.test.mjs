import assert from "node:assert/strict";
import { test } from "node:test";
import { assessClaimSupport, createRepresentation, sealRepresentation, storedArtifactSha256, verifyRepresentation } from "../skills/software-development/openspec-delivery/scripts/evidence-retention.mjs";

const provenance = {
  source: "node --test fixture",
  command: ["node", "--test"],
  environmentScope: "synthetic fixture",
  exitStatus: 0,
  observedAt: "2026-11-10T00:00:00Z",
  revision: "0123456789abcdef0123456789abcdef01234567",
  scope: "synthetic fixture",
  pagination: "not-applicable",
  readbackType: "lossless-representation",
};

const labels = {
  representation: "lossless-representation",
  completeness: "not-applicable",
  confidentiality: "publishable",
};

const claim = (readbackType, pagination) => createRepresentation({
  original: Buffer.from("claim\n"),
  provenance: {
    ...provenance,
    readbackType,
    pagination,
    ...(readbackType === "historical-extract" ? { extractedAt: "2026-11-10T00:01:00Z" } : {}),
  },
  labels: { ...labels, representation: readbackType, completeness: pagination },
});
const expectedClaim = {
  mergedAt: "2026-11-10T12:00:00Z",
  expectedHead: "0123456789abcdef0123456789abcdef01234567",
  applicableCheckIds: ["build / test"],
};
const structuredClaim = ({
  readbackType = "original-response",
  pagination = "complete",
  observedAt = "2026-11-10T11:59:59.500Z",
  omitObservedAt = false,
  extractedAt,
  head = expectedClaim.expectedHead,
  checks = [{ id: "build / test", conclusion: "success", completedAt: "2026-11-10T11:59:59Z" }],
} = {}) => {
  const provenanceWithoutObservedAt = { ...provenance };
  delete provenanceWithoutObservedAt.observedAt;
  return createRepresentation({
  original: Buffer.from(JSON.stringify({ head, checks })),
  provenance: {
    ...provenanceWithoutObservedAt,
    readbackType,
    pagination,
    ...(omitObservedAt ? {} : { observedAt }),
    ...(extractedAt === undefined ? {} : { extractedAt }),
  },
  labels: { ...labels, representation: readbackType, completeness: pagination },
  });
};

test("represents UTF-8 CRLF bytes with trailing whitespace without normalization", () => {
  const original = Buffer.from("line one  \r\nline two\t\r\n", "utf8");
  const representation = createRepresentation({ original, provenance, labels });

  assert.equal(representation.encoding, "utf8");
  assert.equal(representation.content, "line one  \r\nline two\t\r\n");
  assert.deepEqual(verifyRepresentation(representation), original);
});

test("represents Unicode UTF-8 bytes losslessly", () => {
  const original = Buffer.from("snowman ☃ and café\n", "utf8");
  const representation = createRepresentation({ original, provenance, labels });

  assert.equal(representation.encoding, "utf8");
  assert.deepEqual(verifyRepresentation(representation), original);
});

test("round-trips empty and whitespace-only evidence bytes", () => {
  for (const original of [Buffer.alloc(0), Buffer.from("\r\n"), Buffer.from("  \t")]) {
    const representation = createRepresentation({ original, provenance, labels });
    assert.deepEqual(verifyRepresentation(representation), original);
  }
});

test("uses base64 for non-UTF-8 bytes and decodes the exact original", () => {
  const original = Buffer.from([0x00, 0xff, 0x80, 0x0a]);
  const representation = createRepresentation({ original, provenance, labels });

  assert.equal(representation.encoding, "base64");
  assert.deepEqual(verifyRepresentation(representation), original);
});

test("fails closed on a corrupted stored or decoded hash", () => {
  const representation = createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels });

  assert.throws(() => verifyRepresentation({ ...representation, storedArtifactSha256: "0".repeat(64) }), /wrapper SHA-256 mismatch/i);
  assert.throws(() => verifyRepresentation({ ...representation, decodedOriginalSha256: "0".repeat(64) }), /wrapper SHA-256 mismatch/i);
});

test("fails closed when immutable wrapper metadata changes", () => {
  const representation = createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels });

  assert.match(representation.wrapperSha256, /^[a-f0-9]{64}$/);
  assert.throws(() => verifyRepresentation({ ...representation, provenance: { ...provenance, scope: "changed" } }), /wrapper SHA-256 mismatch/i);
  assert.throws(() => verifyRepresentation({ ...representation, labels: { ...labels, confidentiality: "restricted" } }), /wrapper SHA-256 mismatch/i);
  assert.throws(() => verifyRepresentation({ ...representation, encoding: "base64" }), /wrapper SHA-256 mismatch/i);
  assert.throws(() => verifyRepresentation({ ...representation, content: "changed" }), /wrapper SHA-256 mismatch/i);
});

test("requires truthful labels and structured gate provenance", () => {
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels: { ...labels, representation: "original-byte-copy" } }),
    /labels\.representation/i,
  );
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels: { ...labels, confidentiality: "unknown" } }),
    /labels\.confidentiality/i,
  );
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance: { ...provenance, command: [] }, labels }),
    /provenance\.command/i,
  );
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance: { ...provenance, exitStatus: "0" }, labels }),
    /provenance\.exitStatus/i,
  );
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance: { ...provenance, pagination: "unknown" }, labels }),
    /provenance\.pagination/i,
  );
});

test("derives claim limits from verified representations", () => {
  assert.equal(assessClaimSupport({ representation: claim("original-response", "partial"), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: claim("fresh-corroboration", "complete"), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: claim("merge-snapshot", "complete"), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: claim("historical-extract", "complete"), ...expectedClaim }), "blocked");
});

test("supports only verified structured PR-check payloads with source-capture semantics", () => {
  assert.equal(assessClaimSupport({ representation: structuredClaim({ observedAt: "2026-11-10T12:00:00Z" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim(), ...expectedClaim }), "supported");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ readbackType: "historical-extract", extractedAt: "2026-11-10T12:01:00Z" }), ...expectedClaim }), "supported");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ readbackType: "fresh-corroboration" }), ...expectedClaim }), "narrowed");
  assert.throws(() => structuredClaim({ readbackType: "historical-extract" }), /extractedAt/i);
  assert.equal(assessClaimSupport({ representation: structuredClaim({ readbackType: "historical-extract", omitObservedAt: true, extractedAt: "2026-11-10T12:01:00Z" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ head: "ffffffffffffffffffffffffffffffffffffffff" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ checks: [{ id: "build / test", conclusion: "failure", completedAt: "2026-11-10T11:59:59Z" }] }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ checks: [{ id: "build / test", conclusion: "unknown", completedAt: "2026-11-10T11:59:59Z" }] }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ checks: [{ id: "build / test", conclusion: "failure", completedAt: "2026-11-10T11:59:59Z" }] }), ...expectedClaim, completionTimes: ["2026-11-10T11:59:59Z"] }), "blocked");
});

test("narrows only validated structured partial, fresh, and merge readbacks", () => {
  assert.equal(assessClaimSupport({ representation: structuredClaim({ pagination: "partial" }), ...expectedClaim }), "narrowed");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ pagination: "partial", observedAt: "2026-11-10T12:00:00.000Z" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ pagination: "partial", checks: [{ id: "build / test", conclusion: "success", completedAt: "2026-11-10T12:00:00.000Z" }] }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ pagination: "partial", checks: [] }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ pagination: "partial", checks: [{ id: "build / test", conclusion: "success", completedAt: "2026-11-10T11:59:59Z" }, { id: "build / test", conclusion: "success", completedAt: "2026-11-10T11:59:59Z" }] }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ readbackType: "fresh-corroboration" }), ...expectedClaim }), "narrowed");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ readbackType: "merge-snapshot" }), ...expectedClaim }), "narrowed");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ readbackType: "fresh-corroboration", pagination: "partial" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: structuredClaim({ readbackType: "merge-snapshot", checks: [{ id: "build / test", conclusion: "failure", completedAt: "2026-11-10T11:59:59Z" }] }), ...expectedClaim }), "blocked");
});

test("blocks historical check claims with missing, ambiguous, or post-merge completion evidence", () => {
  const historical = (changes = {}) => structuredClaim({ readbackType: "historical-extract", extractedAt: "2026-11-10T12:01:00Z", ...changes });
  assert.equal(assessClaimSupport({ representation: historical({ pagination: "partial" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: historical(), mergedAt: "2026-11-10T12:00:00" }), "blocked");
  assert.equal(assessClaimSupport({ representation: historical({ checks: [{ id: "build / test", conclusion: "success", completedAt: "2026-11-10T12:00:00Z" }] }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: historical({ checks: [{ id: "build / test", conclusion: "success", completedAt: "2026-02-30T11:59:59Z" }] }), ...expectedClaim }), "blocked");
});

test("requires provenance, completeness, and confidentiality labels", () => {
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance: { ...provenance, scope: "" }, labels }),
    /provenance\.scope/i,
  );
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels: { ...labels, completeness: "" } }),
    /labels\.completeness/i,
  );
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels: { ...labels, confidentiality: "" } }),
    /labels\.confidentiality/i,
  );
});

test("rejects unverified wrapper fields and malformed encoded representations", () => {
  const representation = createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels });
  assert.throws(() => verifyRepresentation({ ...representation, originalByteCopy: true }), /unknown representation field/i);
  assert.throws(() => verifyRepresentation({ ...representation, encoding: "rot13" }), /wrapper SHA-256 mismatch|unsupported encoding/i);
  assert.throws(() => verifyRepresentation({ ...representation, encoding: "base64", content: "?" }), /wrapper SHA-256 mismatch|base64 content is invalid/i);
});

test("requires readback type and coherent completeness semantics", () => {
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance: { ...provenance, readbackType: "historical-extract", extractedAt: "2026-11-10T00:01:00Z" }, labels: { ...labels, completeness: "complete" } }),
    /readback type|pagination|completeness/i,
  );
});

test("rejects re-sealed deserialized provenance, label, and redaction mismatches", () => {
  const representation = createRepresentation({
    original: Buffer.from("evidence\n"),
    provenance: { ...provenance, readbackType: "original-response", pagination: "complete" },
    labels: { ...labels, representation: "original-response", completeness: "complete" },
  });
  const reseal = (changes) => {
    const candidate = { ...representation, ...changes };
    return { ...candidate, wrapperSha256: sealRepresentation(candidate) };
  };

  assert.throws(
    () => verifyRepresentation(reseal({ provenance: { ...representation.provenance, readbackType: "fresh-corroboration" } })),
    /readback type must match labels\.representation/i,
  );
  assert.throws(
    () => verifyRepresentation(reseal({ provenance: { ...representation.provenance, pagination: "partial" } })),
    /pagination must match labels\.completeness/i,
  );
  assert.throws(
    () => verifyRepresentation(reseal({
      provenance: { ...representation.provenance, readbackType: "redacted-transformed" },
      labels: { ...representation.labels, representation: "redacted-transformed" },
    })),
    /redacted-transformed.*redacted/i,
  );
  assert.throws(
    () => verifyRepresentation(reseal({ labels: { ...representation.labels, confidentiality: "redacted" } })),
    /redacted.*redacted-transformed/i,
  );
});

test("requires strict UTC observation, merge, and completion instants", () => {
  for (const observedAt of ["", "2026-02-30T00:00:00Z", "2026-11-10T24:00:00Z", "2026-11-10T00:00:00.1234Z"]) {
    assert.throws(
      () => createRepresentation({ original: Buffer.from("evidence\n"), provenance: { ...provenance, observedAt }, labels }),
      /provenance\.observedAt/i,
    );
  }

  const representation = claim("historical-extract", "complete");
  for (const timestamp of ["2026-02-30T12:00:00Z", "2026-11-10T24:00:00Z", "2026-11-10T12:00:00.1234Z"]) {
    assert.equal(
      assessClaimSupport({ representation, mergedAt: timestamp, completionTimes: ["2026-11-10T11:59:59Z"] }),
      "blocked",
    );
    assert.equal(
      assessClaimSupport({ representation, mergedAt: "2026-11-10T12:00:00Z", completionTimes: [timestamp] }),
      "blocked",
    );
  }
});

test("blocks unsupported claims for failed, confidential, missing, or post-merge evidence", () => {
  const factual = ({ exitStatus = 0, confidentiality = "publishable", readbackType = "original-response" } = {}) => createRepresentation({
    original: Buffer.from("claim\n"),
    provenance: {
      ...provenance,
      exitStatus,
      readbackType,
      pagination: "complete",
      ...(readbackType === "historical-extract" ? { extractedAt: "2026-11-10T00:01:00Z" } : {}),
    },
    labels: { ...labels, representation: readbackType, completeness: "complete", confidentiality },
  });

  assert.equal(assessClaimSupport({ representation: factual({ exitStatus: 1 }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: factual({ confidentiality: "restricted" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: factual({ readbackType: "redacted-transformed", confidentiality: "redacted" }), ...expectedClaim }), "blocked");
  assert.equal(assessClaimSupport({ representation: factual() }), "blocked");
  for (const readbackType of ["original-response", "historical-extract", "fresh-corroboration", "merge-snapshot"]) {
    assert.equal(
      assessClaimSupport({
        representation: factual({ readbackType }),
        mergedAt: "2026-11-10T12:00:00Z",
        completionTimes: ["2026-11-10T12:00:00Z"],
      }),
      "blocked",
    );
  }
});

test("rejects unknown nested provenance and label fields", () => {
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance: { ...provenance, claimedOriginal: true }, labels }),
    /unknown provenance field/i,
  );
  assert.throws(
    () => createRepresentation({ original: Buffer.from("evidence\n"), provenance, labels: { ...labels, claim: "complete" } }),
    /unknown labels field/i,
  );
});

test("reaches direct hash and decoding failure paths after resealing", () => {
  const representation = createRepresentation({ original: Buffer.from([0xff]), provenance, labels });
  const reseal = (changes) => {
    const candidate = { ...representation, ...changes };
    return { ...candidate, wrapperSha256: sealRepresentation(candidate) };
  };
  assert.throws(() => verifyRepresentation(reseal({ storedArtifactSha256: "0".repeat(64) })), /stored artifact SHA-256 mismatch/i);
  assert.throws(() => verifyRepresentation(reseal({ decodedOriginalSha256: "0".repeat(64) })), /decoded original SHA-256 mismatch/i);
  assert.throws(() => verifyRepresentation(reseal({ content: "?", storedArtifactSha256: storedArtifactSha256("?") })), /base64 content is invalid/i);
  assert.throws(() => verifyRepresentation(reseal({ encoding: "rot13", storedArtifactSha256: storedArtifactSha256(representation.content) })), /unsupported encoding/i);
});

test("derives claim limits from a verified representation and refuses free inputs", () => {
  assert.equal(assessClaimSupport({ representation: claim("fresh-corroboration", "complete"), ...expectedClaim }), "blocked");
  assert.throws(() => assessClaimSupport({ kind: "fresh-corroboration", pagination: "complete" }), /representation/i);
});
