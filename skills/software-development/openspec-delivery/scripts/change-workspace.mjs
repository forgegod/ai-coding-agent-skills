#!/usr/bin/env node
/** Read-only worktree previews. The authorized orchestrator executes returned argv. */
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, realpathSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const refused = ["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_GRAFT_FILE", "GIT_REPLACE_REF_BASE", "GIT_SHALLOW_FILE", "GIT_CONFIG_COUNT", "GIT_CONFIG_PARAMETERS", "GIT_NAMESPACE"];
const env = { ...process.env, GIT_NO_REPLACE_OBJECTS: "1", GIT_OPTIONAL_LOCKS: "0" };
function git(repo, ...args) {
  return execFileSync("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "-C", repo, ...args], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024 }).trimEnd();
}
function canonical(file) {
  requireThat(path.isAbsolute(file) && !/[\x00-\x1f\x7f]/.test(file), "Expected an absolute safe workspace path");
  requireThat(path.normalize(file) === file, "Expected a normalized path");
  requireThat(file === path.join(realpathSync(path.dirname(file)), path.basename(file)), "Expected a canonical parent, not a symlink alias");
  requireThat(!lstatSync(file, { throwIfNoEntry: false })?.isSymbolicLink(), "Workspace path is a symlink");
  return file;
}
function topology(repo) {
  requireThat(!git(repo, "for-each-ref", "--format=%(refname)", "refs/replace/"), "Git replace refs are unsupported; preserve work and use an unmodified object graph");
  requireThat(!existsSync(git(repo, "rev-parse", "--path-format=absolute", "--git-path", "info/grafts")), "Git grafts are unsupported");
}
function planningPaths(repo, change) {
  let current = repo;
  for (const segment of ["openspec", "changes", change]) {
    current = path.join(current, segment);
    const entry = lstatSync(current, { throwIfNoEntry: false });
    if (!entry) break;
    requireThat(!entry.isSymbolicLink() && entry.isDirectory(), "Planning directory is a symlink or not a directory");
  }
}
function commit(repo, value) {
  requireThat(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value), "Expected a full lowercase base/head/target object ID");
  requireThat(git(repo, "rev-parse", "--verify", `${value}^{commit}`) === value, "Expected exact commit identity");
  return value;
}
function ancestor(repo, base, head) {
  try { git(repo, "merge-base", "--is-ancestor", base, head); }
  catch { throw new Error("Expected base/head ancestor reachable from the named target"); }
}
const dirty = (repo) => Boolean(git(repo, "status", "--porcelain=v1", "--untracked-files=all", "--ignore-submodules=none"));
const common = (repo) => realpathSync(git(repo, "rev-parse", "--path-format=absolute", "--git-common-dir"));
const overlaps = (a, b) => { const relative = path.relative(a, b); return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)); };
function inventory(repo) {
  return git(repo, "worktree", "list", "--porcelain", "-z").split("\0\0").filter(Boolean).map((block) => Object.fromEntries(block.split("\0").filter(Boolean).map((line) => {
    const at = line.indexOf(" ");
    return at < 0 ? [line, true] : [line.slice(0, at), line.slice(at + 1)];
  })));
}
function locate(o, entries, branch) {
  const matches = entries.filter((entry) => entry.branch === `refs/heads/${branch}`);
  requireThat(matches.length === 1, "Expected exactly one registered change worktree; use recovery");
  const entry = matches[0];
  requireThat(!entry.locked && !entry.prunable && !entry.bare, "Worktree is locked, prunable or bare; preserve and resolve ownership");
  const workspace = canonical(entry.worktree);
  requireThat(workspace !== realpathSync(o.repo), "Primary/caller checkout cannot be adopted or retired as a dedicated worktree");
  requireThat(!o.workspace || canonical(o.workspace) === workspace, "Selected workspace differs from registered branch ownership");
  requireThat(realpathSync(git(workspace, "rev-parse", "--show-toplevel")) === workspace, "Worktree root changed");
  requireThat(common(workspace) === common(o.repo), "Worktree belongs to another repository");
  requireThat(git(workspace, "symbolic-ref", "--short", "HEAD") === branch, "Worktree branch changed");
  const head = commit(o.repo, entry.HEAD);
  requireThat(git(workspace, "rev-parse", "HEAD") === head, "Worktree HEAD changed");
  topology(workspace);
  planningPaths(workspace, o.change);
  ancestor(o.repo, o.base, head);
  return { workspace, branch, base: o.base, head, dirty: dirty(workspace) };
}
function main() {
  for (const name of refused) requireThat(process.env[name] === undefined, `Unsupported Git environment override: ${name}`);
  const command = process.argv[2];
  requireThat(["prepare", "locate", "retire"].includes(command), "Expected prepare, locate or retire");
  const args = process.argv.slice(3);
  const seen = new Set();
  for (const arg of args) {
    const key = /^--([^=]+)/.exec(arg)?.[1];
    if (key) { requireThat(!seen.has(key), `Duplicate option --${key}`); seen.add(key); }
  }
  const names = ["repo", "change", "base", "workspace", "branch", ...(command === "retire" ? ["head", "target"] : [])];
  const { values: o } = parseArgs({ args, options: Object.fromEntries(names.map((key) => [key, { type: "string" }])), strict: true, allowPositionals: false });
  for (const key of ["repo", "change", "base", ...(command === "retire" ? ["head", "target"] : [])]) requireThat(o[key], `Missing --${key}`);
  requireThat(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(o.change) && o.change.length <= 200 && o.change !== "archive", "Malformed full change name");
  canonical(o.repo);
  requireThat(realpathSync(git(o.repo, "rev-parse", "--show-toplevel")) === o.repo, "Expected the canonical repository root");
  topology(o.repo);
  planningPaths(o.repo, o.change);
  commit(o.repo, o.base);
  const branch = o.branch ?? `change/${o.change}`;
  requireThat(!branch.startsWith("-") && git(o.repo, "check-ref-format", "--branch", branch) === branch, "Invalid branch");
  const entries = inventory(o.repo);
  if (command === "locate" || command === "retire" || entries.some((entry) => entry.branch === `refs/heads/${branch}`)) {
    const found = locate(o, entries, branch);
    if (command === "retire") {
      requireThat(found.head === commit(o.repo, o.head), "Worktree head changed since closure readback");
      requireThat(!found.dirty && !dirty(o.repo), "Both checkouts must be clean before retirement");
      ancestor(o.repo, found.head, commit(o.repo, o.target));
      return { ...found, action: "retire", target: o.target, argv: ["git", "-C", o.repo, "worktree", "remove", "--", found.workspace] };
    }
    return { ...found, action: command === "prepare" ? "reuse" : "located" };
  }
  requireThat(git(o.repo, "rev-parse", "HEAD") === o.base, "Source HEAD differs from captured base");
  requireThat(!dirty(o.repo), "Source checkout must be clean; preserve drafts and resolve ownership");
  requireThat(!git(o.repo, "for-each-ref", "--format=%(refname)", `refs/heads/${branch}`, `refs/remotes/*/${branch}`), "Branch already exists without a reusable registered worktree; use recovery");
  const workspace = canonical(o.workspace ?? path.join(path.dirname(o.repo), `${path.basename(o.repo)}--${o.change}`));
  requireThat(!lstatSync(workspace, { throwIfNoEntry: false }), "Workspace destination already exists");
  for (const entry of entries) requireThat(!overlaps(entry.worktree, workspace) && !overlaps(workspace, entry.worktree), "Workspace overlaps or is inside an existing checkout");
  return { action: "create", workspace, branch, base: o.base, argv: ["git", "-C", o.repo, "worktree", "add", "-b", branch, "--", workspace, o.base] };
}
try { console.log(JSON.stringify({ ok: true, ...main() })); }
catch (error) { console.log(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; }
