# StepIndicator

## Purpose

Shows where the user is in the 5-step signup and lets them go back to any finished step. It does not switch steps itself: it emits `go`, the app changes the step and moves focus to the new step's heading.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `steps` | `string[]` | — | labels in order, e.g. "Membership", "Access", "Duration", "Your details", "Verify" |
| `current` | `number` | — | 0-based index of the step on screen |
| `completed` | `number[]` | every index below `current` | pass it when the user went back and later steps are still finished |
| `label` | `string` | `'Signup progress'` | name of the `nav` landmark; change it only if a page has two indicators |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `go` | `number` (step index) | a finished step is activated; never for the current or an upcoming step |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| done | index in `completed`, not `current` | `success` ring with a check, label; a button; `success` connector after it | activate to go back and edit |
| current | `index === current` | filled `accent` circle with the number, bold label, `aria-current="step"` | finish the step on screen |
| upcoming | neither | `border-strong` ring with the number, muted label; not interactive | — |
| hover | pointer over a done step | label underlined | activate |
| focus | keyboard focus on a done step | global 2 px `focus` ring | Enter or Space |
| narrow (< md) | viewport below 48rem | circles only, labels visually hidden, a line "Step 2 of 5" + current label above; no connectors | same as above |

## Tokens

`success`, `accent`, `on-accent`, `border`, `border-strong`, `text`, `text-muted`; `font-display`, `text-small`, `text-caption`, `font-semibold`, `font-extrabold`; `rounded-full`, `rounded-sm`; spacing 2–12; breakpoint `md`.

## Accessibility

- `<nav aria-label="Signup progress">` around an `<ol>`, so the count and position are announced ("list, 5 items").
- Done steps are buttons with `aria-label="<label>, completed"`; the visible label is the start of the name (SC 2.5.3). An `aria-label` rather than a hidden span, because the flex layout makes browsers insert a space before the comma.
- The current step has `aria-current="step"`; upcoming steps are plain text, out of the tab order.
- Circles and connectors are `aria-hidden`; the status is in text, not only in colour (SC 1.4.1).
- On narrow screens the labels stay in the list as `sr-only` text; the summary line is `aria-hidden` to avoid reading it twice.
- Done-step targets are at least 48 × 48 px. Steps sit in equal columns with a 48 px minimum, so five steps need 240 px and fit a 375 px screen.
- Focus after `go`: the app moves it to the new step's heading; this component does not keep it.

## Do and don't

- Do keep labels short (one or two words); on `md` each sits under its circle in a fifth of the width and wraps by word.
- Do pass `completed` when going back, so steps after the current one stay reachable.
- Don't make upcoming steps clickable: the user has not given the data they need.
- Don't use it for more than about six steps; the narrow row would overflow.
