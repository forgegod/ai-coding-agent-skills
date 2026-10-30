#!/usr/bin/env node
// Read-only naming aid. No filesystem writes, Git operations, or name reservation.
import { randomBytes } from "node:crypto";
import { lstatSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const namePattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const suffixPattern = /-[0-7][0-9a-hjkmnp-tv-z]{25}$/;
const identity = (name) => ({ name, path: `openspec/changes/${name}`, branch: `change/${name}` });

function encode(value, length) {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result = alphabet[Number(value & 31n)] + result;
    value >>= 5n;
  }
  return result;
}

export function generateName(slug, timestamp = Date.now(), entropy = randomBytes(10)) {
  requireThat(typeof slug === "string" && namePattern.test(slug) && slug.length <= 173 && slug !== "archive", "Expected a lowercase kebab-case slug of 1-173 characters, starting with a letter; archive is reserved");
  requireThat(!suffixPattern.test(slug), "Slug already has a ULID suffix; resolve the existing name instead");
  requireThat(Number.isSafeInteger(timestamp) && timestamp >= 0 && timestamp <= 0xffffffffffff, "Invalid ULID timestamp");
  requireThat(entropy instanceof Uint8Array && entropy.length === 10, "ULID entropy must contain 10 bytes");
  let randomness = 0n;
  for (const byte of entropy) randomness = (randomness << 8n) | BigInt(byte);
  return identity(`${slug}-${encode(BigInt(timestamp), 10)}${encode(randomness, 16)}`);
}

function directory(file) {
  const stat = lstatSync(file);
  requireThat(!stat.isSymbolicLink() && stat.isDirectory(), `Expected a non-symlink directory: ${file}`);
}

export function resolveName(repo, name, exact = false) {
  requireThat(typeof name === "string" && namePattern.test(name) && name.length <= 255 && name !== "archive", "Expected a literal lowercase change name or slug");
  requireThat(typeof repo === "string" && path.isAbsolute(repo), "Expected an absolute repository path");
  const changes = path.join(repo, "openspec", "changes");
  for (const dir of [repo, path.join(repo, "openspec"), changes]) directory(dir);
  const matches = [];
  for (const entry of readdirSync(changes, { withFileTypes: true })) {
    requireThat(!entry.isSymbolicLink(), `Symlinked change entry is unsupported: ${entry.name}`);
    if (!entry.isDirectory() || entry.name === "archive") continue;
    requireThat(namePattern.test(entry.name), `Malformed change directory: ${entry.name}`);
    if (entry.name === name || (!exact && suffixPattern.test(entry.name) && entry.name.slice(0, -27) === name)) matches.push(entry.name);
  }
  matches.sort();
  if (matches.length === 0) return { ok: false, code: "not-found", error: "No active change matches; do not create on resume", matches };
  if (matches.length > 1) return { ok: false, code: "ambiguous", error: "Multiple active changes match; ask the operator to select one", matches };
  return { ok: true, ...identity(matches[0]) };
}

function main() {
  const { positionals, values, tokens } = parseArgs({
    options: { slug: { type: "string" }, repo: { type: "string" }, name: { type: "string" }, exact: { type: "boolean" } }, allowPositionals: true, tokens: true,
  });
  const seen = new Set();
  for (const token of tokens.filter((token) => token.kind === "option")) {
    requireThat(!seen.has(token.name), `Duplicate option: --${token.name}`);
    seen.add(token.name);
  }
  requireThat(positionals.length === 1, "Expected exactly one command: generate or resolve");
  if (positionals[0] === "generate") {
    requireThat(Object.keys(values).every((key) => key === "slug"), "generate accepts only --slug");
    return { ok: true, ...generateName(values.slug) };
  }
  requireThat(positionals[0] === "resolve", "Expected generate or resolve");
  requireThat(values.slug === undefined, "resolve does not accept --slug");
  return resolveName(values.repo, values.name, values.exact);
}

function isEntrypoint() {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(new URL(import.meta.url)); }
  catch { return false; } // Imported by a caller whose argv does not name a file.
}

if (isEntrypoint()) {
  try {
    const result = main();
    console.log(JSON.stringify(result));
    if (!result.ok) process.exitCode = 1;
  }
  catch (error) {
    console.log(JSON.stringify({ ok: false, code: "invalid-input", error: error.message }));
    process.exitCode = 1;
  }
}
