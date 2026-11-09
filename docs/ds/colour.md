# Colour

## Brands and modes

| Brand | Character | Default mode | Accent |
| --- | --- | --- | --- |
| Pulse | dark, high-contrast; the default brand | dark | pink |
| Volt | dark, sharper | dark | yellow |
| Lumen | light-first, softer surfaces | light | pink |

Every brand has a light and a dark mode: six themes. Data attributes: `data-brand="pulse|volt|lumen"`, `data-mode="dark|light"`.

## Semantic roles

Components use only these roles (Tailwind: `bg-<role>`, `text-<role>`, `border-<role>`, `fill-<role>`, `stroke-<role>`).

| Role | Use | Never |
| --- | --- | --- |
| `bg` | page background | card backgrounds |
| `surface` | cards, inputs, panels | page background |
| `surface-raised` | selected or hovered surfaces, skeletons, nested panels | text |
| `text` | body and headings | on `accent` |
| `text-muted` | secondary text, captions, old prices | the only text of an action |
| `border` | decorative dividers | control boundaries (too low contrast) |
| `border-strong` | input, checkbox and card boundaries a user must see (3:1) | decoration |
| `accent` | primary action fill, selected border, current step | body text on `bg` (fills only) |
| `accent-hover` | hover of accent fills | resting state |
| `on-accent` | text and icons on `accent` | anywhere else |
| `success` | done steps, "applied" messages, valid marks (with an icon) | as the only signal |
| `danger` | errors (with an icon and text) | decoration, promos |
| `focus` | focus ring (2 px, offset 2 px) | anything else |
| `chart-1`…`chart-5` | data series, in order | UI chrome |
| `chart-grid` | axes and grid lines | data |
| `chart-label` | axis labels and values | data marks |

## Contrast pairs (`pnpm contrast`)

| Foreground | On | Minimum | WCAG |
| --- | --- | --- | --- |
| `text`, `text-muted`, `success`, `danger` | `bg`, `surface`, `surface-raised` | 4.5 | 1.4.3 |
| `chart-label` | `bg`, `surface` | 4.5 | 1.4.3 |
| `on-accent` | `accent`, `accent-hover` | 4.5 | 1.4.3 |
| `border-strong`, `accent`, `focus` | `bg`, `surface`, `surface-raised` | 3 | 1.4.11 |
| `chart-1`…`chart-5` | `bg`, `surface` | 3 | 1.4.11 |

The focus ring is always offset, so it sits on a surface, never on the accent fill. A new role or a new pair is added to `tools/contrast/index.mjs` in the same change.
