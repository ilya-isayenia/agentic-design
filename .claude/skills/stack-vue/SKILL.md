---
name: stack-vue
description: The Vue 3.5 + TypeScript stack profile of this repository — component API conventions, file layout, Storybook story and Vitest test patterns, Tailwind usage in templates, and the Vue review checks. Load when writing or reviewing Vue components, composables, stories or tests here.
---

# stack-vue — the Vue profile

The only place in the repository that knows the framework. Tokens, DS rules, the accessibility checklist and the change cycle are stack-free; this file says how they turn into Vue code.

Stack: Vue 3.5 (`<script setup lang="ts">`), TypeScript strict with `noUncheckedIndexedAccess`, Tailwind v4 with a reset theme (only token classes exist), Storybook 10 for Vue (`@storybook/vue3-vite`, addon-a11y as error), Vitest 5 (projects `unit` in jsdom and `storybook` in Chromium), Playwright for e2e and visual tests. No Pinia, no router-level state library.

## Commands

| Goal | Command |
| --- | --- |
| unit tests for one path | `pnpm exec vitest run --project unit <path>` |
| story play functions and axe for one path | `pnpm exec vitest run --project storybook <path>` (run `pnpm tokens` first if `packages/tokens/build/` is missing) |
| lint (Vue, vuejs-accessibility, `ds/no-raw-values`) | `pnpm exec eslint <path>` |
| types | `pnpm typecheck` |
| everything | `pnpm check` |

## File layout

| Path | What |
| --- | --- |
| `packages/ui/src/components/<Name>/<Name>.vue` | the component, PascalCase name, one per folder |
| `.../<Name>/<Name>.contract.md` | purpose, API tables (props, slots, events, exposed), states, tokens, accessibility, do and don't |
| `.../<Name>/<Name>.stories.ts` | a story per contract state plus `Matrix` |
| `.../<Name>/<Name>.test.ts` | Vitest unit tests |
| `.../<Name>/<name>.ts` | optional: the InjectionKey and context type of a group (`radioGroup.ts`) |
| `packages/ui/src/index.ts` | every public component as a named default re-export, plus its public types |
| `packages/ui/src/storybook/` | `ThemeMatrix.vue`, `StateLabel.vue` — story helpers, never exported |
| `apps/web/src/composables/use<Name>.ts` | app state and behaviour shared between screens |
| `apps/web/src/lib/` | pure functions with their own `.test.ts` (pricing, validation, api stub) |
| `apps/web/src/data/` | visibly fake mock data |
| `**/explorations/` | prototype variants; never imported by production code; deleted at integrate |

Screens import the design system as `@agentic/ui`, app code as `@web/...`. Components never import from `apps/`.

## Component API

```vue
<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';

export type FieldSize = 'md' | 'lg';

const model = defineModel<string>({ default: '' });
const props = withDefaults(
  defineProps<{
    /** Visible label. Required. */
    label: string;
    size?: FieldSize;
    error?: string;
  }>(),
  { size: 'md' },
);
const emit = defineEmits<{ blur: [event: FocusEvent] }>();
defineSlots<{ end?(): unknown }>();

const id = useId();
const errorId = `${id}-error`;
const input = useTemplateRef<HTMLInputElement>('input');
defineExpose({ focus: () => input.value?.focus() });
</script>
```

- **Script.** Always `<script setup lang="ts">`. No Options API, no mixins, no `this`.
- **Props.** Type-based `defineProps<{...}>()`, wrapped in `withDefaults` when any default exists. Keep `const props = ...` and read `props.x`; do not destructure props. Union string literals for variants, exported as types (`ButtonVariant`). A JSDoc line on every prop whose meaning is not obvious from its name. Booleans default to `false` (absent).
- **Emits.** Tuple form `defineEmits<{ select: [value: string] }>()`. Every emitted event is declared. Event names camelCase, as in the contract table. Do not re-emit native events the root already fires unless the contract lists them.
- **v-model.** `defineModel<T>()` (or `defineModel<T>('name')` for a named model). Never a hand-written `modelValue` prop plus `update:modelValue` emit. The contract lists it as a `v-model` row and an `update:modelValue` event.
- **Ids.** `useId()` for every id that links elements (`for`, `aria-describedby`, `aria-labelledby`, `aria-controls`). An optional `id` prop may override it, for links from an error summary. Never `Math.random()` or counters.
- **Exposed.** Fields expose exactly `defineExpose({ focus })` so screens can move focus to the first invalid field. Nothing else is exposed unless the contract has an `Exposed` row.
- **Template refs.** `useTemplateRef<T>('name')`, not a same-named `ref`; no `document.querySelector`.
- **Slots.** Typed with `defineSlots`; optional (`name?()`) unless the contract marks the slot required. Check presence with the returned slots object, not `$slots` strings.
- **Attributes (`inheritAttrs`).** Default inheritance when the root element is the interactive element (Button, IconButton, Chip): `aria-*`, `data-*` and listeners land on it. When the root is a wrapper and the native control is inside (TextField, Select, Checkbox), set `defineOptions({ inheritAttrs: false })` and bind `useAttrs()` to the control, so `aria-*`, `autocomplete` and `data-testid` reach the element they describe. Never forward `class` to restyle a component; a new look is a new variant in the contract.
- **Groups.** Parent and children talk through `provide`/`inject` with a typed `InjectionKey<Context>` exported from `<name>.ts`. The context holds `ComputedRef`s plus updater functions; the provider owns mutation. A child used outside its group throws a clear error (`inject(key)` returns `undefined` → `throw new Error('Radio must be inside RadioGroup')`).
- **Size.** Over ~200 lines of template + script means a sub-component or a composable is missing.

## Composables and shared state

- No Pinia. App state lives in composables in `apps/web/src/composables/`; module-level refs are the shared store, and the composable returns them (`useSignup()`, `useTheme()`).
- Name `useXxx`. Accept `MaybeRefOrGetter<T>` and read with `toValue()`, so callers pass a ref, a getter or a value.
- Return refs (or `toRefs(reactive(...))`) so callers can destructure without losing reactivity. Expose readonly state plus explicit actions where callers must not write directly.
- A composable that uses lifecycle hooks or `inject` is called synchronously in `setup`, never inside a callback or after an `await`.
- Every timer, listener, observer or interval started in a component or composable is cleared in `onUnmounted` (or the `onWatcherCleanup` / `watch` cleanup callback).
- Time-dependent components take a `now` prop (or a clock argument) so stories and tests are deterministic.

## Templates and Tailwind

- Classes: a static string for the base, computed maps for variants, conditionals in an array:
  `:class="['inline-flex border-2', variantClass, block && 'w-full', inert && 'opacity-60']"`
  with `const variantClass = computed(() => ({ primary: 'bg-accent text-on-accent', ghost: 'bg-transparent text-text' })[props.variant])`.
- Write full class names literally. Tailwind scans source text, so `` `bg-${tone}` `` produces no CSS.
- Only theme classes: semantic colours (`bg-surface`, `text-text-muted`, `border-danger`), the type scale (`text-body`, `text-h2`), the spacing scale (`p-4`, `gap-2`; values in `docs/ds/spacing.md`), `duration-fast`, `ease-standard`. No arbitrary values (`w-[13px]`), no inline `style` with lengths or colours, no default palette (`bg-blue-500` does not exist). `ds/no-raw-values` enforces this.
- Focus: rely on the global `:focus-visible` ring or the `focus-ring` utility; never `outline-none` without a replacement.
- Motion: `transition-*` with motion tokens; add `motion-reduce:` variants where the reduced version must look different.
- Native elements first: `button`, `a href`, `input`, `fieldset`/`legend`, `label for`. A `div` with a click handler is a bug.
- ARIA booleans bound as `:aria-invalid="error ? 'true' : undefined"`; `undefined` removes the attribute, `false` renders `aria-invalid="false"`.
- Decorative icons `aria-hidden="true"`; visual-only parts `aria-hidden` with one `sr-only` sentence carrying the meaning (see Price).
- No `v-html`.

## Stories

Model: `Button.stories.ts`, `TextField.stories.ts`.

- CSF3. `const meta = { title: 'Components/<Name>', component: X, args: {...} } satisfies Meta<typeof X>;` then `export default meta; type Story = StoryObj<typeof meta>;`. Screens use `title: 'Screens/<Name>'`.
- **A story per contract state** (every row of the States table, named after it) and per variant that changes layout. Story names are what the evidence record cites (`components-button--loading`).
- **Event args** are spies: `args: { onClick: fn() }`. For v-model, render with a local `ref` from `args.modelValue` and `v-model`, as in TextField.
- **Play functions** for behaviour: `import { expect, fn, userEvent, waitFor } from 'storybook/test'`; `play: async ({ canvas, args }) => { ... }`. Query by role and name (`canvas.getByRole('button', { name: 'Join now' })`), which also checks the accessible name.
- **Keyboard in play** for every interactive component: `userEvent.tab()` reaches it, `userEvent.keyboard('{Enter}')` / `'{ }'` / `'{ArrowDown}'` / `'{Escape}'` act, and `expect(element).toHaveFocus()` checks where focus went.
- **Matrix story**, required for every component: `parameters: { layout: 'fullscreen' }`, `render` with `ThemeMatrix` (all brands × modes in one canvas) and one `StateLabel` per state. Axe and the visual tests run on it.
- **Deterministic.** Fixed dates via a `now` prop, fixed fake data, no `Math.random`, no network. Wait with `waitFor` / `findBy*`, not fixed sleeps.
- Copy is invented and English; data is visibly fake (`Testy McTest`, `NL00TEST0123456789`).

## Tests

Model: `Button.test.ts`, `Banner.test.ts`.

- Unit project (jsdom) for logic: `import { describe, expect, it, vi } from 'vitest'; import { mount } from '@vue/test-utils';`.
- Test the public interface: props in, rendered output, ARIA attributes, emitted events, slots, exposed methods. Never assert private refs or internal functions; no snapshot-only tests.
- `await` every `trigger`, `setValue` and `setProps`; `await nextTick()` after state changes, `await flushPromises()` after resolved promises.
- v-model: `mount(X, { props: { modelValue: 'a', 'onUpdate:modelValue': (v) => wrapper.setProps({ modelValue: v }) } })`, then assert `wrapper.emitted('update:modelValue')`.
- Injected children: mount through the real parent, or pass `global: { provide: { [key as symbol]: context } }`.
- Composables: reactivity-only ones are called directly; ones with lifecycle hooks or `inject` run inside a small host component.
- Timers: `vi.useFakeTimers()`, `vi.setSystemTime()`, `await vi.advanceTimersByTimeAsync(ms)`; after `wrapper.unmount()` assert `vi.getTimerCount()` is 0. Restore with `vi.useRealTimers()` in `afterEach`.
- Focus tests: `mount(X, { attachTo: document.body })` and `wrapper.unmount()` at the end.
- Keyboard and real focus order belong in story play functions (Chromium), full flows in `tests/e2e/`.

## Review checks

What the code-reviewer applies to Vue files, on top of contracts, AGENTS.md and ds-rules. Each line is a finding when the diff introduces it.

**Reactivity**
- Destructured `defineProps` or `reactive()`: a destructured prop passed to a composable or `watch` without a getter, or a value read once in `setup` and stored, loses reactivity. Use `props.x`, `() => props.x` or `toRef(props, 'x')`.
- `watch` used to derive state that a `computed` would give; a `watch` that writes a ref other code also writes.
- `watch(() => someRef)` instead of `watch(someRef)` or `() => someRef.value`; a `computed` with side effects; `v-model` on a computed without a setter.
- Replacing a `reactive()` object instead of mutating it.

**Lifecycle and cleanup**
- `setTimeout`, `setInterval`, `addEventListener`, observers or subscriptions without cleanup in `onUnmounted` or a watcher cleanup.
- Side effects at module scope of a component; lifecycle composables called conditionally or after `await`.

**Template**
- `v-if` and `v-for` on the same element; `v-for` without `:key` or keyed by index on a list that can reorder.
- Mutating a prop or an injected value outside the provider's updater.
- An emitted event missing from `defineEmits`; `$emit` with a string in the template.
- `v-html`; `:href` from data without a scheme check.
- `v-bind="$attrs"` without `inheritAttrs: false`, or a wrapper component whose `aria-*` attrs land on the wrapper instead of the control.

**Types**
- `any`, `as` casts that hide a type error, non-null assertions (`!`), `@ts-ignore` / `@ts-expect-error` without a reason.
- Public types not exported from `index.ts` when screens need them.

**Accessibility in templates**
- Click handlers on non-interactive elements; missing `type` on a `button` inside a form.
- Ids not from `useId()`; `aria-describedby` pointing to an id that is not rendered.
- `aria-*="false"` where the attribute should be absent; icon-only control without a name; decorative icon without `aria-hidden`.
- Error text not linked to its field (`aria-describedby`) or not exposed through `aria-invalid`.

**Stories and tests**
- A contract state without a story, no Matrix story, or Matrix without `ThemeMatrix`.
- An interactive component with no keyboard step in any play function.
- A test asserting internals, a test with real timers and sleeps, a story that depends on the current date.
