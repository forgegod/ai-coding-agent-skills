---
name: blueprint-initialization
description: Use only when explicitly turning a copied AI Software Blueprint into a real project with project-owned DOX and CAP/CHG records.
version: 1.1.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [bootstrap, dox, product, capability, change-records]
    related_skills: [application-records, phased-plan-design]
---

# Blueprint Initialization

## Purpose

Turn a copied AI Software Blueprint into a project-owned maintenance system.
This is a one-time initialization, not ordinary feature work. It removes the
blueprint's proof records and contracts, replaces them with the real project's
truth, and leaves the generic DOX and CAP/CHG tools that future agents need.

Run this skill only after an explicit operator request such as: “Initialize this
AI Software Blueprint for this project.” Do not trigger it because a repository
merely contains `docs/`, `skills/`, or `AGENTS.md`.

## Preconditions

1. Read the copied root `AGENTS.md`, this skill, and the target project's current
   repository state.
2. Inventory the existing source tree, manifests, tests, CI, documentation, and
   any pre-existing `AGENTS.md` instructions before deleting or replacing files.
3. Preserve unrelated product work. If the copy was layered onto an existing
   working tree, isolate only blueprint-owned files and stop on ambiguous ownership.
4. Establish the project name, project goal, existing verification commands,
   and the directories that need a local DOX boundary. Do not invent a product
   architecture, technology, behaviour, or test result.

## Procedure

### 1. Replace the root rail with the initial DOX template

Read `templates/root-AGENTS.md` from this skill's installed package using
`skill_view` (or `read_file` with the skill directory provided on activation).
Use it as the starting root `AGENTS.md`, not the blueprint's populated root rail.
Then initialize it for the actual repository:

- retain the DOX core contract unchanged;
- replace placeholder project guidance with discovered ownership, local policies,
  architecture decisions, verification commands, and a real Child DOX Index;
- create child `AGENTS.md` files for durable project boundaries and index them;
- preserve any valid pre-existing project instructions by integrating them into
  the appropriate root or child contract.

The completed project root must describe the project, not this blueprint. It may
not retain claims that it ships no runtime, owns the blueprint CAPs, or uses the
blueprint's Node/CI tooling unless those claims are true for the project.

### 2. Rewrite the copied root `README.md` around the project goal

Rewrite the copied root `README.md` around the project goal before describing
the copied framework. The README must state:

- the project name and a concise, source-backed goal;
- the intended user or operator and the outcome the project provides;
- actual setup, run, and verification commands when they exist; and
- links to the project's architecture and current product records when those
  documents exist.

Do not retain this blueprint's purpose, adoption instructions, reference
projects, or verification commands as project content. If the goal cannot be
derived from the operator request, existing source, or current documentation,
stop and ask for it rather than writing a generic README.

### 3. Classify every copied surface

Use this split; classify uncertain files from their contents rather than name:

| Treatment | Surfaces | Result |
| --- | --- | --- |
| Retain and adapt | DOX core, `docs/product/README.md`, `docs/changes/README.md`, reusable skills | Keep their generic lifecycle rules; replace project-specific commands and examples. |
| Replace | root `README.md`, `docs/architecture.md`, `docs/design-decisions.md`, root package and CI configuration | Write actual product purpose, architecture, irreversible decisions, and verification. Never carry blueprint claims forward. |
| Delete or replace | blueprint CAPs, bootstrap CHGs, their index rows, blueprint-only tests and fixtures | Remove the blueprint proving itself as a product. Product records must describe only implemented product behaviour. |
| Decide explicitly | `scripts/check-product-records.mjs`, Node package files, test runner, CI gate | Keep and integrate them only when they fit the product's toolchain; otherwise port or replace the validation before referencing it from contracts. |

Do not retain `CAP-001` through `CAP-003`, `CHG-001`, `CHG-002`, or their
“current records” index entries as product truth. Do not create replacement CAPs
until current product behaviour and executable evidence are known. Do not create
a CHG merely to narrate initialization; create one when a concrete material
product request exists.

### 4. Rebuild project records and verification

1. Reset `docs/product/index.md` to list only real product CAPs. Remove copied
   CAP files and blueprint-only wireframe references.
2. Reset `docs/changes/README.md` so its active and archive listings name only
   project work. Remove copied bootstrap receipts and empty directories that no
   longer have a contract.
3. Add the project's real build, test, lint, documentation, and record-validation
   commands to its manifest, CI, and root DOX contract. A command is documented
   only after it runs successfully in the target project.
4. Keep `application-records` and the `phased-plan-*` skills when the product
   adopts CAP/CHG records. They are generic execution aids, not blueprint proof.
5. Use `application-records` for the first material product request only after
   the project contracts and proof paths exist.

### 5. Remove target-project-owned initialization routing after use

After the project root has replaced its adoption routing and every copied
blueprint proof surface is gone, clean up only target-project-owned artifacts.
Never delete the installed shared skill package or modify the agent profile:

1. If a legacy `skills/software-development/blueprint-initialization/` copy exists
   inside the target project, verify its ownership and remove only that local copy.
   An externally installed package is not a target-project artifact.
2. Remove any target-project ownership row and one-time root-routing reference.
3. Delete or rewrite blueprint-only packaging tests that require this one-time
   skill. Keep only tests the product deliberately owns.
4. Verify no remaining project document says the repository is an AI Software
   Blueprint or links to the removed bootstrap records.

Future agents continue from the initialized root and child DOX contracts plus the
retained generic skills; they do not need this one-time initializer.

## Verification

- The root `AGENTS.md` uses the initialized project rail, has a real Child DOX
  Index, and contains no blueprint-specific architecture or verification claims.
- Every remaining CAP and CHG describes actual project behaviour or work; no
  copied blueprint CAP/CHG remains.
- The root README starts from the project goal and the architecture, decisions,
  package configuration, CI, and test commands describe the project that now
  owns the repository.
- The project's verification commands pass after adaptation.
- Target-project-owned initialization routing, legacy local copies, and blueprint-only
  tests are removed before ordinary product work resumes; installed skill packages
  remain intact for other projects.
