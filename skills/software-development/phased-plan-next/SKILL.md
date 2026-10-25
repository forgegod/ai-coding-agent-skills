---
name: phased-plan-next
description: Select the next phase and hand it to this Herdr pane.
version: 0.2.0
author: Raphael (forgegod), Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [planning, next, herdr, handoff, change-records]
    related_skills: [phased-plan-overview, autonomous-implementation-review, phased-plan-execution, phased-plan-closeout]
---

# Phased Plan Next

Select the next resumable CHG phase using `phased-plan-overview`, then hand its
bounded goal to a fresh Hermes session in the current Herdr pane. Selection is
read-only; unlike overview, this skill can submit the goal rather than asking the
operator to copy it. It does not implement a phase in the selecting session.

## When to use and authority

Use on an explicit operator invocation of `/phased-plan-next` or a request to
select and inject the next phase into this pane. That invocation authorizes the
current-pane reset, queue-mode change, and the canonical single-phase goal's
local Git scope below. Reading, installing, mentioning, or automatically routing
to this skill does not authorize dispatch. A planning-only or preview request
stays read-only. Creating or editing this skill is not invoking it.

The goal authorizes reservation/worktree creation, reviewed implementation
commits, target fast-forward, completion/archive commits, and verified clean
worktree removal for one selected phase. It never authorizes push, a later phase,
other panes, or bypassing project policy. The new orchestrator must still obtain
explicit executor selection under `autonomous-implementation-review`.

## Prerequisites

- Load `phased-plan-overview`; reuse its selection procedure, decision table,
  bounded discovery, record validator, ownership/cleanup rules, and stopping rule.
  Do not copy or weaken those rules. Its print-only final handoff is replaced only
  for an explicitly invoked, unblocked next handoff in Herdr.
- Require Node 22+, Git, Herdr CLI, and a live Hermes CLI pane. The packaged helper
  supports English CLI acknowledgments; unfamiliar output fails closed.
  Automatic handoff requires the pane's foreground cwd to be the selected target
  checkout. Overview can assess another checkout, but next does not relocate a pane.
- Inspect only `HERDR_ENV`, `HERDR_WORKSPACE_ID`, and `HERDR_PANE_ID` through
  `terminal`. Require `HERDR_ENV=1` and both IDs. Never derive identity from focus,
  label, cwd, a sole candidate, or an unqualified `pane current` response.
  Even `pane current --current` can fall back to focus when caller context is absent.
- Missing caller context is a blocker, not permission to inspect process secrets
  or modify configuration. If requested, use the orchestration skill's
  `references/environment-passthrough.md` to configure named-variable passthrough;
  it cannot create context absent from the Hermes process.

## Procedure

1. Run overview's selection once. Retain target checkout, named branch and full
   SHA, selected active CHG path/phase, CAPs, gate, validator result, and recovery
   evidence. Do not rerun implementation gates. Ambiguity, invalid records,
   dirty/detached target, conflicting ownership, or cleanup-only recovery means
   report the exact next action and stop without reset or dispatch. With no active
   CHG, report overview's design route; do not invent a goal.
2. Outside Herdr, return the selection and transport limitation without injection,
   as overview does. In Herdr, require the caller IDs and inspect
   `herdr agent get <literal-caller-pane-id>` and `herdr agent read
   <literal-caller-pane-id> --source detection` through `terminal`. Confirm the
   current workspace, Hermes agent, and target cwd. A capture or idle status alone
   cannot prove an empty composer. Explicit invocation applies to this pane's
   untouched input after the invocation; if there is a draft, dialog, or uncertainty,
   ask for operator confirmation rather than clearing or submitting it. Tell the
   operator to leave the composer alone during handoff. Do not create, rename, focus,
   or select a different pane.
3. Fill the canonical goal below with the selected phase and literal active path.
   The helper constructs that exact goal and adds target checkout/branch/SHA and
   fresh-session revalidation instructions. It never changes records or Git state.
   A new session drops chat context and can reset session-only model choices;
   `/busy queue` may persist the busy-input preference in Hermes configuration.
   Do not promise either change is session-local.
4. Through `terminal`, preview the helper first (no `--dispatch`). Use argument
   quoting appropriate to the shell; all placeholders below are actual values,
   not literal angle-bracket tokens. Use a fresh absolute receipt path under the
   existing session scratch directory, outside the target checkout:

   ```text
   node <this-skill-dir>/scripts/handoff.mjs --repo <target-checkout> --branch <target-branch> --head <full-sha> --chg <active-chg-path> --phase <phase-number> --receipt <scratch>/next-handoff.jsonl
   ```

5. Only with explicit invocation authority and all checks passed, run the same
   command with `--dispatch` through `terminal(background=true,
   persist_on_release=true)`. The bounded helper must outlive the selecting
   session's reset. This one handoff is the only authorized persistent job; do
   not use a cron, subagent, polling loop, arbitrary sleep, or another agent pane.
   Read its initial receipt to distinguish armed from blocked. Do not foreground
   wait for your own turn to finish: end the selecting turn promptly with the
   selection and receipt path. Scheduled is not delivered; do not claim otherwise.
   If the receipt is not populated yet, report scheduled/unconfirmed and end;
   do not hold the turn open waiting for the helper's settlement check.
6. The helper uses `scripts/herdr-pane-state.mjs` to inspect the live bottom
   composer/footer through `agent read --source detection`. Structured `agent get`
   binds pane/workspace/terminal identity and target cwd only: `agent_status`,
   `state_change_seq`, and `completion_seq` can be stale after gateway changes.
   Require visible working first, then two visible idle samples before reset,
   even when metadata says idle throughout. Never skip settlement or use `agent wait`.
   Historical `Working` or `∴ Thought for` text is not activity proof. Unknown UI,
   drafts, queued input, dialogs and identity drift stop without input. The helper
   rechecks the clean target and submits three separate prompts, in this order:

   ```text
   /new --yes <unique-phase-session-name>
   /busy queue
   /goal draft <designed-single-phase-goal>
   ```

   All three prompts are sent without `--wait`; explicit fresh CLI acknowledgments
   and visible idle state are required before the next. A slash command need not
   enter `working`; `/goal draft` can spend more than Herdr's five-second prompt
   activity gate in auxiliary drafting. Bounded `pane wait-output --regex` waits
   scope queue and goal acknowledgments to this unique new-session marker, then
   readback verifies `Goal set` with the exact goal text. This text wait verifies
   command acceptance, never executor completion. This handoff is not a passive
   task monitor; do not reuse it to watch executor work or inject status requests. No `/model`, key
   presses, multiline-paste shortcut, or automatic retry is part of this sequence.
7. If any check, acknowledgment, identity, or wait fails, the helper records the
   last attempted stage and stops. A partial reset remains a partial reset; do not
   roll it back or replay the sequence automatically. Read the receipt and exact
   pane before requesting an explicit recovery decision. Never treat an old
   idle state as proof the selecting turn finished. No background helper is
   allowed when the host cannot preserve it across session end.

## Canonical goal

```text
/goal draft Execute only phase <phase-number> of <active-chg-path> using autonomous-implementation-review, phased-plan-execution, and phased-plan-closeout. I authorize the orchestrator to reserve this phase and create its worktree, commit its reviewed implementation, fast-forward the target, commit its completion/archive records, and remove its clean dedicated worktree after verification. Stop after verified target completion and cleanup; do not push or start another phase.
```

The orchestrator follows `phased-plan-closeout`; the executor must not edit or
commit the CHG path. Selection evidence is not a reservation. The fresh session
must reload the CHG/DOX and revalidate ownership before any implementation write.

## Pitfalls

- The parser supports the English classic CLI `☤ ❯` composer/footer shape: a busy
  queue placeholder plus a live timer/spinner, or empty input plus frozen `⏲`.
  Other skins, locales, TUI layouts or truncated captures fail closed; do not
  bypass them with metadata or transcript-wide keyword matching.
- Pane IDs are not agent-process locks. Leave the pane untouched during the short
  handoff; state checks reduce races but cannot make external input atomic.
- Installation does not grant execution authority. Review this package separately
  from the generic read-only planning entry point.
- Receipts are temporary transport evidence, not progress authority. Active CHGs
  remain the only material-work progress records.

## Verification

Report CHG/phase, target branch/SHA, CAPs, gate, validation and ownership result,
then blocker, preview, or scheduled receipt location. Report selection and handoff
separately: missing caller context does not invalidate the selection, but prevents
dispatch. Identify selection, caller preflight or delivery as the failed layer;
if the helper never ran, say so rather than claiming a failed delivery. A `goal-accepted`
receipt includes post-submission readback; it proves goal acceptance, not phase completion.
The new session verifies the persisted goal against the CHG before proceeding.
Tests use synthetic Herdr responses and isolated Git fixtures; they do not prove
live client compatibility. Never reset a real user session merely to test a skill.
