# ErrorState

## Purpose

Replaces a region whose content failed to load or save, says what went wrong and offers a retry. For a region that loaded but is empty use EmptyState; for a field error use the field's own message.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | — | required; what failed, rendered as a heading |
| `description` | `string` | — | what to do, and what did not happen ("Nothing was charged") |
| `retryLabel` | `string` | `'Try again'` | button text |
| `retrying` | `boolean` | `false` | Button `loading`: spinner, `aria-busy`, clicks ignored, focus kept |
| `announce` | `boolean` | `true` | `role="alert"` on the title and description; turn off when the error is already there at page load |
| `headingLevel` | `2 \| 3` | `2` | pick the level that fits the page outline |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `retry` | — | retry button activated and not `retrying` |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| failed | rendered | `alert` icon in a `danger` circle, title, description, "Try again" | retry |
| retrying | `retrying` | button spinner, `aria-busy="true"`, 60 % opacity; focus stays on the button | wait |
| silent | `announce` false | same look, no `role="alert"` | retry |

## Tokens

`danger` (icon and circle), `text`, `text-muted`; Button tokens; `font-display`, `font-extrabold`, `text-h2`, `text-body`; `max-w-prose`; `rounded-full`; spacing 2, 4, 8, 16.

## Accessibility

- The failure is said in words (title) and shown by the `alert` icon shape, not by red alone.
- `role="alert"` wraps only the title and description, so the button label is not read as part of the alert. Use it when the error replaces content after a user action; turn it off for errors present on first render, which screen readers find through the heading.
- The retry button keeps focus while `retrying`, so keyboard users are not dropped to the top of the page.
- If the retry fails again, the consumer keeps the same ErrorState; re-announce only by remounting it.

## Do and don't

- Do name the thing that failed: "Plans did not load", not "Something went wrong".
- Do say what did not happen when money or data is involved: "Nothing was charged."
- Don't show an error code as the title; put it in the description if support needs it.
- Don't auto-retry in a loop behind this component; one retry per click.
