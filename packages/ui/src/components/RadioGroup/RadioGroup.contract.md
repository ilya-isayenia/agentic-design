# RadioGroup

## Purpose

One choice from a few options shown at once. Owns the value, the shared `name`, required and error; gives them to Radio and PlanCard children through `radioGroupKey` (`radioGroup.ts`).

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | — | selected value |
| `legend` | `string` | — | required; the question |
| `hideLegend` | `boolean` | `false` | legend for screen readers only, when a heading above already says it |
| `name` | `string` | `useId()` | |
| `required` | `boolean` | `false` | `required` on every radio; `*` after the legend, hidden from screen readers |
| `hint` | `string` | — | linked to the fieldset |
| `error` | `string` | — | message above the options; linked to the fieldset and every radio; radios get `aria-invalid` |
| `disabled` | `boolean` | `false` | native `fieldset disabled` |

| Slot | Content |
| --- | --- |
| default | Radio or PlanCard; wrap PlanCards in your own grid |

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `string` | a radio is chosen |

| Export | |
| --- | --- |
| `radioGroupKey` | `InjectionKey<RadioGroupContext>`: `name`, `selected`, `disabled`, `required`, `invalid`, `errorId`, `select(value)` |

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| none selected | no value | all options empty | choose one |
| selected | value | the chosen option filled | change |
| invalid | `error` | alert icon + message above options, `danger` borders | choose one |
| disabled | `disabled` | options at 60 % or dashed | — |

## Tokens

`text`, `text-muted`, `danger`; `text-small`; spacing 2.

## Accessibility

- `<fieldset>` + `<legend>` gives the group its name; hint and error by `aria-describedby` on the fieldset and on each radio (some screen readers skip the fieldset description).
- Arrow keys move and select between same-name native radios; Tab enters at the selected one.
- The error sits above the options so it is read before them.

## Do and don't

- Do use 2–6 options; more → Select.
- Do keep the legend as a question or a short noun phrase.
- Don't use a RadioGroup for options that can be combined; use Checkboxes.
