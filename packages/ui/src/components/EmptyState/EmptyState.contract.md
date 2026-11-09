# EmptyState

## Purpose

Fills a region that loaded fine but has nothing to show: no search results, no bookings yet. It says why it is empty and, where possible, offers the next step. For a failure use ErrorState; for loading use Skeleton.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `icon` | `IconName` | — | decorative, in a 64 px outlined circle |
| `title` | `string` | — | required; rendered as a heading |
| `description` | `string` | — | one or two sentences, muted |
| `headingLevel` | `2 \| 3` | `2` | pick the level that fits the page outline |

| Slot | Content |
| --- | --- |
| `action` | optional; one Button (secondary or ghost) or a link that resolves the emptiness |

No events; the action in the slot emits its own.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| with action | `action` slot | icon, title, description, button | use the action |
| no action | no slot | icon, title, description | change something elsewhere (filters, search) |
| title only | only `title` | heading alone | — |

## Tokens

`text`, `text-muted`, `border`; `font-display`, `font-extrabold`, `text-h2`, `text-body`; `max-w-prose`; `rounded-full`; spacing 2, 4, 8, 16.

## Accessibility

- The title is a real heading (`h2` or `h3`) so it shows in the heading outline; choose the level from the page, not from looks.
- The icon is `aria-hidden`; the title carries the meaning.
- Not a live region. If it replaces results after a search, the search field should announce the count.

## Do and don't

- Do say what is empty and what to do: "No clubs match. Try a wider area or remove a filter."
- Do keep one action at most; two choices go in the page, not here.
- Don't blame the user or use jokes in the title.
- Don't use it to cover an error; a failed request must show ErrorState with retry.
