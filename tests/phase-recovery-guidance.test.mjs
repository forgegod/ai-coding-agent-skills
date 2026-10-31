import { test } from "node:test";
import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

test("phase recovery guidance is not part of this distribution", async () => {
  const file = new URL("../skills/software-development/phased-plan-closeout/references/recovery.md", import.meta.url);
  assert.equal(await stat(file).then(() => true, (error) => error.code === "ENOENT" ? false : Promise.reject(error)), false);
});
