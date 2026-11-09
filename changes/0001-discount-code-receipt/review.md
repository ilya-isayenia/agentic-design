# Review 0001-discount-code-receipt

## Round 1

| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | design-reviewer | required | 95 | `shots/after/app_*` | The route shots have no signup state seeded: duration lands on step 1, details shows an empty receipt, success lands on "Find your club". No route shot shows the discount; the app evidence is only 4 of 12 brand × mode × width baselines, and the success page has none | seed the signup state (arden-north, Home club, 2 years, TEST-10) before each route and re-shoot all routes in 6 themes × 375/1280 | open |
| 2 | design-reviewer | required | 90 | `packages/ui/src/components/Receipt/Receipt.vue:47`, `packages/ui/src/components/ReceiptLine/ReceiptLine.vue:48` | In light-mode single-story shots the receipt's inherited text renders near-white on a light surface (club name, line labels, amounts, total); Matrix and app baselines are fine. Receipt and ReceiptLine set no text role | `text-text` on the Receipt `aside` and the ReceiptLine root; re-shoot in the light themes | open |
| 3 | code-reviewer | required | 90 | `packages/ui/src/components/DiscountApplied/DiscountApplied.contract.md:29` | The contract's `narrow` state (Remove wraps under the note) has no story and no Matrix row | add a `Narrow` story and a Matrix row in a narrow container, or drop the row if the width cannot occur | open |
| 4 | design-reviewer | optional | 85 | `packages/ui/src/components/DiscountApplied/DiscountApplied.vue:20` | "Remove" ends ~26 px left of the amounts' right edge (ghost button padding) | negative right margin from the spacing scale equal to the ghost padding | open |
| 5 | design-reviewer | optional | 80 | Discount line, `components-receipt--with-discount` | The Discount line has ~43 px under its text to the divider against ~29 px on its siblings | `items-start` on the row and `-my-3` on Remove, keep `min-h-12` | open |
| 6 | code-reviewer | optional | 85 | `apps/web/src/components/SignupReceipt.vue:46` | `watch(codeText)` calls `cancelCheck()`, which writes `codeStatus`, also written by `apply()` | handle the user's edit as an `@update:model-value` event | open |
| 7 | code-reviewer | optional | 85 | `packages/ui/src/components/DiscountCode/DiscountCode.vue:28` | `watch(model)` writes `emptyError`, also written by `submit()` | clear `emptyError` in an input handler | open |
| 8 | a11y-auditor | optional | 90 | `apps/web/src/components/SignupReceipt.vue:88` | The polite status keeps its last sentence; after a plan change it still names an older first payment (€20 while the total shows €78.50) | clear `announcement` at the top of the duration watcher | open |

Design score: 7.2/10.

Notes: the a11y auditor found no critical or required issue; keyboard path and focus after Remove checked. The e2e for criterion 11 (Remove after a rejected code) is written at integrate.
