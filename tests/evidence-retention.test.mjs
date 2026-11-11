import assert from "node:assert/strict";
import { test } from "node:test";
import { assessClaimSupport, createRepresentation, verifyRepresentation } from "../skills/software-development/openspec-delivery/scripts/evidence-retention.mjs";

const provenance = {
  source: "node --test fixture",
  command: ["node", "--test"],
  environmentScope: "synthetic fixture",
  exitStatus: 0,
  observedAt: "2026-11-10T00:00:00Z",
  revision: "0123456789abcdef0123456789abcdef01234567",
  scope: "synthetic fixture",
  pagination: "not-applicable",
};

const labels = {
  representation: "lossless-representation",
  completeness: "complete",
  confidentiality: "publishable",
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

test("narrows partial and current readbacks and blocks checks completed after merge", () => {
  assert.equal(assessClaimSupport({ kind: "historical-extract", pagination: "partial" }), "narrowed");
  assert.equal(assessClaimSupport({ kind: "fresh-corroboration", pagination: "complete" }), "narrowed");
  assert.equal(assessClaimSupport({ kind: "merge-snapshot", pagination: "complete" }), "narrowed");
  assert.equal(
    assessClaimSupport({ kind: "historical-extract", pagination: "complete", mergedAt: "2026-11-10T12:00:00Z", completionTimes: ["2026-11-10T12:00:00Z"] }),
    "blocked",
  );
  assert.equal(
    assessClaimSupport({ kind: "historical-extract", pagination: "complete", mergedAt: "2026-11-10T12:00:00Z", completionTimes: ["2026-11-10T11:59:59Z"] }),
    "supported",
  );
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
