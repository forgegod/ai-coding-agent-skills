import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(root, "skills");

const credentialPatterns = [
  /\b(ghp|gho|ghs|ghr)_[A-Za-z0-9]{16,}/,
  /\bsk-[A-Za-z0-9]{20,}/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  /BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY/,
  /\bAKIA[0-9A-Z]{16}\b/,
];

async function skillFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await skillFiles(file)));
    } else if (entry.isFile() && entry.name === "SKILL.md") {
      files.push(file);
    }
  }
  return files.sort();
}

function frontmatterFields(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):(?:\s+(.*))?$/);
    if (field) fields[field[1]] = (field[2] ?? "").trim();
  }
  return fields;
}

test("skills/ ships the DOX chain for the playbook tree", async () => {
  for (const relative of ["AGENTS.md", "software-development/AGENTS.md"]) {
    const info = await stat(path.join(skillsRoot, relative)).catch(() => null);
    assert.ok(info?.isFile(), `missing ${relative}`);
  }
});

test("every SKILL.md carries name, description, and version in its frontmatter", async () => {
  const files = await skillFiles(skillsRoot);
  assert.ok(files.length >= 2, "expected at least two playbooks");
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const fields = frontmatterFields(source);
    assert.ok(fields, `${path.relative(root, file)} has no YAML frontmatter`);
    for (const field of ["name", "description", "version"]) {
      assert.ok(
        fields[field],
        `${path.relative(root, file)} frontmatter is missing ${field}`,
      );
    }
  }
});

test("every SKILL.md name matches its directory", async () => {
  const files = await skillFiles(skillsRoot);
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const fields = frontmatterFields(source);
    const directory = path.basename(path.dirname(file));
    assert.equal(
      fields?.name,
      directory,
      `${path.relative(root, file)} name '${fields?.name}' does not match its directory '${directory}'`,
    );
  }
});

test("skills/ packages a self-contained CAP/CHG phase workflow", async () => {
  const names = [
    "application-records",
    "blueprint-initialization",
    "phased-plan-design",
    "phased-plan-execution",
    "phased-plan-overview",
    "phased-plan-refactoring",
  ];
  const sources = new Map();
  for (const name of names) {
    const file = path.join(skillsRoot, "software-development", name, "SKILL.md");
    const source = await readFile(file, "utf8");
    sources.set(name, source);
    assert.doesNotMatch(source, /(?:~\/.hermes|\/home\/)/, `${name} depends on agent-private paths`);
  }

  const records = sources.get("application-records");
  const phaseSkills = [
    "phased-plan-design",
    "phased-plan-execution",
    "phased-plan-overview",
    "phased-plan-refactoring",
  ];
  for (const name of phaseSkills) {
    assert.match(records, new RegExp(`\\b${name}\\b`), `application-records does not route to ${name}`);
  }
  assert.match(sources.get("phased-plan-design"), /active CHG/i);
  assert.match(sources.get("phased-plan-execution"), /CHG phase table/i);
  assert.match(sources.get("phased-plan-overview"), /docs\/changes\/active/i);
  assert.match(sources.get("phased-plan-refactoring"), /one progress authority/i);
  assert.match(sources.get("blueprint-initialization"), /templates\/root-AGENTS\.md/);
  assert.match(sources.get("blueprint-initialization"), /never delete.*installed.*skill/is);
  assert.doesNotMatch(sources.get("blueprint-initialization"), /remove itself/i);
  assert.match(sources.get("blueprint-initialization"), /target-project-owned/i);
  assert.match(
    sources.get("blueprint-initialization"),
    /rewrite the copied root `README\.md`.*project goal/is,
  );
  const rootAgent = await readFile(path.join(root, "AGENTS.md"), "utf8");
  assert.match(rootAgent, /shared agent profile/);
  const initialRoot = await readFile(
    path.join(skillsRoot, "software-development", "blueprint-initialization", "templates", "root-AGENTS.md"),
    "utf8",
  );
  assert.doesNotMatch(initialRoot, /AI Software Blueprint|CAP-00\d|CHG-00\d/);
});

test("skills package separate review storage and a visual handoff gate", async () => {
  const sources = {};
  for (const name of ["application-records", "capability-wireframes", "phased-plan-design", "phased-plan-execution"]) {
    sources[name] = await readFile(path.join(skillsRoot, "software-development", name, "SKILL.md"), "utf8");
  }
  for (const name of ["application-records", "capability-wireframes"]) {
    assert.match(sources[name], /docs\/changes\/reviews\/CHG-/);
    assert.match(sources[name], /review-only/);
    assert.match(sources[name], /README\.md/);
  }
  assert.match(sources["capability-wireframes"], /Primary surface/);
  assert.match(sources["capability-wireframes"], /existing CAP|existing capabilit/i);
  for (const name of ["phased-plan-design", "phased-plan-execution"]) {
    assert.match(sources[name], /visual handoff/i);
    assert.match(sources[name], /review package/i);
  }
});

test("git-commit-message previews suggested batches before apply", async () => {
  const source = await readFile(
    path.join(skillsRoot, "software-development", "git-commit-message", "SKILL.md"),
    "utf8",
  );
  assert.match(source, /present a preview and stop/i);
  assert.match(source, /same turn/);
  assert.match(source, /Apply uses the preview exactly/);
  assert.match(source, /returns changes/);
  assert.match(source, /A preview is not permission to commit/);
  assert.doesNotMatch(source, /(?:~\/\.hermes|\/home\/)/);
});

test("no repository skill carries credential markers", async () => {
  const files = await skillFiles(skillsRoot);
  const doxFiles = [
    "AGENTS.md",
    "software-development/AGENTS.md",
  ];
  const all = [...files];
  for (const relative of doxFiles) {
    all.push(path.join(skillsRoot, relative));
  }
  for (const file of all) {
    const source = await readFile(file, "utf8");
    for (const pattern of credentialPatterns) {
      assert.ok(
        !pattern.test(source),
        `${path.relative(root, file)} contains a credential-shaped marker`,
      );
    }
  }
});
