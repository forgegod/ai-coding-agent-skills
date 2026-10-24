#!/usr/bin/env node
/**
 * Copy this checkout's complete skill packages into local Hermes profiles.
 *
 * Usage:
 *   node scripts/install-local-skills.mjs [--profile <name>]... [--dry-run]
 */
import { cp, lstat, mkdir, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { discoverSkillPackages } from "./build-well-known-skills.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const identityFiles = new Set(["config.yaml", ".env", "SOUL.md", "profile.yaml", "auth.json", "state.db"]);
const profileNamePattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

async function directoryExists(directory) {
  const info = await lstat(directory).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  return Boolean(info?.isDirectory());
}

async function isHermesProfile(directory) {
  if (!(await directoryExists(directory))) return false;
  for (const name of identityFiles) {
    const info = await lstat(path.join(directory, name)).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (info?.isFile()) return true;
  }
  return false;
}

function validateProfileName(name) {
  if (name === "default") return;
  if (!profileNamePattern.test(name)) {
    throw new Error(`Invalid profile name: ${name}`);
  }
}

async function profilesAt(hermesHome, requestedProfiles) {
  if (requestedProfiles?.length) {
    const unique = [...new Set(requestedProfiles)];
    const profiles = [];
    for (const name of unique) {
      validateProfileName(name);
      const home = name === "default" ? hermesHome : path.join(hermesHome, "profiles", name);
      if (!(await isHermesProfile(home))) {
        throw new Error(`Profile '${name}' is not a local Hermes profile at ${home}`);
      }
      profiles.push({ name, home });
    }
    return profiles;
  }

  const profiles = [];
  if (await isHermesProfile(hermesHome)) profiles.push({ name: "default", home: hermesHome });
  const namedProfiles = path.join(hermesHome, "profiles");
  if (await directoryExists(namedProfiles)) {
    for (const entry of await readdir(namedProfiles, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith(".") || !profileNamePattern.test(entry.name)) continue;
      const home = path.join(namedProfiles, entry.name);
      if (await isHermesProfile(home)) profiles.push({ name: entry.name, home });
    }
  }
  profiles.sort((left, right) => left.name.localeCompare(right.name));
  if (!profiles.length) {
    throw new Error(`No local Hermes profiles found under ${hermesHome}`);
  }
  return profiles;
}

async function existing(pathname) {
  return (await lstat(pathname).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  })) !== null;
}

/**
 * Install every validated package in this checkout without overwriting profiles.
 *
 * @param {{root?: string, hermesHome?: string, profiles?: string[], dryRun?: boolean}} options
 */
export async function installLocalSkills({
  root = scriptRoot,
  hermesHome = path.join(os.homedir(), ".hermes"),
  profiles: requestedProfiles,
  dryRun = false,
} = {}) {
  const packages = await discoverSkillPackages({ root });
  const profiles = await profilesAt(path.resolve(hermesHome), requestedProfiles);
  const collisions = [];

  for (const profile of profiles) {
    for (const skill of packages) {
      const destination = path.join(profile.home, "skills", skill.relativePath);
      if (await existing(destination)) collisions.push(`${profile.name}: ${skill.relativePath}`);
    }
  }
  if (collisions.length) {
    throw new Error(`Refusing to overwrite existing skill packages:\n${collisions.map((entry) => `- ${entry}`).join("\n")}`);
  }

  if (!dryRun) {
    for (const profile of profiles) {
      for (const skill of packages) {
        const destination = path.join(profile.home, "skills", skill.relativePath);
        for (const file of skill.files) {
          const target = path.join(destination, file);
          await mkdir(path.dirname(target), { recursive: true });
          await cp(path.join(skill.directory, file), target, { errorOnExist: true, force: false, verbatimSymlinks: true });
        }
      }
    }
  }

  return { packages, profiles, copied: dryRun ? 0 : packages.length * profiles.length };
}

function usage() {
  return `Usage: node scripts/install-local-skills.mjs [options]

Copies every complete package in this checkout into local Hermes profiles.

Options:
  --profile <name>      Install only this profile; repeat for multiple profiles.
  --all                 Install every recognized local profile (the default).
  --hermes-home <path>  Override ~/.hermes, primarily for an alternate local home.
  --dry-run             Validate sources, profiles, and collisions without copying.
  --help                Show this message.

Existing packages are never replaced. This local copy helper does not run the
Hermes Skills Hub security scanner; review the checkout before using it.`;
}

function parseArgs(args) {
  const profiles = [];
  let hermesHome;
  let dryRun = false;
  let all = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help") return { help: true };
    if (arg === "--profile") {
      const name = args[++index];
      if (!name) throw new Error("--profile requires a profile name");
      profiles.push(name);
    } else if (arg === "--hermes-home") {
      hermesHome = args[++index];
      if (!hermesHome) throw new Error("--hermes-home requires a path");
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--all") {
      all = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (all && profiles.length) throw new Error("--all cannot be combined with --profile");
  return { profiles: profiles.length ? profiles : undefined, hermesHome, dryRun };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const result = await installLocalSkills(options);
  const action = options.dryRun ? "Would install" : "Installed";
  for (const profile of result.profiles) {
    console.log(`${action} ${result.packages.length} skill package${result.packages.length === 1 ? "" : "s"} into ${profile.name}.`);
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
