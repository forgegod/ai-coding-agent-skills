---
name: capability-wireframes
description: Use when a human-facing surface needs a stable visual review.
version: 1.5.0
author: AI Software Blueprint
license: MIT
metadata:
  hermes:
    tags: [product, wireframes, ux, capability, documentation]
    related_skills: [openspec-change-integration]
---

# Capability Wireframes

Use a static wireframe when an OpenSpec change creates or changes a primary
human-facing surface. The wireframe makes the intended interaction reviewable.
It is not a behavior spec, not executable evidence, and not a second task list.

Stable capability and screen keys survive change archival. Do not allocate a
new identity for each change, and do not fabricate a capability record. Read
[references/openspec.md](references/openspec.md) before editing a shared screen.

## When to Use

Use this skill when a change adds or changes a primary screen, pane, dialog, or
multi-step interaction used by a person.

Do not use it for invisible server behaviour, APIs, configuration-only changes,
or a cosmetic adjustment that does not alter interaction, hierarchy, or meaning.

## Layout

This is the companion's default layout, not an OpenSpec requirement. Resolve it
from the target project's root and preserve an existing project-owned layout.
The package does not ship a product generator or create these files on install.

```text
docs/product/wireframes/
├── generate.mjs
├── manifest.json
├── index.html
├── <capability>/html/<screen>.html
└── <capability>/exports/<screen>.png
```

The project chooses the visual system and screenshot renderer. Do not copy a
reference project's framework or machine-local paths into an adopting repository.
Current capability specs link the actual stable HTML/PNG resolved from the
manifest, relative to the referring spec. A directory or manifest key is not a
page or a URL. Do not invent index anchors the generator does not emit.

Pre-implementation visuals stay within their change package, review-only,
outside the manifest and outside current-product links. Use package-relative
links from that change's proposal, design or tasks. Elsewhere cite the full
change name and screen key, not the moving active/archive path. Do not copy
proposal files into the product directory.

## Contracts

- Reuse the project's existing `generate.mjs`. Inspect its actual interface
  before editing it. It is the only editable screen-definition source for current
  visuals. Regenerate HTML, `index.html`, and `manifest.json`; never hand-edit them.
- HTML is the review source. PNG is the renderer export of that same HTML at the
  manifest viewport. Where the project defines no manifest contract, each entry
  has a unique stable key, a non-empty title, HTML and PNG paths, and positive
  integer viewport width and height. Directories agree with the manifest both ways.
- The implementation slice updates the stable screen and links it from the spec
  and tests. Delta references use stable capability/screen keys or verified commit
  permalinks; when syncing into the current spec, compute its relative link from
  the destination, not the delta's directory. A later change of the same surface
  updates that screen; it does not mint a second key.
- Wireframes illustrate the intended interface. They do not replace OpenSpec
  scenarios or executable tests.
- Use synthetic, non-sensitive sample content. Never place real identities,
  credentials, tokens, or production data in a screen or export.
- A design-tool file may be a review source. It never replaces the repository
  generator and PNG export.
- Two changes may propose different screens at once. They do not share a working
  copy of the manifest. Two changes to the same screen are an overlap: reconcile
  the current screen in the change that integrates second.

## Procedure

1. Classify the primary screen in the selected change. While implementation has
   not started, keep the visual in the change package.
2. On the implementation slice, add or update the stable screen before runtime
   UI work. Show the normal state, controls, hierarchy, and the empty, error, or
   permission states the scenarios require.
3. Regenerate inventory, index, and HTML, then render PNG.
4. Link the stable page from the capability spec.
5. When a later change alters interaction or a user-observable failure state,
   update the same screen in that change.

## Verification

- `manifest.json` enumerates every current HTML/PNG pair, and the directories
  contain no extra current screens.
- `index.html` links every manifest screen.
- Every human-facing capability spec links its stable page.
- Change-owned proposals stay outside the manifest and product links.
- The generated HTML opens without a project build step, and the PNG is a current
  rendering of that HTML. Structural validation does not prove render freshness.
- A wireframe is not cited as passing behavior evidence.

## Pitfalls

- Treating a proposal image or a polished page as proof of authorization,
  validation, or privacy behaviour.
- Encoding a change name into the stable screen key, so archival orphans the page.
- Rendering only the happy path when an empty, denied, or destructive state
  changes what a person can safely do.
- Hand-editing generated HTML or PNG, or maintaining a second inventory beside
  the manifest.
