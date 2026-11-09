# Radio

## Purpose

One option inside a RadioGroup. A native `<input type="radio">` nested in its label; the whole 48 px row is the target.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | — | |
| `label` | `string` | — | visible text; the slot replaces it |
| `disabled` | `boolean` | `false` | the group's `disabled` also applies |

| Slot | Content |
| --- | --- |
| default | label content when it needs markup |

No events of its own; selection goes to the group's `v-model`. Throws when used outside a RadioGroup.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| unchecked | other value | empty circle, `border-strong` | choose |
| checked | group value = `value` | `accent` ring and dot | choose another |
| focus | keyboard | `focus` ring around the circle | arrows |
| invalid | group `error` | `danger` circle border, `aria-invalid` | choose one |
| disabled | `disabled` | 60 % opacity, skipped by arrows | — |

## Tokens

`surface`, `accent`, `border-strong`, `danger`, `text`, `focus`; `text-body`; radius `full`; spacing 3, 6, 12.

## Accessibility

- Native radio, so arrow keys, Space and the group name come from the browser.
- Checked is shown by the dot (shape), not by colour alone.
- Row height 48 px; the circle is 24 px and aligned to the first line of a long label.

## Do and don't

- Do keep labels short and parallel.
- Don't put a Radio outside a RadioGroup.
