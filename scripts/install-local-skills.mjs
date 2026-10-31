#!/usr/bin/env node
/**
 * Copy this checkout's complete skill packages into local agent profiles.
 *
 * Usage:
 *   node scripts/install-local-skills.mjs [--profile <name>]... [--client <name>]... [--update] [--dry-run]
 */
import { cp, lstat, mkdir, mkdtemp, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { discoverSkillPackages } from "./build-well-known-skills.mjs";
import { checkRegistration, loadHubLock, recordLocalInstall, removeRegistration } from "./hermes-skill-provenance.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const identityFiles = new Set(["config.yaml", ".env", "SOUL.md", "profile.yaml", "auth.json", "state.db"]);
const profileNamePattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const clientDefinitions = [
  { name: "claude-code", detectionDirectories: [".claude"], storageDirectory: ".claude" },
  { name: "codex", detectionDirectories: [".codex", ".agents"], storageDirectory: ".agents" },
];
const retiredPackages = [
  "application-records",
  "phased-plan-closeout",
  "phased-plan-design",
  "phased-plan-execution",
  "phased-plan-next",
  "phased-plan-overview",
  "phased-plan-refactoring",
].map((name) => ({ name, relativePath: path.join("software-development", name) }));

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
  return profiles;
}

async function clientsAt(userHome, requestedClients) {
  const definitions = new Map(clientDefinitions.map((definition) => [definition.name, definition]));
  const names = requestedClients?.length ? [...new Set(requestedClients)] : clientDefinitions.map(({ name }) => name);
  const clients = [];
  for (const name of names) {
    const definition = definitions.get(name);
    if (!definition) throw new Error(`Unknown client: ${name}`);
    const detected = (await Promise.all(definition.detectionDirectories.map((directory) => directoryExists(path.join(userHome, directory))))).some(Boolean);
    if (!detected) {
      if (requestedClients?.length) throw new Error(`Client '${name}' is not detected under ${userHome}`);
      continue;
    }
    const storageDirectory = path.join(userHome, definition.storageDirectory);
    clients.push({
      name,
      home: userHome,
      storageDirectory,
      skillsDirectory: path.join(storageDirectory, "skills"),
      backupDirectory: path.join(storageDirectory, ".skills-backups"),
    });
  }
  return clients;
}

async function existing(pathname) {
  return (await lstat(pathname).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  })) !== null;
}

async function assertDirectoryChain(base, destination) {
  const relative = path.relative(base, destination);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error(`Destination escapes installation root: ${destination}`);
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
 * @param {{root?: string, hermesHome?: string, userHome?: string, profiles?: string[], clients?: string[], dryRun?: boolean, update?: boolean, purge?: boolean}} options
 */
export async function installLocalSkills({
  root = scriptRoot,
  hermesHome,
  userHome,
  profiles: requestedProfiles,
  clients: requestedClients,
  dryRun = false,
  update = false,
  purge = false,
} = {}) {
  const packages = await discoverSkillPackages({ root });
  const home = path.resolve(hermesHome === undefined ? path.join(os.homedir(), ".hermes") : hermesHome);
  const user = path.resolve(userHome === undefined ? os.homedir() : userHome);
  const hasSelectors = requestedProfiles?.length || requestedClients?.length;
  const selectProfiles = hasSelectors ? requestedProfiles?.length : hermesHome !== undefined || userHome === undefined;
  const selectClients = hasSelectors ? requestedClients?.length : userHome !== undefined || hermesHome === undefined;
  const profiles = selectProfiles ? await profilesAt(home, requestedProfiles) : [];
  const clients = selectClients ? await clientsAt(user, requestedClients) : [];
  if (!profiles.length && !clients.length) throw new Error(`No local Hermes profiles or supported client configurations found under ${home} and ${user}`);
  const canonicalHome = profiles.length ? await realpath(home) : null;
  const canonicalUserHome = clients.length ? await realpath(user) : null;
  const source = await realpath(path.join(root, "skills"));
  const collisions = [];
  const plan = [];
  const batch = randomUUID();
  const locks = new Map();

  const targets = [
    ...profiles.map((profile) => ({
      key: `profile:${profile.name}`,
      kind: "hermes",
      name: profile.name,
      profile,
      home: profile.home,
      base: home,
      canonicalBase: canonicalHome,
      skillsDirectory: path.join(profile.home, "skills"),
      backupDirectory: path.join(profile.home, ".skills-backups"),
      stagingDirectory: profile.home,
    })),
    ...clients.map((client) => ({
      key: `client:${client.name}`,
      kind: "client",
      name: client.name,
      client,
      home: client.home,
      base: user,
      canonicalBase: canonicalUserHome,
      skillsDirectory: client.skillsDirectory,
      backupDirectory: client.backupDirectory,
      stagingDirectory: client.storageDirectory,
    })),
  ];

  for (const profile of profiles) {
    await assertDirectoryChain(home, path.join(profile.home, "skills", ".hub"));
    const lock = await loadHubLock(profile.home);
    locks.set(profile.name, lock);
  }
  for (const target of targets) {
    const lock = target.profile ? locks.get(target.profile.name) : null;
    for (const skill of packages) {
      if (lock) checkRegistration(lock, skill);
      const relativePath = target.kind === "hermes" ? skill.relativePath : skill.name;
      const destination = path.join(target.skillsDirectory, relativePath);
      await assertDirectoryChain(target.base, destination);
      const canonicalDestination = path.join(target.canonicalBase, path.relative(target.base, destination));
      if (source === canonicalDestination || source.startsWith(`${canonicalDestination}${path.sep}`) || canonicalDestination.startsWith(`${source}${path.sep}`)) {
        throw new Error("Installation destination must not overlap canonical skill source");
      }
      const present = await existing(destination);
      if (present && update) await assertDirectoryChain(target.base, target.backupDirectory);
      if (present && !update) collisions.push(`${target.name}: ${relativePath}`);
      plan.push({ target, profile: target.profile, client: target.client, skill, relativePath, destination, action: present ? "update" : "install",
        backup: present ? path.join(target.backupDirectory, batch, relativePath) : null });
    }
  }
  const purgePlan = [];
  if (purge) {
    for (const target of targets) {
      const lock = target.profile ? locks.get(target.profile.name) : null;
      for (const legacy of retiredPackages) {
        const relativePath = target.kind === "hermes" ? legacy.relativePath : legacy.name;
        const destination = path.join(target.skillsDirectory, relativePath);
        await assertDirectoryChain(target.base, destination);
        const canonicalDestination = path.join(target.canonicalBase, path.relative(target.base, destination));
        if (source === canonicalDestination || source.startsWith(`${canonicalDestination}${path.sep}`) || canonicalDestination.startsWith(`${source}${path.sep}`)) {
          throw new Error("Retirement destination must not overlap canonical skill source");
        }
        if (!(await existing(destination))) continue;
        const registration = lock?.data.installed[legacy.name];
        if (registration) checkRegistration(lock, legacy);
        await assertDirectoryChain(target.base, target.backupDirectory);
        const backup = path.join(target.backupDirectory, batch, relativePath);
        const registrationBackup = registration
          ? path.join(target.backupDirectory, batch, "retired-hermes-registrations", `${relativePath}.json`)
          : null;
        if (registrationBackup) await assertDirectoryChain(target.base, path.dirname(registrationBackup));
        purgePlan.push({ target, profile: target.profile, client: target.client, legacy, relativePath, destination, backup, registration, registrationBackup });
      }
    }
  }
  if (collisions.length) {
    throw new Error(`Refusing to overwrite existing skill packages:\n${collisions.map((entry) => `- ${entry}`).join("\n")}`);
  }

  const backups = [];
  let installed = 0;
  let updated = 0;
  let purged = 0;
  if (!dryRun) {
    const staging = new Map();
    try {
      // Same-filesystem staging allows package-directory renames. Finish copying
      // every package before touching any installed package.
      for (const target of targets) {
        await mkdir(target.stagingDirectory, { recursive: true });
        await assertDirectoryChain(target.base, target.stagingDirectory);
        staging.set(target.key, await mkdtemp(path.join(target.stagingDirectory, ".skills-staging-")));
      }
      for (const { target, skill, relativePath } of plan) {
        for (const file of skill.files) {
          const stagedFile = path.join(staging.get(target.key), relativePath, file);
          await mkdir(path.dirname(stagedFile), { recursive: true });
          await cp(path.join(skill.directory, file), stagedFile, { errorOnExist: true, force: false, verbatimSymlinks: true });
        }
      }
      for (const entry of plan) {
        const { target, profile, client, skill, relativePath, destination, action, backup } = entry;
        await assertDirectoryChain(target.base, destination);
        if (backup) await assertDirectoryChain(target.base, path.dirname(backup));
        if (await existing(destination) !== (action === "update")) throw new Error(`Destination changed during installation: ${destination}`);
        await mkdir(path.dirname(destination), { recursive: true });
        if (backup) {
          await mkdir(path.dirname(backup), { recursive: true, mode: 0o700 });
          await rename(destination, backup);
          backups.push({ target: target.name, profile: profile?.name, client: client?.name, skill: skill.name, path: backup });
        }
        const staged = path.join(staging.get(target.key), relativePath);
        let activated = false;
        try {
          await rename(staged, destination);
          activated = true;
          if (profile) {
            await assertDirectoryChain(home, path.join(profile.home, "skills", ".hub"));
            await recordLocalInstall(locks.get(profile.name), skill, destination);
          }
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
      for (const entry of purgePlan) {
        const { target, profile, client, legacy, destination, backup, registration, registrationBackup } = entry;
        await assertDirectoryChain(target.base, destination);
        await assertDirectoryChain(target.base, path.dirname(backup));
        if (!(await existing(destination))) throw new Error(`Retirement destination changed during installation: ${destination}`);
        await mkdir(path.dirname(backup), { recursive: true, mode: 0o700 });
        await rename(destination, backup);
        const packageBackupIndex = backups.length;
        backups.push({ kind: "retired-package", target: target.name, profile: profile?.name, client: client?.name, skill: legacy.name, path: backup });
        try {
          if (registration) {
            await mkdir(path.dirname(registrationBackup), { recursive: true, mode: 0o700 });
            await writeFile(registrationBackup, JSON.stringify(registration, null, 2) + "\n", { flag: "wx", mode: 0o600 });
            backups.push({ kind: "retired-registration", target: target.name, profile: profile.name, skill: legacy.name, path: registrationBackup });
            await removeRegistration(locks.get(profile.name), legacy);
          }
        } catch (error) {
          if (!(await existing(destination)) && (await existing(backup))) {
            await rename(backup, destination);
            backups.splice(packageBackupIndex, 1);
          }
          throw error;
        }
        purged++;
      }
    } catch (error) {
      throw new Error(`Installation stopped: ${error.message}. Earlier packages may already be installed, updated, or purged. Preserved backup locations: ${backups.map((entry) => entry.path).join(", ") || "none"}`, { cause: error });
    } finally {
      for (const directory of staging.values()) await rm(directory, { recursive: true, force: true });
    }
  }

  return { packages, profiles, clients, plan, purgePlan, backups, installed, updated, purged, copied: installed + updated };
}

function usage() {
  return `Usage: node scripts/install-local-skills.mjs [options]

Copies every complete package in this checkout into local Hermes profiles and
detected user-global Claude Code/Codex skill directories.

Options:
  --profile <name>      Install only this profile; repeat for multiple profiles.
  --client <name>       Install only this detected client; claude-code or codex.
  --all                 Install every recognized target within home-root scope.
  --update              Also replace existing packages, preserving full backups.
  --purge               Retire only this project's known historical packages.
  --hermes-home <path>  Override the Hermes base (~/.hermes), not a named profile.
  --user-home <path>    Override the user home used for Claude Code and Codex.
  --dry-run             Validate sources, profiles, and collisions without copying.
  --help                Show this message.

With no selectors or home overrides, all recognized targets are selected.
With no selectors, --hermes-home alone selects only Hermes profiles, and
--user-home alone selects only native clients; both roots enable both families.
--all follows the same home-root isolation and cannot be combined with selectors.
--profile and --client select only the named targets and may be combined, including
to opt in to the other family. An omitted root then uses its normal user-home
default: --user-home does not rebase Hermes, and HERMES_HOME is not used.

Without --update, existing packages are refused. Updates replace entire packages,
including stale support files; old packages remain under each target's
.skills-backups/<batch>/ path. Unrelated skills are untouched. Stop affected
agents before updating. Do not run concurrent installers. This local copy does
not run the Hermes Skills Hub security scanner or establish cross-host execution
compatibility; review the checkout before using it. Hermes copies record
community/unscanned provenance and an installed-content hash for the public
well-known source, so later hermes skills update uses the internet source and
normal scanning. Unpublished local versions may be replaced by older published
content. Do not run this installer concurrently with Hermes skill updates.`;
}

function parseArgs(args) {
  const profiles = [];
  const clients = [];
  let hermesHome;
  let userHome;
  let dryRun = false;
  let update = false;
  let purge = false;
  let all = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help") return { help: true };
    if (arg === "--profile") {
      const name = args[++index];
      if (!name) throw new Error("--profile requires a profile name");
      profiles.push(name);
    } else if (arg === "--client") {
      const name = args[++index];
      if (!name) throw new Error("--client requires a client name");
      clients.push(name);
    } else if (arg === "--hermes-home") {
      hermesHome = args[++index];
      if (!hermesHome) throw new Error("--hermes-home requires a path");
    } else if (arg === "--user-home") {
      userHome = args[++index];
      if (!userHome) throw new Error("--user-home requires a path");
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--update") {
      update = true;
    } else if (arg === "--purge") {
      purge = true;
    } else if (arg === "--all") {
      all = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (all && (profiles.length || clients.length)) throw new Error("--all cannot be combined with --profile or --client");
  return { profiles: profiles.length ? profiles : undefined, clients: clients.length ? clients : undefined, hermesHome, userHome, dryRun, update, purge };
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
      const entries = result.plan.filter((entry) => entry.profile?.name === profile.name);
      const installs = entries.filter((entry) => entry.action === "install").length;
      console.log(`${action} ${installs} and ${options.dryRun ? "update" : "updated"} ${entries.length - installs} skill packages in ${profile.name}.`);
    } else {
      console.log(`${action} ${result.packages.length} skill package${result.packages.length === 1 ? "" : "s"} into ${profile.name}.`);
    }
  }
  for (const client of result.clients) {
    if (options.update) {
      const entries = result.plan.filter((entry) => entry.client?.name === client.name);
      const installs = entries.filter((entry) => entry.action === "install").length;
      console.log(`${action} ${installs} and ${options.dryRun ? "update" : "updated"} ${entries.length - installs} skill packages in ${client.name}.`);
    } else {
      console.log(`${action} ${result.packages.length} skill package${result.packages.length === 1 ? "" : "s"} into ${client.name}.`);
    }
  }
  if (options.purge) {
    const verb = options.dryRun ? "Would purge" : "Purged";
    for (const profile of result.profiles) {
      const count = result.purgePlan.filter((entry) => entry.profile?.name === profile.name).length;
      if (count) console.log(`${verb} ${count} historical skill package${count === 1 ? "" : "s"} from ${profile.name}.`);
    }
    for (const client of result.clients) {
      const count = result.purgePlan.filter((entry) => entry.client?.name === client.name).length;
      if (count) console.log(`${verb} ${count} historical skill package${count === 1 ? "" : "s"} from ${client.name}.`);
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
