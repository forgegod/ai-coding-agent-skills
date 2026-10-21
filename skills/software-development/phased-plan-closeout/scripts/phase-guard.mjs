#!/usr/bin/env node
// Read-only Git/CHG preflight. Never stages, commits, merges, or repairs files.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const details = {};
function requireThat(condition, message) {
  if (!condition) throw new Error(message);
}
function gitRaw(repo, ...args) {
  return execFileSync("git", ["-C", repo, ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  });
}
function git(repo, ...args) {
  return gitRaw(repo, ...args).trim();
}
function sha(value) {
  requireThat(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value ?? ""), "Expected a full commit SHA");
  return value;
}
function checkout(repo, branch, head) {
  requireThat(realpathSync(repo) === realpathSync(git(repo, "rev-parse", "--show-toplevel")), "Expected checkout root");
  requireThat(git(repo, "symbolic-ref", "--short", "HEAD") === branch, "Unexpected checkout branch");
  requireThat(git(repo, "rev-parse", "HEAD") === sha(head), "Checkout HEAD changed");
  requireThat(git(repo, "status", "--porcelain=v1", "--untracked-files=all") === "", "Checkout is dirty; preserve its changes");
}
function ancestor(repo, older, newer) {
  git(repo, "merge-base", "--is-ancestor", older, newer);
}
function phaseRow(repo, ref, chg, phase) {
  const text = git(repo, "show", `${ref}:${chg}`);
  const tables = [];
  let rows = null;
  let fenced = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (!line.trim().startsWith("|")) { rows = null; continue; }
    const cells = line.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((cell) => cell.trim());
    if (cells.join("|") === "#|Phase|Status|Verification gate") {
      rows = [];
      tables.push(rows);
    } else if (rows && !cells.every((cell) => /^:?-+:?$/.test(cell))) {
      requireThat(cells.length === 4 && /^[1-9]\d*$/.test(cells[0]), "Malformed phase table row");
      requireThat(!rows.some((row) => row[0] === cells[0]), "Duplicate phase ID");
      requireThat(/^(?:pending|in-progress|done \(.+\))$/.test(cells[2]), "Unsupported phase status");
      rows.push(cells);
    }
  }
  requireThat(tables.length === 1, "Expected exactly one canonical phase table");
  requireThat(tables[0].filter((row) => row[2] === "in-progress").length <= 1, "Multiple in-progress phases");
  const selected = tables[0].find((row) => row[0] === phase);
  requireThat(selected, "Selected phase is absent");
  requireThat(selected[2] === "in-progress" || !tables[0].some((row) => row[2] === "in-progress"),
    "Another phase is in-progress");
  return selected[2];
}
function reservationIdentity(o) {
  const reservation = sha(o.reservation);
  const repo = realpathSync(o.repo);
  requireThat(repo === realpathSync(git(repo, "rev-parse", "--show-toplevel")), "Expected target checkout root");
  ancestor(repo, reservation, "HEAD");
  paths({ repo, ref: reservation, "allow-path": [o.chg] });
  requireThat(phaseRow(repo, reservation, o.chg, o.phase) === "in-progress", "Reservation row is not in-progress");
  requireThat(phaseRow(repo, `${reservation}^`, o.chg, o.phase) !== "in-progress", "Commit is not a phase reservation transition");
  const branch = `phase/${o.chg.split("/").at(-1).slice(0, -3)}/${o.phase}/${reservation}`;
  git(repo, "check-ref-format", `refs/heads/${branch}`);
  return { repo, reservation, branch };
}

function worktreeCandidates(repo, reservation, branch) {
  const inventory = gitRaw(repo, "worktree", "list", "--porcelain", "-z").split("\0\0").filter(Boolean).map((entry) =>
    Object.fromEntries(entry.split("\0").filter(Boolean).map((field) => {
      const space = field.indexOf(" ");
      return space < 0 ? [field, true] : [field.slice(0, space), field.slice(space + 1)];
    })));
  const candidates = inventory.filter((entry) => {
    if (entry.worktree === repo || entry.bare) return false;
    requireThat(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(entry.HEAD ?? "") && !/^0+$/.test(entry.HEAD),
      "Worktree has unresolved HEAD; require an ownership handoff");
    if (entry.branch === `refs/heads/${branch}`) return true;
    try { ancestor(repo, reservation, sha(entry.HEAD)); return true; }
    catch (error) { if (error.status === 1) return false; throw error; }
  });
  return { inventory, candidates };
}

function locate(o) {
  const { repo, reservation, branch } = reservationIdentity(o);
  const { candidates } = worktreeCandidates(repo, reservation, branch);
  requireThat(candidates.length === 1, `Expected exactly one reserved worktree; found ${candidates.length}`);
  const selected = candidates[0];
  requireThat(selected.branch === `refs/heads/${branch}` && !selected.locked && !selected.prunable,
    "Reserved worktree has unexpected branch or unavailable registration");
  const worktree = realpathSync(selected.worktree);
  requireThat(git(worktree, "symbolic-ref", "--short", "HEAD") === branch, "Reserved worktree branch changed");
  requireThat(git(worktree, "rev-parse", "HEAD") === selected.HEAD, "Reserved worktree HEAD changed");
  ancestor(repo, reservation, selected.HEAD);
  requireThat(git(repo, "rev-parse", `${reservation}:${o.chg}`) === git(worktree, "rev-parse", `HEAD:${o.chg}`), "Reserved worktree CHG blob mismatch");
  requireThat(git(repo, "log", "--full-history", "--format=%H", `${reservation}..${selected.HEAD}`, "--", o.chg) === "", "Worktree history changes the CHG path");
  git(worktree, "diff", "--quiet", "--cached", "HEAD", "--", o.chg);
  git(worktree, "diff", "--quiet", "--", o.chg);
  return { reservation, branch, worktree, worktreeHead: selected.HEAD };
}

function createPreview(o) {
  checkout(o.target, o["target-branch"], o.reservation);
  const { repo, reservation, branch } = reservationIdentity({ ...o, repo: o.target });
  const { inventory, candidates } = worktreeCandidates(repo, reservation, branch);
  requireThat(candidates.length === 0, "Reserved worktree already exists; use recovery");
  requireThat(git(repo, "for-each-ref", "--format=%(refname)", `refs/heads/${branch}`) === "", "Reserved branch already exists; use recovery");
  const destination = o.worktree;
  requireThat(path.isAbsolute(destination) && !/[\x00-\x1f]/.test(destination), "Expected an absolute worktree path");
  requireThat(destination === path.join(realpathSync(path.dirname(destination)), path.basename(destination)), "Expected a canonical worktree path with an existing parent");
  requireThat(!lstatSync(destination, { throwIfNoEntry: false }), "Worktree destination already exists");
  for (const entry of inventory) {
    const relative = path.relative(entry.worktree, destination);
    requireThat(relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative), "Worktree destination is inside an existing checkout");
  }
  checkout(o.target, o["target-branch"], reservation);
  return { reservation, branch, worktree: destination,
    argv: ["git", "-C", repo, "worktree", "add", "-b", branch, "--", destination, reservation] };
}

function preflight(o) {
  checkout(o.target, o["target-branch"], o["target-head"]);
  checkout(o.worktree, o["worktree-branch"], o["worktree-head"]);
  requireThat(realpathSync(o.target) !== realpathSync(o.worktree), "Target and worktree must differ");
  const common = (repo) => realpathSync(git(repo, "rev-parse", "--path-format=absolute", "--git-common-dir"));
  requireThat(common(o.target) === common(o.worktree), "Checkouts belong to different repositories");
  const reservation = sha(o.reservation);
  ancestor(o.target, reservation, o["target-head"]);
  ancestor(o.target, reservation, o["worktree-head"]);
  details.targetBlob = git(o.target, "rev-parse", `${o["target-head"]}:${o.chg}`);
  details.worktreeBlob = git(o.worktree, "rev-parse", `${o["worktree-head"]}:${o.chg}`);
  const reservationBlob = git(o.target, "rev-parse", `${reservation}:${o.chg}`);
  requireThat(details.targetBlob === details.worktreeBlob && details.targetBlob === reservationBlob,
    "CHG blob mismatch; stop without discarding or merging record changes");
  requireThat(git(o.target, "log", "--full-history", "--format=%H", `${reservation}..${o["worktree-head"]}`, "--", o.chg) === "",
    "Worktree history changes the CHG path");
  ancestor(o.target, o["target-head"], o["worktree-head"]);
  details.state = phaseRow(o.target, reservation, o.chg, o.phase);
  requireThat(details.state === "in-progress", "Reservation row is not in-progress");
  requireThat(git(o.target, "diff-tree", "--no-commit-id", "--name-only", "-r", reservation) === o.chg,
    "Reservation is not a CHG-only commit");
  const owner = locate({ repo: o.target, reservation, chg: o.chg, phase: o.phase });
  requireThat(owner.worktree === realpathSync(o.worktree), "Unexpected reserved worktree");
  checkout(o.target, o["target-branch"], o["target-head"]);
  checkout(o.worktree, o["worktree-branch"], o["worktree-head"]);
  return { ...details, phase: o.phase, targetHead: o["target-head"], worktreeHead: o["worktree-head"] };
}

function row(o) {
  const ref = sha(o.ref);
  ancestor(o.repo, ref, "HEAD");
  const state = phaseRow(o.repo, ref, o.chg, o.phase);
  requireThat(["pending", "in-progress", "done"].includes(o.expect), "Unsupported expected state");
  requireThat(state === o.expect || (o.expect === "done" && state.startsWith("done (")), "Selected row does not match expected state");
  if (o.expect === "done") {
    requireThat(o["evidence-commit"], "done requires --evidence-commit");
    const implementation = sha(o["evidence-commit"]);
    ancestor(o.repo, implementation, ref);
    const evidence = state.match(/^done \(.+ exit 0 @ ([a-f0-9]{7,64})\)$/);
    requireThat(evidence, "Expected done (<command> exit 0 @ <commit>) evidence");
    requireThat(git(o.repo, "rev-parse", "--verify", `${evidence[1]}^{commit}`) === implementation,
      "Done evidence names a different implementation commit");
    requireThat(git(o.repo, "rev-list", "--parents", "-n", "1", ref).split(" ").slice(1).join(" ") === implementation,
      "Completion must immediately follow the reviewed implementation tip");
  } else {
    requireThat(!o["evidence-commit"], "--evidence-commit is only valid for done");
  }
  return { ref, phase: o.phase, state };
}

function treeEntries(repo, ref) {
  const listing = ref ? gitRaw(repo, "ls-tree", "-rz", "--full-tree", ref)
    : gitRaw(repo, "ls-files", "--stage", "-z");
  return listing.split("\0").filter(Boolean).map((entry) => {
    const tab = entry.indexOf("\t");
    const [mode, middle, last] = entry.slice(0, tab).split(" ");
    requireThat(tab > 0 && (ref || last === "0"), "Expected a resolved full index");
    return [entry.slice(tab + 1), mode, ref ? last : middle];
  });
}

function digestEntries(entries) {
  entries = [...entries].sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  return createHash("sha256").update(JSON.stringify(entries)).digest("hex");
}

function contentDigest(repo, ref) {
  return digestEntries(treeEntries(repo, ref));
}

function workingEntries(repo, baseEntries) {
  const index = treeEntries(repo);
  requireThat([...baseEntries, ...index].every(([, mode]) => mode !== "160000"), "Submodules require a separate review boundary");
  const objectFormat = git(repo, "rev-parse", "--show-object-format");
  requireThat(["sha1", "sha256"].includes(objectFormat), "Unsupported Git object format");
  const names = new Set([...baseEntries, ...index].map(([name]) => name));
  for (const name of gitRaw(repo, "ls-files", "--others", "--exclude-standard", "-z").split("\0").filter(Boolean)) names.add(name);
  const entries = [];
  for (const name of names) {
    const parts = name.split("/");
    for (let i = 1; i < parts.length; i++) {
      const parent = lstatSync(path.join(repo, ...parts.slice(0, i)), { throwIfNoEntry: false });
      requireThat(!parent || parent.isDirectory(), "Candidate path has a non-directory or symlink parent");
    }
    const file = path.join(repo, name);
    const info = lstatSync(file, { throwIfNoEntry: false });
    if (!info) continue;
    requireThat(info.isFile() || info.isSymbolicLink(), "Candidate contains an unsupported file type");
    const mode = info.isSymbolicLink() ? "120000" : (info.mode & 0o111) ? "100755" : "100644";
    const input = info.isSymbolicLink() ? readlinkSync(file, { encoding: "buffer" }) : readFileSync(file);
    // Git's raw blob framing; no filters, object writes, or subprocess per file.
    const oid = createHash(objectFormat).update(`blob ${input.length}\0`).update(input).digest("hex");
    entries.push([name, mode, oid]);
  }
  return entries;
}

function candidate(o) {
  const repo = realpathSync(o.repo);
  requireThat(repo === realpathSync(git(repo, "rev-parse", "--show-toplevel")), "Expected checkout root");
  const base = sha(o.base);
  const boundary = o.boundary;
  requireThat(["worktree", "index", "commit"].includes(boundary), "Expected worktree, index, or commit boundary");
  requireThat(boundary === "commit" ? !!o.ref : !o.ref, "Only commit boundary accepts and requires --ref");
  requireThat(boundary === "worktree" || o["expect-content"], "Index and commit checks require the reviewed content digest");
  const before = treeEntries(repo, base);
  let entries;
  if (boundary === "commit") {
    const ref = sha(o.ref);
    requireThat(git(repo, "rev-parse", "HEAD") === ref, "Candidate commit is not checkout HEAD");
    requireThat(git(repo, "rev-list", "--parents", "-n", "1", ref) === `${ref} ${base}`, "Candidate parent differs from review base");
    requireThat(git(repo, "status", "--porcelain=v1", "--untracked-files=all") === "", "Checkout is dirty; preserve its changes");
    entries = treeEntries(repo, ref);
  } else {
    requireThat(git(repo, "rev-parse", "HEAD") === base, "Candidate base changed");
    const working = workingEntries(repo, before);
    entries = boundary === "worktree" ? working : treeEntries(repo);
    requireThat(digestEntries(working) === digestEntries(entries), "Index differs from working candidate; preserve unstaged/untracked content");
  }
  const old = new Map(before.map(([name, ...rest]) => [name, JSON.stringify(rest)]));
  const current = new Map(entries.map(([name, ...rest]) => [name, JSON.stringify(rest)]));
  const changed = [...new Set([...old.keys(), ...current.keys()])].filter(name => old.get(name) !== current.get(name)).sort();
  const allowlist = o["allow-path"];
  requireThat(new Set(allowlist).size === allowlist.length && JSON.stringify(changed) === JSON.stringify([...allowlist].sort()), "Candidate paths do not match the exact allowlist");
  const digest = digestEntries(entries);
  if (o["expect-content"]) requireThat(/^[a-f0-9]{64}$/.test(o["expect-content"]) && digest === o["expect-content"], "Candidate differs from reviewed content");
  return { base, boundary, paths: changed, contentDigest: digest, ...(o.ref ? { ref: o.ref } : {}) };
}

function paths(o) {
  const allowlist = o["allow-path"];
  requireThat(Array.isArray(allowlist) && allowlist.length > 0, "Expected an explicit path allowlist");
  requireThat(allowlist.every((item) => item && !/^[\\/]|[\\:*?\[\]\x00-\x1f]/.test(item)
    && item.split("/").every((part) => part && part !== "." && part !== "..")), "Expected literal relative allowlist paths");
  requireThat(new Set(allowlist).size === allowlist.length, "Duplicate allowlist path");
  let actual;
  let base;
  if (o.ref) {
    const ref = sha(o.ref);
    ancestor(o.repo, ref, "HEAD");
    requireThat(git(o.repo, "rev-list", "--parents", "-n", "1", ref).split(" ").length === 2,
      "Expected a single-parent record commit");
    base = git(o.repo, "rev-parse", `${ref}^`);
    actual = gitRaw(o.repo, "diff-tree", "--no-commit-id", "--name-only", "--no-renames", "-z", "-r", ref);
  } else {
    base = git(o.repo, "rev-parse", "HEAD");
    actual = gitRaw(o.repo, "diff", "--cached", "--name-only", "--no-renames", "-z");
  }
  const changed = actual.split("\0").filter(Boolean).sort();
  requireThat(JSON.stringify(changed) === JSON.stringify([...allowlist].sort()), "Record paths do not match the exact allowlist");
  if (o.base) requireThat(base === sha(o.base), "Record base changed");
  const digest = contentDigest(o.repo, o.ref);
  if (o["expect-content"]) {
    requireThat(/^[a-f0-9]{64}$/.test(o["expect-content"]), "Expected a full content digest");
    requireThat(digest === o["expect-content"], "Record content differs from reviewed index");
  }
  return { paths: changed, base, contentDigest: digest, ...(o.ref ? { ref: o.ref } : { boundary: "index" }) };
}

try {
  const preflightNames = ["target", "worktree", "target-branch", "worktree-branch", "target-head", "worktree-head", "reservation", "chg", "phase"];
  const rowNames = ["repo", "ref", "chg", "phase", "expect"];
  const pathNames = ["repo", "ref", "allow-path", "base", "expect-content"];
  const locateNames = ["repo", "reservation", "chg", "phase"];
  const createNames = ["target", "target-branch", "reservation", "chg", "phase", "worktree"];
  const candidateNames = [...pathNames, "boundary"];
  const names = [...new Set([...preflightNames, ...rowNames, "evidence-commit", ...candidateNames])];
  const { positionals, values: o } = parseArgs({ allowPositionals: true,
    options: Object.fromEntries(names.map((name) => [name, { type: "string", multiple: name === "allow-path" }])) });
  const command = positionals[0];
  requireThat(positionals.length === 1 && ["preflight", "row", "paths", "locate", "create-preview", "candidate"].includes(command), "Expected preflight, row, paths, locate, create-preview, or candidate command");
  const required = { preflight: preflightNames, row: rowNames, paths: ["repo", "allow-path"], locate: locateNames, "create-preview": createNames, candidate: ["repo", "base", "boundary", "allow-path"] }[command];
  requireThat(required.every((name) => o[name]), "Missing required argument");
  const allowed = { preflight: preflightNames, row: [...rowNames, "evidence-commit"], paths: pathNames, locate: locateNames, "create-preview": createNames, candidate: candidateNames }[command];
  requireThat(Object.keys(o).every((name) => allowed.includes(name)), "Unexpected argument for command");
  if (!["paths", "candidate"].includes(command)) {
    requireThat(/^docs\/changes\/(?:active|archive)\/CHG-[^/\\:*?\[\]\s]+\.md$/.test(o.chg) && !o.chg.includes(".."), "Expected one literal repository-relative CHG path");
    requireThat(/^[1-9]\d*$/.test(o.phase), "Expected numeric phase ID");
  }
  console.log(JSON.stringify({ ok: true, ...({ preflight, row, paths, locate, "create-preview": createPreview, candidate }[command](o)) }));
} catch (error) {
  console.log(JSON.stringify({ ok: false, ...details, error: error.message }));
  process.exitCode = 1;
}
