---
name: ds-rules
description: Design-system rules for this repository, each phrased as a check with the tool that enforces it. Load before any UI work — a new or changed component, a screen, a prototype variant, a refine or fix round — and for a design or code review of UI. Also load before adding or changing a token.
---

# Design-system rules

The design system is code: DTCG tokens, one Tailwind theme, Vue components, Storybook. These rules are written against those files. Every rule is a check; the last column says who or what runs it. Facts (values, roles, scales) live in `docs/ds/*.md`; this file says what to do with them.

## How a token reaches a class

```
packages/tokens/src/core.json             primitives: palette.*, font.*, space.*, radius.*, motion.*
packages/tokens/src/brands/<b>/<m>.json   semantic roles color.<role> = {palette.<hue>.<step>}; 3 brands × 2 modes
        │  pnpm tokens  (packages/tokens/build.mjs, Style Dictionary)
        ▼
build/tokens.css   :root { --ds-space-*, --ds-font-*, --ds-radius-*, --ds-motion-* }
                   [data-brand="b"][data-mode="m"] { --ds-color-<role> }   (pulse/dark is also :root)
build/themes.json  resolved hex per theme, read by tools/contrast
        ▼
packages/ui/src/styles/index.css   @theme { --*: initial }  then  @theme inline { --color-<role>: var(--ds-color-<role>) … }
        ▼
classes: bg-surface, text-text-muted, border-border-strong, p-4, text-h2, rounded-none, duration-fast
```

Three tiers: **primitive** (palette, scales in `core.json`) → **semantic** (roles in brand files) → **component** (`component.<name>.<part>` in brand files, rare). The palette is never exported to CSS: `build.mjs` drops `palette.*`, so components cannot reach a primitive colour even by mistake. Because the default theme is reset, a class that is not mapped in `@theme` produces no CSS at all — it fails silently, not loudly.

A theme switches by `data-brand` and `data-mode` on any element; everything inside follows.

## Rules

Check names: **lint** = ESLint `ds/no-raw-values` (`packages/ui/src`, `apps/web/src`; not `*.test.ts`, not `data/`); **contrast** = `pnpm contrast`; **axe** = Storybook a11y addon, violations are errors, on every story and every Matrix story; **visual** = `pnpm test:visual` on Matrix stories and screens; **theme** = the class does not exist, nothing renders; **review** = design-reviewer or code-reviewer in `/change` validate.

### Raw values

| # | Rule | Checked by |
| --- | --- | --- |
| R1 | No hex, `rgb()`/`hsl()`/`oklch()`/`color()`, px/rem/em/vh/vw/ch length or Tailwind arbitrary value (`p-[13px]`, `bg-[#fff]`, `[mask:none]`) in templates, scripts or `<style>` | lint |
| R2 | In `<style>`, values come from `var(--ds-*)` only; prefer a class over a `<style>` block | lint (strips `var()` then scans) |
| R3 | No `eslint-disable` for `ds/no-raw-values`. If the rule blocks you, a token is missing: propose it | review |
| R4 | Tailwind still accepts bare numbers for some utilities (`duration-300`, `delay-150`, `z-10`, `opacity-60`). Duration and delay only through motion tokens; `z-*` and `opacity-*` only as already used in `packages/ui` | review (grep `duration-[0-9]`, `delay-[0-9]`) |

### Colour

| # | Rule | Checked by |
| --- | --- | --- |
| C1 | Colour only through semantic roles (`bg-<role>`, `text-<role>`, `border-<role>`, `fill-<role>`, `stroke-<role>`); palette names never appear in components | theme (palette not exported) |
| C2 | Each role only for its "Use" column in `docs/ds/colour.md`, never for its "Never" column | review |
| C3 | `text-on-accent` / `fill-on-accent` only on an `accent` or `accent-hover` fill | contrast (pair exists only there), review |
| C4 | `accent` is a fill or a 3:1 mark (selected border, current step, icon). Never body text on `bg`/`surface` | contrast checks accent at 3:1 only, so text fails 1.4.3 unseen; review |
| C5 | `border` for decoration (dividers); `border-strong` for boundaries a user must see: inputs, checkboxes, unselected cards | contrast (`border-strong` 3:1), review |
| C6 | `success` and `danger` never alone: an icon and words carry the meaning too | review, a11y-auditor |
| C7 | Focus uses the global `:focus-visible` outline or the `focus-ring` utility (`has-focus-visible:focus-ring` on a card around a hidden input). Never `outline-none` without a replacement | review, a11y-auditor |
| C8 | No `dark:` variant to pick colours: roles already switch per mode | review |
| C9 | Every component looks right in all 6 themes, not only Pulse dark | visual (Matrix), axe on Matrix |

### Type

| # | Rule | Checked by |
| --- | --- | --- |
| T1 | Sizes only `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-caption` | theme, lint (arbitrary) |
| T2 | One `text-h1` per screen (the step heading), on an `<h1>`; heading levels do not skip | review, axe on screens |
| T3 | Prices and countdowns use `tabular` (`Price` and `Banner` already do; new numeric displays add it) | review |
| T4 | Display type is uppercase through the `uppercase` class; copy is written in sentence case | review |
| T5 | `font-display` for headings, prices, buttons; `font-text` for body, labels, inputs | review |
| T6 | Body text wider than one line sits in `max-w-prose` | review, visual |

### Spacing, radius, layout

| # | Rule | Checked by |
| --- | --- | --- |
| S1 | Spacing steps only 0, 1, 2, 3, 4, 6, 8, 12, 16 (`p-5`, `gap-10` produce nothing) | theme, visual, review |
| S2 | Use the spacing table in `docs/ds/spacing.md` (card padding 6, mobile 4; sections 8–12) | review |
| S3 | `rounded-none` is the default; `rounded-full` for chips, step circles, badges; `rounded-sm`/`rounded-md` only where `docs/ds/spacing.md` or the component contract names it | theme, review |
| S4 | Widths only `max-w-page`, `max-w-receipt`, `max-w-prose`; breakpoints only `sm`/`md`/`lg`/`xl` | theme |
| S5 | Touch targets at least `min-h-12` (48 px); `sm` controls (32 px) only inside dense controls, never the main action | review, a11y-auditor |
| S6 | Heights of text containers are `min-h-*`, not `h-*`, so text spacing and zoom do not clip | review |
| S7 | Every screen works at 375 px and at 1280 px | visual, `pnpm shots` |

### Motion

| # | Rule | Checked by |
| --- | --- | --- |
| M1 | Durations `duration-fast`/`duration-base`/`duration-slow`; easings `ease-standard`/`ease-emphasized`; animations `animate-spin`/`animate-pulse`/`animate-ticker` | lint (arbitrary), theme, review (R4) |
| M2 | Animate `transform`, `opacity` and colours only; never width, height, top, left, margin or padding | review |
| M3 | Motion only to show a state change, guide attention or keep continuity; otherwise remove it | review |
| M4 | Reduced motion: the base stylesheet cuts animations; a component adds `motion-reduce:` where the reduced version must look different (the ticker stops and shows one copy) | review, story with reduced motion emulated |
| M5 | Nothing flashes; nothing carries meaning only through motion | review |

### Tokens

| # | Rule | Checked by |
| --- | --- | --- |
| K1 | A new semantic role is added to all 6 brand files, mapped in `@theme inline`, given contrast pairs in `tools/contrast/index.mjs` and a row in `docs/ds/colour.md` — in the same change, type `ds` | contrast (exits non-zero if a paired role is missing in any theme; an unpaired role is not checked), review |
| K2 | A component token only when no semantic role can express the value and it belongs to one part of one component; used as `var(--ds-component-<name>-<part>)` | review |
| K3 | Never edit `packages/tokens/build/`; it is generated | review |
| K4 | A changed token value re-baselines every Matrix story it touches, in a separate commit `baselines: <reason>` | visual |

### Components and screens

| # | Rule | Checked by |
| --- | --- | --- |
| P1 | Every component has `<Name>.vue`, `<Name>.contract.md`, a story per state, a `Matrix` story (all states × 6 themes via `ThemeMatrix`) and a test for any logic | review, `pnpm evidence` |
| P2 | Colour or size changes go into a variant in the component, never through classes passed in from outside | review |
| P3 | Every screen and stateful component has a state table: loading, empty, error, partial, success, permission — each with trigger, feedback and safe next action | review, `pnpm evidence` |
| P4 | "Not tested" is not "not applicable". A state is N/A only with a reason ("no request is made, so no loading"); otherwise it has a story or an e2e step | review |
| P5 | Accessibility rules: `.claude/skills/a11y-checklist/` | axe, a11y-auditor |

## Adding a token

1. Look first: an existing role, step or component variant usually fits. A missing token is a question to the human (it is a `ds` change), not a local workaround.
2. Primitive (a new palette step, a type size): add it to `core.json` in DTCG format (colours: `colorSpace`, `components`, `hex`).
3. Semantic role: add `color.<role>` as an alias `{palette.<hue>.<step>}` to all six `brands/<brand>/<mode>.json`.
4. Map it in `packages/ui/src/styles/index.css` (`--color-<role>: var(--ds-color-<role>);` or the matching `--spacing-*`, `--text-*`, `--radius-*`).
5. Add its pairs to `PAIRS` in `tools/contrast/index.mjs` (text 4.5, boundaries and marks 3).
6. Document it in the matching `docs/ds/*.md` with a "Use" and a "Never".
7. `pnpm tokens && pnpm contrast`, then `pnpm check`; update baselines in their own commit.

## Red flags

- `eslint-disable` anywhere near `ds/no-raw-values`.
- A class that renders nothing: `p-5`, `rounded-lg`, `text-sm`, `bg-gray-*`, `max-w-md` — a Tailwind default that the reset removed.
- `duration-300`, `delay-*` with a number, `transition-[width]`.
- `text-accent` on a paragraph; `text-on-accent` without `bg-accent`; `border-border` on an input.
- `dark:bg-*` or `dark:text-*`.
- `outline-none` or `focus:outline-none` with no ring in its place.
- Copy typed in capitals; a second `text-h1`; a heading chosen for its size.
- A component folder without `.contract.md` or without a `Matrix` story.
- A state table cell that says "n/a" with no reason.
- A new `--ds-*` name in a component that is not in `build/tokens.css`.
- Only Pulse dark screenshots in a review.

## Common rationalizations

| Excuse | Reality |
| --- | --- |
| "It's only 2px off the scale." | Then use the nearest step, or propose a token through a `ds` change. |
| "The brand uses exactly this hex." | Then it is a palette step in `core.json` and a role in six brand files, checked for contrast. |
| "Lint is green, so the styling is fine." | Lint finds raw values only. `p-5`, `duration-300` and `text-accent` on body text all pass it. |
| "It looks right in Pulse dark." | There are six themes. The Matrix story renders all of them; check it. |
| "`border` is close enough for the input." | `border` is below 3:1 on purpose; inputs fail SC 1.4.11. Use `border-strong`. |
| "A component token is quicker than a role." | If two components need the value, it is a role. A component token is for one part of one component. |
| "Reduced motion is handled globally." | The global rule shortens time; it does not design the still version. A looping ticker needs its `motion-reduce:` state. |
| "This screen can't be empty." | Write the trigger that makes it impossible. Without it, the state needs a story. |
| "Typing the heading in capitals is the same." | Screen readers may spell capitals letter by letter. Use the `uppercase` class. |
| "I'll pass a class in to recolour it here." | That forks the component. Add a variant to the component and its contract. |
