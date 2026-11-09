# Typography

| Family | Token | Use |
| --- | --- | --- |
| Barlow Condensed | `font-display` | headings, step titles, prices, buttons; uppercase |
| Inter | `font-text` | body, labels, inputs, captions |

Both are self-hosted with `@fontsource`, weights 400, 600, 800. Storybook waits for them before rendering, so screenshots never use a fallback.

## Scale

| Token | Size / line height | Use |
| --- | --- | --- |
| `text-display` | 40 / 44 | page title, success headline |
| `text-h1` | 32 / 36 | step heading |
| `text-h2` | 24 / 28 | section heading, card price |
| `text-h3` | 18 / 24 | card title, receipt club name |
| `text-body` | 16 / 24 | body, inputs, buttons |
| `text-small` | 14 / 20 | perks, hints, receipt lines |
| `text-caption` | 12 / 16 | price lead and period, chip labels |

Sizes are in rem so browser zoom and user font size work (SC 1.4.4). Weights: `font-regular` 400, `font-semibold` 600, `font-extrabold` 800.

## Rules

- One `text-h1` per screen (the step heading); headings do not skip levels.
- Body text is at most 70 characters wide: `max-w-prose`.
- Prices and countdowns use `tabular` (tabular numbers).
- Display type is uppercase through the `uppercase` class, never typed in capitals, so screen readers read words, not letters.
- No size outside the scale; there is no class for it.
