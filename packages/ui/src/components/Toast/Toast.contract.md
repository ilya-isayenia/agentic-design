# Toast

## Purpose

A short message after an action that does not need an answer: saved, copied, sent, failed. It closes itself. Anything the user must act on goes in the page (ErrorState, a field error), not in a toast.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `message` | `string` | — | required; one sentence |
| `tone` | `'info' \| 'success' \| 'danger'` | `'info'` | icon `info` / `check-circle` / `alert`, each with a spoken name ("Info", "Success", "Error") |
| `duration` | `number` | `5000` | ms before it closes itself; `0` keeps it until closed |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `close` | — | after the leave transition, whether the timer ran out or the close button was used; the consumer removes the toast from its list |

Positioning, stacking and the toast list belong to the consumer.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| info | `tone="info"` | `info` icon, `border-strong` border | read; close or wait |
| success | `tone="success"` | `check-circle` icon and border in `success` | read; close or wait |
| danger | `tone="danger"` | `alert` icon and border in `danger`; `role="alert"` | read; fix in the page |
| paused | pointer over it or focus inside it | timer stops and resumes with the time left | read at own pace |
| persistent | `duration` 0 | never closes itself | close |
| leaving | timer ran out or close button | fades out (`duration-fast`), then `close` | — |

## Tokens

`surface-raised`, `text`, `border-strong`, `success`, `danger`, `focus`; `text-body`; `rounded-md`; spacing 2, 3, 4, 8; motion `duration-base` (enter), `duration-fast` (leave), `ease-standard`.

## Accessibility

- `role="status"` (polite) for info and success, `role="alert"` (assertive) for danger.
- The tone is in the icon shape and its spoken name, not only in colour.
- The timer pauses on hover and on focus inside (WCAG 2.2.1 Timing Adjustable). Keep `duration` at 5000 or more for messages longer than a few words, or use 0.
- The close button is an IconButton `sm` (32 px) labelled "Close notification"; it is the only focusable element.
- Enter rises 8 px and fades in; with reduced motion there is no movement and no transition.
- Screen readers announce a live region reliably only when it exists before its content changes. Render toasts inside a container that is already on the page, not in a freshly mounted portal.

## Do and don't

- Do say what happened in plain words: "Your plan is saved", "Payment did not go through".
- Do keep danger toasts for failures the user may not see otherwise; show the fix in the page too.
- Don't put links or buttons other than close in a toast; a message that needs an action is not a toast.
- Don't stack more than three at once.
