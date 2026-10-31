import { test } from "node:test";
import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

test("phased-plan-next is not part of this distribution", async () => {
  const file = new URL("../skills/software-development/phased-plan-next/SKILL.md", import.meta.url);
  assert.equal(await stat(file).then(() => true, (error) => error.code === "ENOENT" ? false : Promise.reject(error)), false);
});
