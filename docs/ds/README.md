# Design system

The design system lives in code: tokens in `packages/tokens/src/` (W3C DTCG 2025.10), components in `packages/ui/`, documentation in Storybook. There is no design file; Storybook is the component spec.

| Page | What it fixes |
| --- | --- |
| [colour.md](colour.md) | brands, modes, semantic roles, contrast pairs |
| [typography.md](typography.md) | families, scale, weights, numbers |
| [spacing.md](spacing.md) | spacing, radius, layout widths, breakpoints |
| [motion.md](motion.md) | durations, easings, reduced motion |
| [components.md](components.md) | every component, its contract and stories |

## How a token reaches a class

1. `packages/tokens/src/core.json` — primitives: palette, type scale, spacing, radius, motion.
2. `packages/tokens/src/brands/<brand>/<mode>.json` — semantic roles (`color.bg`, `color.accent`, …) as aliases to the palette. One file per brand × mode.
3. `pnpm tokens` (Style Dictionary 5) writes `build/tokens.css`: core scales on `:root`, and one block of `--ds-color-*` per `[data-brand][data-mode]`; Pulse dark is also `:root`.
4. `packages/ui/src/styles/index.css` resets Tailwind's default theme (`--*: initial`) and maps each variable in `@theme inline`. Only these classes exist: `bg-surface`, `text-text-muted`, `p-4`, `text-h2`, …
5. A theme switches by setting `data-brand` and `data-mode` on any element; everything inside follows. The Matrix stories rely on this.

Component tokens (`component.<name>.<part>` in a brand file) are allowed when a component needs a value no semantic role gives; none exist yet.

## Checks

- ESLint `ds/no-raw-values`: no hex, colour functions, px/rem lengths or Tailwind arbitrary values in `packages/ui/src` and `apps/web/src`.
- `pnpm contrast`: every text/background pair in every theme (see colour.md).
- Storybook: axe on every story and on the Matrix story of every component, violations fail.
- Visual tests: Matrix stories and app screens against baselines.
