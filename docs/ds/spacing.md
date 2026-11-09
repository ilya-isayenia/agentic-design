# Spacing, radius, layout

## Spacing

Base 4 px. Tokens and classes: `0` 0, `1` 4, `2` 8, `3` 12, `4` 16, `6` 24, `8` 32, `12` 48, `16` 64 (`p-4`, `gap-6`, `mt-12`, `size-12`). `p-5` or `gap-10` do not exist.

| Use | Value |
| --- | --- |
| inside a chip, between icon and label | 1–2 |
| inside a control, between label and field | 2–3 |
| inside a card | 6 (mobile 4) |
| between cards in a grid | 2–4 |
| between sections of a step | 8–12 |
| touch target minimum | 12 (48 px) |

## Radius

`rounded-none` 0 (default: cards, buttons, inputs — the brand look is square), `rounded-sm` 4, `rounded-md` 8, `rounded-full` (chips, step circles, badges).

## Layout

| Token | Value | Use |
| --- | --- | --- |
| `max-w-page` | 80rem | page content |
| `max-w-receipt` | 24rem | receipt column |
| `max-w-prose` | 70ch | body text |

Breakpoints: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem. The receipt sits beside the steps from `lg`; below it follows the steps. Every screen is checked at 375 px.
