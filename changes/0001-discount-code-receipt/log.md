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
- 2026-11-09 decision (prototype): variant B, applied state on the discount line, Remove on that line — the code shows once, the total does not move at 375 px, Receipt.vue needs no new slot by: agent
- 2026-11-09 chosen: explorations-0001-discount-code-receipt-b--matrix (states: -b--default, -b--applying, -b--applied, -b--kept-on-error, -b--invalid)
- 2026-11-09 decision (prototype): Q1 add an inline-action slot to TextField, with its contract, stories and Matrix; write scope widens to packages/ui/src/components/TextField/ — one field markup to maintain beats two by: agent
- 2026-11-09 decision (prototype): Q2 keep the spec wording "{code} applied", not "Applied:" — screen and announcement match the spec by: agent
- 2026-11-09 decision (prototype): Q3 no separate change — main 2c15b5e sets the Storybook theme before first render and shoots Matrix stories once; merged into this branch, the race workaround in explorations can go by: agent
- 2026-11-09 spec: start (round 3, fold in variant B and the TextField slot)
- 2026-11-09 spec: variant B and TextField action slot folded in — new DiscountApplied in a ReceiptLine `below` slot, line label "Discount" (assumption), TextField/** and DiscountApplied/** in scope; no questions
- 2026-11-09 refine: start (from explorations-0001-discount-code-receipt-b--matrix)
- 2026-11-09 refine: built (d0655a1, baselines 18c4e6d), pnpm check green per refiner; 2 questions
- 2026-11-09 waiting (refine): Q1 Apply wraps under the field at 375 px while loading (Button grows 87→111 px) — (a) keep basis-3/5, (b) basis-7/12 and drop "wraps at 320 px" from criterion 21, (c) widen scope to Button/** so loading keeps its width; Q2 confirm: Remove during a kept error keeps the error but drops "{applied} is still in your total."
- 2026-11-09 decision (refine): Q1 (a) keep basis-3/5; Apply may wrap under the field at 375 px while loading — the 600 ms shift leaves focus on Apply and nothing is lost by: agent
- 2026-11-09 follow-up: Button changes width while loading, which moves every loading Button; its own ds change after this one (one request, one change) by: agent
- 2026-11-09 decision (refine): Q2 Remove during a kept error keeps the error and drops "{applied} is still in your total." — after Remove that sentence is false by: agent
- 2026-11-09 spec: start (round 4, fold in Q2)
- 2026-11-09 spec: Q2 folded into step 9, criterion 11 (new e2e "removing the code after a rejected one drops the kept sentence") and the kept row; no questions
- 2026-11-09 refine: after-shots taken (274 in shots/after/)
- 2026-11-09 validate: start (round 1)
- 2026-11-09 validate: round 1 — 3 required (route shots without state, light-mode receipt text, DiscountApplied narrow story), 5 optional; design 7.2/10
- 2026-11-09 decision (validate): resume fix round 1 instead of rerunning validate — the fix subagent stopped mid-work when the print-mode session ended (48c541f, 1e6387c, 16d8d69, baselines f81c389 are on the branch); main is merged with shots seeding sessionStorage, so the refiner puts the signup session into evidence.json routes and re-takes after-shots by: agent
- 2026-11-09 validate: start (fix round 1, resumed)
- 2026-11-09 validate: fix round 1 done — #1 evidence routes seed the signup and after-shots re-taken (e790a16), #2 Receipt aside text colour (e5cca4a); #3 and the #1 baselines were already in 1e6387c, 16d8d69, f81c389; pnpm check green per refiner; 1 question on spec scope
- 2026-11-09 decision (validate): Receipt.vue joins the spec's paths to touch — required finding r1 #2 names that file, and the fix is one class by: agent
