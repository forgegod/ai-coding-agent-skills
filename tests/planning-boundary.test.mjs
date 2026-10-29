import { test } from "node:test";
import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const removed = [
  "application-records",
  "phased-plan-design",
  "phased-plan-execution",
  "phased-plan-closeout",
  "phased-plan-overview",
  "phased-plan-next",
  "phased-plan-refactoring",
];

async function absent(relative) {
  return stat(path.join(root, relative)).then(() => false, (error) => {
    if (error.code === "ENOENT") return true;
    throw error;
  });
}

test("this distribution no longer ships the phase packages", async () => {
  for (const name of removed) {
    assert.equal(await absent(path.join("skills/software-development", name)), true, name);
  }
});
