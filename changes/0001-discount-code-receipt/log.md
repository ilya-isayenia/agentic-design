# Log 0001-discount-code-receipt

Stage lines: `- <YYYY-MM-DD> <stage>: <start | outcome>`.
Decision lines: `- <YYYY-MM-DD> decision (<stage>): <what was decided> — <why> by: <human | agent>`.


- 2026-11-09 spec: start
- 2026-11-09 spec: spec.md written — size L, type feature, 5 questions on discount rules
- 2026-11-09 waiting (spec): what a code takes off; combining with the half-price promo; stacking codes; plan limits and test codes; combining with a referral code; then spec approval
- 2026-11-09 decision (spec): Q1 a code takes a percentage off the first 4-week price after the promo — simplest rule a member can check against the receipt by: agent
- 2026-11-09 decision (spec): Q2 a code applies on top of the half-price promo price — the promo is per plan, the code is per person by: agent
- 2026-11-09 decision (spec): Q3 one code at a time; applying a new code replaces the old one automatically — docs/spec.md walkthrough B says exactly this by: agent
- 2026-11-09 decision (spec): Q4 keep TEST-10 (10%, all plans), TEST-FLEX20 (20%, flex only), TEST-EXPIRED (ended 2020-01-01) — visibly fake, cover valid, plan-limited and expired by: agent
- 2026-11-09 decision (spec): Q5 a discount code and a referral code are independent — the referral is checked after signup and does not change the price by: agent
- 2026-11-09 spec: start (round 2, with answers)
- 2026-11-09 spec: answers folded in — replace-on-new-code, kept-on-rejected-code (assumption), referral independent; no questions
- 2026-11-09 decision (spec): spec accepted with the five answers — acceptance given together with the answers by: agent
- 2026-11-09 prototype: start (round 1)
- 2026-11-09 prototype: round 1 — 3 variants (A applied row in footer; B applied state on the discount line; C field inside the receipt above the total); light-mode text race fixed in explorations; shots in shots/round-1/
- 2026-11-09 waiting (prototype): variant choice for round 1; questions: TextField row slot vs own field markup; C needs a Receipt.vue slot and "Applied:" copy; Storybook light-mode colour race in production stories as a separate change
