import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import { unzipSync } from "fflate";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverSkillPackages } from "../scripts/build-well-known-skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = path.join(root, ".claude-plugin/marketplace.json");

const expectedBundles = {
  "software-development": {
    version: "1.1.1",
    skills: [
      "application-records",
      "capability-wireframes",
      "git-commit-message",
      "phased-plan-closeout",
      "phased-plan-design",
      "phased-plan-execution",
      "phased-plan-next",
      "phased-plan-overview",
      "phased-plan-refactoring",
    ],
  },
  "autonomous-orchestration": {
    version: "1.1.1",
    skills: ["autonomous-implementation-review"],
  },
  "openspec-development": {
    version: "0.1.2",
    skills: ["capability-wireframes", "git-commit-message", "openspec-change-integration"],
  },
};
const sharedSkills = ["capability-wireframes", "git-commit-message"];

test("Claude marketplace selects exact canonical packages for three isolated bundles", async () => {
  const source = await readFile(marketplacePath, "utf8").catch(() => null);
  assert.ok(source, "repository must provide .claude-plugin/marketplace.json");
  const marketplace = JSON.parse(source);
  assert.equal(marketplace.name, "ai-coding-agent-skills");
  assert.equal(marketplace.owner.name, "Raphael (forgegod)");
  assert.deepEqual(marketplace.plugins.map(({ name }) => name), Object.keys(expectedBundles));
  const packages = await discoverSkillPackages({ root });
  const selected = new Map();
  for (const plugin of marketplace.plugins) {
    assert.equal(plugin.source, "./");
    assert.equal(plugin.strict, false);
    assert.equal(plugin.version, expectedBundles[plugin.name].version);
    assert.ok(plugin.description);
    assert.deepEqual(Object.keys(plugin).sort(), ["description", "name", "skills", "source", "strict", "version"]);
    const names = plugin.skills.map((directory) => {
      const pkg = packages.find((entry) => `./skills/${entry.relativePath.split(path.sep).join("/")}` === directory);
      assert.ok(pkg, `unknown canonical package: ${directory}`);
      return pkg.name;
    });
    assert.deepEqual(names, expectedBundles[plugin.name].skills, `${plugin.name} must not gain or lose packages`);
    for (const name of names) {
      const bundles = selected.get(name) ?? [];
      assert.ok(
        bundles.length === 0 || sharedSkills.includes(name),
        `${name} may only be shared between the workflow bundles`,
      );
      selected.set(name, [...bundles, plugin.name]);
    }
  }
  assert.deepEqual([...selected.keys()].sort(), packages.map(({ name }) => name).sort());
  for (const name of sharedSkills) {
    assert.deepEqual(selected.get(name), ["software-development", "openspec-development"]);
  }
  assert.deepEqual(selected.get("openspec-change-integration"), ["openspec-development"]);
  assert.deepEqual(selected.get("autonomous-implementation-review"), ["autonomous-orchestration"]);
  assert.equal(marketplace.plugins[0].skills.length, 9);
  assert.equal(marketplace.plugins[1].skills.length, 1);
  assert.equal(marketplace.plugins[2].skills.length, 3);
});

test("distribution builds complete skill and plugin ZIPs from canonical bytes", async (t) => {
  const script = await readFile(path.join(root, "scripts/build-distribution.mjs"), "utf8").catch(() => null);
  assert.ok(script, "distribution builder must generate Claude upload packages");
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  const output = await mkdtemp(path.join(os.tmpdir(), "claude-packages-"));
  t.after(() => rm(output, { recursive: true, force: true }));
  await buildDistribution({ root, output });
  const packages = await discoverSkillPackages({ root });
  const catalog = JSON.parse(await readFile(path.join(output, "downloads/index.json"), "utf8"));
  assert.deepEqual(catalog.skills.map(({ name }) => name), packages.map(({ name }) => name));
  for (const pkg of packages) {
    const entry = catalog.skills.find(({ name }) => name === pkg.name);
    const archive = unzipSync(await readFile(path.join(output, "downloads", entry.file)));
    assert.deepEqual(Object.keys(archive).sort(), pkg.files.map((file) => `${pkg.name}/${file}`).sort());
    for (const file of pkg.files) {
      assert.deepEqual(Buffer.from(archive[`${pkg.name}/${file}`]), await readFile(path.join(pkg.directory, file)));
    }
  }
  const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
  assert.deepEqual(catalog.plugins.map(({ name }) => name), marketplace.plugins.map(({ name }) => name));
  for (const entry of catalog.plugins) {
    const archive = unzipSync(await readFile(path.join(output, "downloads", entry.file)));
    const manifest = JSON.parse(Buffer.from(archive[".claude-plugin/plugin.json"]).toString());
    const configured = marketplace.plugins.find(({ name }) => name === entry.name);
    if (entry.name === "autonomous-orchestration") {
      const instructions = Buffer.from(archive["README.md"]).toString();
      assert.equal(instructions.includes("selected workflow"), true, "orchestration must support either selected workflow");
      for (const workflow of ["software-development", "openspec-development"]) assert.equal(instructions.includes(workflow), true, workflow);
      assert.equal(/requires the software-development bundle/.test(instructions), false, "OpenSpec scope must not require CAP/CHG installation");
    }
    assert.equal(manifest.name, entry.name);
    assert.equal(manifest.version, configured.version);
    assert.deepEqual(Object.keys(manifest).sort(), ["author", "description", "license", "name", "version"]);
    const selected = packages.filter((pkg) => configured.skills.includes(`./skills/${pkg.relativePath.split(path.sep).join("/")}`));
    assert.ok(archive["README.md"], "plugin ZIP needs standalone installation and safety guidance");
    assert.match(Buffer.from(archive["README.md"]).toString(), /does not grant execution authority/);
    assert.deepEqual(Buffer.from(archive.LICENSE), await readFile(path.join(root, "LICENSE")));
    const expected = [".claude-plugin/plugin.json", "README.md", "LICENSE"];
    for (const pkg of selected) {
      for (const file of pkg.files) {
        const key = `skills/${pkg.name}/${file}`;
        expected.push(key);
        assert.deepEqual(Buffer.from(archive[key]), await readFile(path.join(pkg.directory, file)));
      }
    }
    assert.deepEqual(Object.keys(archive).sort(), expected.sort());
  }
  const pluginPackages = async (entry) => {
    const archive = unzipSync(await readFile(path.join(output, "downloads", entry.file)));
    return [...new Set(Object.keys(archive)
      .filter((key) => key.startsWith("skills/"))
      .map((key) => key.split("/")[1]))].sort();
  };
  assert.deepEqual(await pluginPackages(catalog.plugins[0]), expectedBundles["software-development"].skills.slice().sort());
  assert.deepEqual(await pluginPackages(catalog.plugins[1]), ["autonomous-implementation-review"]);
  assert.deepEqual(await pluginPackages(catalog.plugins[2]), ["capability-wireframes", "git-commit-message", "openspec-change-integration"]);
  const integrationArchive = unzipSync(await readFile(path.join(output, "downloads", catalog.plugins[2].file)));
  assert.ok(integrationArchive["skills/openspec-change-integration/scripts/change-guard.mjs"], "OpenSpec ZIP must ship its guard");
  assert.deepEqual(
    Buffer.from(integrationArchive["skills/git-commit-message/SKILL.md"]),
    await readFile(path.join(root, "skills/software-development/git-commit-message/SKILL.md")),
    "shared package bytes must match canonical source",
  );
  assert.ok(!("skills/phased-plan-next/SKILL.md" in integrationArchive), "OpenSpec bundle must exclude legacy phase skills");
  const html = await readFile(path.join(output, "downloads/index.html"), "utf8");
  for (const entry of [...catalog.plugins, ...catalog.skills]) assert.ok(html.includes(`href="${entry.file}"`));
  assert.match(html, /operator review/i);
  assert.match(await readFile(path.join(output, "index.html"), "utf8"), /downloads\/index.html/);
});

async function fixture(t) {
  const scratch = await mkdtemp(path.join(os.tmpdir(), "claude-validation-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const source = path.join(scratch, "source");
  await mkdir(source);
  await cp(path.join(root, "LICENSE"), path.join(source, "LICENSE"));
  await cp(path.join(root, "skills"), path.join(source, "skills"), { recursive: true });
  await cp(path.join(root, ".claude-plugin"), path.join(source, ".claude-plugin"), { recursive: true });
  return { scratch, source, output: path.join(scratch, "site") };
}

test("distribution ZIPs are reproducible and stale downloads are removed", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  const { source, output } = await fixture(t);
  const first = await buildDistribution({ root: source, output });
  await writeFile(path.join(output, "downloads/stale.zip"), "old");
  const second = await buildDistribution({ root: source, output });
  assert.deepEqual(second.catalog, first.catalog);
  for (const entry of [...second.catalog.skills, ...second.catalog.plugins]) {
    const bytes = await readFile(path.join(output, "downloads", entry.file));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256);
  }
  await assert.rejects(readFile(path.join(output, "downloads/stale.zip")), { code: "ENOENT" });
});

test("distribution refuses source overlap and unsafe support files before replacement", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  const { source, output } = await fixture(t);
  for (const destination of [source, path.join(source, "skills"), path.join(source, "skills/output")]) {
    await assert.rejects(buildDistribution({ root: source, output: destination }), /overlap/);
  }
  await buildDistribution({ root: source, output });
  const original = await readFile(path.join(output, "downloads/index.json"));
  const forbidden = path.join(source, "skills/software-development/application-records/references/AGENTS.md");
  await mkdir(path.dirname(forbidden), { recursive: true });
  await writeFile(forbidden, "not distributable");
  await assert.rejects(buildDistribution({ root: source, output }), /forbidden/);
  assert.deepEqual(await readFile(path.join(output, "downloads/index.json")), original);
});

test("distribution rejects symlink output paths without touching their targets", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  for (const relative of [".", "downloads", ".well-known", "index.html", ".nojekyll"]) {
    await t.test(relative, async (t) => {
      const { scratch, source, output } = await fixture(t);
      const outside = path.join(scratch, "outside");
      await mkdir(outside);
      await writeFile(path.join(outside, "sentinel"), "untouched");
      if (relative !== ".") await mkdir(output);
      await symlink(outside, path.join(output, relative));
      await assert.rejects(buildDistribution({ root: source, output }), /symlink/i);
      assert.equal(await readFile(path.join(outside, "sentinel"), "utf8"), "untouched");
    });
  }
});

async function snapshot(directory) {
  return (await readdir(directory, { recursive: true })).sort();
}

test("distribution accepts a symlinked checkout and aliased output ancestors", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  const { scratch, source } = await fixture(t);
  const checkout = path.join(scratch, "checkout");
  await symlink(source, checkout);
  const scratchAlias = path.join(scratch, "scratch-alias");
  await symlink(scratch, scratchAlias);
  const nestedAlias = path.join(scratchAlias, "link");
  await symlink(scratch, nestedAlias);
  const output = path.join(nestedAlias, "site");
  const result = await buildDistribution({ root: checkout, output });
  const packages = await discoverSkillPackages({ root: source });
  assert.deepEqual(result.skills.map(({ name }) => name), packages.map(({ name }) => name));
  const catalog = JSON.parse(await readFile(path.join(scratch, "site/downloads/index.json"), "utf8"));
  assert.deepEqual(catalog.skills.map(({ name }) => name), packages.map(({ name }) => name));
  assert.match(await readFile(path.join(scratch, "site/index.html"), "utf8"), /downloads\/index.html/);
});

test("output aliased into canonical skill source is refused without mutation", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  const { scratch, source } = await fixture(t);
  const alias = path.join(scratch, "skills-alias");
  await symlink(path.join(source, "skills"), alias);
  const before = await snapshot(path.join(source, "skills"));
  await assert.rejects(buildDistribution({ root: source, output: path.join(alias, "published") }), /overlap/);
  assert.deepEqual(await snapshot(path.join(source, "skills")), before);
});

test("source boundary symlinks cannot redirect package reads", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  await t.test("skills", async (t) => {
    const { scratch, source, output } = await fixture(t);
    const external = path.join(scratch, "external-skills");
    await cp(path.join(source, "skills"), external, { recursive: true });
    await rm(path.join(source, "skills"), { recursive: true });
    await symlink(external, path.join(source, "skills"));
    await assert.rejects(buildDistribution({ root: source, output }), /symlink/i);
  });
  await t.test("LICENSE", async (t) => {
    const { scratch, source, output } = await fixture(t);
    const external = path.join(scratch, "external-license");
    await cp(path.join(source, "LICENSE"), external);
    await rm(path.join(source, "LICENSE"));
    await symlink(external, path.join(source, "LICENSE"));
    await assert.rejects(buildDistribution({ root: source, output }), /symlink/i);
  });
  await t.test(".claude-plugin", async (t) => {
    const { scratch, source, output } = await fixture(t);
    const external = path.join(scratch, "external-catalog");
    await cp(path.join(source, ".claude-plugin"), external, { recursive: true });
    await rm(path.join(source, ".claude-plugin"), { recursive: true });
    await symlink(external, path.join(source, ".claude-plugin"));
    const before = await readFile(path.join(external, "marketplace.json"), "utf8");
    await assert.rejects(buildDistribution({ root: source, output }), /symlink/i);
    assert.equal(await readFile(path.join(external, "marketplace.json"), "utf8"), before);
  });
});

test("source symlinks and root plugin manifests cannot bypass package isolation", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  const { source, output } = await fixture(t);
  await writeFile(path.join(source, ".claude-plugin/plugin.json"), "{}");
  await assert.rejects(buildDistribution({ root: source, output }), /root plugin manifest/i);
  await rm(path.join(source, ".claude-plugin/plugin.json"));
  const manifest = path.join(source, ".claude-plugin/marketplace.json");
  const bytes = await readFile(manifest);
  await writeFile(path.join(source, "external.json"), bytes);
  await rm(manifest);
  await symlink(path.join(source, "external.json"), manifest);
  await assert.rejects(buildDistribution({ root: source, output }), /symlink/i);
});

test("invalid marketplace cannot replace a previous distribution", async (t) => {
  const { buildDistribution } = await import("../scripts/build-distribution.mjs");
  const { source, output } = await fixture(t);
  await buildDistribution({ root: source, output });
  const original = await readFile(path.join(output, "downloads/software-development.plugin.zip"));
  const file = path.join(source, ".claude-plugin/marketplace.json");
  const valid = JSON.parse(await readFile(file, "utf8"));
  const mutations = [
    ["traversal", (m) => { m.plugins[0].name = "../escape"; }],
    ["missing skill", (m) => { m.plugins[0].skills[0] = "./skills/missing"; }],
    ["omitted skill", (m) => { m.plugins[0].skills.pop(); }],
    ["duplicate skill", (m) => { m.plugins[0].skills.push(m.plugins[0].skills[0]); }],
    ["implicit orchestration", (m) => { m.plugins[0].skills.push(...m.plugins[1].skills); m.plugins[1].skills = []; }],
    ["missing OpenSpec bundle", (m) => { m.plugins.pop(); }],
    ["unexpected OpenSpec skill", (m) => { m.plugins[2].skills.push("./skills/software-development/phased-plan-next"); }],
    ["duplicate OpenSpec package", (m) => { m.plugins[2].skills.push(m.plugins[2].skills[1]); }],
    ["integration leaked into general bundle", (m) => { m.plugins[0].skills.push(m.plugins[2].skills[2]); }],
    ["unshared skill duplicated across bundles", (m) => { m.plugins[2].skills.push(m.plugins[0].skills[0]); }],
    ["shared skill removed from OpenSpec bundle", (m) => { m.plugins[2].skills.shift(); }],
    ["remote source", (m) => { m.plugins[0].source = "https://example.org"; }],
    ["active hooks", (m) => { m.plugins[0].hooks = {}; }],
    ["missing version", (m) => { delete m.plugins[0].version; }],
  ];
  for (const [name, mutate] of mutations) {
    await t.test(name, async () => {
      const invalid = structuredClone(valid);
      mutate(invalid);
      await writeFile(file, JSON.stringify(invalid));
      await assert.rejects(buildDistribution({ root: source, output }), /marketplace/i);
      assert.deepEqual(await readFile(path.join(output, "downloads/software-development.plugin.zip")), original);
    });
  }
});
