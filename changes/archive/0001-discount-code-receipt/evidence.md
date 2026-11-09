# Evidence — 0001-discount-code-receipt

> add a discount code field to the receipt

| | |
| --- | --- |
| Type / size | feature / L |
| Branch | `change/0001-discount-code-receipt` |
| Decisions | 0 by human, 15 by agent |
| Review | 11 finding(s), 0 open critical/required; Design score: 8.2 |
| Checks | 9/9 green at `a0922e9` |

## Evidence status

- [x] complete

## What it delivers

Members who have chosen a plan can apply one discount code in the receipt, see its deduction, note and Remove on a "Discount" line above a lower first payment, and carry that payment to the success page.

## Acceptance criteria

1. With no duration chosen, the receipt has no discount field. Once a duration is chosen, the field is labelled "Discount code (optional)" and Apply sits next to it. → e2e `discount-code.spec.ts: the field appears once the plan has a price`
2. On Home club, 2 years, regular, applying `TEST-10` adds the line "Discount" with −€2 and the note "TEST-10 applied" above the total, and changes the total from €22 to €20. The struck-through total stays €69. → e2e `discount-code.spec.ts: a valid code lowers the total`; unit `apps/web/src/lib/discount.test.ts`, `apps/web/src/lib/pricing.test.ts`
3. ` test-10 ` (lower case, surrounding spaces) applies as `TEST-10`. → unit `discount.test.ts`
4. On Home club, flex, `TEST-FLEX20` takes the 4-week price from €59.50 to €47.50 and the first payment from €84.50 to €72.50. On a 2-year plan it shows the "not eligible" message and the total does not change. → unit `discount.test.ts`; story `components-discountcode--not-eligible`
5. An unknown code shows its message under the field. The input has `aria-invalid="true"` and is described by the message. The total does not change. → story `components-discountcode--invalid`; e2e `discount-code.spec.ts: an unknown code shows the message`
6. `TEST-EXPIRED` shows the expired message, with the same field wiring as criterion 5. → unit `discount.test.ts`; story `components-discountcode--expired`
7. Apply with an empty or blank field shows "Enter a code to apply it." and emits no `apply` event. → story `components-discountcode--empty-submit`; unit `packages/ui/src/components/DiscountCode/DiscountCode.test.ts`
8. While a check runs, Apply has `aria-busy="true"` and stays focused, and a second press emits nothing. → story `components-discountcode--applying`
9. With `?mock=code-error`, Apply shows the retry message and the code stays in the field. Pressing Apply again sends the same code. → story `components-discountcode--network-error`; unit `apps/web/src/lib/api.test.ts`; e2e `discount-code.spec.ts: a failed check offers a retry`
10. After a code is applied, the discount line shows "TEST-10 applied", its summary and Remove, and the code appears nowhere else in the receipt: the footer has no applied row. The field is empty and enabled, with Apply next to it. Focus stays on Apply, and the polite status region contains "TEST-10 applied. Your first payment is now €20." → story `components-discountcode--applied`, `components-discountapplied--default`, `components-receipt--with-discount`; e2e `discount-code.spec.ts: a valid code lowers the total`
11. Remove on the discount line emits `remove`. The app then removes the line, brings the total back, puts focus in the discount code input and announces "Code removed. Your first payment is now €22." With `TEST-10` applied and `NOPE` rejected (message ending "TEST-10 is still in your total."), Remove leaves "We don't recognise this code. Check the spelling and try again." under the field, without the sentence "TEST-10 is still in your total.", and the field keeps `NOPE`. → story `components-discountapplied--default` (play: Remove emits `remove`); e2e `discount-code.spec.ts: removing the code restores the total`; e2e `discount-code.spec.ts: removing the code after a rejected one drops the kept sentence` (new)
12. On Home club, flex, with `TEST-10` applied (first payment €78.50), applying `TEST-FLEX20` leaves one discount line, with the note "TEST-FLEX20 applied" and Remove named "Remove code TEST-FLEX20". The first payment becomes €72.50, and the status region contains "TEST-FLEX20 applied instead of TEST-10. Your first payment is now €72.50." → unit `discount.test.ts` (`nextApplied`); e2e `discount-code.spec.ts: a new code replaces the applied one`
13. On Home club, 2 years, with `TEST-10` applied, applying `TEST-FLEX20`, `TEST-EXPIRED` or `NOPE`, or a check that fails, keeps `TEST-10` applied and the total at €20. The matching message shows, ending with "TEST-10 is still in your total." → unit `discount.test.ts` (`nextApplied`); story `components-discountcode--kept-on-error`; e2e `discount-code.spec.ts: a rejected new code keeps the applied one`
14. Changing the duration from flex to 2 years with `TEST-FLEX20` applied removes the discount line, with its note and Remove, and restores the total. The empty field gets the code back, and the "no longer applies" message shows and is announced. → unit `discount.test.ts`; story `components-discountcode--no-longer-applies`; e2e `discount-code.spec.ts: a plan change drops a code that no longer applies`
15. Pressing Enter in the field applies, the same as Apply. Tab order is field → Apply with no code applied, and Remove (on the discount line) → field → Apply with a code applied. → story `components-discountcode--keyboard` (Enter, field → Apply); story `components-receipt--with-discount` (play: Tab from Remove reaches the field, then Apply)
16. An applied code survives a reload. The success page shows the discounted first payment (€20 for criterion 2's plan). → e2e `discount-code.spec.ts: the discount reaches the success page`
17. A ReceiptLine with a negative amount shows "−€2" (minus sign U+2212) and screen readers read "€2 off". → story `components-receiptline--deduction`; unit `packages/ui/src/components/ReceiptLine/ReceiptLine.test.ts`
18. DiscountCode, DiscountApplied, TextField, ReceiptLine and Receipt Matrix stories pass axe in all 6 themes. Success and danger messages always carry an icon and words. → story `components-discountcode--matrix`, `components-discountapplied--matrix`, `components-textfield--matrix`, `components-receiptline--matrix`, `components-receipt--matrix`
19. The duration step with an applied code renders at 1280 px and 375 px without overflow. → visual `tests/visual/app.spec.ts: step-3-duration-discount`
20. With a discount code applied, the referral field still accepts a code, and entering one does not change the total. → e2e `discount-code.spec.ts: the referral code leaves the discounted total alone`
21. A TextField with content in its `action` slot shows that content on the input's row, after the input in DOM and tab order. The input keeps its label, its hint and error description and its `aria-invalid`. The error shows under the whole row. At 320 px the action wraps under the input instead of overflowing. → story `components-textfield--with-action`; unit `packages/ui/src/components/TextField/TextField.test.ts`
22. DiscountCode renders its input and Apply through TextField's `action` slot, with no input markup of its own. → unit `packages/ui/src/components/DiscountCode/DiscountCode.test.ts`
23. A ReceiptLine with content in its `below` slot shows that content under the label and price, even when the line has a collapsed disclosure. → story `components-receiptline--deduction`; unit `ReceiptLine.test.ts`

## States

| State | Status | Evidence |
| --- | --- | --- |
| loading | pass | story components-discountcode--applying (aria-busy, focus kept on Apply, second press and Enter emit nothing, field keeps text); unit DiscountCode.test.ts › emits nothing while applying; api.test.ts › answers after 600 ms, can be cancelled; e2e discount-code.spec.ts › a failed check offers a retry (AC 9) (aria-busy during the retry); visual tests/visual/app.spec.ts › app step-3-duration-applying pulse-dark 375 (applying held with a paused clock: Apply keeps the size and place it had before the press, on the field's row in the 291 px receipt row); unit DiscountCode.test.ts › sizes Apply with a hidden loading copy that no one can reach |
| empty | pass | story components-discountcode--empty-submit (message, aria-invalid, announced, no apply event); unit DiscountCode.test.ts › shows the empty message and emits nothing for an empty or blank field. The receipt's own no-plan-yet state: components-receipt--empty, components-receipt--club-only; e2e › the field appears once the plan has a price (AC 1) |
| error | pass | stories components-discountcode--network-error, --invalid, --expired, --not-eligible, --no-longer-applies, --kept-on-error; unit discount.test.ts (checkCode, rejectionMessage, nextApplied), api.test.ts › fails with ?mock=code-error; e2e › an unknown code shows the message (AC 5), a failed check offers a retry (AC 9), a rejected new code keeps the applied one (AC 13), removing the code after a rejected one drops the kept sentence (AC 11), a plan change drops a code that no longer applies (AC 14) |
| partial | not applicable | A code is checked as a whole: one answer, applied in full or not at all. Nothing loads in parts. |
| success | pass | stories components-discountcode--applied (field emptied, focus on Apply, announcement), components-discountapplied--default (note, Remove named "Remove code TEST-10", emits remove by click, Enter, Space), components-discountapplied--narrow (Remove wraps under the note, no overflow, Tab and Enter), components-receiptline--deduction ("−€2", read "€2 off"), components-receipt--with-discount (Tab Remove → field → Apply → referral); unit discount.test.ts, pricing.test.ts, ReceiptLine.test.ts, DiscountApplied.test.ts; e2e › a valid code lowers the total (AC 2, 10), removing the code restores the total (AC 11), removing the code after a rejected one drops the kept sentence (AC 11), a new code replaces the applied one (AC 12), the discount reaches the success page (AC 16), the referral code leaves the discounted total alone (AC 20) |
| permission | not applicable | The product has no accounts or roles (docs/spec.md §7), so every visitor may enter a code. Codes limited to some plans are covered by the not-eligible error. |

Accessibility: axe (error level) clean on every story and on the DiscountCode, DiscountApplied, TextField, ReceiptLine and Receipt Matrix stories in all 6 themes; e2e a11y.spec.ts axe on step 3 with the field in 6 themes; pnpm contrast 210/210. Keyboard: DiscountCode Keyboard story (Tab to field, Enter applies with focus kept, Tab to Apply, Space), TextField WithAction (input → action, description unchanged), Receipt WithDiscount (Remove → field → Apply → referral), DiscountApplied Default (Tab, Enter, Space); e2e focus on Apply after applying, focus into the field after Remove. Announcements: one polite role=status in DiscountCode, mounted from the first render, checked for applied, replaced, kept, error, no-longer-applies and removed in e2e; no role=alert. Success and errors always carry an icon and words.

Responsive: visual tests/visual/app.spec.ts › step-3-duration-discount, step-4-details-discount, step-5-verify-discount, success-discount (arden-north, Home club, 2 years, TEST-10 applied; success shows First payment €20) in all 6 themes at 375 and 1280; after-shots shots/after/app_* of the same four routes, seeded with that signup from routes in this record, in 6 themes at 375 and 1280; e2e › the field and Apply share a row at 375 px and wrap at 320 px without overflow (AC 19, 21) (no horizontal scroll at either width); story components-discountapplied--narrow and its Matrix row: Remove wraps under the note below 155 px, which the 236 px discount line at 320 px reaches with text at 200 %; Apply is as wide idle as applying (hidden loading copy), so both wrap at the same width: beside the field in the 291 px receipt row at 375 and the 284 px Matrix column, under it in the 236 px row at 320 (visual app step-3-duration-applying pulse-dark 375; story components-discountcode--matrix)

## Checks

- ✅ tokens (0s)
- ✅ typecheck (3s)
- ✅ lint (2s)
- ✅ unit (4s)
- ✅ storybook (7s)
- ✅ contrast (0s)
- ✅ visual (17s)
- ✅ e2e (14s)
- ✅ denylist (0s)

## Screenshots

Folders: [after/](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/after) · [round-1/](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/round-1)

![app_join_arden-north_details--lumen-dark--1280.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/after/app_join_arden-north_details--lumen-dark--1280.png?raw=true)
![app_join_arden-north_details--lumen-dark--375.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/after/app_join_arden-north_details--lumen-dark--375.png?raw=true)
![app_join_arden-north_details--pulse-dark--1280.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/after/app_join_arden-north_details--pulse-dark--1280.png?raw=true)
![app_join_arden-north_details--pulse-dark--375.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/after/app_join_arden-north_details--pulse-dark--375.png?raw=true)
![app_join_arden-north_duration--lumen-dark--1280.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/after/app_join_arden-north_duration--lumen-dark--1280.png?raw=true)
![app_join_arden-north_duration--lumen-dark--375.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/shots/after/app_join_arden-north_duration--lumen-dark--375.png?raw=true)

Stories: `components-discountcode--idle`, `components-discountcode--empty-submit`, `components-discountcode--applying`, `components-discountcode--applied`, `components-discountcode--invalid`, `components-discountcode--expired`, `components-discountcode--not-eligible`, `components-discountcode--no-longer-applies`, `components-discountcode--network-error`, `components-discountcode--kept-on-error`, `components-discountcode--keyboard`, `components-discountcode--matrix`, `components-discountapplied--default`, `components-discountapplied--narrow`, `components-discountapplied--matrix`, `components-textfield--with-action`, `components-textfield--with-action-invalid`, `components-textfield--matrix`, `components-receiptline--deduction`, `components-receiptline--matrix`, `components-receipt--with-discount`, `components-receipt--empty`, `components-receipt--club-only`, `components-receipt--matrix`

## Decisions

- 2026-11-09 decision (spec): Q1 a code takes a percentage off the first 4-week price after the promo — simplest rule a member can check against the receipt by: agent
- 2026-11-09 decision (spec): Q2 a code applies on top of the half-price promo price — the promo is per plan, the code is per person by: agent
- 2026-11-09 decision (spec): Q3 one code at a time; applying a new code replaces the old one automatically — docs/spec.md walkthrough B says exactly this by: agent
- 2026-11-09 decision (spec): Q4 keep TEST-10 (10%, all plans), TEST-FLEX20 (20%, flex only), TEST-EXPIRED (ended 2020-01-01) — visibly fake, cover valid, plan-limited and expired by: agent
- 2026-11-09 decision (spec): Q5 a discount code and a referral code are independent — the referral is checked after signup and does not change the price by: agent
- 2026-11-09 decision (spec): spec accepted with the five answers — acceptance given together with the answers by: agent
- 2026-11-09 decision (prototype): variant B, applied state on the discount line, Remove on that line — the code shows once, the total does not move at 375 px, Receipt.vue needs no new slot by: agent
- 2026-11-09 decision (prototype): Q1 add an inline-action slot to TextField, with its contract, stories and Matrix; write scope widens to packages/ui/src/components/TextField/ — one field markup to maintain beats two by: agent
- 2026-11-09 decision (prototype): Q2 keep the spec wording "{code} applied", not "Applied:" — screen and announcement match the spec by: agent
- 2026-11-09 decision (prototype): Q3 no separate change — main 2c15b5e sets the Storybook theme before first render and shoots Matrix stories once; merged into this branch, the race workaround in explorations can go by: agent
- 2026-11-09 decision (refine): Q1 (a) keep basis-3/5; Apply may wrap under the field at 375 px while loading — the 600 ms shift leaves focus on Apply and nothing is lost by: agent
- 2026-11-09 decision (refine): Q2 Remove during a kept error keeps the error and drops "{applied} is still in your total." — after Remove that sentence is false by: agent
- 2026-11-09 decision (validate): resume fix round 1 instead of rerunning validate — the fix subagent stopped mid-work when the print-mode session ended (48c541f, 1e6387c, 16d8d69, baselines f81c389 are on the branch); main is merged with shots seeding sessionStorage, so the refiner puts the signup session into evidence.json routes and re-takes after-shots by: agent
- 2026-11-09 decision (validate): Receipt.vue joins the spec's paths to touch — required finding r1 #2 names that file, and the fix is one class by: agent
- 2026-11-09 decision (validate): send #9 to fix round 2 although refine Q1 (a) accepted the wrap — that answer was an agent's, made when the in-scope options were a spec edit or a Button change; the reviewer rates the jump of the pressed control as required, and the process gives required findings to the refiner; if no fix keeps criterion 21 without touching Button, the refiner returns blocked and the question goes to the human by: agent

## Prototype rounds

- 2026-11-09 prototype: start (round 1)
- 2026-11-09 prototype: round 1 — 3 variants (A applied row in footer; B applied state on the discount line; C field inside the receipt above the total); light-mode text race fixed in explorations; shots in shots/round-1/
- 2026-11-09 waiting (prototype): variant choice for round 1; questions: TextField row slot vs own field markup; C needs a Receipt.vue slot and "Applied:" copy; Storybook light-mode colour race in production stories as a separate change
- 2026-11-09 decision (prototype): variant B, applied state on the discount line, Remove on that line — the code shows once, the total does not move at 375 px, Receipt.vue needs no new slot by: agent
- 2026-11-09 decision (prototype): Q1 add an inline-action slot to TextField, with its contract, stories and Matrix; write scope widens to packages/ui/src/components/TextField/ — one field markup to maintain beats two by: agent
- 2026-11-09 decision (prototype): Q2 keep the spec wording "{code} applied", not "Applied:" — screen and announcement match the spec by: agent
- 2026-11-09 decision (prototype): Q3 no separate change — main 2c15b5e sets the Storybook theme before first render and shoots Matrix stories once; merged into this branch, the race workaround in explorations can go by: agent

## Review findings

| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | design-reviewer | required | 95 | `shots/after/app_*` | The route shots have no signup state seeded: duration lands on step 1, details shows an empty receipt, success lands on "Find your club". No route shot shows the discount; the app evidence is only 4 of 12 brand × mode × width baselines, and the success page has none | seed the signup state (arden-north, Home club, 2 years, TEST-10) before each route and re-shoot all routes in 6 themes × 375/1280 | fixed: 16d8d69, f81c389, e790a16 |
| 2 | design-reviewer | required | 90 | `packages/ui/src/components/Receipt/Receipt.vue:47`, `packages/ui/src/components/ReceiptLine/ReceiptLine.vue:48` | In light-mode single-story shots the receipt's inherited text renders near-white on a light surface (club name, line labels, amounts, total); Matrix and app baselines are fine. Receipt and ReceiptLine set no text role | `text-text` on the Receipt `aside` and the ReceiptLine root; re-shoot in the light themes | fixed: 48c541f, e5cca4a |
| 3 | code-reviewer | required | 90 | `packages/ui/src/components/DiscountApplied/DiscountApplied.contract.md:29` | The contract's `narrow` state (Remove wraps under the note) has no story and no Matrix row | add a `Narrow` story and a Matrix row in a narrow container, or drop the row if the width cannot occur | fixed: 1e6387c |
| 4 | design-reviewer | optional | 85 | `packages/ui/src/components/DiscountApplied/DiscountApplied.vue:20` | "Remove" ends ~26 px left of the amounts' right edge (ghost button padding) | negative right margin from the spacing scale equal to the ghost padding | open |
| 5 | design-reviewer | optional | 80 | Discount line, `components-receipt--with-discount` | The Discount line has ~43 px under its text to the divider against ~29 px on its siblings | `items-start` on the row and `-my-3` on Remove, keep `min-h-12` | open |
| 6 | code-reviewer | optional | 85 | `apps/web/src/components/SignupReceipt.vue:46` | `watch(codeText)` calls `cancelCheck()`, which writes `codeStatus`, also written by `apply()` | handle the user's edit as an `@update:model-value` event | open |
| 7 | code-reviewer | optional | 85 | `packages/ui/src/components/DiscountCode/DiscountCode.vue:28` | `watch(model)` writes `emptyError`, also written by `submit()` | clear `emptyError` in an input handler | open |
| 8 | a11y-auditor | optional | 90 | `apps/web/src/components/SignupReceipt.vue:88` | The polite status keeps its last sentence; after a plan change it still names an older first payment (€20 while the total shows €78.50) | clear `announcement` at the top of the duration watcher | open |
| 9 | design-reviewer | required | 85 | `components-discountcode--matrix` (applying cell, all six themes); `packages/ui/src/components/TextField/TextField.vue:59` | While applying, Apply widens (~85 → ~110 px with the spinner) and drops under the field in a ~283 px column; the pressed control and the referral field below move ~56 px. The app receipt row at 375 px is ~291 px, so the same jump is likely on phones (inferred; no app shot of the applying state). Refine Q1 (a) accepted this wrap; the reviewer rates it required against spec behaviour 2 and the loading row ("only the button changes") | keep Apply's width while it loads inside DiscountCode or TextField without changing Button for everyone (reviewer suggests `basis-1/2`); re-shoot the DiscountCode Matrix; add an applying shot or visual case at 375 | fixed: 122d4cd, 82ff865 |
| 10 | design-reviewer | optional | 85 | `components-discountapplied--narrow`, `packages/ui/src/components/DiscountApplied/DiscountApplied.vue:20` | When Remove wraps under the note, its label starts ~26 px right of the note's left edge (ghost padding; same cause as #4, now on the left) | with #4, cancel the ghost padding on both sides with a negative horizontal margin from the spacing scale | open |
| 11 | a11y-auditor | optional | 80 | `packages/ui/src/components/DiscountCode/DiscountCode.vue:44-48` | A second empty submit in a row is probably not announced: `live` is cleared and refilled within one task, so the browser sees no change. SC 4.1.3 is still met (message stays in the status region and the field's description) | refill after a real task gap (`setTimeout`, cleared on unmount), or drop the repeat-announcement comment | open |

---
Built by `pnpm evidence 0001` from `changes/0001-discount-code-receipt`. Full record: [change.md](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/change.md), [log.md](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/log.md), [review.md](https://github.com/ilya-isayenia/agentic-design/blob/change/0001-discount-code-receipt/changes/archive/0001-discount-code-receipt/review.md).
