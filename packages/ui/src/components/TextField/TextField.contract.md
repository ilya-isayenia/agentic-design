# TextField

## Purpose

One line of text input with a visible label: names, email, phone, address, IBAN. The base for every text entry in the signup form.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | |
| `label` | `string` | — | required; always visible above the input |
| `type` | `'text' \| 'email' \| 'tel' \| 'password' \| 'url' \| 'search' \| 'date' \| 'number'` | `'text'` | |
| `name` | `string` | — | form field name |
| `required` | `boolean` | `false` | native `required`; a `*` after the label, hidden from screen readers |
| `hint` | `string` | — | under the label, linked with `aria-describedby` |
| `error` | `string` | — | sets `aria-invalid`, danger border, alert icon + message under the field, linked after the hint |
| `autocomplete` | `string` | — | always set it for personal data (SC 1.3.5) |
| `inputmode` | `'text' \| 'numeric' \| 'decimal' \| 'tel' \| 'email' \| 'url' \| 'search' \| 'none'` | — | |
| `placeholder` | `string` | — | an example only, never the label |
| `disabled` | `boolean` | `false` | |
| `readonly` | `boolean` | `false` | `surface-raised` background; for values filled in by the system (BIC from IBAN) |
| `id` | `string` | `useId()` | set it when an error summary links to the field |
| `maxlength` | `number` | — | |

| Slot | Content |
| --- | --- |
| `end` | inside the field on the right: a spinner while checking, a check icon when valid. Give icons a `label` if they carry meaning |

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `string` | each input |
| `blur` | `FocusEvent` | the input loses focus; validate here, not on every key |

| Exposed | |
| --- | --- |
| `focus()` | moves focus to the input; used by the error summary |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| empty | no value | `border-strong` border, placeholder in `text-muted` if given | type |
| filled | value | text in `text` | edit or move on |
| focus | keyboard or pointer | 2 px `focus` ring, offset 2 px | type |
| invalid | `error` | `danger` border, alert icon, "Error:" prefix for screen readers, message | fix the value; the message says how |
| checking | spinner in `end` | spinner on the right | wait or move on |
| readonly | `readonly` | `surface-raised` background, focusable | read; change the source field |
| disabled | `disabled` | 60 % opacity, not focusable | fix what blocks it |

## Tokens

`surface`, `surface-raised`, `text`, `text-muted`, `border-strong`, `danger`, `focus`; `font-text`, `text-body`, `text-small`; spacing 1–4, 12; motion `duration-fast`, `ease-standard`.

## Accessibility

- Name: the `<label for>`. Description: hint, then error, by `aria-describedby`.
- Error is icon + text + border, never colour alone (SC 1.4.1); `aria-invalid="true"` while it shows. The message is not a live region: the form's error summary announces errors on submit.
- Required: native `required` makes screen readers say "required"; the visual `*` is `aria-hidden` so it is not read twice. Put `novalidate` on the form so browser bubbles do not replace our messages.
- Height 48 px (SC 2.5.8 needs 24).
- `autocomplete` tokens on personal data (SC 1.3.5).

## Do and don't

- Do write errors as what to do: "Enter the full IBAN", not "Invalid".
- Do validate on blur and on submit, not on every key.
- Don't use the placeholder as the label or the hint.
- Don't hide the label; if the design has no room, the design changes.
