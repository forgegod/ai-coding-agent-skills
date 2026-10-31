# Recovery before mutation

Preserve all work and evidence. This helper never repairs failures or authorizes
Git/GitHub writes. Recovery starts by reading exact local refs and dirty state,
issue/assignment/activation, candidate/review, actual PR heads and target history.
A failed command or unknown remote result is not proof of absence.

| Observed state | Required bounded response |
| --- | --- |
| Dirty/unowned checkout, conflicting run or ambiguous operator | Stop and retain paths/refs; operator chooses ownership and safe next action. No reset, discard, silent unassignment or competing executor. |
| Proposed plan changed after approval | Reapprove named changed scope/gates and digest before continuing. Preserve previous approval and evidence. |
| Candidate changed after review | Run gates and independent review on the new exact candidate; do not relabel old review. At most two correction/review cycles before escalation. |
| Push/comment/PR write timed out | Read the exact target and intended content back. Resume only from known state; do not replay a possibly successful write blindly. |
| Open PR waiting on review or checks | Not a failure and not a second pull request. Resume under finish from the actual head and review state. |
| Implementation already merged, no receipt | Verify actual merge and target, run missing integrated gates, then prepare the same change's truthful receipt/archive. Do not reapply implementation. |
| Integrated gate failed | Keep completion blocked, preserve failure output and obtain explicit repair/revert authority. Checked tasks do not mean accepted integration. |
| Receipt/archive PR already exists | Read its exact head/content/merge state and continue that closure path. Do not create competing receipts or rewrite previous failed evidence. |
| Current capability spec differs from an older delta | Reconcile against current target explicitly; never reapply an old MODIFIED block over newer accepted behavior. |
| Target advanced after verification | Re-verify a named revision unless the guard accepts exact record-only movement/new evidence; changed product/config/current-spec content is never excused by a declared prefix. |
| Closure merged, cleanup interrupted | Verify closure/acceptance and request only bounded cleanup. Do not create another PR attesting the closure or report cleanup before readback. |

Summarize observed state, retained work, exact evidence identities, blockers and
one operator decision. An operator handoff is not an unattended resume token,
permission to change merge settings or authority to start another change.
