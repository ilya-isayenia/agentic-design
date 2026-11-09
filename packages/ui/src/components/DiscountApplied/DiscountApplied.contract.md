# DiscountApplied

## Purpose

The applied note and Remove on a receipt's discount line: a check icon, "{code} applied", what the code does, and a Remove button. It goes in ReceiptLine's `below` slot, so the code shows once, next to the money it changes. It only lays out what it is given; the app removes the line and moves focus on `remove`.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `code` | `string` | — | required; the applied code, normalised by the app; shown as "{code} applied" and in Remove's name |
| `summary` | `string` | — | required; e.g. "10% off your first 4 weeks" |

| Slot | Content |
| --- | --- |
| none | |

| Event | Payload | When |
| --- | --- | --- |
| `remove` | — | Remove activated (click, Enter or Space) |

No v-model, nothing exposed.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| applied | rendered with `code` and `summary` | check icon, "{code} applied" in `success`, the summary in `text-muted`, Remove at the right | continue, or Remove |
| narrow | the line is too narrow for the note and Remove | the note wraps; Remove goes under it | as applied |
| focus | keyboard focus on Remove | global 2 px `focus` ring | Enter or Space |

Removed is the app's state, not this component's: on `remove` the app takes the line away, moves focus to the discount code field and announces the new total through DiscountCode's status region.

## Tokens

`success` (icon and "{code} applied"), `text-muted` (summary); `font-text`, `text-small`, `font-semibold`; spacing 1–2. Reuses Button (`ghost`, md) and Icon (`check-circle`).

## Accessibility

- The note is one paragraph. The icon is decorative (`aria-hidden`); the words "{code} applied" and the summary carry the meaning, so success is never colour alone (SC 1.4.1).
- Remove is a native `button` named "Remove code {code}": the visible "Remove" starts the name (SC 2.5.3), and the code tells two discount lines apart if there ever are two.
- Remove is 48 px high (md).
- No live region of its own: DiscountCode's status region announces the removal and the new total, so it is heard once.
- When Remove is pressed, the button goes away with the line. The app must move focus (to the discount code field), never leave it on `body`.

## Do and don't

- Do put it in the `below` slot of the discount ReceiptLine, so it reads after "Discount, €2 off".
- Do update `code` in place when a new code replaces the old one; do not key the line by the code, so a focused Remove keeps focus.
- Don't show the code a second time in the line's label or in the receipt footer.
- Don't use it for errors; DiscountCode shows those under the field.
