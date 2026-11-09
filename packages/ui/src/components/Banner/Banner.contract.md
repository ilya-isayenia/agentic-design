# Banner

## Purpose

A promo strip across the top of the page with a countdown to the end of an offer. One per page. It is not for errors or system messages; use Toast or ErrorState.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `message` | `string` | — | required; one short sentence |
| `endsAt` | `Date \| string` | — | required; ISO string or `Date` |
| `now` | `Date` | — | fixed current time for stories and tests; when absent the banner reads the clock every second and clears the interval on unmount or when the offer ends |
| `actionLabel` | `string` | — | link text; the link renders only with `href` too |
| `href` | `string` | — | link target |
| `dismissible` | `boolean` | `true` | shows a close IconButton labelled "Dismiss offer" |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `dismiss` | — | close button activated; the consumer hides the banner and remembers the choice |

Helpers in `countdown.ts`: `getCountdown(endsAt, now)`, `formatCountdown(countdown)`, `describeCountdown(countdown)`.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| running | more than 1 hour left | message, "Ends in" and digits `02d 07h 52m 36s`; zero days, then zero hours, are dropped | follow the link or dismiss |
| last hour | under 1 hour left | a "Last hour" tag (`accent` fill) before the message; digits `42m 09s` | follow the link or dismiss |
| ended | `now >= endsAt` | "This offer has ended" in muted text; no digits, no link | dismiss |
| without action | no `actionLabel` or `href` | no link | dismiss |
| non-dismissible | `dismissible` false | no close button | — |

## Tokens

`surface`, `text`, `text-muted`, `accent` (bottom border and "Last hour" tag), `on-accent`, `focus`; `font-display`, weights semibold/extrabold; `text-h3`, `text-small`, `text-caption`; `tabular`; spacing 1, 2, 4, 12.

The digits are in `text`, not `accent`: accent fails 4.5:1 as text on the banner surface in pulse dark (about 3.4:1) and volt light (about 3.6:1). The accent shows as the bottom border and the "Last hour" tag fill, where `on-accent` text passes in all six themes.

## Accessibility

- The ticking digits and the "Ends in" caption are `aria-hidden`. A `<time datetime>` carries a visually hidden sentence at minute level ("Offer ends in 2 days 7 hours"). It is not a live region, so nothing is announced every second.
- The banner is not a landmark itself, so several banners in one view do not create duplicate landmarks. Put it inside the page `header` or another landmark.
- The link and the close button are 48 px tall. Order: message, time, link, close.
- The state is never shown by colour alone: "Last hour" and "This offer has ended" are words.

## Do and don't

- Do pass `endsAt` from the server and keep the message under about 60 characters, so the strip fits on one line on desktop.
- Do remember a dismissal (storage or account) so the banner does not come back on the next page.
- Don't pass `now` in production; it freezes the countdown.
- Don't make the countdown the only place the end date appears; the offer terms say it in full.
