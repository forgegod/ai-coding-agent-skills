import { test } from "node:test";
import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

test("phase-guard is not part of this distribution", async () => {
  const guard = new URL("../skills/software-development/phased-plan-closeout/scripts/phase-guard.mjs", import.meta.url);
  assert.equal(await stat(guard).then(() => true, (error) => error.code === "ENOENT" ? false : Promise.reject(error)), false);
});
