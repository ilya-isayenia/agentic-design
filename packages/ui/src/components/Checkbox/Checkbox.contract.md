# Checkbox

## Purpose

A single yes/no: consent, terms, newsletter. The label is the slot and may contain links.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `boolean` | `false` | |
| `name` | `string` | — | |
| `value` | `string` | — | submitted value |
| `required` | `boolean` | `false` | native `required`; `*` after the label, hidden from screen readers |
| `error` | `string` | — | `aria-invalid`, danger box border, alert icon + message under the label |
| `disabled` | `boolean` | `false` | |
| `id` | `string` | `useId()` | |

| Slot | Content |
| --- | --- |
| default | the label; may contain links |

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `boolean` | toggled |

| Exposed | |
| --- | --- |
| `focus()` | moves focus to the checkbox |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| unchecked | `false` | empty box, `border-strong` | check |
| checked | `true` | `accent` box with `on-accent` check mark | uncheck |
| focus | keyboard | `focus` ring around the box | Space |
| invalid | `error` | `danger` box border, alert icon, message | check it or read why it is needed |
| disabled | `disabled` | 60 % opacity | — |

## Tokens

`surface`, `accent`, `on-accent`, `border-strong`, `danger`, `text`, `focus`; `text-body`, `text-small`; radius `sm`; spacing 2–3, 6, 8.

## Accessibility

- The native input is the visible box (`appearance-none`), so focus, Space, clicks and form submission are native. Target 24 × 24 px (SC 2.5.8); the label adds to it.
- The check mark is shown only on `:checked`; the checked state is also the filled box, not colour alone.
- Name from `<label for>`; links inside the label stay separate tab stops.

## Do and don't

- Do write the label as a statement the person agrees to.
- Don't pre-check consent.
- Don't use a checkbox for an action that happens at once; use a switch or a button.
