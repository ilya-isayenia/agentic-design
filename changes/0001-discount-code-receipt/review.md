# Review 0001-discount-code-receipt

## Round 1

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

Design score: 7.2/10.

### Fixes (round 1)

- #1: visual tests seed the discounted signup (arden-north, Home club, 2 years, TEST-10) on steps 3–5 and success in all six themes at 375 and 1280 (16d8d69, baselines f81c389); `evidence.json` routes carry the same signup session and `shots/after/` was re-taken from the record, 286 shots (e790a16).
- #2: ReceiptLine (48c541f) and the Receipt `aside` (e5cca4a) set `text-text`; contracts updated; no baseline moved.
- #3: DiscountApplied `Narrow` story and Matrix row (1e6387c).
- `pnpm check` green after the fixes (refiner).

Notes: the a11y auditor found no critical or required issue; keyboard path and focus after Remove checked. The e2e for criterion 11 (Remove after a rejected code) is written at integrate.

## Round 2

| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | design-reviewer | required | 85 | `components-discountcode--matrix` (applying cell, all six themes); `packages/ui/src/components/TextField/TextField.vue:59` | While applying, Apply widens (~85 → ~110 px with the spinner) and drops under the field in a ~283 px column; the pressed control and the referral field below move ~56 px. The app receipt row at 375 px is ~291 px, so the same jump is likely on phones (inferred; no app shot of the applying state). Refine Q1 (a) accepted this wrap; the reviewer rates it required against spec behaviour 2 and the loading row ("only the button changes") | keep Apply's width while it loads inside DiscountCode or TextField without changing Button for everyone (reviewer suggests `basis-1/2`); re-shoot the DiscountCode Matrix; add an applying shot or visual case at 375 | fixed: 122d4cd, 82ff865 |
| 10 | design-reviewer | optional | 85 | `components-discountapplied--narrow`, `packages/ui/src/components/DiscountApplied/DiscountApplied.vue:20` | When Remove wraps under the note, its label starts ~26 px right of the note's left edge (ghost padding; same cause as #4, now on the left) | with #4, cancel the ghost padding on both sides with a negative horizontal margin from the spacing scale | open |
| 11 | a11y-auditor | optional | 80 | `packages/ui/src/components/DiscountCode/DiscountCode.vue:44-48` | A second empty submit in a row is probably not announced: `live` is cleared and refilled within one task, so the browser sees no change. SC 4.1.3 is still met (message stays in the status region and the field's description) | refill after a real task gap (`setTimeout`, cleared on unmount), or drop the repeat-announcement comment | open |

Design score: 8.1/10.

### Fixes (round 2)

- #9: DiscountCode puts a hidden loading copy of Apply (`invisible`, `aria-hidden`, `inert`) in Apply's grid cell, so Apply is 111 px idle and applying; TextField's input share goes from `basis-3/5` to `basis-5/9`. Measured: app at 375 row 291 / input 172 / Apply 111, on the row idle and applying; Matrix at 1280 284/165/111 on the row; app at 320 Apply under the field both idle and applying (criterion 21 kept). New visual case `step-3-duration-applying` (pulse-dark 375) asserts Apply's box does not move on press; it fails on the old code. Contracts updated; baselines in 82ff865; after-shots re-taken. Cost: idle Apply is wider and the input at 375 is 172 px instead of 196; the hidden copy goes when Button keeps its width while loading (follow-up).
- `pnpm check` green after the fix (refiner).

Notes: round 1 #1, #2 and #3 confirmed fixed (design-reviewer opened 8 route shots and the light single-story receipt shots; code-reviewer checked the Narrow story and Matrix row against the contract). Code reviewer: no findings. The a11y auditor found no critical or required issue. Criterion 11's second e2e (Remove after a rejected code) is still for integrate.

## Round 3

No findings at confidence ≥ 80 from any reviewer.

Design score: 8.2/10.

Notes: #9 confirmed fixed — in the 1280 Matrix (six themes) and app step 3 at 375 Apply is ~111 px idle and applying and stays on the field's row. The design reviewer judges the wider idle Apply acceptable (a fixed-width inline action; TEST-EXPIRED fits the narrower input); it differs from TextField's content-sized WithAction example until the Button follow-up. The a11y auditor confirmed the hidden copy is out of the tree and tab order, with no duplicate name, id or busy state, the wrap at 320 px and 200 % text, and forced colours. The code reviewer confirmed `basis-5/9` needs no arbitrary value, the applying visual case is deterministic and no check was weakened. Optional findings #4–#8, #10, #11 stay open.
