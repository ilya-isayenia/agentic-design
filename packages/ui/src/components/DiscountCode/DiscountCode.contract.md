# DiscountCode

## Purpose

A field for one discount code with Apply beside it, and the polite status region for every result. It goes in Receipt's `footer`, above the referral field. It renders TextField with Apply in TextField's `action` slot and has no input markup of its own. It shows no applied state: the applied code, its summary and Remove live on the discount line (DiscountApplied in ReceiptLine's `below` slot). It handles layout, focus and announcements only; the app checks the code and passes the result back in.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | the text in the field |
| `status` | `'idle' \| 'applying'` | `'idle'` | `applying` puts Apply in its loading state (`aria-busy`, `aria-disabled`, stays focusable); the field stays as it is |
| `error` | `string` | — | message under the field row; passed to TextField `error` (alert icon, `aria-invalid`, `aria-describedby`); shown with or without an applied code. The app writes the whole message, including "{applied} is still in your total." |
| `announcement` | `string` | `''` | text of the polite status region; the app sets it after each result, including errors and a Remove on the discount line, and empties it when a check starts |
| `label` | `string` | `'Discount code (optional)'` | |
| `hint` | `string` | — | e.g. "One code at a time. We take it off your first 4 weeks." |

| Slot | Content |
| --- | --- |
| none | |

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `string` | each input |
| `apply` | `code: string` (trimmed, upper-cased) | Apply or Enter with a non-blank value while not `applying`, with or without an applied code; the app decides whether it replaces the applied one |

| Exposed | |
| --- | --- |
| `focus()` | focuses the input; the app calls it after Remove on the discount line |

Types: `DiscountCodeStatus`.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| idle | no `error`, `status` idle | label, hint, field, Apply on the same row; Apply is already as wide as while applying | type a code, or ignore the field |
| empty submit | Apply or Enter with an empty or blank field | "Enter a code to apply it." under the field with the alert icon, announced politely; no `apply` event | type a code |
| applying | `status="applying"` | Apply shows its spinner with `aria-busy="true"` and keeps focus; Apply keeps its size and place, so nothing on the row or below it moves; the field keeps its text; a second press does nothing; nothing is announced | wait; editing the field lets the app drop the pending check |
| applied | the app empties the field and sets `announcement` | emptied field and Apply, ready for another code; the announcement in the status region; focus stays where it was | continue, or apply another code |
| invalid | `error` with the unknown-code message | message with the alert icon, `aria-invalid`, described by the message, announced | fix the code and Apply again |
| expired | `error` with the expired message | as invalid | try another code |
| not eligible | `error` with the not-eligible message | as invalid | change the plan or try another code |
| no longer applies | `error` with the no-longer-applies message, the code back in the field | as invalid | change the plan back and Apply, or leave it |
| network error | `error` with the retry message | as invalid; the code stays in the field | press Apply again: the same code is sent |
| kept on error | `error` ending with "{applied} is still in your total." | as invalid; the discount line elsewhere is unchanged | fix the new code, or Remove on the discount line |
| focus | keyboard focus on the input or Apply | global 2 px `focus` ring | type, Enter, Space |

## Tokens

`danger`, `text`, `text-muted`, `border-strong` through TextField; `font-text`, `text-body`, `text-small`; spacing 1–4; motion `duration-fast`, `ease-standard` only through Button and TextField. Reuses TextField (with the `action` slot), Button (Apply `secondary`, md) and Icon (`alert`, through TextField's error). Apply's width comes from a hidden copy of Apply in its loading state in the same grid cell (`invisible`, `aria-hidden`, `inert`), because Button grows by its spinner while loading; no length is set.

## Accessibility

- The input is named by its visible label and described by the hint, then the error. Apply is a native `button type="submit"` named "Apply", outside the input's name and description.
- Tab order: field, then Apply. Enter in the field applies, the same as Apply.
- While applying, Apply keeps focus (`aria-disabled`, not `disabled`), so focus never drops to `body`.
- One polite `role="status"` region, mounted from the first render and never removed. It carries `announcement`, or this component's own empty-submit message. A repeated empty submit is announced again. The field error itself is not live (TextField's rule), so each result is heard once.
- No `role="alert"`: the code is optional, so nothing blocks the user.
- Errors are icon and words with the `danger` border, never colour alone (SC 1.4.1).
- Apply is md (48 px). At narrow widths Apply wraps under the field instead of overflowing (SC 1.4.10). Idle and applying wrap at the same width, so starting a check never moves Apply or the content below it: in the app's receipt at 375 px (a 291 px row) Apply stays beside the field in both; at 320 px (a 236 px row) it sits under the field in both.
- The hidden sizing copy of Apply is `invisible`, `aria-hidden` and `inert`: it is not in the tab order or the accessibility tree, so there is one Apply for assistive technology.

## Do and don't

- Do put it in Receipt's `footer`, above the referral field, and only once the receipt has a total.
- Do set `announcement` for every result, including errors and a Remove on the discount line, so the new total is heard once and from one place.
- Do empty `announcement` when a check starts, so the same message twice in a row is announced twice.
- Don't nest it in another `<form>`; its root is a form.
- Don't show the applied code here; it belongs on the discount line (DiscountApplied).
- Don't make Apply primary; the step's Continue is the screen's one primary action.
