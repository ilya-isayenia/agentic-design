# agentic-design — the story of the system

A membership signup app for an invented chain of gyms, built on its own multi-brand design system, and a Claude Code setup that makes every later change through one cycle: spec, prototype variants, refinement, validation, integration. Every change leaves a folder that says what was asked, what was tried, who decided and what proves the result.

State: 2026-11-09. The app, the design system, the checks and the agent setup are on `main`. One change went through the whole cycle: "discount code in the receipt", pull request #1, CI green. The repository is private, so the Pages links do not work yet; everything runs locally. See also [demo.md](demo.md), [defending.md](defending.md), [practice.md](practice.md), [spec.md](spec.md), [getting-started.md](getting-started.md).

## 1. Why it exists

An agent can write a screen in minutes. Then it invents a colour that is not in the system, skips the error state, forgets light mode, and says "done" without running the tests. A week later nobody knows why the screen looks the way it does. Three ideas answer that:

1. **The design system is code, and checks enforce it.** A raw colour fails lint. A class outside the token scale does not exist. A contrast miss in any of six themes fails the build.
2. **The process is fixed; agents work inside it.** The stage order and the points where a human decides are written once. A model decides how to do a stage, never which stage comes next.
3. **"Done" is evidence, not an opinion.** `pnpm check` green means done. Before a PR opens, a script builds `evidence.md`; if an item is missing, the PR does not open.

## 2. How one change flows

You type `/change <what you want, in plain words>` in Claude Code. The `change` skill (`.claude/skills/change/SKILL.md`) is the conductor. It runs in the main conversation, creates `changes/<id>-<slug>/` and a branch, starts one subagent per stage, keeps `change.md` and `log.md`, and commits after every stage. It writes no design or code itself.

```
/change add a discount code field to the receipt
  spec-writer          -> spec.md, proposes size and type           [stop: questions; spec for L]
  prototyper           -> 2-3 variants as Storybook stories          [stop: pick, mix, or ask for more]
  refiner (refine)     -> every state, theme, keyboard path, tests; pnpm check green
  3 reviewers          -> review.md, read-only, fresh context
  refiner (fix)        -> critical and required findings, at most 2 rounds  [stop: if still open]
  refiner (integrate)  -> wired into the app, e2e test, explorations deleted
  pnpm evidence        -> evidence.md; folder archived; PR opened   [stop: a human merges]
```

**Size decides the depth**, so a copy fix does not pay for a feature's process:

| Size | Example | Stages | Human stops |
| --- | --- | --- | --- |
| S | copy, spacing, a colour, a small bug | short spec → refine → validate → integrate | merge |
| M | a new state or variant, a changed layout | spec → one optional prototype round → refine → validate → integrate | prototype choice, merge |
| L | a new screen, flow or feature | spec → prototype rounds until one is chosen → refine → validate → integrate | spec, prototype choice, merge |

The spec-writer proposes the size; the human can change it at any stop. Questions from any subagent are an extra stop at any size.

**Where the human decides.** At a stop the conductor commits, prints the question and ends with `Answer with: /change continue <id> — <your answer>`. Plain words work: "accept", "B", "A's layout with B's accent". The answer goes into `log.md` as a decision ending `by: human`. In an unattended run (the request carries `--unattended`, or an answer starts with `agent:`) the conductor decides, writes `by: agent` and the reason. There is no third kind of decision.

**Stop and ask instead of guessing.** Subagents cannot talk to the human. When a token or component is missing, the spec is ambiguous or contradicts `docs/product/`, or work would leave a subagent's write scope, it returns a question and the conductor stops.

**The builder is not the reviewer.** The design-reviewer, a11y-auditor and code-reviewer have only Read, Grep and Glob, start with a fresh context and never see the refiner's reasoning. Findings carry severity (critical, required, optional, nit) and confidence; only confidence 80 or more is reported. Critical and required findings go back to the refiner at most twice, then the human decides. Optional ones are listed in the PR and never block.

**The record survives a broken session.** Everything is committed after each stage and before each stop. `/change continue <id>` reads `change.md` and `log.md` and picks up from the recorded stage; a stage that died midway is rerun.

**The first run.** Change 0001 (size L) ran in five headless processes, 20:32 to 21:56 by commit time. The spec-writer asked five product questions. One prototype round gave three variants and 216 screenshots; B was chosen. Review took three rounds: 3 required findings (design score 7.2), then 1 more (8.1), then none (8.2). The PR maps 23 acceptance criteria to their proof, with `pnpm check` 9/9 green. All 15 decisions are `by: agent`: another agent answered the stops, not a person. Walkthrough B in `spec.md` §9 imagined other variants and human answers; the record on the branch is what really happened.

## 3. Who does what

| Work | Script | Agent | Human |
| --- | --- | --- | --- |
| Stage order, stops, record | — | conductor follows `change/SKILL.md` | answers stops |
| Spec | — | spec-writer; proposes size | accepts (L), answers questions |
| Options | `pnpm shots`: 6 themes × 375/1280 px | prototyper: 2–3 variants in `explorations/` | picks or mixes |
| Build | `pnpm check` decides done | refiner; writes `evidence.json` | — |
| Baselines | `pnpm test:visual:update` in Docker | refiner runs it, own `baselines:` commit | accepts by approving the PR |
| Review | axe, lint, contrast, e2e ran first | three read-only reviewers | decides after two failed fix rounds |
| Evidence | `pnpm evidence`; refuses when incomplete | — | reads it |
| Merge | CI runs the same `pnpm check` | never (denied) | merges on GitHub |

If a thing can be computed, a script does it. The model writes specs, variants, code and reviews. A person decides scope, design and merge.

## 4. The design system

**Tokens** are W3C DTCG files in three tiers: primitives in `packages/tokens/src/core.json`; semantic roles (`bg`, `surface`, `text-muted`, `accent`, `focus`, `chart-1`…`chart-5`, …) in `brands/<brand>/<mode>.json`; component tokens only where needed (none yet). Style Dictionary builds CSS variables per `[data-brand][data-mode]`. The palette is never exported, so a component cannot reach a raw colour even by mistake.

**Three brands × two modes.** Pulse (pink accent), Volt (yellow), Lumen (light-first), each light and dark: six themes. A theme is two attributes on any element. A new brand is new token files, not component edits.

**Tailwind with its default theme reset**, so `bg-red-500` or `p-[13px]` produce no CSS at all. The ESLint rule `ds/no-raw-values` fails on hex, colour functions, raw lengths and arbitrary values.

**Storybook is the component spec**; there is no design file. Each of the 21 components has a contract (`<Name>.contract.md`: props, slots, events, states, tokens, accessibility, do and don't), a story per state, tests, and one **Matrix** story with every state in all six themes on one canvas. Visual tests and axe run on the Matrix, so every theme is checked without a hundred stories.

**"All states" is a fixed table**: loading, empty, error, partial, success, permission. Each needs a story or test, or a reason that holds for the product. PR #1 shows it: partial does not apply because a code is checked as a whole; permission does not apply because there are no accounts.

**Checks.** `pnpm check` runs tokens, types, lint, unit tests, Storybook tests with axe as errors, contrast for 210 text/background pairs, visual tests in Docker against 48 baselines, e2e with axe on every screen in six themes, and the denylist. CI runs the same command.

## 5. The stack profile

Tokens, DS rules, the review rubric, the cycle and the tools (`shots`, `evidence`, `contrast`, `visual`) do not know about Vue. Framework knowledge sits in `.claude/skills/stack-vue/`: component API, file layout, story and test patterns, review checks. `AGENTS.md` names it as the active profile; a React project adds `stack-react`.

The claim holds, with seams. The profile name is hard-coded in the `skills:` field of the prototyper, refiner and code-reviewer, not read from `AGENTS.md` as the spec says. The ESLint config, the Storybook framework package, the Matrix helpers and a section of `a11y-checklist` are Vue too. A second stack is a profile plus those files; the process and the design system stay.

## 6. What is strong

- **Checks decide.** Off-scale classes do not exist, axe violations are errors, visual tests run in Docker, so a Mac and Linux CI see the same pixels.
- **Resume works.** Change 0001 crossed five processes, one killed mid-stage.
- **The cycle found real defects**, four in our tools and four in the product, that a happy-path demo would never show.
- **The human reads one page**, where every acceptance criterion points to its proof.

## 7. What is weak

**Defects the first cycle found in our own tools, fixed on `main`:** Storybook set the theme during render, so light-mode shots showed white text on a light surface; Matrix stories were shot six times instead of once; the conductor ran the fix subagent in the background, and headless mode killed it with the process (subagents now run in the foreground); `pnpm shots` opened app routes without signup state, so route shots showed an empty receipt.

**Defects the reviewers found in the product:** route shots with no discount visible; receipt text near-white in light mode; a contract state without a story; the Apply button jumping under the field while loading. The last fix is a workaround, a hidden copy of the loading button that holds the width. The cause is Button changing width while loading; that is logged as its own change.

**Limits of this version:**
- All 15 decisions in PR #1 are `by: agent`. The stops work, but no person answered them yet.
- PR #1 carries 69 MB of screenshots (502 PNG files). Every L change would add as much to git history. Decide before merge: only `after/` at 1280 px in git and the rest as CI artifacts, or Git LFS.
- The process and the write scopes are enforced by instructions. Only the evidence gate blocks; deny rules stop the edit tools, not a shell command.
- Change ids count folders on the checkout and open `change/*` branches, so a new change gets `0002` while PR #1 is open. Two people starting at the same minute can still collide.
- App screens have pixel baselines in four theme and width pairs out of twelve; the rest is covered by axe only.
- The agent regenerates baselines; this is safe only if the human looks at the image diffs.
- Claude Code ignores the project's allow rules until the folder is trusted once interactively.
- No eval set and no cost per change. The setup is judged by one change.
- No WCAG claim until a person does a keyboard and screen-reader pass.

## 8. What is next

The order: make the process hard to bypass, then measure, then extend.

1. A stage gate in code: a script the conductor must ask before moving on; it refuses when an output is missing, a check is red or a stop has no answer.
2. Schemas for `change.md`, findings and `evidence.json`.
3. Hard write scopes: a `PreToolUse` hook on the spec's paths, plus a sandbox for shell writes.
4. A small eval set of frozen tasks, run whenever a skill, agent or model changes.
5. `/review` on a PR label in CI; findings only.
6. A React profile, to prove the stack claim.
7. A retro over `changes/archive/`: repair rounds, findings by type, where people overrode agents.

**How Figma would be added.** Code stays the source of truth: tokens in the repository pass contrast, visual tests and review; an edit in Figma passes none of these. Figma becomes a view of the system and an input to changes. A designer's token change goes through `/change` as type `ds`.

- **Tokens, code → Figma:** the Figma Variables REST API from CI after merge (automatic, Enterprise plan only), or Tokens Studio with GitHub sync (lower plans; multi-file sync is paid; its own token types may need build changes). Six themes map to variable modes; check the mode limit of the plan.
- **Components:** Code Connect maps Figma components to our code, Vue through its HTML integration. Each mapping is written and reviewed by a person.
- **Agents reading designs:** the Figma MCP server gives a frame's screenshot, structure and variables. Its output is React by default: a reference to map onto our tokens, never code to paste. Rate limits need a paid seat.
- **In the cycle:** a frame link sits next to the request; the spec-writer maps each value to a token or stops; the frame can seed variant A; the design-reviewer compares shots with it.
- **Risks:** two sources drifting (one direction wins, and a check compares the exported JSON with the token files); seat cost; a frame is outside input, treated as data.

## 9. Where to look

| Question | File |
| --- | --- |
| Rules for every agent | `AGENTS.md`, `CLAUDE.md` |
| The cycle, sizes, stops, resume | `.claude/skills/change/SKILL.md` |
| Each subagent: inputs, write scope, output | `.claude/agents/*.md` |
| DS rules, accessibility, Vue profile | `.claude/skills/ds-rules/`, `a11y-checklist/`, `stack-vue/` |
| What agents may not do | `.claude/settings.json`, `AGENTS.md` rule 7 |
| A component done right | `packages/ui/src/components/Button/` |
| A full change record | `changes/archive/0001-discount-code-receipt/` on branch `change/0001-discount-code-receipt` |
