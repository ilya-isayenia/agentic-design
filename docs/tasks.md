# Build tasks

The one-off build of the app, design system and agent setup described in `docs/spec.md`. Later work goes through `/change`, not this list.

## 2. Check scaffold, then the design system

- [x] pnpm workspace (`packages/tokens`, `packages/ui`, `apps/web`), pinned versions, `.nvmrc`, `packageManager`.
- [x] `pnpm typecheck` (vue-tsc) and `pnpm lint` (ESLint: Vue, `vuejs-accessibility`, no raw values) pass on an empty component.
- [x] Storybook (Vue 3 + Vite) runs; Vitest addon runs stories; a11y violations fail the run.
- [x] `tools/contrast` checks every text/background pair in every brand × mode against WCAG AA and fails on a miss.
- [x] Tokens: DTCG `core.json` and `brands/<brand>/<mode>.json` for Pulse, Volt, Lumen × light, dark; semantic roles including `chart-1`…`chart-5`, `chart-grid`, `chart-label`; Style Dictionary builds CSS variables and a resolved JSON per theme.
- [x] Tailwind v4 with the default theme reset and `@theme inline` mapping to the token variables; a class outside the scale does not exist.
- [x] Every component in spec §3 has `<Name>.vue`, `<Name>.contract.md`, `<Name>.stories.ts` (a story per state and a Matrix story over the 6 themes) and `<Name>.test.ts` where it has logic.
- [x] `docs/ds/` covers typography, colour, spacing, motion and the components index.

Done when: typecheck, lint, unit tests, Storybook tests with a11y and contrast are green.

## 3. App

- [x] Club finder: search, list, abstract SVG map with counts; loading, no results, error.
- [x] Steps 1–5 with the states from spec §4; step indicator goes back to done steps; focus moves to the new step's heading.
- [x] Sticky receipt: empty and filled; no discount code (added in step 8 through `/change`).
- [x] Success page.
- [x] Prices and promo rules in `apps/web/src/data/`, described in `docs/product/pricing.md`; copy in `docs/product/copy.md`; legal placeholders.
- [x] Unit tests for pricing and IBAN logic.

Done when: `pnpm dev` walks the whole flow in all 3 brands; checks green.

## 4. Agent setup

- [x] `AGENTS.md`, `CLAUDE.md`.
- [x] Skills: `change`, `review`, `ds-rules`, `a11y-checklist`, `stack-vue`.
- [x] Subagents: spec-writer, prototyper, refiner, design-reviewer, a11y-auditor, code-reviewer; read-only tools for reviewers; turn limits.
- [x] `tools/shots`, `tools/evidence`, `changes/` with a README.
- [x] `.claude/settings.json` without deny rules yet.

Done when: `/change status` runs and lists no open changes.

## 5. Remaining checks

- [x] Visual tests in Docker against the static Storybook (Matrix stories) and the app; first baselines in `tests/visual/baselines/`.
- [x] e2e on the app: full signup; club finder states; step navigation.
- [x] `tools/denylist`.
- [x] `pnpm check` runs everything in the order of spec §6; `ci.yml` runs it.

Done when: `pnpm check` is green locally and in CI.

## 6. Hand-over

- [x] `docs/getting-started.md`: install, run, `/change` and `/change continue`, reading `evidence.md`, baselines; three ready requests for `/change`.

Done when: a person with Node, pnpm and Docker can follow it from a clean clone.

## 7. Publishing

- [x] `pages.yml`: app at `/`, Storybook at `/storybook/`.
- [x] `tools/setup-repo.sh` enables Pages through `gh api` (not run while the repository is private).
- [x] README links.

Done when: the workflow file is valid and the script passes shellcheck.

## 8. Cycle run

- [x] "Discount code in the receipt" through `/change` (spec §9), size L, in separate processes so resume is exercised.

Done when: the PR is open with `evidence.md` and `log.md` lines marked `by: agent`.

## 9. Final

- [x] Deny rules in `.claude/settings.json` (spec §5.6).

Done when: committed on `main`; `pnpm check` green on `main`.
