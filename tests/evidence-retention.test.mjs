import assert from "node:assert/strict";
import { test } from "node:test";
import { createRepresentation, verifyRepresentation } from "../skills/software-development/openspec-delivery/scripts/evidence-retention.mjs";

const provenance = {
  source: "node --test fixture",
  observedAt: "2026-11-10T00:00:00Z",
  revision: "0123456789abcdef0123456789abcdef01234567",
  scope: "synthetic fixture",
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

test("uses base64 for non-UTF-8 bytes and decodes the exact original", () => {
  const original = Buffer.from([0x00, 0xff, 0x80, 0x0a]);
  const representation = createRepresentation({ original, provenance, labels });

  assert.equal(representation.encoding, "base64");
  assert.deepEqual(verifyRepresentation(representation), original);
});

test("fails closed on a corrupted stored or decoded hash", () => {
  const original = Buffer.from("evidence\n", "utf8");
  const representation = createRepresentation({ original, provenance, labels });

  assert.throws(() => verifyRepresentation({ ...representation, storedArtifactSha256: "0".repeat(64) }), /stored artifact SHA-256/i);
  assert.throws(() => verifyRepresentation({ ...representation, decodedOriginalSha256: "0".repeat(64) }), /decoded original SHA-256/i);
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
