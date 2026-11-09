# Receipt

## Purpose

The order summary beside the signup steps: which club, what each part costs, and the total every 4 weeks. It only lays out what the app passes in; prices come from the app's pricing data. Sticky positioning is the app's job.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | `'Your membership receipt'` | the `h2` that names the `aside` |
| `club` | `{ name: string; address: string }` | — | chosen club; name in display caps, address with a pin |
| `empty` | `boolean` | derived | forces the empty state on or off; by default empty when there is no `club` and the default slot renders nothing |

| Slot | Content |
| --- | --- |
| default | `ReceiptLine` items; dashed `border` dividers are drawn between them |
| `total` | one `ReceiptLine` with `emphasis="total"`, under a dashed `border-strong` rule |
| `footer` | extra content under the receipt, e.g. the DiscountCode field and the referral code `TextField`; shown in every state |

No events.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| empty | no club, no lines (or `empty`) | dumbbell icon and "Choose a club and a plan to see your price here." | pick a club in the finder |
| club only | `club`, no lines | club name and address, then "Choose a plan to see your price." | choose a plan in the step |
| filled | lines (and usually `club` and `total`) | lines with dashed dividers, total at the bottom | continue the steps |
| with discount | a discount ReceiptLine (negative amount, DiscountApplied in `below`) after the plan and starter lines; DiscountCode in `footer` | "Discount" line with the deduction, "{code} applied", the summary and Remove, above the total; the field and Apply in the footer | continue, Remove, or apply another code |

## Tokens

`surface`, `border`, `border-strong`, `text`, `text-muted`; `font-display`, `text-h3`, `text-body`, `text-small`, `font-semibold`, `font-extrabold`; `rounded-md`; spacing 1–8; `max-w-receipt`, `max-w-prose`.

## Accessibility

- `<aside aria-labelledby>` pointing at its own `h2` (id from `useId`), so it is a named complementary landmark. In the app, place it beside `<main>`, not inside it: a complementary landmark belongs at the top level (axe `landmark-complementary-is-top-level`).
- No live region for the total, by decision: the total only changes in reply to a choice the user just made in the step, and that choice is already announced there. A live region would read every price twice. A discount code's new total is announced by DiscountCode's own status region, also after a Remove on the discount line, so it is not read twice either.
- Prices are read through each ReceiptLine's `sr-only` text ("€22, was €44").
- The pin and dumbbell icons are decorative (`aria-hidden`).
- The club name is a paragraph, not a heading: the receipt is one short section under its `h2`.

## Do and don't

- Do pass ReceiptLine items only in the default slot, so the dividers fall between lines.
- Do put the discount code field (DiscountCode) in `footer`, above the referral field. Its line goes in the default slot after the plan and starter lines, with DiscountApplied in the line's `below` slot.
- Don't make the receipt sticky here; the app positions it.
- Don't add a live region for the total.
