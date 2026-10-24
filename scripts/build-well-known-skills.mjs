#!/usr/bin/env node
/**
 * Build the static Hermes well-known skill endpoint.
 *
 * Usage:
 *   node scripts/build-well-known-skills.mjs --out <directory>
 */
import { cp, lstat, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supportDirectories = new Set(["assets", "examples", "references", "scripts", "templates"]);

function frontmatter(source, sourcePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) throw new Error(`${sourcePath} has no YAML frontmatter`);
  const fields = parse(match[1]);
  if (!fields || typeof fields !== "object" || Array.isArray(fields) || !match[2].trim()) {
    throw new Error(`${sourcePath} must contain a YAML mapping and non-empty body`);
  }
  return fields;
}

async function skillDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error(`${path.join(directory, entry.name)} is a symlink`);
  }
  const dirs = [];
  if (entries.some((entry) => entry.isFile() && entry.name === "SKILL.md")) {
    dirs.push(directory);
  }
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      dirs.push(...(await skillDirectories(path.join(directory, entry.name))));
    }
  }
  return dirs;
}

async function packageFiles(skillDirectory) {
  const files = ["SKILL.md"];
  for (const directory of supportDirectories) {
    const root = path.join(skillDirectory, directory);
    const info = await lstat(root).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (!info) continue;
    if (info.isSymbolicLink()) throw new Error(`${root} is a symlink`);
    if (!info.isDirectory()) {
      throw new Error(`${root} must be a directory`);
    }
    for (const relative of await regularFiles(root, skillDirectory)) files.push(relative);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

async function regularFiles(directory, skillDirectory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(entry.name) ||
        /^AGENTS\.md$/i.test(entry.name) || /\.(?:pem|key|p12|pfx)$/i.test(entry.name)) {
      throw new Error(`${file} is an unsafe or forbidden package path`);
    }
    if (entry.isDirectory()) {
      files.push(...(await regularFiles(file, skillDirectory)));
    } else if (entry.isFile()) {
      files.push(path.relative(skillDirectory, file).split(path.sep).join("/"));
    } else {
      throw new Error(`${file} must be a regular file or directory`);
    }
  }
  return files;
}

/**
 * Build a Hermes-compatible `/.well-known/skills` directory.
 *
 * @param {{root?: string, output: string}} options
 */
export async function buildWellKnownSkills({ root = scriptRoot, output }) {
  if (!output) throw new Error("An output directory is required");

  const source = path.resolve(root, "skills");
  const destinationRoot = path.resolve(output);
  if (source === destinationRoot || source.startsWith(`${destinationRoot}${path.sep}`) ||
      destinationRoot.startsWith(`${source}${path.sep}`)) {
    throw new Error("Output directory must not overlap canonical skill source");
  }
  const endpoint = path.join(destinationRoot, ".well-known", "skills");
  const packages = await discoverSkillPackages({ root });

  await rm(endpoint, { recursive: true, force: true });
  await mkdir(endpoint, { recursive: true });
  for (const { name, files, directory } of packages) {
    const destination = path.join(endpoint, name);
    await mkdir(destination, { recursive: true });
    for (const file of files) {
      const target = path.join(destination, file);
      await mkdir(path.dirname(target), { recursive: true });
      await cp(path.join(directory, file), target, { verbatimSymlinks: true });
    }
  }
  const skills = packages.map(({ directory, relativePath, ...metadata }) => metadata);
  await writeFile(
    path.join(endpoint, "index.json"),
    `${JSON.stringify({ skills }, null, 2)}\n`,
  );
  await writeFile(path.join(destinationRoot, ".nojekyll"), "");
  await writeFile(path.join(destinationRoot, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Coding Agent Skills</title></head>
<body><h1>AI Coding Agent Skills</h1><p>Portable engineering playbooks for AI coding agents.</p>
<p><a href=".well-known/skills/index.json">Skill discovery index</a></p>
<p><a href="https://github.com/forgegod/ai-coding-agent-skills#install-with-hermes">Catalog and installation instructions</a></p>
</body></html>\n`);
  return { endpoint, skills };
}

/**
 * Discover and validate the complete local packages that the endpoint publishes.
 *
 * @param {{root?: string}} options
 */
export async function discoverSkillPackages({ root = scriptRoot } = {}) {
  const source = path.resolve(root, "skills");
  const packages = [];

  for (const directory of await skillDirectories(source)) {
    const skillPath = path.join(directory, "SKILL.md");
    const fields = frontmatter(await readFile(skillPath, "utf8"), path.relative(root, skillPath));
    const name = fields.name;
    const description = fields.description;
    if (typeof name !== "string" || name.length > 64 || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
      throw new Error(`${path.relative(root, skillPath)} has an invalid public skill name`);
    }
    if (name !== path.basename(directory)) {
      throw new Error(`${path.relative(root, skillPath)} name must match its directory`);
    }
    if (typeof description !== "string" || !description.trim() || description.length > 1024) {
      throw new Error(`${path.relative(root, skillPath)} must have a description up to 1024 characters`);
    }
    if (typeof fields.version !== "string" || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(fields.version)) {
      throw new Error(`${path.relative(root, skillPath)} must have a semantic version`);
    }
    if (packages.some((entry) => entry.name === name)) {
      throw new Error(`duplicate public skill name: ${name}`);
    }

    packages.push({
      name,
      description,
      files: await packageFiles(directory),
      directory,
      relativePath: path.relative(source, directory),
    });
  }

  packages.sort((left, right) => left.name.localeCompare(right.name));
  return packages;
}

async function main() {
  const args = process.argv.slice(2);
  const outputFlag = args.indexOf("--out");
  const output = outputFlag >= 0 ? args[outputFlag + 1] : "dist";
  if (!output || args.some((arg, index) => arg === "--out" && !args[index + 1])) {
    throw new Error("Usage: node scripts/build-well-known-skills.mjs --out <directory>");
  }
  const result = await buildWellKnownSkills({ output });
  console.log(`Built ${result.skills.length} skills at ${result.endpoint}`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
