#!/usr/bin/env node
/** Build the well-known endpoint and Claude upload packages from canonical source. */
import { lstat, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { zipSync } from "fflate";
import { buildWellKnownSkills, discoverSkillPackages } from "./build-well-known-skills.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

// Deliberately narrower than Claude's schema: this catalog ships skills only.
function validateMarketplace(marketplace, packages) {
  const fail = (message) => { throw new Error(`Invalid Claude marketplace: ${message}`); };
  const keys = (value, expected) => value && typeof value === "object" &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expected.sort());
  if (!keys(marketplace, ["name", "owner", "description", "plugins"]) ||
      marketplace.name !== "ai-coding-agent-skills" ||
      !keys(marketplace.owner, ["name"]) || typeof marketplace.owner.name !== "string" ||
      !marketplace.owner.name.trim() || typeof marketplace.description !== "string" ||
      !marketplace.description.trim() || !Array.isArray(marketplace.plugins) || marketplace.plugins.length !== 2) {
    fail("expected a named, skills-only catalog with two plugins");
  }
  const selected = new Set();
  for (const [index, plugin] of marketplace.plugins.entries()) {
    if (!keys(plugin, ["name", "version", "description", "source", "strict", "skills"]) ||
        plugin.name !== ["software-development", "autonomous-orchestration"][index] ||
        typeof plugin.version !== "string" || !/^\d+\.\d+\.\d+$/.test(plugin.version) ||
        typeof plugin.description !== "string" || !plugin.description.trim() ||
        plugin.source !== "./" || plugin.strict !== false ||
        !Array.isArray(plugin.skills) || !plugin.skills.length) fail("invalid plugin metadata or components");
    for (const directory of plugin.skills) {
      const pkg = packages.find((entry) => `./skills/${entry.relativePath.split(path.sep).join("/")}` === directory);
      if (!pkg || selected.has(pkg.name)) fail(`unknown or duplicate skill: ${directory}`);
      if ((pkg.name === "autonomous-implementation-review") !== (plugin.name === "autonomous-orchestration")) {
        fail("orchestration must remain a separate opt-in");
      }
      if (pkg.description.length > 200) fail(`${pkg.name} exceeds Claude's 200-character description limit`);
      selected.add(pkg.name);
    }
  }
  if (selected.size !== packages.length) fail("every canonical skill must be selected exactly once");
}

async function info(file) {
  return lstat(file).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
}

// Only owned paths are checked: symlinked ancestors (e.g. macOS /var, a checkout alias)
// are portable aliases, but a symlink at the owned path itself could redirect writes.
async function rejectSymlink(file) {
  if ((await info(file))?.isSymbolicLink()) throw new Error(`${file} is a symlink`);
}

// Resolve aliased ancestors of a path whose leaf may not exist yet.
async function canonicalize(target) {
  const absolute = path.resolve(target);
  const missing = [];
  for (let current = absolute; ; current = path.dirname(current)) {
    try {
      return path.join(await realpath(current), ...missing.reverse());
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      if (current === path.dirname(current)) throw error;
      missing.push(path.basename(current));
    }
  }
}

function assertOutsideSource(source, destination) {
  if (source === destination || source.startsWith(`${destination}${path.sep}`) ||
      destination.startsWith(`${source}${path.sep}`)) {
    throw new Error("Output directory must not overlap canonical skill source");
  }
}

export async function buildDistribution({ root = scriptRoot, output }) {
  if (!output) throw new Error("An output directory is required");
  const requested = path.resolve(output);
  await rejectSymlink(requested);
  for (const entry of ["downloads", ".well-known", "index.html", ".nojekyll"]) {
    await rejectSymlink(path.join(requested, entry));
  }
  const canonicalRoot = await canonicalize(root);
  // Aliased output ancestors must be resolved before the overlap check, or a link
  // into the canonical source subtree would pass the lexical comparison.
  const destination = await canonicalize(requested);
  assertOutsideSource(path.join(canonicalRoot, "skills"), destination);
  // The owned catalog directory is source too: a link there would redirect metadata
  // reads. Resolve through canonicalRoot so aliases above the project root stay allowed.
  await rejectSymlink(path.join(canonicalRoot, ".claude-plugin"));
  await rejectSymlink(path.join(root, "skills"));
  await rejectSymlink(path.join(root, ".claude-plugin/marketplace.json"));
  if (await info(path.join(root, ".claude-plugin/plugin.json"))) {
    throw new Error("A root plugin manifest would override marketplace skill isolation");
  }
  const packages = await discoverSkillPackages({ root: canonicalRoot });
  const marketplace = JSON.parse(await readFile(path.join(root, ".claude-plugin/marketplace.json"), "utf8"));
  validateMarketplace(marketplace, packages);
  await rejectSymlink(path.join(root, "LICENSE"));
  const license = await readFile(path.join(root, "LICENSE"));
  const contents = new Map();
  for (const pkg of packages) {
    const files = {};
    for (const file of pkg.files) files[file] = await readFile(path.join(pkg.directory, file));
    contents.set(pkg.name, files);
  }
  const archives = new Map();
  function archive(name, file, files) {
    const bytes = zipSync(files, { level: 9, mtime: new Date(1980, 0, 1) });
    archives.set(file, bytes);
    return { name, file, sha256: createHash("sha256").update(bytes).digest("hex") };
  }
  const skills = packages.map((pkg) => archive(pkg.name, `${pkg.name}.zip`,
    Object.fromEntries(Object.entries(contents.get(pkg.name)).map(([file, bytes]) => [`${pkg.name}/${file}`, bytes]))));
  const plugins = marketplace.plugins.map((plugin) => {
    const manifest = { name: plugin.name, version: plugin.version, description: plugin.description,
      author: marketplace.owner, license: "MIT" };
    const readme = `# ${plugin.name}\n\n${plugin.description}\n\n` +
      "Upload this ZIP through Claude's Customize → Plugins → Add → Upload plugin. Review the bundled instructions and scripts before enabling. Installation does not grant execution authority or Hermes scanner approval.\n\n" +
      "These are community engineering workflows. Chat, Cowork, and Claude Code do not have equivalent execution capabilities. Git workflows require a project checkout, Git, Node 22+ for the phase guard, and the target project's tooling and permissions. Hermes-specific tool names must be mapped to available host tools.\n\n" +
      "Orchestration is a separate opt-in and requires the software-development bundle and separately reviewed project role configuration. No agents, hooks, connectors, or permission changes are installed by this package.\n\n" +
      "Instructions: https://github.com/forgegod/ai-coding-agent-skills#install-with-claude-desktop\n" +
      "Upstream: https://claude.com/docs/plugins/overview\n\nMIT; see LICENSE. Canonical skill authors and metadata are preserved.\n";
    const files = { ".claude-plugin/plugin.json": Buffer.from(json(manifest)), "README.md": Buffer.from(readme), LICENSE: license };
    for (const directory of plugin.skills) {
      const pkg = packages.find((entry) => `./skills/${entry.relativePath.split(path.sep).join("/")}` === directory);
      for (const [file, bytes] of Object.entries(contents.get(pkg.name))) files[`skills/${pkg.name}/${file}`] = bytes;
    }
    return archive(plugin.name, `${plugin.name}.plugin.zip`, files);
  });
  const catalog = { plugins, skills };
  const result = await buildWellKnownSkills({ root: canonicalRoot, output: destination });
  const downloads = path.join(destination, "downloads");
  await rm(downloads, { recursive: true, force: true });
  await mkdir(downloads, { recursive: true });
  for (const [file, bytes] of archives) await writeFile(path.join(downloads, file), bytes);
  await writeFile(path.join(downloads, "index.json"), json(catalog));
  const list = (entries) => entries.map(({ name, file }) => `<li><a href="${escapeHtml(file)}" download>${escapeHtml(name)}</a>${name === "autonomous-orchestration" || name === "autonomous-implementation-review" ? " — optional; operator review required" : ""}</li>`).join("\n");
  await writeFile(path.join(downloads, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Claude skill downloads</title></head>
<body><h1>Claude skill downloads</h1>
<p>Community packages, not official Anthropic skills or Hermes scanner-approved installations. Review before enabling. Installation does not grant execution authority.</p>
<p><a href="https://github.com/forgegod/ai-coding-agent-skills#install-with-claude-desktop">Installation instructions and execution requirements</a></p>
<h2>Plugin bundles</h2><p>Recommended: software-development. Upload through Customize → Plugins → Add → Upload plugin. Orchestration is a separate opt-in and requires the general bundle plus separately configured roles.</p><ul>${list(plugins)}</ul>
<h2>Individual skills</h2><p>Upload one ZIP through Customize → Skills → + → Create skill → Upload a skill. Do not unzip it. Related workflows may require other skills.</p><ul>${list(skills)}</ul>
<p><a href="index.json">Download inventory and SHA-256 checksums</a> · <a href="../index.html">Home</a></p>
</body></html>\n`);
  const landing = await readFile(path.join(destination, "index.html"), "utf8");
  await writeFile(path.join(destination, "index.html"), landing.replace("</body>", '<p><a href="downloads/index.html">Claude plugin and skill ZIP downloads</a></p>\n</body>'));
  return { ...result, downloads, catalog };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 2 || args[0] !== "--out" || !args[1])) {
    throw new Error("Usage: node scripts/build-distribution.mjs [--out <directory>]");
  }
  const result = await buildDistribution({ output: args[1] ?? "dist" });
  console.log(`Built ${result.skills.length} skills and ${result.catalog.plugins.length} Claude plugins at ${path.resolve(args[1] ?? "dist")}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
