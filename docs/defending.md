# Defending it — hard questions

Questions an enterprise architect, a lead engineer or a design-system owner is likely to ask, with short honest answers grounded in the repository. Say the weak parts before you are asked. The story behind the answers: [overview.md](overview.md). Practise them out loud; every task in [practice.md](practice.md) points back here.

## The approach

**1. Why not one big prompt?**
A long prompt mixes stages, and the model drifts: it skips the error state, forgets a theme, reviews its own work in the same context. Here each stage has its own instruction and only the inputs it needs (`.claude/agents/*.md`). The design rules and the accessibility checklist load as skills only for the agents that need them. The conductor holds the order.

**2. Why a fixed workflow and not an autonomous agent that plans its own steps?**
The steps of a UI change are known in advance: spec, options, build, review, integrate. When the steps are known, fixing them in writing costs nothing and removes a whole class of errors. The model decides how to do a stage, never which stage comes next. Autonomy is kept for what is really open: the content of a spec, the variants, the code, the findings.

**3. Why six subagents and not one agent?**
Three reasons. Context: each subagent starts clean and reads only its inputs, so a long change does not fill one window. Independence: the reviewers never see the refiner's reasoning, so they do not inherit its blind spots. Scope: each one has its own tools and write paths; the reviewers have only Read, Grep and Glob.

**4. Why not an orchestration framework or an off-the-shelf spec toolkit?**
The stages fit in one written instruction (`.claude/skills/change/SKILL.md`, 167 lines). A framework would add code to run and maintain without adding a check. Generic spec toolkits are not design-aware and are heavy for one change; their good ideas (a folder per change, sizes, approval gates) are taken and adapted. The cost is real: the order is enforced by an instruction, not by code (question 11).

**5. Who decides the size, and what if it is wrong?**
The spec-writer proposes it from a table (`.claude/agents/spec-writer.md`, "Size and type"). The human can change it at any stop by answering `size M`; the conductor then follows the new row from the current stage. A size hint in the request wins. An S that should have been M shows up in review: the reviewers check against the state table, not against the size.

## Trust

**6. How do you trust agent output?**
In layers, cheapest first. Scripts: `pnpm check` runs types, lint with a no-raw-values rule, unit tests, Storybook tests with axe as errors, contrast in six themes, visual tests in Docker, e2e with axe, denylist. Then three read-only reviewers with a fresh context. Then `pnpm evidence`, which refuses to build the PR body while anything is missing. Then a person reads `evidence.md` and merges. Trust comes from checks and evidence, not from the agent's claim.

**7. The reviewers are the same model as the builder. Isn't that marking your own homework?**
Partly, yes. All agents use `model: inherit`. What helps: a fresh context with no access to the builder's reasoning, read-only tools, a rubric with fixed anchors for 3, 6 and 9, and an instruction to assume the spec is not met until a shot shows it. In PR #1 the reviewers found four required issues the builder missed, one of which an earlier agent decision had accepted. A different model for review would be stronger; it is not set up yet.

**8. What happens when the reviewer is wrong?**
A false positive: the refiner in fix mode may put a finding into `questions` with its reason instead of fixing it, and the conductor asks the human. A finding the human defers or rejects is not raised again in later rounds. After two fix rounds with required findings still open, the human decides. A false negative is caught, if at all, by the checks and the human reading the evidence. The confidence threshold of 80 is a convention, not calibrated.

**9. What if the agent says the checks are green and they are not?**
It does not report them; a script does. `pnpm check` writes `.check/results.json` with the commit. `pnpm evidence` refuses if any step failed, if fewer than nine steps ran, or if code changed after the checks ran. CI runs the same `pnpm check` on the PR, outside the agent's reach.

**10. What stops an agent from weakening a test to make it pass?**
Rules and review, not enforcement. `AGENTS.md` rule 5 forbids it. The refiner's instruction has a "red flags" table ("The test is flaky; skip it" → never). The code-reviewer looks for removed assertions, `.skip`, loosened lint rules and stories excluded from axe. CI and the human see the diff. A hook that rejects such diffs is not built.

**11. The conductor can skip a stage. Then what is the process worth?**
Today the order lives in an instruction. The one hard gate is at the end: `pnpm evidence` fails without a review, a passing check run, shots for every brand and mode, and a reason for every state. So a skipped review or a skipped check blocks the PR. The next step is a stage gate in code that the conductor must ask before moving on.

**12. The agent regenerates visual baselines itself. Can it bless its own bug?**
It can propose it. Baselines change only through `pnpm test:visual:update`, in a separate commit `baselines: <reason>`, and the Edit and Write tools are denied on `tests/visual/baselines/`. The human accepts them by approving the PR, where GitHub shows the old and new image side by side. This only works if the human looks; that is a weak point.

## Safety

**13. What stops an agent from editing its own rules?**
`.claude/settings.json` denies the Edit and Write tools on `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.github/**` and the baselines, and denies force-push, `--no-verify`, `gh pr merge` and repository edits. A shell command can still reach those files; that is why `AGENTS.md` rule 7 says "not allowed", not "cannot". The next step is a `PreToolUse` hook plus a sandbox for shell writes. Any edit to those paths is also visible in the PR diff.

**14. What if a brief, a ticket or a design frame contains instructions?**
It is input, treated as data. The spec-writer turns it into a spec a human can read; the reviewers can only read; no agent can merge. The blast radius is one branch and one PR. Hard path limits would narrow it further; they are not built.

**15. How do you keep personal data and secrets out?**
There are no secrets: payment, SMS and maps are stubs. `pnpm denylist` scans the tree, commit messages and every patch in history for strings from a secret list, home-directory paths and tilde paths, and prints only where, never the match. Locally it passes when `DENYLIST` is unset; in CI the secret is set.

## Cost and limits

**16. What does a change cost, and how long does it take?**
Cost per change is not measured; that is a gap. Time: change 0001, size L, ran from 20:32 to 21:56 by commit time, across five headless processes, with the stops answered by another agent at once. An L change is heavy on purpose: one prototype round, three review rounds, each with three reviewers. An S change skips the prototype and the spec stop. Recording cost and time per stage in `log.md` is cheap and should come next.

**17. What are the limits: context, rate limits, flaky runs?**
Each subagent has a turn limit (`maxTurns` 25 to 80). Repair loops stop after two rounds. Every stage commits, so a crash or a limit costs one stage, not the change. Runs vary: the same request can produce different questions. Without an eval set nobody can show how much they vary (question 28).

**18. 69 MB of screenshots in one PR. How does that scale?**
It does not. PR #1 holds 502 PNG files. It needs a decision before merge: keep only `after/` at 1280 px in git and the rest as CI artifacts, or use Git LFS. Once merged, removing them means rewriting history.

## The human

**19. In PR #1 all 15 decisions are by an agent. What are the human stops for?**
In the first run the point was to prove the cycle and the resume, unattended, so another agent answered each stop with `agent:` and a reason. The log says so on every line. The stops exist and work: each one committed, ended the process, and the next `/change continue` picked up the answer. With a person at the keyboard the same lines say `by: human`.

**20. What is fake in the demo?**
The data, copy, prices, clubs and codes are invented; payment, SMS and maps are stubs. No person answered PR #1's stops. Only one change has gone through the cycle. The Pages links do not work while the repository is private. App screens have pixel baselines in four theme and width pairs, not all twelve; the other themes are covered by axe only.

**21. What if the human gives a vague answer at a stop?**
That is allowed. "A's layout with B's accent" or "more options with denser cards" becomes the brief for the next prototype round; the prototyper never repeats a rejected idea. A change to the spec goes back to the spec-writer. The answer is logged word for word.

## Design system

**22. Why Storybook and not Figma as the spec?**
Storybook renders the real components with the real tokens, so what you approve is what ships. Checks run on it: axe, play functions, visual tests on the Matrix stories. A Figma file passes none of these and needs a sync that can drift. Figma can be added as a view and an input, with code as the source of truth ([overview §8](overview.md#8-what-is-next)).

**23. DTCG tokens, three tiers, a reset Tailwind theme — isn't that heavy for one app?**
It is what makes six themes and agent safety cheap. Because the default theme is reset, an agent cannot use a colour outside the system: the class produces no CSS. Because the palette is not exported, a component cannot reach a raw colour. Adding a brand is adding token files. The cost was paid once, at setup.

**24. How do you know accessibility is really fine?**
Automation finds only part of the problems. Here: axe as errors on every story and Matrix story, axe on every app screen in six themes, the Vue accessibility lint, contrast over every token pair. The a11y-auditor covers what a rule engine cannot judge: keyboard path, focus after an action, announcements, reduced motion, forced colours. We make no WCAG 2.2 AA claim until a person does a keyboard and screen-reader pass.

**25. The Matrix is one big picture. How do you find what changed?**
The visual test names the component. Finding the exact state and theme in the diff image is left to the person or the design-reviewer. It is the price of checking six themes without hundreds of stories.

## Scale

**26. How does this scale to a team?**
The unit is one change: one folder, one branch, one PR. Several people can run changes in parallel, each in their own session. CI runs the same `pnpm check`. Two things are missing for a team. Change ids count the folders on the checkout and the open `change/*` branches (`pnpm evidence --next-id`), which covers one machine's view after `git fetch`, but two people starting a change at the same minute can still collide. Nothing like code owners guards `.claude/`. Review on a PR label in CI is not set up.

**27. How would a React project use it?**
Add a `stack-react` profile: component API conventions, file layout, story and test patterns, review checks. Tokens, DS rules, the cycle and the tools stay. Honestly, more than one file changes: the profile name is hard-coded in the `skills:` field of the prototyper, refiner and code-reviewer; the ESLint config, the Storybook framework package and the Matrix helpers are Vue; `a11y-checklist` has a Vue section. Still a few files, not a redesign.

**28. How do you know an edit to an instruction did not make results worse?**
Today we do not. The next step is a small eval set: a few frozen tasks (a token change, a new variant, a page with planted defects, a request that must end in a question), run a few times whenever a skill, agent or model changes, compared on findings, rounds and checks.

**29. Isn't this locked to one vendor's tool?**
The knowledge is plain Markdown: `AGENTS.md`, the DS rules, the checklist, the rubric, the change record. The scripts and checks are Node and Playwright. What is tool-specific is the skill and subagent format and the conductor's use of subagents. Moving would mean rewriting the conductor, not the rules.

**30. What would you do first next week?**
Make the process hard to bypass: a stage gate in code and a write-scope hook. Then measure: cost and time per stage, and an eval set. Only then reach: Figma as a view of the tokens, and a React profile.

**31. Can it build something from scratch, or only change what exists?**
It can, through size XL, a mode for new products: spec → plan → child changes → whole-product review (`change/SKILL.md` §9, brief in `docs/site-brief-template.md`). The parent writes a product spec and a plan; the first child scaffolds a new app in `apps/<name>/` on the same design system; each later child adds a section as an ordinary S, M or L change with its own PR; the plan comes back after the scaffold; at the end the design and accessibility reviewers look at the assembled product once, because each child's reviewers saw only their slice. The first run ("a two-section landing page as a new app `apps/landing`, Pulse brand") went from request to PR #2 in six headless processes: the product spec stop raised a real design-system question (calls to action are links, Button renders only `<button>`) that became its own child in the plan; the scaffold child took three review rounds (4 required findings, then 1 critical — section headings white on the light page — then none; design score 6.9 to 8.4) and found a skip-link bug in the signup app as a side effect. When PR #1 merged meanwhile, PR #2 conflicted; that is why the cycle now merges `origin/main` before a PR and on every continue while waiting for merge. Honest limits: every decision was `by: agent`; the re-plan answer, the later children, the whole-product review and the record PR have not run yet, because each needs a person to merge the previous PR; PR #2 is left open as the example.
