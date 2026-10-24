#!/usr/bin/env node
/**
 * Copy this checkout's complete skill packages into local Hermes profiles.
 *
 * Usage:
 *   node scripts/install-local-skills.mjs [--profile <name>]... [--update] [--dry-run]
 */
import { cp, lstat, mkdir, mkdtemp, readdir, realpath, rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { discoverSkillPackages } from "./build-well-known-skills.mjs";
import { checkRegistration, loadHubLock, recordLocalInstall } from "./hermes-skill-provenance.mjs";

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

async function assertDirectoryChain(base, destination) {
  const relative = path.relative(base, destination);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error(`Destination escapes Hermes home: ${destination}`);
  let current = base;
  for (const part of ["", ...relative.split(path.sep).filter(Boolean)]) {
    current = path.join(current, part);
    const info = await lstat(current).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (!info) return;
    if (info.isSymbolicLink()) throw new Error(`Refusing symlink destination: ${current}`);
    if (!info.isDirectory()) throw new Error(`Destination must be a directory: ${current}`);
  }
}

/**
 * Install every validated package; explicit updates preserve old packages as backups.
 *
 * @param {{root?: string, hermesHome?: string, profiles?: string[], dryRun?: boolean, update?: boolean}} options
 */
export async function installLocalSkills({
  root = scriptRoot,
  hermesHome = path.join(os.homedir(), ".hermes"),
  profiles: requestedProfiles,
  dryRun = false,
  update = false,
} = {}) {
  const packages = await discoverSkillPackages({ root });
  const home = path.resolve(hermesHome);
  const profiles = await profilesAt(home, requestedProfiles);
  const canonicalHome = await realpath(home);
  const source = await realpath(path.join(root, "skills"));
  const collisions = [];
  const plan = [];
  const batch = randomUUID();
  const locks = new Map();

  for (const profile of profiles) {
    await assertDirectoryChain(home, path.join(profile.home, "skills", ".hub"));
    const lock = await loadHubLock(profile.home);
    locks.set(profile.name, lock);
    for (const skill of packages) {
      checkRegistration(lock, skill);
      const destination = path.join(profile.home, "skills", skill.relativePath);
      await assertDirectoryChain(home, destination);
      const canonicalDestination = path.join(canonicalHome, path.relative(home, destination));
      if (source === canonicalDestination || source.startsWith(`${canonicalDestination}${path.sep}`) || canonicalDestination.startsWith(`${source}${path.sep}`)) {
        throw new Error("Installation destination must not overlap canonical skill source");
      }
      const present = await existing(destination);
      if (present && update) await assertDirectoryChain(home, path.join(profile.home, ".skills-backups"));
      if (present && !update) collisions.push(`${profile.name}: ${skill.relativePath}`);
      plan.push({ profile, skill, destination, action: present ? "update" : "install",
        backup: present ? path.join(profile.home, ".skills-backups", batch, skill.relativePath) : null });
    }
  }
  if (collisions.length) {
    throw new Error(`Refusing to overwrite existing skill packages:\n${collisions.map((entry) => `- ${entry}`).join("\n")}`);
  }

  const backups = [];
  let installed = 0;
  let updated = 0;
  if (!dryRun) {
    const staging = new Map();
    try {
      // Same-filesystem staging allows package-directory renames. Finish copying
      // every package before touching any installed package.
      for (const profile of profiles) staging.set(profile.name, await mkdtemp(path.join(profile.home, ".skills-staging-")));
      for (const { profile, skill } of plan) {
        for (const file of skill.files) {
          const target = path.join(staging.get(profile.name), skill.relativePath, file);
          await mkdir(path.dirname(target), { recursive: true });
          await cp(path.join(skill.directory, file), target, { errorOnExist: true, force: false, verbatimSymlinks: true });
        }
      }
      for (const entry of plan) {
        const { profile, skill, destination, action, backup } = entry;
        await assertDirectoryChain(home, destination);
        if (backup) await assertDirectoryChain(home, path.dirname(backup));
        if (await existing(destination) !== (action === "update")) throw new Error(`Destination changed during installation: ${destination}`);
        await mkdir(path.dirname(destination), { recursive: true });
        if (backup) {
          await mkdir(path.dirname(backup), { recursive: true, mode: 0o700 });
          await rename(destination, backup);
          backups.push({ profile: profile.name, skill: skill.name, path: backup });
        }
        const staged = path.join(staging.get(profile.name), skill.relativePath);
        let activated = false;
        try {
          await rename(staged, destination);
          activated = true;
          await assertDirectoryChain(home, path.join(profile.home, "skills", ".hub"));
          await recordLocalInstall(locks.get(profile.name), skill, destination);
        } catch (error) {
          if (activated) await rename(destination, staged);
          if (backup && !(await existing(destination))) {
            await rename(backup, destination);
            backups.pop();
          }
          throw error;
        }
        if (action === "update") updated++;
        else installed++;
      }
    } catch (error) {
      throw new Error(`Installation stopped: ${error.message}. Earlier packages may already be installed/updated. Preserved backup locations: ${backups.map((entry) => entry.path).join(", ") || "none"}`, { cause: error });
    } finally {
      for (const directory of staging.values()) await rm(directory, { recursive: true, force: true });
    }
  }

  return { packages, profiles, plan, backups, installed, updated, copied: installed + updated };
}

function usage() {
  return `Usage: node scripts/install-local-skills.mjs [options]

Copies every complete package in this checkout into local Hermes profiles.

Options:
  --profile <name>      Install only this profile; repeat for multiple profiles.
  --all                 Install every recognized local profile (the default).
  --update              Also replace existing packages, preserving full backups.
  --hermes-home <path>  Override ~/.hermes, primarily for an alternate local home.
  --dry-run             Validate sources, profiles, and collisions without copying.
  --help                Show this message.

Without --update, existing packages are refused. Updates replace entire packages,
including stale support files; old packages remain under each profile's
.skills-backups/<batch>/<category>/<skill>. Unrelated skills are untouched.
Stop agents using the selected profiles before updating. Do not run concurrent
installers. This local copy does not run the Hermes Skills Hub security scanner;
review the checkout before using it. It records community/unscanned provenance
and an installed-content hash for the public well-known source, so later
hermes skills update uses the internet source and normal scanning. Unpublished
local versions may be replaced by older published content. Do not run this
installer concurrently with Hermes skill updates.`;
}

function parseArgs(args) {
  const profiles = [];
  let hermesHome;
  let dryRun = false;
  let update = false;
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
    } else if (arg === "--update") {
      update = true;
    } else if (arg === "--all") {
      all = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (all && profiles.length) throw new Error("--all cannot be combined with --profile");
  return { profiles: profiles.length ? profiles : undefined, hermesHome, dryRun, update };
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
    if (options.update) {
      const entries = result.plan.filter((entry) => entry.profile.name === profile.name);
      const installs = entries.filter((entry) => entry.action === "install").length;
      console.log(`${action} ${installs} and ${options.dryRun ? "update" : "updated"} ${entries.length - installs} skill packages in ${profile.name}.`);
    } else {
      console.log(`${action} ${result.packages.length} skill package${result.packages.length === 1 ? "" : "s"} into ${profile.name}.`);
    }
  }
  for (const backup of result.backups) console.log(`Backup: ${backup.path}`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
