# Price

## Purpose

Shows a price in euros, optionally with the price before a promo, a lead ("From") and a period ("/4 weeks"). Used in PlanCard, ClubCard and Receipt.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `amount` | `number` | — | cents |
| `was` | `number` | — | cents; shown struck through only when higher than `amount` |
| `period` | `string` | — | shown as `/period` |
| `lead` | `string` | — | caption above the price |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `text-body` / `text-h2` / `text-h1` |

No slots, no events.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| regular | no `was` | one price | — |
| promo | `was > amount` | old price struck through, muted | — |

## Tokens

`text`, `text-muted`; `font-display`, weights semibold/extrabold; `text-caption`, `text-small`, `text-body`, `text-h3`, `text-h2`, `text-h1`; `tabular`.

## Accessibility

- Visual parts are `aria-hidden`; one visually hidden sentence carries the meaning in reading order: "From €22, was €44 per 4 weeks". Screen readers do not announce `<del>` reliably, so the struck price is never the only cue.
- Tabular numbers keep columns of prices aligned.

## Do and don't

- Do pass cents; `formatMoney` decides decimals (€36, €49.50).
- Don't build price strings by hand in screens; use this component or `formatMoney`.
