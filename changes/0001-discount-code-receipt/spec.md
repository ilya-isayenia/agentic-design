# Discount code in the receipt (0001-discount-code-receipt)

## Summary
Once a plan has a price, the receipt shows an optional "Discount code" field with an Apply button. A valid code adds a discount line to the receipt and lowers the first payment. The same lower amount shows on the success page. Unknown, expired and ineligible codes, and a failed check, each show a message that says what to do next. Today the receipt has no way to apply a discount. This change adds one without changing the existing half-price promo.

## Size and type
Size: L. It adds a new component (DiscountCode), new mock data and pricing rules, and a new flow inside the receipt. Type: feature.

## User-facing behaviour

The receipt sits beside the steps at 1280 px (from `lg`, sticky). At 375 px it comes after the step content. The behaviour is the same at both widths; only the position differs.

1. Before a duration is chosen, the receipt looks as it does today: empty, club only, or "from" price. It has no discount field. Assumption: the field appears only when the receipt has a total, because a code without a price has nothing to act on.
2. Once a duration is chosen, the receipt footer shows "Discount code (optional)" with a hint, a text field and an "Apply" button. The existing referral code field stays below it.
3. The user types a code and presses Apply, or presses Enter in the field. A trimmed empty field shows "Enter a code to apply it." and no check runs.
4. While the code is checked, Apply shows its spinner and the field keeps its text. Pressing Apply again does nothing.
5. **Valid code.** The field and Apply are replaced by an applied row: a check icon, the code and a summary ("10% off your first 4 weeks"), plus a "Remove" button. A new receipt line "Discount TEST-10" shows the deduction ("−€2"). The total drops (Home club, 2 years, regular: €22 becomes €20). Screen readers hear "TEST-10 applied. Your first payment is now €20." Focus moves to Remove.
6. **Unknown, expired or ineligible code.** The field stays, shows the message under it with the alert icon, and the total does not change. The message is announced. Focus stays on Apply.
7. **Check failed (network).** As in step 6, with the retry message. The code stays in the field, so pressing Apply again retries.
8. **Remove.** The discount line goes away and the total goes back up. The empty field returns with focus in it. Screen readers hear "Code removed. Your first payment is now €22."
9. **Plan changed after a code is applied.** The code is checked again, locally and with no loading state, against the new plan.
   - If it still applies, the discount line and total update.
   - If it does not, the discount line goes away, the field comes back with the code still in it, and the "no longer applies" message shows and is announced.
   - Assumption: the code is not applied again by itself when the user switches back. Pressing Apply again applies it.
10. Reloading the page keeps an applied code, in sessionStorage with the rest of the signup. On the success page, "First payment" shows the discounted amount.

Copy (new strings; `{code}` is the code as typed, normalised to capitals):

| Place | Text |
| --- | --- |
| Field label | "Discount code (optional)" |
| Field hint | "We take it off your first 4 weeks." |
| Apply button | "Apply" |
| Empty submit | "Enter a code to apply it." |
| Applied row | "{code}" and summary, e.g. "10% off your first 4 weeks" / "20% off your first 4 weeks on Flex" |
| Remove button | visible "Remove"; accessible name "Remove code {code}" |
| Receipt line label | "Discount {code}" |
| Unknown code | "We don't recognise this code. Check the spelling and try again." |
| Expired code | "This code has expired. Try another code." |
| Not eligible | "{code} works on Flex plans only. Choose Flex or try another code." |
| No longer applies | "{code} works on Flex plans only, so it's no longer in your total. Choose Flex and apply it again." |
| Check failed | "We couldn't check the code. Check your connection and try again." |
| Announcement, applied | "{code} applied. Your first payment is now {total}." |
| Announcement, removed | "Code removed. Your first payment is now {total}." |

"Flex plans" stands for the code's allowed durations, built from the duration titles ("2-year and 1-year plans" when it allows two of them).

## Acceptance criteria
1. With no duration chosen, the receipt has no discount field. Once a duration is chosen, the field is labelled "Discount code (optional)" and Apply sits next to it. → e2e `discount-code.spec.ts: the field appears once the plan has a price`
2. On Home club, 2 years, regular, applying `TEST-10` adds the line "Discount TEST-10" with −€2 and changes the total from €22 to €20. The struck-through total stays €69. → e2e `discount-code.spec.ts: a valid code lowers the total`; unit `apps/web/src/lib/discount.test.ts`, `apps/web/src/lib/pricing.test.ts`
3. ` test-10 ` (lower case, surrounding spaces) applies as `TEST-10`. → unit `discount.test.ts`
4. On Home club, flex, `TEST-FLEX20` takes the 4-week price from €59.50 to €47.50 and the first payment from €84.50 to €72.50. On a 2-year plan it shows the "not eligible" message and the total does not change. → unit `discount.test.ts`; story `components-discountcode--not-eligible`
5. An unknown code shows its message under the field. The input has `aria-invalid="true"` and is described by the message. The total does not change. → story `components-discountcode--invalid`; e2e `discount-code.spec.ts: an unknown code shows the message`
6. `TEST-EXPIRED` shows the expired message, with the same field wiring as criterion 5. → unit `discount.test.ts`; story `components-discountcode--expired`
7. Apply with an empty or blank field shows "Enter a code to apply it." and emits no `apply` event. → story `components-discountcode--empty-submit`; unit `packages/ui/src/components/DiscountCode/DiscountCode.test.ts`
8. While a check runs, Apply has `aria-busy="true"` and stays focused, and a second press emits nothing. → story `components-discountcode--applying`
9. With `?mock=code-error`, Apply shows the retry message and the code stays in the field. Pressing Apply again sends the same code. → story `components-discountcode--network-error`; unit `apps/web/src/lib/api.test.ts`; e2e `discount-code.spec.ts: a failed check offers a retry`
10. After a code is applied, focus is on Remove and the polite status region contains "TEST-10 applied. Your first payment is now €20." → story `components-discountcode--applied`; e2e `discount-code.spec.ts: a valid code lowers the total`
11. Remove brings the total back, puts focus in the empty input and announces "Code removed. Your first payment is now €22." → story `components-discountcode--applied` (play: remove); e2e `discount-code.spec.ts: removing the code restores the total`
12. Changing the duration from flex to 2 years with `TEST-FLEX20` applied removes the discount line, restores the total, keeps the code in the field and shows and announces the "no longer applies" message. → unit `discount.test.ts`; story `components-discountcode--no-longer-applies`; e2e `discount-code.spec.ts: a plan change drops a code that no longer applies`
13. Pressing Enter in the field applies, the same as Apply. Tab order is field → Apply in the idle state and Remove only in the applied state. → story `components-discountcode--keyboard`
14. An applied code survives a reload. The success page shows the discounted first payment (€20 for criterion 2's plan). → e2e `discount-code.spec.ts: the discount reaches the success page`
15. A ReceiptLine with a negative amount shows "−€2" (minus sign U+2212) and screen readers read "€2 off". → story `components-receiptline--deduction`; unit `packages/ui/src/components/ReceiptLine/ReceiptLine.test.ts`
16. DiscountCode, ReceiptLine and Receipt Matrix stories pass axe in all 6 themes. Success and danger messages always carry an icon and words. → story `components-discountcode--matrix`, `components-receiptline--matrix`, `components-receipt--matrix`
17. The duration step with an applied code renders at 1280 px and 375 px without overflow. → visual `tests/visual/app.spec.ts: step-3-duration-discount`

## States
| State | Trigger | Feedback (what the user sees and hears) | Safe next action |
| --- | --- | --- | --- |
| loading | Apply pressed with a non-empty code; the fake check takes 600 ms (3 s with `?mock=slow`) | Apply shows the spinner with `aria-busy="true"`. The field keeps its text. Nothing is announced until the result. | wait; editing the field throws away the pending result and returns to idle |
| empty | Apply pressed with an empty or blank field | "Enter a code to apply it." under the field with the alert icon, announced politely; no check runs | type a code |
| error | the check fails (`?mock=code-error`) | "We couldn't check the code. Check your connection and try again." under the field with the alert icon, announced politely; code kept; total unchanged | press Apply again |
| partial | not applicable. A code is checked as a whole: one answer, applied in full or not at all. Nothing loads in parts. | — | — |
| success | a known, current code that covers the chosen plan | applied row (check icon, code, summary, Remove), the line "Discount {code}" with the deduction, the lower total; "{code} applied. Your first payment is now {total}." announced politely; focus on Remove | continue the steps, or Remove |
| permission | not applicable. The product has no accounts or roles (spec §7), so every visitor may enter a code. Codes limited to some plans are covered by "not eligible". | — | — |
| idle | a duration is chosen and no code is applied | label, hint, empty field, Apply | type a code, or ignore the field |
| no plan yet | no duration chosen | no field; the receipt shows its existing empty, club-only or "from" state (unchanged, `components-receipt--empty`, `components-receipt--club-only`) | choose a plan in the step |
| invalid | the code is not in the list | "We don't recognise this code. Check the spelling and try again." with the alert icon, `aria-invalid`, announced politely; total unchanged | fix the code and Apply again |
| expired | the code's end date has passed | "This code has expired. Try another code." with the alert icon, announced politely; total unchanged | try another code |
| not eligible | the code is current but does not cover the chosen duration | "{code} works on {durations} plans only. Choose {durations} or try another code." with the alert icon, announced politely; total unchanged | change the duration in step 3 or try another code |
| no longer applies | an applied code stops covering the plan after a step change | discount line removed, total restored, field back with the code in it, the "no longer applies" message announced politely | change the duration back and Apply, or leave it |
| removed | Remove pressed | discount line gone, total restored, empty field, focus in the field, "Code removed. Your first payment is now {total}." announced politely | type another code or continue |

## Component API

### DiscountCode (new)
A field for one discount code with Apply, and an applied row with Remove. It handles layout, focus and announcements only. The app decides whether a code is valid and passes in the result.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | the text in the field |
| `status` | `'idle' \| 'applying' \| 'applied'` | `'idle'` | `applying` sets Apply to loading; `applied` shows the applied row instead of the field |
| `error` | `string` | — | message under the field; passed to TextField `error` (icon, `aria-invalid`, `aria-describedby`); only in `idle` |
| `appliedCode` | `string` | — | required when `status="applied"` |
| `appliedSummary` | `string` | — | e.g. "10% off your first 4 weeks" |
| `announcement` | `string` | `''` | text of the polite status region; the app sets it after each result, including errors |
| `label` | `string` | `'Discount code (optional)'` | |
| `hint` | `string` | — | |

| Slot | Content |
| --- | --- |
| none | |

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `string` | each input |
| `apply` | `code: string` (trimmed, upper-cased) | Apply or Enter with a non-blank value while not `applying` |
| `remove` | — | Remove activated |

| Exposed | |
| --- | --- |
| `focus()` | focuses the input |

v-model: `modelValue` (the field text).
Tokens: `success` (applied icon and code), `danger` via TextField, `text`, `text-muted`, `border-strong` via TextField; `font-text`, `text-body`, `text-small`, `font-semibold`, `tabular` for amounts in the summary; spacing 1–4; motion `duration-fast`, `ease-standard` only through Button and TextField. Reuses TextField, Button (Apply `secondary` md, Remove `ghost` md) and Icon (`check-circle`, `alert`).
Assumption: Apply is `secondary`, because the step's Continue is the one primary action on screen.
Assumption: the root is a `<form novalidate>` so Enter applies, and the contract says never to nest it in another form. The receipt sits outside `<main>` and its forms.
Stories: `Idle`, `EmptySubmit`, `Applying`, `Applied`, `Invalid`, `Expired`, `NotEligible`, `NoLongerApplies`, `NetworkError`, `Keyboard`, `Matrix`. There is one story per state row except "no plan yet" (Receipt's existing stories prove it), "removed" (the `Applied` play removes the code) and the two "not applicable" rows.

### ReceiptLine (changed)
| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `amount` | `number` | — | may now be negative: a deduction. It shows "−" (U+2212) and the absolute value, `sr-only` "€2 off", and is never struck through |

Slots and events unchanged. Tokens unchanged.
Stories: new `Deduction`; `Matrix` gains the deduction state.
Assumption: a deduction is a negative amount on the existing line, not a new variant. It changes no colour or size, so P2 does not call for a variant.

### Receipt (changed: contract and stories only)
The contract's "Do leave the discount code out" line becomes "the discount code goes in `footer`, above the referral field; its line goes in the default slot". The "no live region for the total" decision stays: the new total is announced by DiscountCode, where the action happens, so it is not read twice.
Stories: new `WithDiscount` (discount line plus DiscountCode applied in the footer); `Matrix` gains it.

## Accessibility
- Names and roles:
  - The input is named by its visible label "Discount code (optional)" and described by the hint, then the error.
  - Apply is a native `button type="submit"` named "Apply".
  - Remove is named "Remove code {code}", with the visible "Remove" at the start of the name (SC 2.5.3).
  - The applied row is a paragraph: the icon is decorative, and the words "{code} applied" plus the summary carry the meaning.
  - The receipt stays the named `aside`.
- Keyboard:
  - In idle, Tab goes field → Apply → referral field. Enter in the field applies.
  - While applying, Apply keeps focus (`aria-disabled`, as Button's loading does).
  - On applied, focus moves from Apply, which is removed, to Remove, so it never drops to `body`.
  - On Remove, focus moves to the input.
  - On an error, focus stays where it was (Apply or the input).
  - On "no longer applies", focus is in the step and stays there.
- Announcements:
  - One polite `role="status"` region inside DiscountCode, mounted from the first render. Its text is `announcement`, plus the component's own empty-submit message.
  - No `role="alert"`: the code is optional, so nothing blocks the user.
  - The field error itself is not live (TextField's rule), so each result is heard once.
- Other:
  - Applied uses `success` with the check icon and words, and errors use `danger` with the alert icon and words. Colour is never the only signal (C6, SC 1.4.1).
  - Apply and Remove are md (48 px).
  - No new motion. The spinner follows the global reduced-motion rule.
  - At 320 px the field and Apply wrap rather than overflow (SC 1.4.10).

## Data
New `apps/web/src/data/discounts.ts` (codes are visibly fake; dates are fixed so the visual tests and stories are stable):

| Code | Off | Durations | Ends |
| --- | --- | --- | --- |
| `TEST-10` | 10% | all | none |
| `TEST-FLEX20` | 20% | `flex` | none |
| `TEST-EXPIRED` | 10% | all | 2020-01-01 |

Assumption, pending questions 1–4: shape `{ code, off, durations, endsAt?, summary }`.

Rules (new section "Discount code" in `docs/product/pricing.md`, after question 1–4 answers):
- One code at a time.
- The percentage comes off the first 4-week price after the promo. The result is rounded to the nearest €0.50, like every other price here. The discount is the difference.
- The starter package and later periods are untouched.
- First payment = discounted first 4-week price + starter package.
- The struck-through total keeps its definition: no promo, starter charged, no discount.
- Codes are trimmed and upper-cased before the check.
- Examples:
  - Home club, 2 years, `TEST-10`: €22 → €20, first payment €20.
  - Home club, flex, `TEST-FLEX20`: €59.50 → €47.50, first payment €72.50.
  - Home club, flex, `TEST-10`: €59.50 → €53.50, first payment €78.50.

Code changes:
- `apps/web/src/lib/discount.ts`: `normaliseCode`, `checkCode(code, duration, now)` returning `applied | unknown | expired | not-eligible`, and `discountedPrice`.
- `apps/web/src/lib/api.ts`: `checkDiscountCode(code, duration, signal)` with a 600 ms delay (3 s with `slow`). It throws with the new mock flag `code-error`.
- `useSignup`: new state `discountCode: string` (the applied code, `''` if none), kept in sessionStorage. `total` and a new `discount` computed apply it, so the receipt and the success page both read it.
- A plan change re-runs `checkCode` locally. Assumption: no request, because the code's rules came with the first answer.

How to trigger each state (new rows in `docs/product/mock-data.md`):

| Want to see | Do |
| --- | --- |
| applied | `TEST-10` on any plan |
| not eligible / no longer applies | `TEST-FLEX20` on a 2-year or 1-year plan, or apply it on flex and switch to 2 years |
| expired | `TEST-EXPIRED` |
| unknown | any other code, e.g. `NOPE` |
| slow check | `?mock=slow` |
| check fails | `?mock=code-error` |

## Paths to touch
packages/ui/src/components/DiscountCode/**
packages/ui/src/components/ReceiptLine/**
packages/ui/src/components/Receipt/Receipt.contract.md
packages/ui/src/components/Receipt/Receipt.stories.ts
packages/ui/src/index.ts
docs/ds/components.md
apps/web/src/data/discounts.ts
apps/web/src/lib/discount.ts
apps/web/src/lib/discount.test.ts
apps/web/src/lib/pricing.ts
apps/web/src/lib/pricing.test.ts
apps/web/src/lib/api.ts
apps/web/src/lib/api.test.ts
apps/web/src/composables/useSignup.ts
apps/web/src/components/SignupReceipt.vue
docs/product/pricing.md
docs/product/copy.md
docs/product/mock-data.md
tests/e2e/discount-code.spec.ts
tests/visual/app.spec.ts

Baselines for the Receipt, ReceiptLine and DiscountCode matrices and for app steps 3–5 change only through `pnpm test:visual:update`, in a separate `baselines:` commit.

## Out of scope
- More than one code at a time, or stacking with the referral code. The referral field is untouched and has no price effect.
- Fixed-amount (euro) codes and codes on later 4-week periods. Only a percentage on the first 4 weeks.
- Showing the code or the discount line on the success page; only its "First payment" amount changes.
- A real code service, rate limiting or lockout after wrong tries.
- Changes to the half-price promo, the Banner or the "from" prices on the access level step.
- New tokens or icons.

## Open questions
1. What does a code take off? Options: a percentage of the first 4-week price after promo (my pick) | a percentage of the whole first payment, starter included | a fixed euro amount | every 4-week period for N months.
2. Does a code combine with the half-price promo on 1- and 2-year plans? Options: yes, on top of the promo price (my pick) | only on flex | the better of the two wins.
3. Can two codes stack? Options: one code at a time, and the user removes it to try another (my pick) | a new code replaces the old one automatically | codes stack.
4. Are codes limited to some plans or membership types, and are the test codes right? My pick: `TEST-10` 10% on all plans, `TEST-FLEX20` 20% on flex only, `TEST-EXPIRED` ended 2020-01-01. Options: keep these | name your own codes and limits.
5. Can a member use a discount code and a referral code together? Options: yes, they are independent (my pick) | no, one or the other.
