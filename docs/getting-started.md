# Getting started

This repository is a membership signup app on its own design system, plus a Claude Code setup that makes every change go through one cycle: spec → prototypes → refinement → validation → integration. You will make changes by talking to Claude Code; it writes the code, runs the checks and opens a pull request for you to merge.

What it is and why: [`spec.md`](spec.md). Rules for agents: [`AGENTS.md`](../AGENTS.md).

Learn, show and defend it: [overview](overview.md) (the story of the system) · [demo](demo.md) (a 15–20 minute script) · [defending](defending.md) (hard questions, honest answers) · [practice](practice.md) (learning tasks).

## 1. Install

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 26 (see `.nvmrc`) | `node -v` |
| pnpm | 12 (pinned in `package.json`) | `pnpm -v` |
| Docker Desktop | any recent; must be running | `docker info` |
| Claude Code | latest | `claude --version` |
| GitHub CLI | latest, logged in | `gh auth status` |

Docker is needed for the visual tests: screenshots are taken inside the official Playwright image so they look the same on every computer and in CI.

```sh
git clone git@github.com:ilya-isayenia/agentic-design.git
cd agentic-design
pnpm install
pnpm exec playwright install chromium
```

## 2. Run

| Command | What you get |
| --- | --- |
| `pnpm dev` | the app at http://localhost:5173/agentic-design/ — switch brand and mode in the header |
| `pnpm storybook` | the design system at http://localhost:6006 — brand and mode in the toolbar; every component has a **Matrix** story with all states in all six themes |
| `pnpm check` | every check, in order: types, lint, unit tests, Storybook tests with accessibility, contrast, visual tests (Docker), end-to-end tests, denylist. Green means done |

To see the app's other states (loading, errors, an expired SMS code), use the URL flags in [`docs/product/mock-data.md`](product/mock-data.md). The SMS code is `123456`; a test IBAN is `NL13 TEST 0123 4567 89`.

## 3. Make a change

Start Claude Code in the repository folder (`claude`) and type:

```
/change <what you want, in plain words>
```

For example `/change make the plan cards denser on mobile`. The conductor:

1. creates `changes/<id>-<slug>/` and a branch `change/<id>-<slug>`;
2. writes a spec and proposes a size: **S** (copy, spacing, a small bug), **M** (a new state or variant), **L** (a new screen or feature);
3. runs the stages for that size and **stops** where you decide.

| Stop | What you see | What you answer |
| --- | --- | --- |
| Questions | what the spec-writer could not decide | the answer, in plain words |
| Spec (L only) | `changes/<id>/spec.md` | `accept`, or what to change; you can also say `size M` |
| Prototype (M, L) | 2–3 variants as stories in Storybook under **Explorations**, and screenshots in `changes/<id>/shots/round-N/` | `B`, `A's layout with B's colours`, `more options with denser cards` — rounds repeat until you pick one |
| Merge | a pull request link | review it on GitHub and merge |

Between the stops, the agents refine the chosen variant (every state, brand, mode, keyboard, tests), three reviewers check it with a fresh eye (design, accessibility, code), the refiner fixes what they found (at most two rounds, then you are asked), and the work is wired into the app.

Each stop ends with a line like:

```
Answer with: /change continue 0008 — <your answer>
```

Type exactly that with your answer. If Claude Code was closed, the session broke or you come back the next day, the same command picks the change up from where `changes/<id>/change.md` says it stopped; everything done so far is committed on the branch. Without an answer (`/change continue 0008`) it shows the open question again.

Other commands: `/change status` lists open changes; `/review <component, route or PR number>` runs only the three reviewers and reports findings without editing.

## 4. Read the evidence before you merge

Every pull request body is `evidence.md`, built by `pnpm evidence <id>`. Read it top to bottom:

1. **Evidence status** — must say `complete`. The conductor refuses to open a PR while an item is missing.
2. **Acceptance criteria** — what the spec promised.
3. **States** — loading, empty, error, partial, success, permission (and the change's own states), each with where it is shown (a story, a test) or why it does not apply.
4. **Checks** — every step of `pnpm check`, green, at the commit you are merging.
5. **Screenshots** — after the change, all brands, light and dark, 375 and 1280 px; `before/` for edits; `round-N/` for prototypes.
6. **Decisions** — each ends with `by: human` (you) or `by: agent` (made without you; you can overrule it with `/change continue`).
7. **Review findings** — what the reviewers found and how it was fixed.

The full record stays in `changes/archive/<id>-<slug>/` after the merge.

## 5. Screenshot baselines

Visual tests compare every component's Matrix story and seven app screens against images in `tests/visual/baselines/`. When a change alters how something looks, the refiner regenerates the affected images on the branch with `pnpm test:visual:update` (in Docker) and commits them separately as `baselines: <reason>`. You accept them by approving the PR: GitHub shows the old and new image side by side in the "Files changed" tab. Never edit baseline images by hand; a red visual test on `main` means something changed that nobody approved.

## 6. Your first changes

Three ready requests. Start with the first; each is a real **L** change with a spec stop and prototype rounds. Charts are hand-written SVG components on the `chart-*` tokens, without a chart library (see `docs/ds/colour.md`).

1. **Price of one workout by workouts per week.**
   ```
   /change on the access level step, add a chart of the price of one workout against the number of workouts per week (1 to 7) for each access level, so a member sees how training more makes each workout cheaper. SVG component on the chart tokens, no chart library.
   ```
2. **Compare plans and durations.**
   ```
   /change add a comparison of access levels and durations as columns, so a member can compare the 4-week price, the first payment and the total over the contract side by side before choosing. SVG component on the chart tokens, no chart library.
   ```
3. **Member dashboard.**
   ```
   /change add a member dashboard after signup: visits per week, money spent against the value of the visits, and a forecast for the rest of the contract, with mock data. SVG chart components on the chart tokens, no chart library.
   ```

Answer the stops as you would answer a colleague. If a variant is not right, say why; the prototyper never repeats a rejected idea.

## 7. A new site or product

The cycle can also build something that does not exist yet: a landing page, a presentation site, another app on the same design system. That is size **XL — new product: spec → plan → child changes → whole-product review**.

1. Copy [`site-brief-template.md`](site-brief-template.md) to `docs/briefs/<name>.md` (git-ignored) and fill it in: purpose, audience, sections with content and media, references (screenshots next to it in `docs/briefs/<name>/`), brand, constraints. The template ends with a filled example.
2. `/change build a new site from docs/briefs/<name>.md as a new app apps/<name>`. The capstone task [practice.md P8](practice.md#p8-capstone-build-your-own-presentation-site-from-scratch-xl) walks through it.
3. Answer the stops:

| Stop | What you see | What you answer |
| --- | --- | --- |
| Product spec | `changes/<id>/product-spec.md` | `accept`, or what to change |
| Plan | `changes/<id>/plan.md`: the child changes in order, each with size S, M or L | `accept`, or reorder, add, drop, resize |
| Each child | the child's own stops (spec, prototype, merge), with its own id | as for any change; merge its PR, then `/change continue <parent id>` |
| Re-plan, after the first child | the plan again, now that the app's frame exists | `as is`, or what to change |
| Whole-product review | findings about the assembled product: order, rhythm, consistency, keyboard flow | `fix child` (default), or defer or reject each |
| Merge of the record | a last PR with the product's record and `evidence.md` summarising every child | merge it |

The first child creates `apps/<name>/`; `pnpm check`, Storybook and the Pages site pick it up without config changes. Run it locally with `pnpm --filter @agentic/<name> dev`.

