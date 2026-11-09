# PlanCard

## Purpose

A selectable card for a plan or membership type: title, perks, optional price and promo ribbon. Behaves as one radio inside a RadioGroup.

## API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | — | |
| `title` | `string` | — | the radio's name |
| `description` | `string` | — | one short line |
| `perks` | `string[]` | `[]` | each with a check icon |
| `price` | `{ amount: number; was?: number; period?: string; lead?: string }` | — | cents; rendered by Price; omit for membership types |
| `ribbon` | `string` | — | promo strip at the top |
| `disabled` | `boolean` | `false` | the group's `disabled` also applies |

No slots, no events of its own; selection goes to the group's `v-model`. Throws when used outside a RadioGroup. Put cards in a grid: the card fills the cell height and the price sits at the bottom.

## States

| State | Trigger | Feedback | Safe next action |
| --- | --- | --- | --- |
| default | not selected | `border-strong` border, empty circle top right | choose |
| hover | pointer over | `surface-raised` background | choose |
| focus | keyboard on the hidden radio | `focus` ring around the card | arrows |
| selected | group value = `value` | 2 px `accent` border and a filled check badge (shape, not colour only) | choose another or continue |
| promo | `ribbon` | `accent` strip with moving text; old price struck through | choose |
| invalid | group `error` | `danger` border | choose one |
| disabled | `disabled` | dashed `border`, `bg` background, muted title; text keeps AA contrast | read why in `description` |
| no price | no `price` | perks only | choose |
| long text | long title or perks | text wraps; card grows; grid rows align | — |

## Tokens

`surface`, `surface-raised`, `bg`, `text`, `text-muted`, `border`, `border-strong`, `accent`, `on-accent`, `danger`, `focus`; `font-display`, `text-h3`, `text-body`, `text-small`; radius `md`, `full`; spacing 1–4, 8; motion `duration-fast`, `ease-standard`, `animate-ticker`.

## Accessibility

- A native radio (`sr-only`) carries the semantics; arrow keys move between cards like any radio group.
- The `<label>` wraps only the title and stretches over the card with `::after`, so a click anywhere selects it. Wrapping the whole card in `<label>` is not used: Price renders a `<p>` and perks a `<ul>`, which are not allowed inside a label.
- Name: the title. Description, in this order: ribbon, price sentence, description, perks, group error.
- The ribbon text is read once (`sr-only`); the moving copies are `aria-hidden`. The ticker stops under `prefers-reduced-motion` and pauses on hover or focus inside the card (SC 2.2.2).
- Focus ring on the card through `has-focus-visible:`.

## Do and don't

- Do keep perks to 3–5 short lines; the same order on every card.
- Do say in `description` why a card is disabled.
- Don't put links or buttons inside the card: the stretched label covers them.
- Don't use the ribbon for anything but a promo.
