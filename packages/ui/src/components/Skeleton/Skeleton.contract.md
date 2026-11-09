# Skeleton

## Purpose

A placeholder in the shape of content that is still loading (plan cards, club list, receipt). Use it when the layout is known; use a Spinner inside a Button for a submit in progress.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'text' \| 'rect' \| 'circle'` | `'text'` | text = lines; rect = fills its container, at least 64 px tall; circle = 48 px |
| `lines` | `number` | `3` | for `text`; at least 1; the last of several lines is two thirds wide |
| `label` | `string` | — | what is loading; when given, one visually hidden `role="status"` reads "Loading {label}" |

No slots, no events.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| loading | rendered | shapes pulse in `border` colour | wait |
| loading, reduced motion | `prefers-reduced-motion: reduce` | static shapes, no pulse | wait |
| labelled | `label` set | screen readers hear "Loading {label}" once | wait |

The consumer replaces the skeleton with content; there is no "done" state inside.

## Tokens

`border` (fill); `rounded-sm` (lines), `rounded-md` (rect), `rounded-full` (circle); spacing 2, 4, 12, 16; `animate-pulse`.

`border` is used instead of `surface-raised`: in lumen light `surface-raised` and `bg` are both white, so a `surface-raised` skeleton disappears on the page.

## Accessibility

- Shapes are always `aria-hidden`; they mean nothing to a screen reader.
- Label one skeleton per loading region, not each one, so the status is read once. When the content arrives, the consumer moves focus or announces only if the user asked for it.
- `animate-pulse` stops under `prefers-reduced-motion` (`motion-reduce:animate-none`, plus the global reduced-motion rule).
- Set `aria-busy="true"` on the region being loaded if it already holds content.

## Do and don't

- Do match the real layout (same number of cards, similar line count) so nothing jumps when content arrives.
- Do show it only after about 300 ms, so fast loads do not flash.
- Don't use it for content that failed; use ErrorState.
- Don't put text inside a skeleton shape.
