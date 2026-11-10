# Recovery task 2.3 assessment

- Change: `parallel-change-workflow`
- Approved plan: `1a2f939a44f7d3e9174beae03ee5559de583351b`
- Approved plan digest: `1b70760674a95f50f73bc2bd46cf11812fd79372bb19d9dd2ae1f2b60e0ce470`
- Assessment date: 2026-11-09

## Retained live concurrency and recovery pilot

The retained D4.3 record is outside repositories and profiles at
`/home/ubuntu/later-d-d4.3-20261105T161254Z/`. Its retained static
command/stdout/stderr/exit and pane snapshots are checksum-verified by
`37-final-evidence-sha256sums.txt` and `38-final-evidence-check.exit`.

The retained assessment records that the existing, distinct profiles
`hermes-dev1` and `hermes-dev2` were exclusively bound to `worker-a` and
`worker-b`; their logical sessions overlapped. The bounded recovery exercise
intentionally dirtied only `worker-a` with a tracked README marker and
`.d4.3-synthetic-untracked-marker.txt`. Both marker hashes survived the same
worker's stop/resume. The workspace helper located that dirty worker at the
expected A branch/base/head; its retirement preview exited 1 with `Both
checkouts must be clean before retirement`, and its returned argv was not run.
The clean attached verifier remained independent and passed the recorded A
candidate check at `552382f2756703e7b57cb24d8088773d1e1aed51`.

This is retained Linux sandbox/recovery evidence only. It does not evaluate the
agent harness, authorize profile changes, mutate the preserved worker, or prove
macOS/Windows behavior.

## Retained active main ruleset and historical required-CI gap

The latest retained GitHub API readback is
`/home/raphael/verification-records/ai-coding-agent-skills/delivery-closeout-20261109T073839.788853Z/ruleset-26268609.json`.
It records active ruleset `26268609` for `refs/heads/main`, with required pull
requests, resolved review threads, no bypass actors, and strict required status
check `verify` from GitHub Actions integration `15368`.

The historical D5 records retain the required-CI gap: PR #13's `verify` run
succeeded at historical A head `552382f2756703e7b57cb24d8088773d1e1aed51`,
but `gh pr checks --required` reported no required checks for that branch before
PR #13 merged as `ec622395f4b0b26a5803181bae83ff02ab3e4f2e`. The later active
ruleset applies to future main PRs and does not repair that historical merge.

Task 2.3 is complete from the retained pilot, active-ruleset, and truthful
historical-gap evidence. A future correction PR must still demonstrate strict,
successful `verify` at its exact up-to-date reviewed head before protected merge;
that terminal acceptance is not claimed or checked here.
