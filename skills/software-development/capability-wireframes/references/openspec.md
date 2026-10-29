# OpenSpec-scoped wireframes

Load this only when the adopting project's policy explicitly selects OpenSpec for
the scope and the change affects a primary human-facing surface. The CAP layout in
`SKILL.md` applies to CAP/CHG-selected projects. Never maintain
both layouts for one capability.

## Stable keys, not records

- Keep current visuals under `docs/product/wireframes/<capability>/`, one
  directory per stable capability key, with one screen key per human surface.
  File names derive from those keys, so a later change updates the same screen
  instead of allocating a new identity.
- The keys are names, not records. An OpenSpec change does not allocate
  `CAP-NNNN` and no fabricated CAP record is required for current behavior.
- `openspec/specs/` links the stable HTML page for the capability. Link the
  manifest entry rather than duplicating paths, and change the link only when the
  stable key itself changes.

Portable layout:

```text
docs/product/wireframes/
├── generate.mjs                     # the project's existing generator
├── manifest.json
├── index.html
├── <capability>/html/<screen>.html
└── <capability>/exports/<screen>.png
```

## Generator and manifest

- Reuse the project's existing `generate.mjs`; inspect its actual interface
  (screen-table shape, CLI arguments, output directories) before editing it. Do
  not assume a CAP record parser, a `CAP-NNNN` filename derivation, or a
  `**Primary surface:**` CAP declaration exists. Extend only key-to-path
  derivation and the screen table.
- Keep HTML as the review source and PNG as the renderer export of that same HTML
  at the manifest viewport. Regenerate `index.html` and `manifest.json`; never
  hand-edit generated output.
- Preserve the manifest contract the project already validates. Where it defines
  none, each entry carries a unique stable key, a non-empty title, HTML and PNG
  paths, and positive integer viewport width and height, and the artifact
  directories agree with it in both directions.

## Change-owned proposals

- Pre-implementation visuals are change-owned under
  `openspec/changes/<name>/`. Keep them review-only, outside the manifest, and
  outside product links; reference them from the proposal, design or tasks.
- The implementation slice updates the stable screen, regenerates HTML, PNG,
  index and manifest, and links it from the spec delta and tests. Do not copy
  proposal files into the product directory or treat a proposal as current
  behavior.
- Archived change packages retain their review assets and package-relative paths.
  Repair repository links when the package moves; do not requalify proposals as
  current visuals.