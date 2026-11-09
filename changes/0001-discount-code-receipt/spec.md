# Discount code in the receipt (0001-discount-code-receipt)

## Summary
Once a plan has a price, the receipt shows an optional "Discount code" field with an Apply button. A valid code adds a discount line to the receipt and lowers the first payment. That line also says which code is applied and holds its Remove button, so the code shows in one place, next to the money it changes. The same lower amount shows on the success page. One code applies at a time: a new valid code replaces the applied one, and a rejected new code leaves it in place. Unknown, expired and ineligible codes, and a failed check, each show a message that says what to do next. Today the receipt has no way to apply a discount. This change adds one on top of the existing half-price promo, without changing it or the referral code.

## Size and type
Size: L. It adds two new components (DiscountCode, DiscountApplied), an inline-action slot on TextField, new mock data and pricing rules, and a new flow inside the receipt. Type: feature.

## User-facing behaviour

The receipt sits beside the steps at 1280 px (from `lg`, sticky). At 375 px it comes after the step content. The behaviour is the same at both widths; only the position differs.

1. Before a duration is chosen, the receipt looks as it does today: empty, club only, or "from" price. It has no discount field. Assumption: the field appears only when the receipt has a total, because a code without a price has nothing to act on.
2. Once a duration is chosen, the receipt footer shows "Discount code (optional)" with a hint, a text field and an "Apply" button on the same row as the input, outside its border. The existing referral code field stays below it.
3. The user types a code and presses Apply, or presses Enter in the field. A trimmed empty field shows "Enter a code to apply it." and no check runs.
4. While the code is checked, Apply shows its spinner and the field keeps its text. Pressing Apply again does nothing. A code already applied stays applied, with its line and total, until the result arrives, and its Remove still works.
5. **Valid code.** A new receipt line "Discount" appears after the plan and starter lines, above the total, with the deduction on the right ("−€2"). Under its label the line shows a check icon, "TEST-10 applied" and the summary ("10% off your first 4 weeks"), with a "Remove" button at the right. Nothing is added to the footer: the field empties and stays usable, with Apply next to it. The total drops (Home club, 2 years, regular: €22 becomes €20). Screen readers hear "TEST-10 applied. Your first payment is now €20." Focus stays where it was: on Apply, or in the field after Enter. Nothing focused is removed. Assumption: the field empties on success, because the discount line already shows the code.
   Assumption: the line label is "Discount" without the code, because the code already shows in "{code} applied" on the same line and is shown once. The prototype labelled the line "Discount TEST-10" and wrote "Applied:"; keeping "{code} applied" moves the code out of the label. To overrule, the label becomes "Discount {code}" and the code shows twice on the line.
6. **A second valid code.** With a code applied, the user applies another code that is valid for the plan. It replaces the applied one: the discount line updates in place and names the new code in its note and in Remove, and the total is recalculated from the new code alone. Screen readers hear "TEST-FLEX20 applied instead of TEST-10. Your first payment is now €72.50." Applying the code that is already applied ends like step 5, and the total does not change.
7. **Unknown, expired or ineligible code.** The field keeps the text and shows the message under it with the alert icon. The total does not change. The message is announced. Focus stays on Apply. If a code is already applied, it stays applied and the message ends with "TEST-10 is still in your total." Assumption: a rejected new code never removes the applied one, because the user did not ask to lose it.
8. **Check failed (network).** As in step 7, with the retry message. The code stays in the field, so pressing Apply again retries. An applied code stays applied.
9. **Remove.** The user presses Remove on the discount line. The line goes away with its note and Remove, and the total goes back up. Focus moves to the discount code field in the footer, the next control after Remove in tab order. The field keeps any text the user typed there. Screen readers hear "Code removed. Your first payment is now €22."
10. **Plan changed after a code is applied.** The code is checked again, locally and with no loading state, against the new plan.
   - If it still applies, the discount line and total update.
   - If it does not, the discount line goes away, and the "no longer applies" message shows under the field and is announced. If the field is empty, the code goes back into it. Text the user typed there is kept.
   - Assumption: the code is not applied again by itself when the user switches back. Pressing Apply again applies it.
11. Reloading the page keeps an applied code, in sessionStorage with the rest of the signup. On the success page, "First payment" shows the discounted amount.
12. The referral code field works as it does today, whether or not a discount code is applied. It does not change the price.

Copy (new strings; `{code}` is the code as typed, normalised to capitals):

| Place | Text |
| --- | --- |
| Field label | "Discount code (optional)" |
| Field hint | "One code at a time. We take it off your first 4 weeks." |
| Apply button | "Apply" |
| Empty submit | "Enter a code to apply it." |
| Applied note on the discount line | "{code} applied", then the summary, e.g. "10% off your first 4 weeks" / "20% off your first 4 weeks on Flex" |
| Remove button (on the discount line) | visible "Remove"; accessible name "Remove code {code}" |
| Receipt line label | "Discount" |
| Unknown code | "We don't recognise this code. Check the spelling and try again." |
| Expired code | "This code has expired. Try another code." |
| Not eligible | "{code} works on Flex plans only. Choose Flex or try another code." |
| No longer applies | "{code} works on Flex plans only, so it's no longer in your total. Choose Flex and apply it again." |
| Check failed | "We couldn't check the code. Check your connection and try again." |
| Kept, added after the four messages above when a code is applied | "{applied} is still in your total." |
| Announcement, applied | "{code} applied. Your first payment is now {total}." |
| Announcement, replaced | "{code} applied instead of {applied}. Your first payment is now {total}." |
| Announcement, removed | "Code removed. Your first payment is now {total}." |

"Flex plans" stands for the code's allowed durations, built from the duration titles ("2-year and 1-year plans" when it allows two of them). `{applied}` is the code already applied.

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
11. Remove on the discount line emits `remove`. The app then removes the line, brings the total back, puts focus in the discount code input and announces "Code removed. Your first payment is now €22." → story `components-discountapplied--default` (play: Remove emits `remove`); e2e `discount-code.spec.ts: removing the code restores the total`
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
| State | Trigger | Feedback (what the user sees and hears) | Safe next action |
| --- | --- | --- | --- |
| loading | Apply pressed with a non-empty code; the fake check takes 600 ms (3 s with `?mock=slow`) | Apply shows the spinner with `aria-busy="true"`. The field keeps its text. An applied code keeps its discount line (note and Remove) and total. Nothing is announced until the result. | wait; editing the field throws away the pending result and returns to idle; Remove on the discount line still removes an applied code |
| empty | Apply pressed with an empty or blank field | "Enter a code to apply it." under the field with the alert icon, announced politely; no check runs | type a code |
| error | the check fails (`?mock=code-error`) | "We couldn't check the code. Check your connection and try again." under the field with the alert icon, announced politely; code kept; total unchanged | press Apply again |
| partial | not applicable. A code is checked as a whole: one answer, applied in full or not at all. Nothing loads in parts. | — | — |
| success | a known, current code that covers the chosen plan, with no code applied | the line "Discount" with the deduction above the total, and on it the check icon, "{code} applied", the summary and Remove; the emptied field in the footer, with no applied row there; the lower total; "{code} applied. Your first payment is now {total}." announced politely; focus stays on Apply (or in the field after Enter) | continue the steps, Remove, or apply another code |
| replaced | a valid code applied while another code is applied | the discount line updates in place: its note and Remove name the new code only; total recalculated from the new code; "{code} applied instead of {applied}. Your first payment is now {total}." announced politely; focus stays where it was | continue, Remove, or apply another code |
| kept | a new code is unknown, expired, not eligible or the check fails while a code is applied | the matching message under the field with the alert icon, ending with "{applied} is still in your total.", announced politely; discount line (note and Remove) and total unchanged | fix the new code, try another, Remove on the discount line, or continue with the applied one |
| permission | not applicable. The product has no accounts or roles (spec §7), so every visitor may enter a code. Codes limited to some plans are covered by "not eligible". | — | — |
| idle | a duration is chosen and no code is applied | label, hint, empty field, Apply | type a code, or ignore the field |
| no plan yet | no duration chosen | no field; the receipt shows its existing empty, club-only or "from" state (unchanged, `components-receipt--empty`, `components-receipt--club-only`) | choose a plan in the step |
| invalid | the code is not in the list | "We don't recognise this code. Check the spelling and try again." with the alert icon, `aria-invalid`, announced politely; total unchanged | fix the code and Apply again |
| expired | the code's end date has passed | "This code has expired. Try another code." with the alert icon, announced politely; total unchanged | try another code |
| not eligible | the code is current but does not cover the chosen duration | "{code} works on {durations} plans only. Choose {durations} or try another code." with the alert icon, announced politely; total unchanged | change the duration in step 3 or try another code |
| no longer applies | an applied code stops covering the plan after a step change | discount line removed with its note and Remove, total restored, the code back in the field if it was empty, the "no longer applies" message announced politely | change the duration back and Apply, or leave it |
| removed | Remove on the discount line pressed | discount line gone with its note and Remove, total restored, field keeps its text, focus in the discount code field in the footer, "Code removed. Your first payment is now {total}." announced politely | type another code or continue |

## Component API

### DiscountCode (new)
A field for one discount code with Apply beside it, and the polite status region for every result. It goes in Receipt's `footer`. It renders TextField with Apply in TextField's `action` slot and has no input markup of its own. It shows no applied state: the applied code, its summary and Remove live on the discount line (DiscountApplied in ReceiptLine's `below` slot). It handles layout, focus and announcements only. The app decides whether a code is valid and passes in the result.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | the text in the field |
| `status` | `'idle' \| 'applying'` | `'idle'` | `applying` sets Apply to loading; the field stays as it is |
| `error` | `string` | — | message under the field row; passed to TextField `error` (icon, `aria-invalid`, `aria-describedby`); shown with or without an applied code. The app adds the "still in your total" sentence |
| `announcement` | `string` | `''` | text of the polite status region; the app sets it after each result, including errors and a Remove on the discount line |
| `label` | `string` | `'Discount code (optional)'` | |
| `hint` | `string` | — | |

| Slot | Content |
| --- | --- |
| none | |

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `string` | each input |
| `apply` | `code: string` (trimmed, upper-cased) | Apply or Enter with a non-blank value while not `applying`, with or without an applied code; the app decides whether it replaces the applied one |

| Exposed | |
| --- | --- |
| `focus()` | focuses the input; the app calls it after Remove on the discount line |

v-model: `modelValue` (the field text).
Tokens: `danger`, `text`, `text-muted`, `border-strong` via TextField; `font-text`, `text-body`, `text-small`; spacing 1–4; motion `duration-fast`, `ease-standard` only through Button and TextField. Reuses TextField (with the `action` slot), Button (Apply `secondary` md) and Icon (`alert`, through TextField's error).
Assumption: Apply is `secondary`, because the step's Continue is the one primary action on screen.
Assumption: the root is a `<form novalidate>` so Enter applies, and the contract says never to nest it in another form. The receipt sits outside `<main>` and its forms.
Stories: `Idle`, `EmptySubmit`, `Applying`, `Applied` (emptied field, Apply, the announcement in the status region), `Invalid`, `Expired`, `NotEligible`, `NoLongerApplies`, `NetworkError`, `KeptOnError`, `Keyboard`, `Matrix`. Each state row has one story, with these exceptions. "No plan yet" is proven by Receipt's existing stories. "Removed" is proven by DiscountApplied's `Default` play (Remove emits `remove`) and the e2e scenario, because the app removes the line and moves focus. "Replaced" is app logic: DiscountApplied only receives a new `code` and DiscountCode a new `announcement`, so `discount.test.ts` and the e2e scenario prove it. The two "not applicable" rows need no story.

### DiscountApplied (new)
The applied note and Remove on the discount line: a check icon, "{code} applied", the summary, and a Remove button. It goes in ReceiptLine's `below` slot. The app removes the line and moves focus on `remove`. Assumption: a component of its own rather than markup in the app, so its copy, contrast and Remove name are covered by a story and axe in all 6 themes, and the Receipt story and the app do not duplicate it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `code` | `string` | — | required; shown as "{code} applied" and in Remove's name |
| `summary` | `string` | — | required; e.g. "10% off your first 4 weeks" |

| Slot | Content |
| --- | --- |
| none | |

| Event | Payload | When |
| --- | --- | --- |
| `remove` | — | Remove activated |

v-model: none.
Layout: one paragraph (the icon, "{code} applied" in `success` `font-semibold`, then the summary in `text-muted`) that wraps, with Remove at its right. When the receipt is too narrow, Remove wraps under the paragraph.
Tokens: `success` (icon and "{code} applied"), `text-muted` (summary); `font-text`, `text-small`, `font-semibold`; spacing 1–2. Reuses Button (Remove `ghost` md) and Icon (`check-circle`, decorative).
Stories: `Default` (applied, play: Remove emits `remove` and the button is named "Remove code TEST-10"), `Matrix` (TEST-10 and TEST-FLEX20 summaries).

### TextField (changed)
New slot for an inline action: a control on the input's row, outside the input's border.

| Slot | Content |
| --- | --- |
| `end` | unchanged |
| `action` | new. One control after the input on the same row, e.g. an Apply button. It is not part of the input's name or description. The input takes the remaining width; the row wraps, so the action goes under the input when there is no room (SC 1.4.10). The error message shows under the whole row |

Props, events and exposed `focus()` unchanged.
Tokens: unchanged, plus spacing 2 for the gap between input and action.
Contract: Slot table gains `action`; States gains "with action" (trigger: `action` slot; feedback: control after the input, wraps when narrow; safe next action: type, then Tab to the action); Accessibility gains "the action follows the input in tab order and needs its own accessible name"; Do and don't gains "Don't put the screen's primary action in `action`".
Stories: new `WithAction` (Apply button; play: Tab goes input → action, and the input's accessible description is unchanged); `Matrix` gains "with action" and "with action, invalid".
Assumption: the action sits next to the input, outside its border, as built in prototype B, not inside it as `end` does. `end` stays for non-interactive marks (spinner, check).

### ReceiptLine (changed)
| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `amount` | `number` | — | may now be negative: a deduction. It shows "−" (U+2212) and the absolute value, `sr-only` "€2 off", and is never struck through |

| Slot | Content |
| --- | --- |
| default | unchanged: details behind the disclosure |
| `below` | new. Content always visible under the label and price, outside the disclosure, e.g. DiscountApplied on the discount line. With the default slot too, it sits between the label row and the details |

Events unchanged. Tokens unchanged; the `below` content brings its own.
Contract: Slot table gains `below`; States gains "with below content"; Do and don't gains "Do put the line's status and actions in `below`; keep breakdowns in the default slot".
Stories: new `Deduction` (label "Discount", amount −200, DiscountApplied for TEST-10 in `below`); `Matrix` gains it.
Assumption: a deduction is a negative amount on the existing line, not a new variant. It changes no colour or size, so P2 does not call for a variant.
Assumption: ReceiptLine gets a generic `below` slot rather than discount props or its own Remove button, so the line stays unaware of codes.

### Receipt (changed: contract and stories only)
Receipt.vue needs no new slot. The contract's "Do leave the discount code out" line becomes "the discount code field goes in `footer`, above the referral field. Its line goes in the default slot after the plan and starter lines, with DiscountApplied in the line's `below` slot". The "no live region for the total" decision stays: the new total is announced by DiscountCode's status region, also after a Remove on the line, so it is not read twice.
Stories: new `WithDiscount` (the discount line with DiscountApplied, plus DiscountCode with an empty field in the footer; play: Tab from Remove reaches the discount input, then Apply); `Matrix` gains it.

## Accessibility
- Names and roles:
  - The input is named by its visible label "Discount code (optional)" and described by the hint, then the error.
  - Apply is a native `button type="submit"` named "Apply".
  - Remove sits on the discount line and is named "Remove code {code}", with the visible "Remove" at the start of the name (SC 2.5.3).
  - The applied note on the discount line is a paragraph: the icon is decorative, and the words "{code} applied" plus the summary carry the meaning. Read in order, the line gives "Discount, €2 off, TEST-10 applied, 10% off your first 4 weeks, Remove code TEST-10".
  - Apply in TextField's `action` slot has its own name and is not part of the input's name or description.
  - The receipt stays the named `aside`.
- Keyboard:
  - With no code applied, Tab goes field → Apply → referral field. With a code applied, it goes Remove (on the discount line, after the plan and starter disclosures) → field → Apply → referral field. The total in between has no control. Enter in the field applies.
  - While applying, Apply keeps focus (`aria-disabled`, as Button's loading does).
  - On applied or replaced, focus stays where it was (Apply, or the input after Enter). Neither is removed, so focus never drops to `body`. On replaced, the discount line is updated in place, not re-created, so a focused Remove keeps focus. Assumption: the line is not keyed by the code.
  - On Remove, focus moves to the discount code input, because the Remove button goes away with the line. The input is the next control after Remove in tab order, so the user goes on from the same place.
  - On an error, focus stays where it was (Apply or the input).
  - On "no longer applies", focus is in the step and stays there.
- Announcements:
  - One polite `role="status"` region inside DiscountCode, mounted from the first render. Its text is `announcement`, plus the component's own empty-submit message. The Remove on the discount line is announced through this region too: DiscountApplied has no region of its own.
  - No `role="alert"`: the code is optional, so nothing blocks the user.
  - The field error itself is not live (TextField's rule), so each result is heard once.
- Other:
  - Applied uses `success` with the check icon and words, and errors use `danger` with the alert icon and words. Colour is never the only signal (C6, SC 1.4.1).
  - Apply and Remove are md (48 px).
  - No new motion. The spinner follows the global reduced-motion rule.
  - At 320 px the field and Apply wrap rather than overflow (SC 1.4.10). On the discount line, the applied note wraps and Remove goes under it if there is no room.

## Data
New `apps/web/src/data/discounts.ts` (codes are visibly fake; dates are fixed so the visual tests and stories are stable):

| Code | Off | Durations | Ends |
| --- | --- | --- | --- |
| `TEST-10` | 10% | all | none |
| `TEST-FLEX20` | 20% | `flex` | none |
| `TEST-EXPIRED` | 10% | all | 2020-01-01 |

Shape: `{ code, off, durations, endsAt?, summary }`.

Rules (new section "Discount code" in `docs/product/pricing.md`):
- One code at a time. A new code that is valid for the plan replaces the applied one. A new code that is unknown, expired or not eligible, or whose check fails, leaves the applied one in place.
- The percentage comes off the first 4-week price after the promo. On 1- and 2-year plans it applies on top of the half-price promo price. The result is rounded to the nearest €0.50, like every other price here. The discount is the difference.
- The starter package and later periods are untouched.
- First payment = discounted first 4-week price + starter package.
- The struck-through total keeps its definition: no promo, starter charged, no discount.
- Codes are trimmed and upper-cased before the check.
- A discount code and a referral code are independent: both can be entered, and the referral code never changes the price.
- Examples:
  - Home club, 2 years, `TEST-10`: €22 → €20, first payment €20.
  - Home club, flex, `TEST-FLEX20`: €59.50 → €47.50, first payment €72.50.
  - Home club, flex, `TEST-10`: €59.50 → €53.50, first payment €78.50.
  - Home club, flex, `TEST-10` applied, then `TEST-FLEX20`: `TEST-FLEX20` replaces it, first payment €72.50 (not €78.50 less 20%).
  - Home club, 2 years, `TEST-10` applied, then `TEST-FLEX20`: not eligible, `TEST-10` stays, first payment €20.

Code changes:
- `apps/web/src/lib/discount.ts`: `normaliseCode`, `checkCode(code, duration, now)` returning `applied | unknown | expired | not-eligible`, `discountedPrice`, and `nextApplied(current, newCode, result)`. `nextApplied` returns the new code on `applied` and `current` on any other result or a failed check.
- `apps/web/src/lib/api.ts`: `checkDiscountCode(code, duration, signal)` with a 600 ms delay (3 s with `slow`). It throws with the new mock flag `code-error`.
- `useSignup`: new state `discountCode: string` (the applied code, `''` if none), kept in sessionStorage. `total` and a new `discount` computed apply it, so the receipt and the success page both read it.
- A plan change re-runs `checkCode` locally. Assumption: no request, because the code's rules came with the first answer.

How to trigger each state (new rows in `docs/product/mock-data.md`):

| Want to see | Do |
| --- | --- |
| applied | `TEST-10` on any plan |
| replaced | on flex, apply `TEST-10`, then `TEST-FLEX20` |
| kept | on a 2-year plan, apply `TEST-10`, then `TEST-FLEX20`, `TEST-EXPIRED` or `NOPE` |
| not eligible / no longer applies | `TEST-FLEX20` on a 2-year or 1-year plan, or apply it on flex and switch to 2 years |
| expired | `TEST-EXPIRED` |
| unknown | any other code, e.g. `NOPE` |
| slow check | `?mock=slow` |
| check fails | `?mock=code-error` |

## Paths to touch
packages/ui/src/components/DiscountCode/**
packages/ui/src/components/DiscountApplied/**
packages/ui/src/components/TextField/**
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

Baselines for the Receipt, ReceiptLine, TextField, DiscountCode and DiscountApplied matrices and for app steps 3–5 change only through `pnpm test:visual:update`, in a separate `baselines:` commit.

## Out of scope
- Stacking two discount codes. A second code replaces the first; it never adds to it. The referral field is untouched: it works alongside a discount code and has no price effect.
- Fixed-amount (euro) codes and codes on later 4-week periods. Only a percentage on the first 4 weeks.
- Showing the code or the discount line on the success page; only its "First payment" amount changes.
- A real code service, rate limiting or lockout after wrong tries.
- Changes to the half-price promo, the Banner or the "from" prices on the access level step.
- New tokens or icons.
- Using TextField's `action` slot anywhere other than DiscountCode, e.g. on the referral field. A new slot on Receipt.

## Open questions
None
