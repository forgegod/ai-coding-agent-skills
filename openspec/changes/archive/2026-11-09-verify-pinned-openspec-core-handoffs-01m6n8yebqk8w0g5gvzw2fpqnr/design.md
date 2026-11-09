---
metadata_version: 1
artifact: design
change: verify-pinned-openspec-core-handoffs-01m6n8yebqk8w0g5gvzw2fpqnr
---
# Design

## Context

See proposal.md for motivation, scope, verified issue identity and full overlap
record. The existing opt-in entry point has `pinned = "1.16.0"`, a local
`run(cwd, args, expectedStatus)` npm-exec helper, an exported pure
`executionEnvironment`, metadata/task/archive fixtures and finally-based raw log
retention with home/cache removal. `npm test` imports that environment function
from `tests/openspec-metadata.test.mjs` and pins its exact key set; B must not
widen or change that exported contract or edit its consumer.

Only `tests/openspec-cli-compatibility.mjs` is a product edit. The native capability
inventory has only `local-skill-installation`; it governs the repository installer,
not upstream generation in a disposable project. No requirement is added, modified
or removed, so `skip_specs: true` is appropriate and no specs are generated.

Pinned source at Fission-AI/OpenSpec revision
`27c0515724decc633818c735ee596481eec78a8b` defines core workflows as
`propose, explore, apply, update, sync, archive`. Its CLI reference supports
`init --tools claude --profile core --no-animation`; its profile-handoff tests
already exercise optional-reference filtering. These are design inputs, not new
local execution evidence and not an assertion that 1.16.0 has a defect.

## Goals / Non-Goals

Goals:
- Detect inventory drift and dangling optional handoffs using actual generated
  files from exactly the pinned npm package, not template copies or a global CLI.
- Prevent vacuous scans, prove each forbidden spelling is rejected, and preserve
  existing environment/log/cleanup behavior in one test file.
- Preserve the project's seven-workflow setup requirement while testing the
  upstream six-workflow core profile as an isolated compatibility surface.

Non-goals:
- Change the exported environment allowlist, Git child environments, delivery
  guards, installed profiles, configuration defaults, schemas, pins or installers.
- Expand coverage to refresh, custom/expanded profiles, beta skills, other hosts,
  upstream PRs, or a general workflow-reference validation service.
- Treat planning status, this issue, or an overlap review as plan approval,
  candidate review, remote publication, integration or Later D readiness.

## Decisions

### 1. Fresh core fixture through the existing pinned runner

Add a second synthetic project under the existing scratch root, separate from the
metadata fixture and repository copy. Allocate its own fresh HOME and
XDG_CONFIG_HOME using unchanged `executionEnvironment(process.env, { home })`.
Reuse the current npm executable, exact `--package=@fission-ai/openspec@1.16.0`,
`--cache <scratch>/npm-cache`, `--yes`, `--ignore-scripts`, timeout, maxBuffer and
raw `{ args, status, stdout, stderr, error }` records. A small optional per-call
environment parameter or equivalent local runner factoring is allowed inside
this file; preserve all existing callers and exported environment semantics.

Invoke `--version` through that same pinned runner/environment, then
`init --tools claude --profile core --no-animation` with noninteractive piped
stdin in the empty core fixture. No force/legacy cleanup is needed for an empty
project. To make both output surfaces explicit, seed only the new scratch
XDG config's `openspec/config.json` with `{ "profile": "core", "delivery": "both" }`.
This is synthetic fixture configuration, never a real user configuration or a
profile installer. No `config` command or installed-profile discovery is needed.

Assert HOME/XDG_CONFIG_HOME are distinct from the existing fixture's and contained
in scratch; telemetry is exactly `0`. Exercise the unchanged constructor with a
synthetic source containing host HOME/XDG, profile names, synthetic credentials,
npm_config_* and NODE_OPTIONS, verifying isolation without reading actual secret
values. Check a synthetic child launched with the fixture env observes the scratch
locations, telemetry and omission of those variables. Use explicit platform handling
consistent with the existing constructor; do not claim simulated native results.

Rejected: global CLI proof, inherited HOME/config, extra inherited variables,
shared profiles, and editing a second test file. If isolation really needs a
contract change or another product path, stop for revised selection.

### 2. Exact inventories, then exhaustive generated-file scan

Read generated files from the synthetic project's `.claude/skills/` and
`.claude/commands/` trees only. Fail if a required root/file is missing, empty,
non-regular or symlinked rather than silently skip it. Require exactly:

| Core workflow | Skill directory with SKILL.md | Command under commands/opsx/ |
| --- | --- | --- |
| propose | openspec-propose | propose.md |
| explore | openspec-explore | explore.md |
| apply | openspec-apply-change | apply.md |
| update | openspec-update-change | update.md |
| sync | openspec-sync-specs | sync.md |
| archive | openspec-archive-change | archive.md |

Sort and compare observed inventories to these literals; do not import upstream
runtime internals, infer inventory from prose, or count host installations.
Recursively enumerate and scan every generated regular skill/command file,
including any support files; the expected SKILL.md and command paths must all
be in the scanned set. Exact primary inventories prevent optional generated
workflows from slipping past a content-only scan. Include the observed relative
inventory in retained scratch evidence/success output, not just a claimed count.

Reject references to all omitted optional workflows:

| Workflow | Canonical direct skill reference | Command reference |
| --- | --- | --- |
| new | /openspec-new-change | /opsx:new |
| continue | /openspec-continue-change | /opsx:continue |
| ff | /openspec-ff-change | /opsx:ff |
| bulk-archive | /openspec-bulk-archive-change | /opsx:bulk-archive |
| verify | /openspec-verify-change | /opsx:verify |
| onboard | /openspec-onboard | /opsx:onboard |

Also cover literal shortened `/openspec-new`, `/openspec-continue`,
`/openspec-ff`, `/openspec-bulk-archive` and `/openspec-verify` forms requested by
the scoped brief. Match complete invocation tokens with correct boundaries so
suffix variants cannot bypass rejection. Bare canonical `openspec-...` skill
names can be rejected as references too; ordinary words such as "continue" and
native CLI fallback `openspec new change` are not slash-workflow references.
Use the same assertion for real generated content and synthetic controls; report
relative file and offending token on failure. Do not manufacture expected generated
files as evidence or silently filter optional references before asserting.

Rejected: checking only propose/apply, a four-token new/continue regex, checking
only skill bodies, broad word bans, copying template text, and treating absent
command files as success.

### 3. Negative controls prove the assertions work

Keep controls local to this opt-in file; no additional module or test route.
A correct synthetic inventory and harmless core references pass. Missing/extra
skill or command inventories fail. For every forbidden canonical and short token,
assert the same content guard throws when that token is inserted into an otherwise
valid synthetic skill or command body; include code-fenced references and both
surfaces. At least one such dangling-reference mutation starts from an in-memory
copy of a real generated file. Preserve the original generated files as evidence.

The positive generated scan is separate from these intentional failures: catch
only the expected assertion failure with `assert.throws` (or the asynchronous
counterpart), never downgrade a genuine CLI or generation failure to an expected
negative result. Assertions must execute from main when `npm run test:openspec`
runs; importing the module in the ordinary suite must still avoid npm/network or
fixture side effects.

### 4. Retain raw execution and cleanup, not a new evidence framework

Keep actual command output/status in `probe-log.json` and preserve generated
fixture files plus the observed inventory under scratch. Include enough cwd/fixture
identity in local records to distinguish the metadata and core runs without
replacing raw output with summaries. Run cleanup for the new HOME, old HOME and
scratch npm cache in finally on all outcomes; retain existing fixtures and logs.
Ensure raw-log write failure cannot bypass cleanup (nested finally as needed).
Do not alter scanner policy or adopt the sequenced Lossless evidence framework.
No filesystem or network sandbox claim is made.

### 5. Bounded independence and documentation impact

The fresh overlap check uses accepted main/A merge-base
`a85ceff2e461a70fbeca1e8e2abf6ff5fddd7007`, not A's historical guard base. A's
published candidate `552382f2756703e7b57cb24d8088773d1e1aed51` changes Git helpers,
guard/workspace tests, delivery docs and packaging; B's probe blob is unchanged
between that candidate and main (`5f821013558550dbbbca3503a1757c15ca692324`).
A's current clean owner and plan/task artifacts were read, with no shared product
edit or handoff-generation contract. Independent read-only review concurred.

The actual untracked Lossless draft
`lossless-closeout-evidence-01m6devwqew28806bvm7zjk4vn` owns evidence-retention
semantics and delivery/package integration, not this fixture. Consuming the same
opt-in gate is not ownership of its source. Preserve it and the dirty original A
workspace; never clone/adopt them. These findings hold only for the bounded current
scope and require a fresh check before implementation, freeze and integration.

Required skill inventories, prerequisite relationships, pins, installation routes,
companion dependencies and package bytes do not change. Current setup/metadata
and SDLC guides remain accurate, so the root same-change documentation obligation
does not require a product-doc edit here. If that assessment changes, stop, record
the extra path/overlap in the operator guide and seek revised selection; do not
silently expand B or add a version bump.

## Risks / Trade-offs

- [Empty/partial generated inventory] -> Exact expected paths, nonempty files and
  complete recursive traversal before scanning; never pass on zero files.
- [Regex misses an optional spelling] -> Explicit canonical/short token matrix,
  per-token controls on skills and commands, including code-fenced text.
- [Host configuration or credential inheritance] -> Existing allowlist, new scratch
  HOME/XDG, synthetic contaminant checks and actual fixture-child observation;
  unchanged exported env contract. This is not a security sandbox.
- [Network or upstream package failure] -> Fail the opt-in gate and retain raw
  output; never substitute global CLI/template/profile results.
- [Shared test import regresses] -> Preserve import-without-execution and existing
  environment keys; run ordinary npm tests after implementation.
- [Scope or sibling drift] -> Stop and reselect/reapprove rather than broaden B.

## Migration Plan

No runtime/profile/data migration. After separately authorized plan freeze and
exact plan approval, bounded execution may implement this one-file test delta.
Require `npm run test:openspec` plus `npm test`, `npm run build`,
`npm run validate:openspec`, `openspec validate --all --strict --json --no-interactive`
and whitespace checks after the final edit. Build output stays untracked; tests
remain synthetic. The focused gate requires npm/network access, Node 22.12.0+
and Git under the existing accepted prerequisites.

Full tests catch the existing env import contract; build proves unchanged
packaging; metadata/native validation check the new artifacts and existing
repository; whitespace checks include newly added planning files, not only tracked
diffs. Real scanner/native installer release probes are not newly required by a
test-only non-package delta. Additional product scope requires reassessment, not
permission to bypass or expand. No gates above are run as implementation evidence
in this proposal request; native planning validation alone is authorized now.

Rollback is ordinary reviewed reversal/repair of the test-only delta under later
authority, preserving raw failure evidence and all sibling state. Publication,
protected integration, exact-target gates, factual receipt/archive and issue
closure remain separately authorized later events. No immutable B plan commit,
digest approval or candidate exists at planning completion.

## Source inputs

Read-only pinned design sources (not local generated evidence):
- https://github.com/Fission-AI/OpenSpec/blob/27c0515724decc633818c735ee596481eec78a8b/src/core/profiles.ts
- https://github.com/Fission-AI/OpenSpec/blob/27c0515724decc633818c735ee596481eec78a8b/docs/cli.md
- https://github.com/Fission-AI/OpenSpec/blob/27c0515724decc633818c735ee596481eec78a8b/test/commands/profile-handoffs.test.ts
- https://github.com/Fission-AI/OpenSpec/blob/27c0515724decc633818c735ee596481eec78a8b/test/core/templates/profile-handoffs.test.ts
