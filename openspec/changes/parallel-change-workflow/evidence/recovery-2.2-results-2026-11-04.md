# Recovery task 2.2 results

- Candidate verified before execution: `1714d838508deaa51ea56245217967579e21533f`
- Approved successor plan: `18821a595b159a2095e844dd56394266ada837f0`
- Approved plan digest: `9c8f6fba8eae03fdfeb67914c066233663f3d072db0d1f3dc827e84d10ffafd4`
- Date: 2026-11-04

## Real scanner release gate

Command:

```sh
HERMES_SOURCE=/home/raphael/src/NousResearch-hermes-agent npm run test:security
```

The selected scanner file had SHA-256
`2b39ae73585709c51af62cbf8c3f23c5330ca1e297ac01453e9328996e281562`, matching
the retained scanner identity. The checkout had unrelated untracked paths; the
tracked scanner file had no diff. The command exited 0. Its stdout, stderr and
exit status are retained as `recovery-2.2-real-scanner-2026-11-04.*`.

The release scan rebuilt five packages, ran all three real-scanner negative
controls, and reported `skills-guard-v10`, safe/allowed verdicts for all five
complete packages, with no exclusions, suppressions or force/bypass.

## Native-client installation and validation

Separate empty session-scratch user homes were created for Claude Code and Codex.
Only the respective existing client marker directory was seeded. No Hermes
profile directory existed in either scratch home before or after the run.

Commands:

```sh
node scripts/install-local-skills.mjs --user-home <isolated-claude-home> --client claude-code
node scripts/install-local-skills.mjs --user-home <isolated-codex-home> --client codex
node --test tests/local-profile-installation.test.mjs
```

Both client installs exited 0 and reported installation of five complete skill
packages. Readback compared every installed complete package byte-for-byte with
its canonical source package: `autonomous-implementation-review`,
`capability-wireframes`, `git-commit-message`, `openspec-delivery`, and
`openspec-next`. All comparisons exited 0. Codex readback used its documented
`.agents/skills` destination after detecting `.codex`.

The isolated native-client suite exited 0: 52 passed, 0 failed, 0 skipped. Its
stdout, empty stderr and exit status are retained as
`recovery-2.2-native-client-suite-2026-11-04.*`; install stdout/stderr/exit
records are retained under the respective `recovery-2.2-claude-install-*` and
`recovery-2.2-codex-install-*` names.

## Retained failure

The first Claude readback used the non-existent source path
`skills/creative/capability-wireframes` and exited 2 before comparing that
package. It did not modify source or either installation. The exact stderr and
exit code remain in `recovery-2.2-claude-validation-first-attempt-2026-11-04.*`.
The corrected source path, `skills/software-development/capability-wireframes`,
then compared byte-for-byte with exit 0; its empty stdout/stderr and exit status
are retained as `recovery-2.2-claude-capability-wireframes-validation-2026-11-04.*`.

No source correction, profile change, publication, sandbox pilot, archive or
finish action occurred.
