# Membership signup — spec

A membership signup web app for a chain of gyms, built on its own multi-brand design system, plus the Claude Code setup that makes every later change: spec → prototypes → refinement → validation → integration. This file goes into the repository as `docs/spec.md`.

## 1. What is built

- **App:** club finder (list and an abstract map), a 5-step signup (membership type → access level → duration → your details → SMS verification), a sticky receipt beside the steps, a success page. Invented data and copy; payment, SMS and maps are stubs.
- **Design system:** tokens, 3 brands × light/dark, components with all states, documented in Storybook.
- **Agent setup:** instructions for Claude Code to make any change through one cycle, with a record of every change in the repository.
- **Checks:** one command, the same locally and in CI.

Brands (invented): **Pulse** — dark, pink accent (the default); **Volt** — dark, yellow accent; **Lumen** — light-first, pink accent. Every brand has a light and a dark mode.

## 2. Stack and repository

Vue 3 + TypeScript, Vite, Tailwind CSS v4, Storybook (Vue 3 + Vite), Vitest, Playwright, Style Dictionary, pnpm workspaces. Versions pinned at setup; `.nvmrc` and `packageManager` in `package.json`. Routing: `vue-router` with hash history (GitHub Pages has no server rewrites). State: composables, no Pinia. Vite `base: '/agentic-design/'`. Fonts self-hosted with `@fontsource` (Barlow Condensed, Inter) and preloaded in Storybook. The app and Storybook run locally (`pnpm dev`, `pnpm storybook`) and are published with GitHub Pages once the owner makes the repository public.

**Stack profile.** The design system and the agent process do not depend on the framework: tokens build into CSS variables, and the DS rules, accessibility checklist, review rubric and change cycle are the same for any stack. Only component code and the instructions for writing and reviewing it depend on the framework; they live in one stack profile, `.claude/skills/stack-vue/` (component API conventions, file layout, story and test patterns, review checks). The refiner and code-reviewer load the active profile named in `AGENTS.md`. Another stack (e.g. React) is a second profile; everything else stays.

```
AGENTS.md                    rules for any agent working here (short)
CLAUDE.md                    @AGENTS.md + Claude Code specifics
.claude/
  settings.json              permissions and deny rules
  skills/change/             the change cycle (the conductor)
  skills/review/             review on request
  skills/ds-rules/           design-system rules, loaded by subagents
  skills/a11y-checklist/     accessibility checklist, loaded by subagents
  skills/stack-vue/          the Vue stack profile
  agents/                    one file per subagent (5.3)
packages/tokens/             DTCG source: core.json, brands/<brand>/<mode>.json; build → CSS variables
packages/ui/                 <Name>.vue, <Name>.contract.md, <Name>.stories.ts, <Name>.test.ts
apps/web/                    routes, screens, mock data (src/data/), composables
docs/spec.md  docs/tasks.md  docs/getting-started.md
docs/ds/                     typography, colour, spacing, motion, components index
docs/product/                pricing rules, copy, legal placeholders
changes/<id>/                one folder per change in progress (5.1)
changes/archive/<id>/        finished changes
tests/e2e/                   app scenarios
tests/visual/                visual tests; baselines in tests/visual/baselines/
tools/                       contrast, shots, evidence, denylist; setup-repo.sh (enables Pages via `gh api`)
.github/workflows/           ci.yml (pnpm check), pages.yml (app at /, Storybook at /storybook/)
```

## 3. Design system

**Tokens** (W3C DTCG format), three tiers: primitive (raw scales) → semantic (roles: `bg`, `surface`, `surface-raised`, `text`, `text-muted`, `accent`, `on-accent`, `success`, `danger`, `border`, `focus`, `chart-1`…`chart-5`, `chart-grid`, `chart-label`) → component (only where a component needs its own value). Each brand × mode is one file, `brands/<brand>/<mode>.json`. Themes switch by `data-brand` and `data-mode` on the root; Style Dictionary builds CSS variables; Tailwind maps them with `@theme inline` and its default theme is reset, so classes outside the scale do not exist.

**Typography.** Display: Barlow Condensed (headings, prices, step titles, uppercase). Text: Inter. Scale: `display` 40/44, `h1` 32/36, `h2` 24/28, `h3` 18/24, `body` 16/24, `small` 14/20, `caption` 12/16; weights 400/600/800. Body text max 70ch. Tabular numbers for prices.

**Spacing** 4 px base (4, 8, 12, 16, 24, 32, 48, 64). **Radius** 0, 4, 8, full. **Motion** 120/200/320 ms, two easings; everything respects `prefers-reduced-motion`.

**Components:** Button (primary, secondary, ghost; sizes; loading), IconButton, TextField, Select, Checkbox, Radio and RadioGroup, Chip, Price (old/new, period), Stepper (number with − / +), StepIndicator (done, current, upcoming), PlanCard (title, perks, price, selected, promo ribbon), ClubCard (photo placeholder, perks, price, actions), ReceiptLine, Receipt, Banner (promo with countdown), Toast, Skeleton, EmptyState, ErrorState. **Charts** are hand-written SVG Vue components on the chart tokens, no chart library; none is built now (they are later changes, see docs/practice.md).

**Contract** (`<Name>.contract.md`, one per component): purpose; props, slots, events; states; tokens used; accessibility (role, name, keyboard, focus, announcements); do and don't.

**Stories.** Brand and mode are Storybook globals set by one decorator. Each state has a story (tested and axe-checked in the default theme). Each component also has one **Matrix** story: all states × all 6 themes in one canvas; visual tests and axe run on it, so every theme is checked without hundreds of stories.

**"All states"** means the state table: loading, empty, error, partial, success, permission — each with its trigger, feedback and safe next action; "not tested" is not "not applicable".

## 4. Screens

| Screen | Content | States |
| --- | --- | --- |
| Club finder | search by postcode or city, list of club cards, abstract SVG map with counts | loading, no results, error |
| 1. Membership type | regular, student, corporate | none selected, selected |
| 2. Access level | workouts-per-week stepper; plan cards (one club, area, city, country) with old/new price | selected, promo |
| 3. Duration | 2 years, 1 year, flex | selected, promo |
| 4. Your details | name, date of birth, contact, address, IBAN with BIC and bank auto-filled, consent | empty, invalid per field, error summary, submitting |
| 5. SMS verification | code input, resend with timer | waiting, wrong code, expired |
| Receipt (sticky) | club, chosen plan, starter package, total, referral code | empty, filled |
| Success | summary and next steps | — |

The discount code is **not** built here; it is added through `/change` (walkthrough B). Prices and promo rules are data in `apps/web/src/data/`, described in `docs/product/pricing.md`. All copy, prices, perk names and codes are new, never transcribed from the reference screens. Test data is visibly fake (e.g. IBAN `NL00TEST0123456789`). The step indicator lets the user go back to done steps; focus moves to the new step's heading.

## 5. Working with agents

An agent here is Claude Code working from a written instruction with the context it needs. Everything else (scripts, CI) supports it.

### 5.1 Every piece of work is a change

Taken from OpenSpec's change model, adapted: any work — a new feature, an edit, a design-system change, a fix — is a **change** with its own folder; finished changes are archived.

```
changes/<NNNN>-<slug>/
  change.md      id, type (feature | edit | ds | fix), size (S | M | L), status, current stage, branch
  spec.md        what and why, acceptance criteria, states, out of scope
  log.md         every stage, prototype round and decision; each decision line ends with "by: human" or "by: agent"
  review.md      reviewers' findings and what was fixed
  evidence.md    checks, screenshots, story links — what the human reads before merge (built by tools/evidence)
  shots/         screenshots from tools/shots, including the explorations shown in prototype rounds
  product-spec.md, plan.md   a new product's parent change only (XL, below)
```

`/change continue 0008` finds the folder whose name starts with `0008`.

**Size decides the stages** (adaptive depth, as in AWS AI-DLC):

| Size | Example | Stages | Human stops |
| --- | --- | --- | --- |
| S | spacing, copy, a colour, a small bug | spec (short) → refine → validate → integrate | merge |
| M | a new state, a new variant, a changed layout | spec → prototype (1 round, optional) → refine → validate → integrate | prototype choice, merge |
| L | a new screen, flow or feature | spec → prototype (rounds until chosen) → refine → validate → integrate | spec, prototype choice, merge |
| XL | a new site, app or product | product spec → plan → child changes (each S, M or L) → whole-product review | product spec, plan, each child's merge, re-plan after the first child, whole-product findings, merge of the record |

The spec-writer proposes the size; the human can change it.

**XL — new product: spec → plan → child changes → whole-product review.** XL is a mode for a product that does not exist yet, not a bigger change. The person fills `docs/site-brief-template.md` (purpose, audience, sections with content and media, references, brand, constraints) and names it in the request. The parent change writes `product-spec.md` (purpose, audience, sections or screens, content per section, an existing brand or new brand tokens, out of scope) and, after the human accepts it, `plan.md`: the child changes in build order, each with a size and a scope. The first child is always the scaffold of a new app in `apps/<name>/` on `packages/ui` and the tokens, with its navigation and an e2e smoke test; `pnpm check`, Storybook and Pages pick up every app in `apps/*`. Each child is a normal change with its own folder, branch and PR, linked by `parent` in its `change.md`; the next child starts from `main` after the previous one is merged. After the first child the plan is shown again and the human may reorder, add or drop children. After the last child the design-reviewer and the a11y-auditor review the assembled product once (narrative order, visual rhythm and consistency across sections, navigation and keyboard flow end to end); their findings become a final fix child or go to the human. The parent's `evidence.md` summarises every child and that review and goes to `main` in one last PR with the record.

### 5.2 Commands

- `/change <what you want>` — starts a change: folder, branch `change/<id>`, then the stages.
- `/change continue <id>` — resumes from `change.md`, with everything done so far on the branch.
- `/change status` — open changes and where each stands.
- `/review <screen, component or PR>` — the three reviewers only; findings, no edits.

`skills/change` is the conductor: it holds the stage order and the stops, starts a subagent per stage, writes `change.md` and `log.md`, commits at the end of every stage. It does no design or code work itself. It runs in the main conversation (no `context: fork`), because subagents cannot start subagents.

### 5.3 Subagents

| Subagent | Does | Reads | Writes |
| --- | --- | --- | --- |
| spec-writer | request → `spec.md`, proposes size, lists questions | request, `docs/product/`, components index | `changes/<id>/spec.md` |
| prototyper | 2–3 variants as stories, one line each on how it differs; next round from feedback, never repeating rejected ideas | spec, ds-rules, log | `packages/ui/**/explorations/`, `apps/web/**/explorations/` |
| refiner | (a) refine: the chosen variant (or the spec, for S) → finished components and screens with all states, brands, modes, keyboard, tests; (b) integrate: wires it into the app, adds the e2e scenario, deletes explorations | spec, chosen variant, contracts, ds-rules, a11y-checklist, stack profile | paths named in the spec; app paths in (b) |
| design-reviewer | against the spec and the DS: typography, spacing, hierarchy, states, themes | `shots/`, stories, spec, ds-rules | findings only |
| a11y-auditor | keyboard, focus order, names and roles, announcements, contrast, reduced motion — what automation cannot catch | axe output, stories, a11y-checklist | findings only |
| code-reviewer | code against contracts, AGENTS.md and the stack profile | diff, contracts, stack profile | findings only |

Reviewers have read-only tools and a fresh context; they never see the refiner's reasoning. Findings carry severity (critical, required, optional, nit) and confidence; only confidence ≥ 80 is reported. Findings go back to the refiner at most twice; then the conductor stops and asks the human. Subagents cannot talk to the human: when the DS lacks a token or component, the spec is ambiguous or contradicts `docs/product/`, or work would leave its write scope, a subagent returns its questions to the conductor, which stops and asks.

### 5.4 Human stops, baselines, merge

The conductor stops and waits in the chat. The human answers in plain words: "accept", "variant B", "A's layout with B's accent", "more options towards denser cards", "size M". The conductor writes the answer into `log.md` with "by: human". When no human is present (unattended runs), the conductor decides, writes "by: agent" and the reason; the human can answer again later.

**Visual baselines.** When a change alters visuals, the refiner regenerates the affected baselines on the branch (`pnpm test:visual:update`, in Docker) as a separate commit `baselines: <reason>`. The human accepts them by approving the PR, where the image diffs are visible.

**Merge.** Integrate ends with: checks green, `tools/evidence` builds `evidence.md`, the change folder moves to `changes/archive/<id>/`, the PR is opened. The "merge" stop means the conductor stops after the PR is open; the human merges on GitHub.

### 5.5 Where to look when writing the instructions

Skills and subagents are built on published, professionally written ones — taken whole, in part or for structure — and adapted to this project. The table is a pointer for whoever writes them, not a list of authors.

| Item | Look at | Adapt |
| --- | --- | --- |
| `ds-rules` | ours; structure from wshobson/agents `design-system-patterns`, addyosmani/agent-skills `frontend-ui-engineering`, ECC `motion-foundations` | rules against our DTCG tokens and Tailwind `@theme`; every rule checkable; "common rationalizations" table |
| `a11y-checklist` | agent-skills `accessibility-checklist`, ECC `accessibility`, AWS AI-DLC `accessibility-wcag` | WCAG 2.2 AA, SC names checked against W3C; Vue examples; forced colours, reduced motion |
| `change` | ours; bounded generate/evaluate loop from ECC `gan-design`; evidence gate from ECC `frontend-design-direction` | stages and sizes from 5.1; integrate refuses to open the PR while the evidence checklist is incomplete |
| spec-writer | AWS AI-DLC `component-spec-template` | slots, emits, v-model, tokens, stories to produce, open questions |
| prototyper | ours; "plan, check against generic, build" loop and anti-default list from Anthropic `frontend-design` | variants differ in structure or density, never in invented style; existing tokens only |
| refiner | state table from ECC `frontend-design-direction`; verification list from agent-skills | keyboard, themes, interaction and a11y tests per state |
| `stack-vue` | ECC `rules/vue` (testing, patterns), Vue parts of ECC `vue-reviewer` | our component API conventions, story and test patterns |
| design-reviewer | ours; axes from ECC `design-system`, calibration from ECC `gan-evaluator` | scored rubric with anchors; token adherence and consistency weighted, originality 0; light and dark shots |
| a11y-auditor | wshobson/agents `wcag-audit-patterns`; output format from ECC `a11y-architect` | AA only |
| code-reviewer | agent-skills `code-reviewer`, confidence filter from Anthropic `pr-review-toolkit`; Vue checks come from `stack-vue` | DS checks: tokens only, story and test present, slot and emit contracts |

### 5.6 Tools and guardrails

- `tools/shots` — Playwright over the static Storybook and the app: story ids × brand × mode × viewport; "before" shots from the merge base. Output into `changes/<id>/shots/`.
- `tools/evidence` — builds `evidence.md` from check results and shots; lists missing items, which block integrate.
- `tools/contrast` — every text/background pair in every brand × mode against WCAG AA.
- `tools/denylist` — reads `DENYLIST` (one string per line); matches case-insensitively and ignoring spaces; also flags `/Users/` and `~/`; scans the working tree, commit messages and `git log -p`; prints only `path:line` or the commit id, never the matched text; passes when `DENYLIST` is unset.
- `.claude/settings.json` denies agent edits to `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.github/**`, `tests/visual/baselines/**` except through `pnpm test:visual:update`. Deny rules do not stop every subprocess, so docs say "not allowed", not "cannot". Each subagent has a turn limit.

## 6. Checks

`pnpm check` runs, in order: type check; ESLint with Vue, `vuejs-accessibility` and a no-raw-values rule; Vitest unit tests; Storybook tests (play functions, a11y addon with violations as errors); contrast; Playwright visual tests in Docker (`snapshotPathTemplate` into `tests/visual/baselines/`); Playwright e2e on the app; denylist. CI runs the same command. Agents run it in refine and integrate; red means not done.

## 7. Not built

Figma or Penpot counterpart (next step); real payment, SMS and maps; accounts and login; a cloud platform for agents; a retro loop over finished changes (the records in `changes/archive/` keep the data for it).

## 8. Walkthrough A — an edit: "make the plan cards denser on mobile"

1. **You type:** `/change make the plan cards denser on mobile, the 4 cards don't fit on one screen`.
2. **spec-writer** writes `changes/0007-denser-plan-cards/spec.md`: at 375 px all four cards fit within two screen heights; price stays the largest text; touch targets ≥ 44 px; desktop unchanged. Size **S**. Branch `change/0007-denser-plan-cards`.
3. **refiner** changes PlanCard's mobile spacing tokens and layout, updates stories and tests.
4. **Checks:** contrast and a11y pass; visual tests show changes in the PlanCard matrix and the Access level screen only; refiner commits `baselines: denser plan cards on mobile`.
5. **Reviewers** read the shots: design-reviewer flags the perks list wrapping into 4 lines in Volt; refiner tightens line height for `small` inside the card; second pass clean.
6. **integrate:** evidence built, folder archived, PR opened. **You see** `evidence.md`: before/after at 375 px in 3 brands, checks green, one finding fixed. You merge on GitHub.

## 9. Walkthrough B — a feature: "discount code in the receipt"

1. **You type:** `/change add a discount code field to the receipt`.
2. **spec-writer** writes the spec: field with Apply; states idle, validating, applied (saving shown, total updates), invalid (message under the field), expired, network error (retry); codes from mock data; screen readers hear the new total. Size **L**. Question: can two codes stack? **Stop.** You answer "no, one code; a new one replaces the old". **Stop** for the spec: "accept".
3. **prototyper**, round 1: A — field always open; B — "Have a code?" link that expands; C — field in a card under the total. Shots in all brands. **Stop.** You answer "B, but the applied state from C". Round 2: two variants of B with C's applied state. **Stop.** "The second".
4. **refiner (refine)** builds DiscountCode with its contract, stories for every state and the matrix, unit tests for the code rules.
5. **Checks:** the a11y addon fails — the error message is not linked to the field; refiner adds `aria-describedby`; green; new baselines committed.
6. **Reviewers:** a11y-auditor — the total change is not announced → polite live region; design-reviewer — invalid state uses colour only → icon added; code-reviewer clean.
7. **refiner (integrate)** wires it into Receipt, adds the e2e scenario "valid code lowers the total; invalid code shows the message", deletes explorations. Evidence built, folder archived, PR opened.
8. **You see** `evidence.md`: the chosen variant, every state, checks green, three findings and fixes, the round history. You merge on GitHub.

If the session breaks at any step, a new session runs `/change continue 0008` and goes on from the stage written in `change.md`.
