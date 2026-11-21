# Pages recovery runbook — disclosure-safe draft

This is a new summary of the retained Task 1.2 runbook, not its original bytes or evidence of a new deployment. It does not authorize settings changes, deployment, or live profile installation.

## Restore Pages at the destination

Keep `grewety/ai-coding-agent-skills` as the repository of record; do not transfer back or recreate it. Diagnose the failed build or Pages deployment in Actions. Check that Pages still uses GitHub Actions, and that the protected `main` workflow can deploy through the `github-pages` environment. Restore only the necessary approved workflow or environment setting; route source fixes through a protected PR. Run the normal protected deployment from the accepted `main` revision and confirm the actual successful run before claiming recovery.

## Fallback while Pages is unavailable

Use the public GitHub source and the repository's documented client installation routes. Build ZIPs and the checksum inventory from a named verified checkout if Pages downloads are unavailable. Native client copies and manual ZIPs are local copies, not Hermes scanner-managed installations. Use the documented scanner-managed route for Hermes and never bypass scanner refusal or overwrite local changes to make an install pass. Do not promise redirects from the old Pages URL.

## Verify restoration

Record the deployed revision and run. Compare the landing page, downloads page, well-known catalog, every advertised package file, and ZIPs with the build of that exact revision. Validate ZIP integrity and SHA-256 against both the public and local inventories. Exercise documented Hermes discovery and scanner-managed installation in a disposable home only, and keep native-copy checks separate from Desktop or account acceptance. If a check fails, retain the result and keep recovery unaccepted.
