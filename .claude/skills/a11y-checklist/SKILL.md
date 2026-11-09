---
name: a11y-checklist
description: WCAG 2.2 AA checklist for this repository — what the automated checks already catch, what a person must still check, and the keyboard contract of every component. Load when building or changing a component or screen, writing a state table, prototyping, or auditing accessibility in a review.
---

# Accessibility checklist (WCAG 2.2 AA)

The target is WCAG 2.2 Level AA, nothing more and nothing less: AAA criteria (2.4.13 Focus Appearance, 2.3.3 Animation from Interactions) are not requirements here, though some of our own rules go further. SC 4.1.1 Parsing was removed in 2.2; do not cite it. Token and colour rules: `.claude/skills/ds-rules/`.

## What automation catches, and what it does not

| Check | Runs | Catches | Misses |
| --- | --- | --- | --- |
| axe in Storybook (`a11y.test: 'error'`) | every story; every Matrix story (6 themes) | missing names and labels, ARIA misuse, duplicate ids, nested interactive elements, text contrast as rendered, list and landmark structure | focus order and visibility, keyboard operability, announcements, reflow, motion, forced colours, meaning |
| `eslint-plugin-vuejs-accessibility` | `pnpm lint` | `alt` text, form controls without labels, click without key handler, positive `tabindex`, `autofocus`, static elements with handlers | anything decided at runtime |
| `pnpm contrast` | every token pair × 6 themes | 1.4.3 (4.5:1) and 1.4.11 (3:1) for the pairs in `tools/contrast/index.mjs` | text on images, `text-accent` misuse, pairs not listed |
| story `play` tests, Vitest, Playwright | `pnpm test:*` | keyboard behaviour and focus moves that someone wrote a test for | everything else |

Automation finds a minority of real problems. A person (or the a11y-auditor) checks the rest: a keyboard-only pass through the whole flow; VoiceOver with Safari and NVDA with Firefox or Chrome; 320 px width and 200 % zoom; a text-spacing override; forced colours (Chrome DevTools → Rendering → emulate `forced-colors: active`); `prefers-reduced-motion: reduce`.

## Keyboard and focus

- [ ] Everything works with the keyboard alone (2.1.1 Keyboard). No `div` or `span` with a click handler: use `<button>` or `<a href>`.
- [ ] Tab order follows the visual order (2.4.3 Focus Order); no positive `tabindex`.
- [ ] Focus is always visible (2.4.7 Focus Visible): the global `:focus-visible` outline or `focus-ring`; a card with a hidden input shows it with `has-focus-visible:focus-ring`.
- [ ] The focused element is never fully hidden by the sticky receipt bar or a banner (2.4.11 Focus Not Obscured (Minimum)). Give the scroll container `scroll-padding` equal to the sticky height, or do not stick below `lg`.
- [ ] On a step change, focus moves to the new step's `<h1>` (`tabindex="-1"`), and `document.title` names the step (2.4.2 Page Titled). On first load, focus is not moved.
- [ ] No keyboard trap (2.1.2 No Keyboard Trap). We have no modal; if one is added, focus stays inside, Escape closes it and focus returns to its trigger.
- [ ] A skip link to `<main>` is the first tab stop on screens with a header (2.4.1 Bypass Blocks).
- [ ] Removing or disabling the focused element never drops focus to `<body>`: use `aria-disabled` while loading or at a limit, and move focus to a named next element after a dismiss.
- [ ] Nothing changes context on focus or on input alone (3.2.1 On Focus, 3.2.2 On Input): choosing a plan does not advance the step; Continue does.
- [ ] No single-key shortcuts (2.1.4 Character Key Shortcuts); no drag-only interaction (2.5.7 Dragging Movements); no path or multi-finger gestures (2.5.1 Pointer Gestures); actions fire on up-event (2.5.2 Pointer Cancellation — native buttons do).

## Names, roles, states

- [ ] Native elements first; ARIA only where HTML has no element (4.1.2 Name, Role, Value).
- [ ] Every control has a name; icon-only controls use IconButton with `label`; the icon is `aria-hidden`.
- [ ] The visible label is the start of the accessible name (2.5.3 Label in Name): "Details, completed" for a done step labelled "Details".
- [ ] State is exposed, not only drawn: `aria-current="step"`, `aria-expanded`, `aria-invalid`, `aria-busy`, `checked`.
- [ ] Structure is in markup (1.3.1 Info and Relationships): headings, lists, `fieldset` + `legend` for radio groups, `<nav aria-label>` for the step indicator; landmarks `header`, `main`, `aside` (receipt).
- [ ] Reading order in the DOM matches the visual order at every breakpoint (1.3.2 Meaningful Sequence).
- [ ] `<html lang="en">` (3.1.1 Language of Page); headings and labels describe their content (2.4.6 Headings and Labels); link text makes sense with its context (2.4.4 Link Purpose (In Context)).
- [ ] Decorative images and SVGs are `aria-hidden`; the club photo placeholder is decorative; a meaningful image has `alt` (1.1.1 Non-text Content).

## Forms

- [ ] Every field has a visible `<label>` (3.3.2 Labels or Instructions); placeholders are never the label. Format hints sit in the hint text, linked by `aria-describedby`.
- [ ] Required fields: native `required` plus a visible marker explained once above the form; the `*` is `aria-hidden`.
- [ ] An error names the field and the fix (3.3.1 Error Identification, 3.3.3 Error Suggestion): "Enter a date of birth like 31 12 1990", not "Invalid". The field gets `aria-invalid="true"` and `aria-describedby` points at the message; an icon goes with the colour.
- [ ] On submit with errors, an error summary at the top takes focus and lists every error as a link that focuses its field.
- [ ] Personal fields carry `autocomplete` tokens (1.3.5 Identify Input Purpose): `given-name`, `family-name`, `bday`, `email`, `tel`, `street-address` or `address-line1`, `postal-code`, `address-level2`, `country-name`. IBAN has no token; leave it out rather than invent one.
- [ ] Nothing entered earlier in the flow is asked again (3.3.7 Redundant Entry): the club from the finder, the plan from step 2; going back through the step indicator keeps every value.
- [ ] SMS code: one `<input autocomplete="one-time-code" inputmode="numeric">`, paste allowed, no split boxes that block paste; no CAPTCHA or puzzle of any kind (3.3.8 Accessible Authentication (Minimum)).
- [ ] The code expiry is a time limit (2.2.1 Timing Adjustable): "Send a new code" extends it, and the remaining time is stated in text.
- [ ] Before the signup is submitted, the receipt shows what will be charged and the user can go back and change it (3.3.4 Error Prevention (Legal, Financial, Data)).
- [ ] If a help link or contact is shown on several steps, it is in the same place on each (3.2.6 Consistent Help).

## Announcements

- [ ] Status changes that do not move focus are announced (4.1.3 Status Messages): new total in the receipt, "Code sent", "Applied", stepper value.
- [ ] `polite` (`role="status"`, `<output>`) for results and confirmations; `assertive` (`role="alert"`) only for errors that block the user. Never both for one message.
- [ ] The live region is in the DOM before its text changes; mount the container once, then change its content.
- [ ] Countdowns are not live regions. The ticking digits are `aria-hidden`; a visually hidden sentence at minute level carries the time; announce only meaningful moments ("Code expired").
- [ ] Loading: `aria-busy` on the region; announce the result, not the spinner.

## Contrast and colour

- [ ] Meaning is never colour alone (1.4.1 Use of Color): error = icon + text; selected plan = check icon + border; done step = check + "completed" in the name.
- [ ] Text 4.5:1 (1.4.3 Contrast (Minimum)) in all 6 themes, including text on the club photo placeholder and on promo fills; disabled controls are exempt, but say why they are disabled.
- [ ] Boundaries a user must find, focus ring, selected border, meaningful icons 3:1 (1.4.11 Non-text Contrast) in all 6 themes.
- [ ] A new colour pair is added to `tools/contrast/index.mjs`, not checked by eye.

## Resize, reflow, spacing

- [ ] Text zooms to 200 % without loss (1.4.4 Resize Text): sizes are rem; no fixed `h-*` on text containers.
- [ ] At 320 CSS px wide (= 1280 px at 400 %) nothing needs horizontal scrolling and nothing is cut off (1.4.10 Reflow); the receipt stacks below the steps; the step indicator fits.
- [ ] With line height 1.5, paragraph spacing 2×, letter spacing 0.12 em and word spacing 0.16 em applied, no text is clipped or overlaps (1.4.12 Text Spacing).
- [ ] Works in portrait and landscape (1.3.4 Orientation).
- [ ] Content shown on hover or focus can be dismissed with Escape, hovered and stays until dismissed (1.4.13 Content on Hover or Focus).

## Motion and timing

- [ ] `prefers-reduced-motion: reduce` gives a still version: the promo ribbon stops and shows its text once; toasts appear without movement.
- [ ] Moving or auto-updating content that starts by itself, lasts over 5 s and sits beside other content can be paused, stopped or hidden (2.2.2 Pause, Stop, Hide). The PlanCard ribbon pauses on hover and focus; the Banner countdown is hidden by dismissing it. A non-dismissible banner with ticking digits fails this; the auditor judges whether a hover-only pause is enough.
- [ ] Toasts pause their timer on hover and focus (2.2.1 Timing Adjustable).
- [ ] Nothing flashes more than three times a second (2.3.1 Three Flashes or Below Threshold).

## Forced colours

Windows contrast themes replace our colours with system colours (`forced-colors: active`). Backgrounds and box shadows disappear; text, borders and outlines stay.

- [ ] State is shown by borders, outlines, icons or text, never by background alone: selected = border + check icon; current step = border + `aria-current`.
- [ ] Focus is an `outline` (ours is), never a `box-shadow` only.
- [ ] SVG icons use `currentColor` for `fill`/`stroke` (Icon does), so they follow the system text colour.
- [ ] A visually hidden radio or checkbox still shows its state through a drawn border or icon, and the focus ring is drawn on the card.
- [ ] Use the `forced-colors:` variant with existing classes if a state is lost; never `forced-color-adjust: none` on whole components.

## Target size

- [ ] Every pointer target is at least 24 × 24 CSS px or has 24 px of spacing around it (2.5.8 Target Size (Minimum)). Ours: 48 px (`min-h-12`, `size-12`) for touch actions; `sm` (32 px) only in dense controls; inline text links are exempt.

## Keyboard contract per component

| Component | Tab stop | Keys | Focus and announcements |
| --- | --- | --- | --- |
| Button | yes | Enter, Space | loading: `aria-disabled` + `aria-busy`, stays focusable |
| IconButton | yes | Enter, Space | name from `label`; `sm` 32 px, `md` 48 px |
| TextField | the input | typing | `aria-describedby` hint + error; `focus()` exposed for the error summary |
| Select | the native `<select>` | Arrows, Alt+Down/Space opens (per platform), typeahead | native only; no custom listbox |
| Checkbox | the input | Space toggles | error linked by `aria-describedby` |
| RadioGroup / Radio | one stop for the group (checked, else first) | Arrows move and select; Tab leaves | `fieldset` + `legend`; error on the group |
| PlanCard | the hidden radio | as Radio; click anywhere on the card selects | ring on the card; ribbon text read once from a hidden span, ticker `aria-hidden`; ribbon pauses on focus |
| Stepper | the − and + buttons | Enter, Space; ArrowUp/ArrowDown on either button | value in a polite `<output>`; at a limit `aria-disabled`, focus stays |
| StepIndicator | done steps only | Enter, Space go back | `nav` + `ol`; `aria-current="step"`; the app then focuses the step `<h1>` |
| ClubCard | its actions, not the card | Enter on each action | heading names the club; no clickable card wrapping other controls; photo `aria-hidden` |
| Receipt disclosure | the toggle button | Enter, Space | `aria-expanded` + `aria-controls`; focus stays on the toggle; total change announced politely |
| Banner | link, then close | Enter; Enter/Space on close | digits `aria-hidden`; after close, focus moves to the next landmark or heading, never `body` |
| Toast | the close button only | Enter, Space on close | `role="status"` (info, success) or `role="alert"` (danger); never takes focus; timer pauses on hover and focus |

## Vue patterns

Label, hint and error wired with `useId`, and a `focus()` for the error summary:

```vue
<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';
const props = defineProps<{ label: string; hint?: string; error?: string; autocomplete?: string }>();
const id = useId();
const describedBy = computed(
  () => [props.hint && `${id}-hint`, props.error && `${id}-error`].filter(Boolean).join(' ') || undefined,
);
const input = useTemplateRef<HTMLInputElement>('input');
defineExpose({ focus: () => input.value?.focus() });
</script>
<template>
  <label :for="id">{{ label }}</label>
  <p v-if="hint" :id="`${id}-hint`">{{ hint }}</p>
  <input :id="id" ref="input" :autocomplete="autocomplete" :aria-invalid="error ? 'true' : undefined" :aria-describedby="describedBy" />
  <p v-if="error" :id="`${id}-error`"><Icon name="alert" /> {{ error }}</p>
</template>
```

Focus to the step heading after navigation (not on first load):

```ts
const heading = useTemplateRef<HTMLHeadingElement>('heading'); // <h1 ref="heading" tabindex="-1">
// No `immediate`: the watcher skips the first render, so first load keeps focus where the browser put it.
watch(() => route.params.step, async () => {
  await nextTick();
  heading.value?.focus();
});
```

An announcement region that exists before it changes:

```vue
<output class="sr-only" aria-live="polite" aria-atomic="true">{{ totalSentence }}</output>
```
