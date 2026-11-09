# Stepper

## Purpose

Pick a small whole number with − and + buttons, e.g. workouts per week or guest passes.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `number` | `0` | shown clamped to `min`–`max` |
| `label` | `string` | — | visible; names the group and the value |
| `min` | `number` | `0` | |
| `max` | `number` | `Infinity` | |
| `format` | `(n: number) => string` | `String` | e.g. `n => \`${n} workouts per week\`` |
| `decreaseLabel` | `string` | `'Decrease'` | button name |
| `increaseLabel` | `string` | `'Increase'` | button name |

No slots.

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `number` | the value changes; never emitted at a limit |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| in range | `min < value < max` | both buttons active | − or + |
| at min | `value = min` | − at 60 %, `aria-disabled` | + |
| at max | `value = max` | + at 60 %, `aria-disabled` | − |
| focus | keyboard on a button | `focus` ring | Enter, Space, ArrowUp, ArrowDown |

## Tokens

`surface`, `surface-raised`, `text`, `border-strong`, `focus`; `font-display`, `text-h3`, `text-small`; spacing 2, 4, 12; motion `duration-fast`, `ease-standard`.

## Accessibility

- `role="group"` named by the visible label. Buttons are 48 × 48 px with `aria-label`s; icons are decorative.
- The value is an `<output aria-live="polite">`, so each change is announced in the `format` text.
- A button at a limit gets `aria-disabled`, not `disabled`: if it were disabled while focused, focus would fall to `<body>`.
- ArrowUp and ArrowDown anywhere in the group change the value; the group itself is not a tab stop.

## Do and don't

- Do pass `format` so the value has its unit.
- Do keep the range small (under ~10 steps); for larger numbers use TextField with `inputmode="numeric"`.
- Don't hide the label.
