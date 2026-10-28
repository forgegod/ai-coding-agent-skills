# GitHub automation

## Purpose

Verify skill packages and publish the tested static distribution site to GitHub Pages.

## Ownership

- `workflows/ci.yml` owns credential-free pull-request and branch verification.
- `workflows/publish-skills.yml` owns tested builds and Pages deployment on main or manual dispatch.

## Local Contracts

- Both workflows run `npm ci`, `npm test`, and `npm run build` on Node 22.
- Default permissions are contents: read. Only the deployment job receives pages: write and id-token: write.
- Deploy only dist/ via the Pages artifact; include `.well-known/` dot-directory explicitly and retain `downloads/` ZIPs, HTML, and checksum inventory. The source marketplace is versioned in Git, not deployed as a Pages registry.
- Pull requests do not deploy. Serialize Pages deployments; retain the previous successful deployment if build checks fail.

## Work Guidance

Keep local commands, root verification, and workflows aligned. No personal tokens or stored deployment secrets are needed.

## Verification

Validate YAML and run matching local checks. Verify deployment run and public endpoint before declaring publishing complete.

## Child DOX Index

No child DOX documents. Parent: `../AGENTS.md`.
