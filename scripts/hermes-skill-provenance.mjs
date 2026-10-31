// Hermes HubLockFile v1 compatibility. Local bytes are not a hub scan attestation.
import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const upstreamSkills = "https://forgegod.github.io/ai-coding-agent-skills/.well-known/skills";

async function readLock(file) {
  const info = await lstat(file).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (!info) return null;
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Hub lock must be a regular file, not a symlink: ${file}`);
  return readFile(file, "utf8");
}

export async function loadHubLock(home) {
  const file = path.join(home, "skills", ".hub", "lock.json");
  const raw = await readLock(file);
  let data;
  try { data = raw === null ? { version: 1, installed: {} } : JSON.parse(raw); }
  catch { throw new Error(`Malformed Hermes hub lock: ${file}`); }
  if (data?.version !== 1 || !data.installed || typeof data.installed !== "object" || Array.isArray(data.installed)) throw new Error(`Unsupported Hermes hub lock: ${file}`);
  return { file, raw, data };
}

export function checkRegistration(lock, skill) {
  const previous = lock.data.installed[skill.name];
  if (previous === undefined) return;
  const installPath = skill.relativePath.split(path.sep).join("/");
  if (previous?.install_path !== installPath || previous?.source !== "well-known" || previous?.identifier !== `well-known:${upstreamSkills}/${skill.name}`) {
    throw new Error(`Conflicting Hermes hub registration for ${skill.name}; resolve its existing source/path before local installation`);
  }
}

async function persistLock(lock, data) {
  if (await readLock(lock.file) !== lock.raw) throw new Error(`Hermes hub lock changed during installation: ${lock.file}`);
  const raw = JSON.stringify(data, null, 2) + "\n";
  await mkdir(path.dirname(lock.file), { recursive: true });
  const temporary = path.join(path.dirname(lock.file), `.lock-${randomUUID()}.json`);
  try {
    await writeFile(temporary, raw, { flag: "wx", mode: 0o600 });
    await rename(temporary, lock.file);
    lock.raw = raw;
    lock.data = data;
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function localContentHash(directory, files) {
  // Matches tools.skills_guard.content_hash: POSIX paths, NUL, raw bytes,
  // case-sensitive lexical ordering, first 16 SHA-256 hex digits.
  const hash = createHash("sha256");
  for (const file of [...files].sort()) {
    hash.update(file, "utf8");
    hash.update(Buffer.from([0]));
    hash.update(await readFile(path.join(directory, file)));
  }
  return `sha256:${hash.digest("hex").slice(0, 16)}`;
}

export async function recordLocalInstall(lock, skill, directory) {
  checkRegistration(lock, skill);
  const now = new Date().toISOString();
  const entry = {
    source: "well-known",
    identifier: `well-known:${upstreamSkills}/${skill.name}`,
    trust_level: "community",
    scan_verdict: "unscanned",
    content_hash: await localContentHash(directory, skill.files),
    install_path: skill.relativePath.split(path.sep).join("/"),
    files: skill.files,
    metadata: { install_method: "local-checkout", update_source: `${upstreamSkills}/${skill.name}` },
    scan_provenance: {},
    installed_at: lock.data.installed[skill.name]?.installed_at ?? now,
    updated_at: now,
  };
  const data = { ...lock.data, installed: { ...lock.data.installed, [skill.name]: entry } };
  await persistLock(lock, data);
}

export async function removeRegistration(lock, skill) {
  checkRegistration(lock, skill);
  const previous = lock.data.installed[skill.name];
  if (previous === undefined) return undefined;
  const installed = { ...lock.data.installed };
  delete installed[skill.name];
  await persistLock(lock, { ...lock.data, installed });
  return previous;
}
