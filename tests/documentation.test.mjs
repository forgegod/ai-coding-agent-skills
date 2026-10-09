import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const readme = fileURLToPath(new URL("../README.md", import.meta.url));

test("normal installer loop excludes the blocked initializer and documents manual review", async () => {
  const source = await readFile(readme, "utf8");
  const loop = source.match(/^for skill in (.+); do$/m)?.[1]?.split(/\s+/);
  assert.ok(loop, "document a normal installer loop");
  assert.equal(loop.length, 7);
  assert.ok(!loop.includes("blueprint-initialization"));
  assert.match(source, /### Manual initializer installation/);
  assert.match(source, /dangerous/i);
  assert.match(source, /templates\/root-AGENTS\.md/);
  assert.match(source, /manual installation does not receive.*scanner/is);
  assert.doesNotMatch(source, /^hermes.*skills install.*blueprint-initialization/m);
});
