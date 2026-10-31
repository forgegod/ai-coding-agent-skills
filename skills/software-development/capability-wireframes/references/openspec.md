# OpenSpec-scoped wireframes

Load this with `SKILL.md` when the selected change affects a primary human-facing
surface. Stable keys and the generator contract live in the skill. This file
keeps the overlap and archival checks.

## Parallel visuals

- Two changes may propose visuals for different screens at the same time. They
  do not share a working copy of `manifest.json` or `generate.mjs`.
- Two changes that alter the same stable screen are an overlap. Specify both
  proposals in their own change packages, and reconcile the current screen in
  the change that integrates second. A clean Git merge of HTML is not a reviewed
  interface.
- Do not allocate `CAP-NNNN`. No capability record is required for current
  behavior. The key is a name, not a ticket.

## Generator and manifest

- Reuse the project's existing `generate.mjs`; inspect its actual interface
  (screen-table shape, CLI arguments, output directories) before editing it.
- Keep HTML as the review source and PNG as the renderer export of that same HTML
  at the manifest viewport. Regenerate `index.html` and `manifest.json`.
- Preserve the manifest contract the project already validates. Where it defines
  none, each entry carries a unique stable key, a non-empty title, HTML and PNG
  paths, and positive integer viewport width and height.

## Change-owned proposals

- Pre-implementation visuals stay within the selected change package, review-only,
  outside the manifest and outside current `openspec/specs/` links. The active
  package is located at `openspec/changes/<name>/` for tool use, not durable identity.
- From other documents, cite the full change name (including its existing ULID)
  and the screen key. Resolve the current package location when reading it; do not
  embed an active path or guess a future archive path. An optional immutable commit
  permalink is a reference to that published revision, not the latest file.
- The implementation slice updates the stable screen and links it from the current
  spec and tests. Do not copy proposal files into `docs/product/wireframes/`.
  The default product layout is a companion convention, not native OpenSpec policy.
- Delta specs should identify current visuals by stable capability/screen keys or
  a verified commit permalink. During sync, compute the current spec's relative
  HTML/PNG links from its destination and validate them; copying a delta-relative
  link verbatim changes its meaning. A manifest entry is not automatically a URL.
- Archived change packages retain their review assets and package-relative links
  when both endpoints move together. The receipt guard requires byte-identical
  archival. Do not repair links by rewriting the frozen package during closure;
  resolve any necessary content changes before integrated verification. Changes
  outside that package also need renewed verification, not a wider archive allowlist.
