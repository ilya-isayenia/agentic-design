# Chip

## Purpose

A small rounded tag. As a `span` it lists a perk of a club or plan ("Sauna", "24/7 access"). As a `button` it is an on/off filter in the club finder.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | — | the text; the default slot replaces it |
| `icon` | `IconName` | — | decorative, before the label |
| `tone` | `'neutral' \| 'accent'` | `'neutral'` | static chips only; accent draws an accent border, the text stays `text` |
| `as` | `'span' \| 'button'` | `'span'` | `button` makes it a toggle |
| `pressed` | `boolean` | `false` | `as="button"` only; controlled by the parent, rendered as `aria-pressed` |

| Slot | Content |
| --- | --- |
| default | the label, plain text; falls back to `label` |

| Event | Payload | When |
| --- | --- | --- |
| `toggle` | `boolean` (the next `pressed` value) | the button chip is activated; the parent updates `pressed` |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| static neutral | `as="span"` | thin `border` outline, `text-muted` text | — |
| static accent | `tone="accent"` | `accent` outline, `text` text | — |
| toggle off | `as="button"`, not `pressed` | `border-strong` outline; `surface-raised` on hover | activate to turn on |
| toggle on | `pressed` | filled `accent`, `on-accent` text, check icon, `aria-pressed="true"` | activate to turn off |
| focus | keyboard focus on a toggle | global 2 px `focus` ring | Enter or Space |

## Tokens

`border`, `border-strong`, `accent`, `accent-hover`, `on-accent`, `text`, `text-muted`, `surface-raised`; `text-caption`, `text-small`, `font-semibold`; `rounded-full`; spacing 1–3, `min-h-8`; motion `duration-fast`, `ease-standard`.

## Accessibility

- Static chip: plain text; put a group of them in a `<ul>`.
- Toggle chip: native `button` with `aria-pressed`, so screen readers say "toggle button, pressed". Name: the label.
- The on state adds a check icon and a fill, not only a colour change (SC 1.4.1).
- Target is 32 px high: a filter, not a main action, above the 24 px minimum (SC 2.5.8).
- Accent never colours text: it is only guaranteed 3:1 on surfaces.

## Do and don't

- Do keep labels to one to three words.
- Do let the parent own `pressed` and update it on `toggle`.
- Don't use a chip as a navigation link or as the main action; use Button.
- Don't put an icon in a toggle chip that already shows the check when on; the check replaces it.
