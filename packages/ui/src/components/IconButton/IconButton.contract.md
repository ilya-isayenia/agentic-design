# IconButton

## Purpose

An action shown only as an icon: close, dismiss, previous/next, favourite toggle. Use it only where the icon is widely understood; otherwise use Button with text.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `icon` | `IconName` | — | required |
| `label` | `string` | — | required; becomes `aria-label`, so it is the only name a screen reader hears |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'ghost'` | same colours as Button; ghost has no border |
| `size` | `'sm' \| 'md'` | `'md'` | 32 / 48 px square; `sm` only in dense places (toasts, table rows), never the main control on touch |
| `disabled` | `boolean` | `false` | native `disabled` |
| `pressed` | `boolean` | — | set it to make a toggle (`aria-pressed`); leave it out for a plain action |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `click` | `MouseEvent` | activated and not disabled |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| default | — | icon in `text` (filled `accent` for primary) | activate |
| hover | pointer over | `surface-raised` fill (`accent-hover` for primary) | activate |
| focus | keyboard focus | 2 px `focus` ring, offset 2 px | Enter or Space |
| pressed | `pressed` true | colours inverted (`text` fill, `bg` icon), `aria-pressed="true"` | activate again to release |
| disabled | `disabled` | 60 % opacity, not focusable | fix what blocks it |

## Tokens

`accent`, `accent-hover`, `on-accent`, `text`, `bg`, `surface-raised`, `focus`; spacing 8 / 12 (size); motion `duration-fast`, `ease-standard`.

## Accessibility

- Role: native `button`. Name: `label` through `aria-label`; the icon is `aria-hidden`.
- Keyboard: Enter and Space (native).
- Target size: `md` is 48 px. `sm` is 32 px, which still clears the 24 px minimum of WCAG 2.2 SC 2.5.8.
- Pressed state is shown by inverting colours, not by a hue change alone.

## Do and don't

- Do write the label as the action: "Dismiss offer", "Next month", not "X" or "Icon".
- Do keep the label stable for a toggle; `aria-pressed` carries the state ("Favourite", pressed / not pressed).
- Don't use it for the main action of a step; use Button with text.
- Don't add a tooltip as the only explanation; the label must make sense on its own.
