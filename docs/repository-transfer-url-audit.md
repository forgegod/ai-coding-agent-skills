# Repository transfer: old URLs and external listings

This is the 2026-11-21 UTC audit for `transfer-repository-to-grewety-01m7wcqhgdd3ntk1bpww84a4sf`, tracking [issue #25](https://github.com/grewety/ai-coding-agent-skills/issues/25). The source inventory is pinned to the [canonical-route merge on main](https://github.com/grewety/ai-coding-agent-skills/commit/78cda1e516a3976a94d05ab5e120bb232ef8caa3). The listing observations below are a snapshot, not a guarantee about future indexing.

## What was observed

| Surface | Result |
| --- | --- |
| GitHub repository | Read-only GitHub API lookups by both the former and current slugs resolved to `grewety/ai-coding-agent-skills`, the same public repository ID (`1412009355`, node `R_kgDOVCmNiw`). |
| GitHub Pages | The former `forgegod.github.io` project landing page and well-known catalog returned HTTP 404 without redirecting. Use the [current Pages site](https://grewety.github.io/ai-coding-agent-skills/). Task 5.2 verified that distribution on the [canonical-route deployment](https://github.com/grewety/ai-coding-agent-skills/actions/runs/44902585598). |
| skills.sh | Both `forgegod/ai-coding-agent-skills` and `grewety/ai-coding-agent-skills` returned HTTP 404 at the repository route. All five skill detail routes under each slug returned HTTP 200 with an unavailable-page body, not a listing. The [provider FAQ](https://www.skills.sh/docs/faq) describes automatic indexing through telemetry from genuine installations. No installation or telemetry event was generated for this audit. |
| SkillsLLM | The [public repository-name search](https://skillsllm.com/?q=ai-coding-agent-skills) returned zero results. The [provider's About page](https://skillsllm.com/about) states a 100-star minimum; GitHub reported zero stars. The [submission page](https://skillsllm.com/submit) requires GitHub sign-in. No sign-in or submission was attempted; nested-collection acceptance, exceptions to eligibility, and private moderation status were not verified. |

**Confirmed external listing changes:** none. **Outstanding:** any future indexing or operator submission is separate from this audit and does not block the GitHub or Pages cutover. No submission is represented as queued or approved.

## Classified source inventory

At the audited revision, a case-insensitive literal search for `forgegod` in tracked text counted 13 matching product lines and 130 matching archive lines. Counts are per line, not per occurrence. The archived tree was unchanged from the pre-transfer baseline.

| Classification | Count | Locations at the audited revision and disposition |
| --- | ---: | --- |
| Exact legacy migration | 3 | `README.md:189`, `scripts/hermes-skill-provenance.mjs:7`, `tests/local-profile-installation.test.mjs:551`. Preserve the opt-in local migration identifier, documentation and fixture. This does not require the old Pages endpoint to be live. |
| Negative assertions for generated output | 3 | `tests/claude-packaging.test.mjs:100,145`, `tests/well-known-skills.test.mjs:29`. Preserve checks that reject old-owner URLs in generated output. |
| Personal attribution | 4 | `.claude-plugin/marketplace.json:4`, `skills/software-development/openspec-delivery/SKILL.md:5`, `skills/software-development/openspec-next/SKILL.md:5`, `tests/claude-packaging.test.mjs:31`. Preserve the names and matching assertion. |
| Copyright | 1 | `LICENSE:3`. Preserve. |
| AI Software Blueprint attribution | 1 | `README.md:792`. Preserve the link to the separate upstream repository. |
| Former external listing reference | 1 | `README.md:672`. The transfer audit replaces the dead directory link with the dated status above, not with an unverified new URL. |
| Historical archive | 130 | `openspec/changes/archive/`. Preserve historical URLs as originally recorded. |

No remaining reference in the audited product tree served as an active canonical GitHub URL, Pages URL, or installer default for the transferred collection.
