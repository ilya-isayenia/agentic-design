# ReceiptLine

## Purpose

One line of the membership receipt: a label on the left, a price on the right, an optional note under the price, optional content that always shows under the line, and optional details behind a disclosure. A negative amount is a deduction, such as a discount. The `total` emphasis is the last line of the receipt.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | — | e.g. "Membership fee", "Starter package" |
| `amount` | `number` | — | cents; formatted by `formatMoney`. Negative for a deduction: shown as "−€2" (minus sign U+2212 and the absolute value), read as "€2 off", never struck through |
| `was` | `number` | — | cents; struck through only when higher than `amount`; ignored on a deduction |
| `note` | `string` | — | small muted text under the price, e.g. "First payment" |
| `emphasis` | `'default' \| 'total'` | `'default'` | total = display font, larger price |
| `defaultOpen` | `boolean` | `false` | details start expanded; only with the default slot |

| Slot | Content |
| --- | --- |
| default | details shown under the line; when present, the label becomes a disclosure button |
| `below` | content always visible under the label and price, outside the disclosure, e.g. DiscountApplied on the discount line. With the default slot too, it sits between the label row and the details |

No events: the disclosure state is local.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| regular | — | label and price | — |
| promo | `was > amount` | old price struck through and muted before the new one; screen readers hear "€22, was €44" | — |
| with note | `note` | caption under the price | — |
| deduction | `amount < 0` | "−€2" in the price column, no strike-through; screen readers hear "€2 off" | — |
| with below content | `below` slot | the content under the label and price, visible whether the details are open or not | whatever the content offers |
| collapsed | default slot, closed | label with a chevron pointing down, `aria-expanded="false"` | activate to show details |
| expanded | activated or `defaultOpen` | chevron turned up, details visible, `aria-expanded="true"` | activate to hide |
| total | `emphasis="total"` | uppercase display label, `text-h2` price | — |
| focus | keyboard focus on the disclosure | global 2 px `focus` ring | Enter or Space |

## Tokens

`text`, `text-muted`; `font-display`, `text-h2`, `text-h3`, `text-small`, `text-caption`, `font-semibold`, `font-extrabold`; `tabular`; spacing 1–4; `rounded-sm`; motion `duration-fast`, `ease-standard`.

## Accessibility

- Disclosure pattern: a native `button` with `aria-expanded` and `aria-controls` pointing at the details (`useId`, so copies on one page never clash). Details stay in the DOM and are hidden with `display: none`.
- The visible price is `aria-hidden`; one `sr-only` string carries it ("€22, was €44"), because `<del>` is not announced reliably.
- No live region: the receipt changes only in reply to a choice the user just made, and that choice is announced where it was made.
- The chevron is decorative; its turn respects reduced motion through the global rule.
- The disclosure target is 32 px high: a secondary control, above the 24 px minimum (SC 2.5.8).

## Do and don't

- Do pass cents and let the line format them.
- Do put a breakdown ("2 workouts a week × 4 weeks") in the slot instead of extra lines.
- Do put the line's status and actions in `below`; keep breakdowns in the default slot.
- Do pass a deduction as a negative amount on a normal line; it is not a variant and changes no colour.
- Don't draw separators here; Receipt draws the dashed dividers between lines.
- Don't use `total` more than once per receipt.
