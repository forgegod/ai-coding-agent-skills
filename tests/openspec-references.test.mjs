import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFile(path.join(root, file), "utf8");
const ticketPath = "skills/software-development/openspec-delivery/references/ticket.md";

test("proposal issue is a stable identity and risk snapshot, not prospective lifecycle evidence", async () => {
  const source = await read(ticketPath);
  const body = source.match(/```markdown\n([\s\S]*?)\n```/)?.[1];
  assert.ok(body, "A ready-to-use issue body is required");
  assert.match(body, /OpenSpec change: <full-change-name>/);
  assert.doesNotMatch(body, /openspec\/changes\/|\[ \]|Integrated revision|Independent reviewer verdict|Closure decision|Pull request and candidate SHA|permalink of this body/);
  for (const field of [/blast radius/i, /Confidentiality/, /Integrity/, /Availability/, /Recovery/, /Authorization/, /acceptance/i]) assert.match(body, field);
  assert.match(source, /editable issue body.*not.*immutable/i);
  assert.match(source, /create or reuse/i);
  assert.match(source, /multiple.*matches|ambiguous/i);
  assert.match(source, /read.back/i);
  assert.match(source, /github_issue/);
  assert.match(source, /after.*occur|already.*occur|actually.*occur/i);
});

test("workflow references moving changes by identity and explains path resolution boundaries", async () => {
  const source = await read("docs/openspec-workflow.md");
  assert.match(source, /## Identity and path conventions/);
  assert.match(source, /full change name.*stable reference/i);
  assert.match(source, /active changes only/i);
  assert.match(source, /archive keeps the same\s+identity/i);
  assert.doesNotMatch(source, /openspec\/changes\/(?:archive\/YYYY-MM-DD-)?(?:pin-note|export-notes|add-dark-mode)-[0-9a-z]{26}/);
  assert.match(source, /docs\/product\/wireframes\/notes\/html\/note-screen\.html/);
  assert.match(source, /docs\/product\/wireframes\/notes\/exports\/note-screen\.png/);
  assert.doesNotMatch(source, /updates `docs\/product\/wireframes\/notes\/` and links/);
  assert.match(source, /not an OpenSpec.*requirement|not required by OpenSpec/i);
});

test("workflow local Markdown links resolve from the document, not the repository root", async () => {
  const source = await read("docs/openspec-workflow.md");
  const targets = [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]).filter((target) => !/^(?:https?:|#)/.test(target));
  assert.ok(targets.length > 0);
  for (const target of targets) {
    const absolute = path.resolve(root, "docs", target.split("#")[0]);
    assert.ok((await stat(absolute)).isFile(), target);
  }
});

test("wireframe links survive package moves without rewriting frozen archives", async () => {
  const source = await read("skills/software-development/capability-wireframes/references/openspec.md");
  assert.match(source, /package-relative/);
  assert.match(source, /immutable.*permalink|commit.*permalink/i);
  assert.match(source, /byte.identical/i);
  assert.doesNotMatch(source, /Repair repository links when the package moves/);
  assert.match(source, /relative.*(?:sync|current)|(?:sync|current).*relative/i);
});
