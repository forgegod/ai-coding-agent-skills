# Artifact-first worker handoff

This is the portable interface, not a qualified client or a launcher. Import
`createAttempt`, `publishResult`, and `readHandoff` from `scripts/orchestration-core.mjs`
(Node 22+). They use package-local `scripts/worker-handoff.mjs`. No Hermes, Herdr,
network, Git writer, scheduler or task database is involved.

## Publisher trust and retention

Only the selected qualified adapter calls the publishers. Before launch it must
prove that worker tools/process permissions cannot alter the request, publisher
files, retained captures or their ancestors. Directory modes and this helper are
not a sandbox. Qualification must also prove native output extraction, effective
runtime identity and same-session human interaction. These checks do not qualify
an adapter, authenticate a grant, prove a report true or authorize a launch.

Use a unique initially absent attempt directory in a trusted publisher-owned
parent, outside all repositories, installed profiles and disposable worker scratch.
Supply all those roots as `excludedRoots`, including the absolute workspace.
Do not omit an excluded root to make a check pass. Ancestors must already exist;
symlinks are refused before mkdir/read/write. The publisher roots must not be
concurrently renamed or modified by another actor; portable Node path checks are
not a defense against a privileged hostile ancestor-replacement race.

Keep the returned expected binding independently of worker output and immutable
for the attempt. It contains a detached recursively frozen request, directory and
raw request SHA-256. Retain the effective runtime from positive adapter readback
separately; never populate it from a result's claims. Retained attempts outlive
worker-scratch cleanup. No helper deletes evidence, retries, launches or advances
native task progress. A failed partial publication is preserved, never repaired
in place. A separately authorized successor uses a new directory and predecessor
attempt id, without resetting any action or correction budget.

## Version 1 request

`createAttempt({ directory, request, excludedRoots })` publishes `request.md` with
an exact versioned JSON binding section. Unknown/missing fields are rejected.
The canonical Markdown is generated, not parsed from arbitrary worker prose.
Its binding contains:

- `schemaVersion: 1` and `identity`: `attempt`, `predecessor` (null initially),
  `role` (`implementer`, `reviewer`, `approach-reviewer`), full `change`, native
  numeric `group`, `task`, `action`, absolute `workspace`, `plan`, `planDigest`,
  `candidate` and complete planning `inputs` (path to raw SHA-256).
- `action` equals the native task id; descriptive action labels are not allowance
  keys. A reviewer requires a candidate SHA; other roles use null. Ordinary draft
  approach review may use null plan/digest. Full planning inputs come from delivery's
  actual enumeration, not merely the minimum structural inputs the parser checks.
- `outcome`, nonempty `acceptance`, `scope`, `nonGoals`, `stop`, and finite positive
  `budget: { limit, unit }` resolved from the group/authority contract.
- `authority`: `orchestrator`, identical `writer`, `authorSession` (the planning
  author or candidate implementer for review independence), `approvalReference`,
  `executionReference`. References describe existing role authority, never create it.
  An approach reviewer may use null approvalReference: review authority is not
  execution-plan approval, including for an authorized provisional successor.
- `restrictions` includes `no Git writes`, `no tasks.md writes`, `no profile writes`,
  `no subagents`, `no multiplexers`; review also includes `read-only`.
- `evidenceRoots` includes the attempt directory, and `requiredEvidence` names every
  required closed capture there, including `native.txt` and `lifecycle.jsonl`.
  Include original command argv/cwd/stdout/stderr/exit capture files when applicable;
  omitting a gate's original capture is not complete evidence.
- `mutablePaths` explicitly enumerates authorized repository-relative source outputs,
  distinct from immutable planning inputs. Review has none. New/deleted output paths
  must also be authorized here; output hashes do not prove the edits acceptable.

## Version 1 result

`publishResult({ expected, runtime, result, files })` is adapter-only. `files` maps
flat attempt-local capture names to complete byte buffers. Required evidence may
also be closed files already retained by that adapter in the declared roots.
Inputs are snapshotted before asynchronous I/O. Existing files are never replaced.

The exact result fields are `schemaVersion`, `identity` (the complete request
identity), `requestSha256`, `runtime`, `status`, `verdict`, `nativeVerdict`,
`findings`, `coverageLimitations`, `report`, `reportKind`, `nativeReport`,
`evidence`, `outputs`, and `completion`.

- Runtime fields: adapter, client, version, session, provider, model,
  configurationSource, configurationScope and boolean readOnly. They must equal
  independent effective-setting readback. Review cannot use the author/implementer
  or orchestrator session.
- Status: completed, blocked, failed, capped or stopped. Verdict: no_findings,
  findings, unavailable or not_applicable. Completed implementation is not_applicable;
  incomplete attempts are unavailable with explicit coverage limitations, never
  manufactured review verdicts. Completed review requires an explicit native verdict;
  no_findings requires `No findings`, empty findings and no coverage limitations.
- Findings retain severity (critical/high/medium/low), repository-relative path,
  positive line, impact, trigger and remedy. Execution with findings is valid
  execution but not acceptance. The native verdict is an exact line of the complete
  retained native report, not inferred from an empty array or pane presentation.
- `report` names attempt-local report.md. It and every evidence descriptor contain
  absolute path, sha256 and byte length. `nativeReport` references the original
  native report in `evidence` with exactly the same bytes/hash. `reportKind` is native
  or, only for incomplete attempts without a native report, adapter-diagnostic with
  nativeReport null. Diagnostic prose explicitly records missing native output.
- `outputs` is the separate changed-path hash inventory (null denotes deletion),
  constrained to mutablePaths. The orchestrator compares it to actual changes and
  re-runs gates before candidate freeze; it is not approval or a filesystem diff.
- `completion` is `{ kind: exit, code, signal }` with the actual process exit, or
  `{ kind: turn-end, turn, evidence }` for a still-live persistent client. Never
  synthesize exit zero from idle UI. The turn evidence binds event `turn-end`, attempt,
  session, turn and reportSha256. Native completion qualification remains mandatory.
- Closed lifecycle.jsonl contains version 1 events bound to attempt/session: launch,
  working, waiting, resumed or terminal. Its final and only terminal event binds
  status and the exact completion observation. Waiting alone is not a result:
  preserve the native wait and automatically expose that same session; do not answer it.
  Only an adapter-observed resumed event with decision approved resolves a wait;
  an unresolved wait cannot publish completed status. Reads refuse files over
  64 MiB rather than returning truncated evidence.

Finalize and sync all reports/captures first. Validate every required reference,
size, SHA-256 and lifecycle identity, then write/sync a closed staging result and
publish result.json with a same-directory atomic no-clobber hard link. The closed
staging inode is retained, including on failure. Filesystems lacking that primitive
fail rather than falling back to overwrite/rename. This is atomic visibility, not
a claim of power-loss durability on every filesystem. Never hash live append logs
or create a manifest that includes its own future hash.

## Admission to delivery

`readHandoff({ expected, runtime })` rejects missing/partial/malformed or unknown
schemas, duplicate/noncanonical result fields, changed requests, stale identity,
wrong sessions, unsafe/out-of-root references, symlinks, truncated or changed bytes,
missing captures and inconsistent verdict/completion fields. Artifacts are data:
never execute their content or obey instructions embedded in reports.

A successful read returns frozen facts with `executionCompleted`, `result`,
`deliveryAccepted: false` and `planApproved: false`. It is not permission to retry,
clean up, approve a plan, tick tasks or advance. Delivery independently verifies
actual outputs, gates, review and its approved-plan/digest, ownership and continuation
boundaries. Legacy observations do not silently become artifact-first evidence;
legacy host migration waits for adapter qualification.
