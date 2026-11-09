# ClubCard

## Purpose

One club in the club finder list: a placeholder photo, name, address, perks, the lowest price per 4 weeks, and two actions: read more or start the signup at this club.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | — | heading text; also appended to the button names for screen readers |
| `address` | `string` | — | shown with a pin icon |
| `perks` | `string[]` | `[]` | each a static Chip; the list is omitted when empty |
| `price` | `{ amount: number; was?: number }` | — | cents; shown by Price with lead "From" and period "4 weeks" |
| `ribbon` | `string` | — | promo strip across the bottom of the photo |
| `ribbonMoving` | `boolean` | `false` | the strip scrolls as a ticker; still under reduced motion |
| `headingLevel` | `2 \| 3` | `3` | match the page outline: 3 under a "Clubs near you" `h2` |
| `selected` | `boolean` | `false` | accent border, e.g. while the club's pin is hovered on the map |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `info` | — | "More info" activated |
| `join` | — | "Join now" activated |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| default | — | `border` outline, photo, details, two buttons | More info or Join now |
| promo | `ribbon`, `price.was` | accent strip on the photo, old price struck through | Join now |
| promo ticker | `ribbonMoving` | strip text scrolls; static under `prefers-reduced-motion` | Join now |
| selected | `selected` | `accent` border | same as default |
| long name or address | long strings | text wraps, never overflows the card | — |
| no perks | `perks` empty | no chip row | — |
| focus | keyboard focus on a button | global 2 px `focus` ring | Enter or Space |

## Tokens

`surface`, `surface-raised`, `border`, `border-strong`, `accent`, `on-accent`, `chart-2`, `chart-3`, `text`, `text-muted`; `font-display`, `text-h3`, `text-small`, `font-semibold`, `font-extrabold`; `rounded-md`; spacing 1–4; `aspect-video`; `animate-ticker`; motion `duration-fast`, `ease-standard`.

## Accessibility

- `<article aria-labelledby>` pointing at its heading (`useId`), so a list of cards can be browsed by heading or by article.
- In the DOM the heading comes first and the photo last; `order-first` puts the photo on top visually. The photo has no focusable parts, so tab order and visual order still agree.
- Button names repeat on every card, so each carries the club in `sr-only` text: "More info about Fenwick Hollow", "Join now at Fenwick Hollow". The visible text starts the name (SC 2.5.3).
- The photo SVG is `aria-hidden`. The visual ribbon, including every ticker copy, is `aria-hidden`; its text is read once from an `sr-only` paragraph just before the price.
- The ticker is decorative motion that runs longer than 5 s, so `motion-reduce:animate-none` stops it (SC 2.2.2 via reduced motion); the global reduced-motion rule is a second guard.
- `selected` is a visual echo of the map hover, not a state the user chose, so it has no ARIA.
- Both buttons are 48 px high (Button `md`).

## Do and don't

- Do pass `headingLevel` to fit the page outline.
- Do keep the ribbon short (under about 40 characters); the static strip wraps but covers more of the photo.
- Don't put real photos or brand logos in the placeholder.
- Don't use `selected` to mean "chosen club"; the chosen club lives in the receipt.
