# Demo — script and fallback

**One sentence:** a signup app on its own six-theme design system, where every change goes through one fixed cycle (spec, prototypes, refinement, independent review, integration), checks decide "done", and a person reads one page of evidence and merges.

Length: 15–20 minutes plus questions. Quote only numbers from the table at the end or from [overview.md](overview.md). Hard questions: [defending.md](defending.md).

## Before the demo

**The day before**

1. **Decide PR #1 and merge it.** Read its `evidence.md`, decide what to do with its 69 MB of screenshots ([overview §7](overview.md#7-what-is-weak)), then merge it on GitHub. Why before the demo: it keeps the demo history short. The next change id counts the folders on the checkout and the open `change/*` branches, so a new change gets `0002` even while PR #1 is open.
2. **Trust the folder.** Run `claude` in the repository once and accept the trust dialog. Until then Claude Code ignores the allow rules in `.claude/settings.json` and asks permission for every command.
3. **Dry run one S change** with the request from step 6 below, end to end. Note how long it took. Leave its PR open: you merge it live at the end. It is also your fallback if the live run is slow.
4. **Warm up:** start Docker Desktop, run `pnpm install` and `pnpm check` on `main`. The first visual run pulls the Playwright image; do not let that happen live.
5. **Save offline copies** of PR #1's page and of the dry-run PR (print to PDF), in case the network fails.

**30 minutes before**

- `git switch main && git pull`, `git status` clean. Docker running.
- Terminal 1: `pnpm dev` → http://localhost:5173/agentic-design/
- Terminal 2: `pnpm storybook` → http://localhost:6006
- Terminal 3: `claude` in the repository, idle.
- Browser tabs: the app; Storybook at `?path=/story/components-plancard--matrix`; PR #1 (`gh pr view 1 -R ilya-isayenia/agentic-design --web`); the dry-run PR.
- Editor open on the repository.

## The script

| Time | Show | Say |
| --- | --- | --- |
| 0:00 | `README.md` | The one sentence. "Three parts: an app, a design system, and an agent setup that makes every change. I will show each, then a change made live." |
| 1:00 | App tab. Search `arden`, press Join now at Arden North, go through steps 1–3. Point at the sticky receipt. | "A five-step signup with a receipt that follows you. All data is invented; payment, SMS and maps are stubs." |
| 2:00 | Header: switch **Brand** to Volt, then Lumen; switch **Mode**. | "Six themes. A theme is two attributes on the root element. No component knows which brand it is in." |
| 2:30 | Back to the finder, search `zzz`. | "The no-results state. Every screen has its states: loading, empty, error, partial, success, permission. Remember this hint; I will change it live." |
| 3:00 | Storybook: PlanCard **Matrix**. Then the toolbar Brand and Mode. | "There is no design file. Storybook is the spec. This one canvas is every state of PlanCard in all six themes. Visual tests and axe run on it, so every theme is checked." |
| 4:00 | Editor: `packages/ui/src/components/PlanCard/PlanCard.contract.md`, then `packages/ui/src/styles/index.css` (the `--*: initial` line). | "Every component has a contract: props, slots, events, states, tokens, accessibility. Tailwind's default theme is reset, so `bg-red-500` does not exist. An ESLint rule fails on any raw colour or length." |
| 5:00 | PR #1 page, top of the body. | "This is the first change made through the cycle: a discount code in the receipt, size L. The PR body is `evidence.md`, built by a script. Top line: 15 decisions, all by an agent — no person answered the stops in this run. 11 findings, none open that block. 9 of 9 checks green at this commit." |
| 6:00 | Scroll: **Acceptance criteria**, then **States**. | "Every criterion names its proof: a story, a unit test or an e2e test. In the states table, partial and permission say *why* they do not apply. 'Not tested' is never a reason." |
| 7:00 | **Review findings**, row 9. Then `review.md` link, Round 2. | "The interesting one. At refine, an agent accepted that Apply jumps under the field while loading. The design reviewer, with a fresh context, rated it required anyway. The fix is a workaround: a hidden copy holds the width. The real cause is in Button, so that is logged as its own change." |
| 8:00 | `log.md` link: the decision lines. | "Every decision line ends `by: human` or `by: agent`, with the reason. Nothing else counts as a decision." |
| 8:30 | Files changed: one baseline PNG (e.g. `components-receipt--matrix.png`), image diff. Then the commits list. | "Baselines change only through one command, in a separate `baselines:` commit. You accept them by approving the PR, where GitHub shows old and new side by side. Each stage is one commit." |
| 9:30 | Terminal 3: type the live request (below). | "Size S: a copy change. No prototype, no spec stop. It will spec, refine, review and open a PR, and stop only for merge." |
| 10:30 | Editor: `.claude/skills/change/SKILL.md`, section 2 (sizes) and section 5 (stops). | "The conductor is a written instruction. It holds the order and the stops, starts one subagent per stage, commits after each. It writes no code itself." |
| 11:30 | `.claude/agents/design-reviewer.md`: `tools: Read, Grep, Glob`, then the Rubric table. | "Reviewers can only read. They never see the builder's reasoning. Findings have severity and confidence; only 80 or more is reported. Originality has weight zero: in a design system, fitting beats novelty." |
| 12:30 | `.claude/settings.json` deny list; `AGENTS.md` rule 7. | "Agents may not edit their own rules, CI or baselines, force-push or merge. Honest part: deny rules stop the edit tools, not every shell command. The rule says 'not allowed', not 'cannot'." |
| 13:30 | Terminal 3 and the editor: `changes/<id>-<slug>/change.md`, `spec.md`, `log.md`. Run `git log --oneline -5`. | "Live: the folder, the branch, the spec with its acceptance criteria and state table. One commit per stage, so if I close this terminal now, `/change continue <id>` picks it up." |
| 15:00 | The dry-run PR from yesterday. Read its evidence top, then merge it on GitHub. | "This is what the live one will look like when it ends. The agent never merges; I do." |
| 16:00 | [overview.md](overview.md) section 7. | "What is weak: the process is enforced by an instruction, not code; all decisions in PR #1 were by an agent; 69 MB of screenshots per L change; one change is not a measurement. Next: a stage gate in code, hard write scopes, an eval set, then Figma as a view of the tokens, with code as the source of truth." |
| 17:00 | End. | Questions. |

**The live request** (step 9:30), typed exactly:

```
/change on the club finder, when no club matches, change the hint to "Check the spelling, or search by town instead of postcode."
```

What to expect: a new folder `changes/<id>-finder-no-results-hint/` (the slug may differ), a branch `change/<id>-…`, a short `spec.md`, size S, type edit. Then refine, three reviewers, integrate, PR. It will probably still be running at 13:30; show whatever stage it reached. If it stops with a question, read it out, answer it with the printed `/change continue <id> — <answer>` line, and say: "this is the stop-and-ask rule working."

## If something fails live

| What fails | Do this |
| --- | --- |
| Claude Code asks permission for `git pull`, `git merge` or another command | Allow it. The allow list in `.claude/settings.json` does not cover every command the conductor uses. Say so; it is a known gap. |
| Permission prompts for every command | The folder is not trusted. Accept the dialog, or skip to the dry-run PR. |
| `/change` says the tree is not clean | `git status`; `git stash`; run the request again. |
| The live change is slow | Keep talking over the agent files; at 15:00 switch to the dry-run PR as planned. |
| A subagent returns `blocked` or a check is red | Show `log.md` and the stop message. "Red means not done, and the system says so instead of opening a PR." |
| `pnpm check` fails on visual | Docker is not running: `docker info`. |
| Port 5173 or 6006 is busy | Stop the old process, or read the new port from the terminal output. |
| No network, or GitHub is down | App and Storybook run locally. Show PR #1 from the PDF, and its record on `main` in `changes/archive/0001-discount-code-receipt/` (after the merge). |
| Rate limit or model error | Stop the live part and say why. Continue with the dry-run PR and the record. |

## Numbers you may quote

| What | Number | Where |
| --- | --- | --- |
| Components | 21, each with contract, story per state, Matrix story, tests | `packages/ui/src/components/` |
| Themes | 3 brands × 2 modes = 6 | `packages/tokens/src/brands/` |
| Contrast | 210 text/background pairs over 6 themes, all pass | `pnpm contrast` |
| Visual baselines on `main` | 48 (21 Matrix stories + 7 screens in 4 theme/width pairs) | `tests/visual/baselines/` |
| `pnpm check` on PR #1 | 9/9 green, under a minute by its own timings | PR #1 body, Checks |
| PR #1 cycle | 5 headless processes; 20:32 to 21:56 by commit time; resumed every time, once mid-stage | branch commits, `log.md` |
| PR #1 spec | size L, 5 questions, 23 acceptance criteria | `spec.md` |
| PR #1 prototypes | 1 round, 3 variants, 216 screenshots; B chosen | `log.md`, `shots/round-1/` |
| PR #1 review | 3 rounds; 4 required found and fixed, 7 optional open; design score 7.2 → 8.1 → 8.2 | `review.md` |
| PR #1 decisions | 15, all by agent | `log.md` |
| PR #1 screenshots | 502 files, 69 MB | `shots/` |
| Defects in our own tools found by the first cycle | 4, fixed on `main` | overview §7 |
| Cost per change | not measured | — |
