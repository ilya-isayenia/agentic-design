# Button

## Purpose

Starts an action: submit a step, join, retry, apply. One primary button per view region; the rest are secondary or ghost.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | primary = filled accent; secondary = outlined; ghost = text with underline |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | min heights 32 / 48 / 64 px; `sm` only inside dense controls, never as the main action on touch |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | |
| `loading` | `boolean` | `false` | shows a spinner, sets `aria-busy`, ignores clicks, stays focusable |
| `disabled` | `boolean` | `false` | native `disabled` |
| `block` | `boolean` | `false` | full width |
| `iconEnd` | `IconName` | — | decorative icon after the label, hidden while loading |

| Slot | Content |
| --- | --- |
| default | the label; required, plain text |

| Event | Payload | When |
| --- | --- | --- |
| `click` | `MouseEvent` | activated and not disabled or loading |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| default | — | filled or outlined per variant | activate |
| hover | pointer over | `accent-hover` fill (primary), `surface-raised` (others) | activate |
| focus | keyboard focus | 2 px `focus` ring, offset 2 px | Enter or Space |
| loading | `loading` | spinner, `aria-busy="true"`, 60 % opacity | wait; focus stays |
| disabled | `disabled` | 60 % opacity, not focusable | fix what blocks it |

## Tokens

`accent`, `accent-hover`, `on-accent`, `text`, `surface-raised`, `focus`; `font-display`, `text-small`/`text-body`/`text-h3`; spacing 1–8; motion `duration-fast`, `ease-standard`.

## Accessibility

- Role: native `button`. Name: the slot text. Never icon-only — use IconButton.
- Keyboard: Enter and Space (native).
- Loading uses `aria-disabled` instead of `disabled`, so focus is not dropped to `body` during submit.
- Disabled buttons are exempt from contrast (SC 1.4.3), but the reason must be visible near the button.

## Do and don't

- Do write the label as a verb: "Continue", "Join now".
- Do use `type="submit"` inside forms.
- Don't put two primary buttons side by side.
- Don't change colours through classes from outside; add a variant here instead.
