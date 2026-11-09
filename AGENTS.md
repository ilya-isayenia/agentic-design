# Agents working in this repository

A membership signup app on its own multi-brand design system. What it is and why: `docs/spec.md`. How to run it: `docs/getting-started.md`.

## Every piece of work is a change

Any work — feature, edit, design-system change, fix — goes through `/change` (`.claude/skills/change/`). It creates `changes/<id>/`, a branch `change/<id>`, and runs the stages for the change's size. Do not edit `main` directly.

## Stack profile

Active profile: **`stack-vue`** (`.claude/skills/stack-vue/`). Only that profile knows the framework; everything else here (tokens, DS rules, accessibility checklist, review rubric, change cycle) is stack-free.

## Layout

| Path | What |
| --- | --- |
| `packages/tokens/src/` | DTCG tokens: `core.json`, `brands/<brand>/<mode>.json` |
| `packages/ui/src/components/<Name>/` | `<Name>.vue`, `.contract.md`, `.stories.ts`, `.test.ts` |
| `apps/web/src/` | screens, routes, composables, mock data in `data/` |
| `docs/ds/`, `docs/product/` | design-system rules, pricing and copy |
| `changes/` | one folder per change; `changes/archive/` when merged |
| `tests/e2e/`, `tests/visual/` | Playwright; visual baselines in `tests/visual/baselines/` |
| `tools/` | contrast, shots, evidence, denylist, check |

## Rules

1. Tokens only. No raw colours, lengths or Tailwind arbitrary values; the theme has no default palette. Rules: `.claude/skills/ds-rules/`.
2. Accessibility is WCAG 2.2 AA and a build gate (axe in Storybook, contrast script). Checklist: `.claude/skills/a11y-checklist/`.
3. A component is done with its contract, a story per state, a Matrix story and tests. A screen is done with all its states (loading, empty, error, partial, success, permission — "not tested" is not "not applicable").
4. Copy is English and invented; test data is visibly fake. Never copy text, prices or names from reference material.
5. `pnpm check` green means done; red means not done. Do not skip or weaken a check to make it pass.
6. Visual baselines change only through `pnpm test:visual:update` in a separate commit `baselines: <reason>`.
7. Not allowed for agents: editing `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.github/**`, baselines by hand; force-push; bypassing hooks. Ask the human instead.
8. No local paths, personal names or secrets in the repository; `pnpm denylist` checks.

## Commands

`pnpm dev` · `pnpm storybook` · `pnpm check` · `pnpm test:unit` · `pnpm test:storybook` · `pnpm test:e2e` · `pnpm test:visual` · `pnpm shots <id>` · `pnpm evidence <id>`
