# Minimum outcome task authoring

## Generation instructions

Author the fewest goal-oriented tasks that deliver the complete agreed outcome
without weakening scope, safety, acceptance evidence, or authority/ownership.
There is no fixed task-count target. Split only for a necessary dependency,
authority, ownership, safety, or independently verifiable delivery boundary.
Files, functions, commands, agent roles, and routine coding/test/docs steps do
not by themselves justify tracked tasks. State the material reason for each split.
Each outcome includes its tests and documentation; the final checkpoint checks
cross-outcome integration rather than deferring basic quality work.

Carry this rule into the adopting project's OpenSpec `rules.tasks`, SDLC and
contributor guidance under authorized planning writes. It accompanies adoption
of this workflow version without a separate per-change opt-in. Installing a
skill does not adopt policy. Do not patch upstream OpenSpec or automatically
rewrite/refreeze already-approved frozen plans. Preserve native checkbox syntax
and dependency ordering. Working steps may adapt inside approved scope and
budget; native `tasks.md` remains the only mutable progress authority.

## Planning review

Read the generated task instructions as well as the complete proposed outcome.
Map every agreed requirement and acceptance scenario to an outcome. Check both
unnecessary fragmentation and harmful over-merging: every split needs a material
boundary; every merge must retain dependency gates, distinct authority, one writer,
safety, observable acceptance, a finite group or inherited budget and a declared
stop condition. Fewer checkboxes never justify dropped requirements, weaker tests,
unbounded work, or bypassed approval/independent review. Record concrete findings
with paths, affected requirements, the boundary and a minimal remedy. A fixed
quota is not an oracle. Strict CLI validation is not a semantic minimality proof.

## Coherent outcome example

Synthetic local feature, one writer and one local authority boundary:

- [ ] 1.1 Deliver bounded note pinning, including persistence, focused tests and documentation.

Acceptance: pin/unpin survives reload; regression tests pass and usage is current.
Budget: two correction/review cycles. Stop: verified outcome or failed gate.
Do not split this into separate function, styling, test and documentation tasks.

## Necessary boundary example

Synthetic migration whose destructive step requires a separate operator grant:

- [ ] 1.1 Deliver and verify a non-destructive migration preview, including tests and operator documentation.
- [ ] 2.1 Apply and verify the approved migration within its separately granted destructive scope, including rollback tests and documentation.

Reason: the destructive authority and dependency gate must remain visible.
Group 2 waits for accepted preview evidence and the separate grant. Each group
has its own bounded budget, acceptance evidence and stop condition. Combining
these outcomes would hide an authority boundary even though it reduces the count.

## Review examples

Reject a checklist of "edit parser", "add tests", "write docs" for the coherent
outcome: routine steps do not establish necessary boundaries. Reject a single
"preview and destroy old data" task without the migration grant gate: it hides
scope and safety. Accept the two examples only for their stated assumptions,
not as a universal one-task or two-task template. Tests check the generated
instruction text and these representative boundary examples; a planning reviewer
still judges the actual plan's completeness and semantic minimality.
