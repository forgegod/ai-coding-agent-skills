// Shared Git execution contract. Configuration and runtime locations remain trusted.
const refused = new Set(["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_NAMESPACE", "GIT_GRAFT_FILE", "GIT_SHALLOW_FILE", "GIT_REPLACE_REF_BASE", "GIT_CONFIG_COUNT", "GIT_CONFIG_PARAMETERS"]);
const runtime = ["PATH", "HOME", "XDG_CONFIG_HOME", "TMPDIR", "TMP", "TEMP"];
const windows = ["SystemRoot", "WINDIR", "ComSpec", "PATHEXT", "USERPROFILE", "APPDATA", "LOCALAPPDATA"];
const selectors = ["GIT_CONFIG_GLOBAL", "GIT_CONFIG_SYSTEM", "GIT_CONFIG_NOSYSTEM"];
const windowsProcessBaseline = ["HOMEDRIVE", "HOMEPATH", "LOGONSERVER", "SYSTEMDRIVE", "USERDOMAIN", "USERNAME"];

export function gitEnvironment(source, platform = process.platform) {
  const normalize = platform === "win32" ? (name) => name.toUpperCase() : (name) => name;
  const allowed = new Map([...runtime, ...(platform === "win32" ? windows : []), ...selectors].map((name) => [normalize(name), name]));
  const present = new Map();
  // Inspect names only. Refuse overrides and ambiguous aliases before any value read.
  for (const key of Object.keys(source)) {
    const name = normalize(key);
    if (refused.has(name)) throw new Error(`Unsupported Git environment override: ${key}`);
    if (!allowed.has(name)) continue;
    if (present.has(name)) throw new Error(`Ambiguous Git environment aliases: ${allowed.get(name)}`);
    present.set(name, key);
  }
  const env = {};
  for (const [name, key] of present) env[allowed.get(name)] = source[key];
  env.GIT_NO_REPLACE_OBJECTS = "1";
  env.GIT_OPTIONAL_LOCKS = "0";
  env.LC_ALL = "C";
  // Windows injects these names into child processes unless they are explicitly blank.
  if (platform === "win32") for (const name of windowsProcessBaseline) env[name] = "";
  return env;
}
