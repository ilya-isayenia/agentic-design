# Select

## Purpose

Choose one value from a known short list (home club, country, title). Native `<select>`, styled like TextField, so mobile pickers and keyboard behaviour come from the platform.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | `''` means nothing chosen |
| `label` | `string` | — | required; visible above |
| `options` | `{ value: string; label: string }[]` | — | |
| `placeholder` | `string` | — | disabled first option shown while the value is `''` |
| `name` | `string` | — | |
| `required` | `boolean` | `false` | native `required`; `*` hidden from screen readers |
| `hint` | `string` | — | linked with `aria-describedby` |
| `error` | `string` | — | `aria-invalid`, danger border, alert icon + message |
| `autocomplete` | `string` | — | e.g. `country` |
| `disabled` | `boolean` | `false` | |
| `id` | `string` | `useId()` | |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `string` | an option is chosen |
| `blur` | `FocusEvent` | the select loses focus |

| Exposed | |
| --- | --- |
| `focus()` | moves focus to the select |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| placeholder | value `''` | placeholder text in `text-muted` | open and choose |
| selected | value set | label in `text` | change or move on |
| focus | keyboard or pointer | `focus` ring | arrows, type-ahead, Enter |
| invalid | `error` | `danger` border, alert icon, message | choose a value |
| disabled | `disabled` | 60 % opacity | fix what blocks it |

## Tokens

`surface`, `text`, `text-muted`, `border-strong`, `danger`, `focus`; `font-text`, `text-body`, `text-small`; spacing 2–4, 12; motion `duration-fast`.

## Accessibility

- Native `combobox` role from `<select>`; name from `<label for>`; hint and error by `aria-describedby`.
- The chevron is decorative (`aria-hidden`, `pointer-events-none`).
- Height 48 px.

## Do and don't

- Do use it for 4–15 options; fewer → RadioGroup, more or searchable → a search field.
- Do give a placeholder that says the action: "Choose a club".
- Don't preselect a value the person did not choose when the choice matters for price.
