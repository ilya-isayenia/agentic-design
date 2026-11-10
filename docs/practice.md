# Practice — learning tasks

Tasks for learning the system by using it, easiest first. Each one ends in something you can show. The story of the system is in [overview.md](overview.md); install and the commands are in [getting-started.md](getting-started.md).

How to use:

- Do the tasks in order. P1 and P2 need no agent; P3 onwards each make a real change, a branch and a pull request.
- Before a task is done, answer its **defend it** questions out loud to someone who did not build the system. If you cannot, the task is not done. Most answers are in [defending.md](defending.md) or in the files the task names; the question number is given where one fits.
- Answer the stops yourself. Your decisions should end `by: human` in `log.md`; that is the difference from PR #1, where an agent answered every stop.
- Merge your own PRs on GitHub after reading `evidence.md`. The agent never merges.
- If something in the system turns out wrong while you work, write it down with the file and the line. Finding a real defect counts more than finishing a task.

---

### P1 Run the app and Storybook; switch brands and modes

- **Goal:** see the product and the design system with your own eyes, in every theme and state.
- **What to do:**
  - Install and run as in [getting-started.md §1–2](getting-started.md#1-install). Start Docker first.
  - `pnpm dev`. Walk the whole signup to the success page: search `arden`, Join now at Arden North, choose type, access, duration; test IBAN `NL13 TEST 0123 4567 89`; SMS code `123456`.
  - Switch **Brand** and **Mode** in the header. Then open the app with `?brand=volt&mode=light` before the `#`.
  - Trigger the states from [mock-data.md](product/mock-data.md): no results (`zzz`), finder error (`?mock=error`), submit error, wrong and expired SMS code.
  - `pnpm storybook`. Use the Brand and Mode toolbar. Open the **Matrix** story of Button, PlanCard and Receipt. Read `packages/ui/src/components/Button/Button.contract.md` next to its stories.
  - Follow one colour from `packages/tokens/src/brands/volt/light.json` to a class, using `docs/ds/README.md` ("How a token reaches a class").
  - Run `pnpm check` once and read the summary.
- **Done when:** you have walked the signup to success in all three brands; you have seen every finder state and both SMS errors; you can name every state in the PlanCard Matrix; `pnpm check` is green on your machine.
- **Defend it:**
  - Where does the accent colour on a button come from, file by file?
  - Why does `bg-red-500` render nothing here, and why is that a safety feature for agents? (Q23)
  - What does a Matrix story give you that a story per theme does not? What does it cost? (Q25)
  - Why do visual tests run in Docker?

### P2 Give the demo alone

- **Goal:** show the system in 15–20 minutes without notes.
- **What to do:**
  - Read PR #1 in full: its body (`evidence.md`), then `change.md`, `spec.md`, `log.md` and `review.md` in `changes/archive/0001-discount-code-receipt/` (on the branch `change/0001-discount-code-receipt` until it is merged).
  - Open the prototype shots in `shots/round-1/` and find variants A, B and C. Say in one line each how they differ.
  - Run [demo.md](demo.md) from "30 minutes before" to the end, timed, out loud. For the live step use any S request, or skip it and show PR #1 again.
  - Record yourself once and watch it.
- **Done when:** you finish under 20 minutes; you open every file the script names without searching; you can tell the story of finding #9 (accepted by an agent at refine, rated required by the reviewer, fixed with a workaround, follow-up logged) without looking.
- **Defend it:**
  - How do you trust agent output? (Q6)
  - All 15 decisions in PR #1 are by an agent. What are the human stops for? (Q19)
  - What is fake in the demo? (Q20)
  - You have five minutes instead of twenty. What do you show, and what do you cut?

### P3 An S change through `/change`

- **Goal:** run the whole cycle once at its smallest: spec, refine, validate, integrate, merge.
- **What to do:**
  - Pick a copy or spacing change you can see. For example: `/change on the duration step, change the heading to "How long do you want to train with us?"`.
  - Watch the stages. After the spec stage, open `changes/<id>-<slug>/spec.md` and check that every acceptance criterion names its proof.
  - After validate, read `review.md`. For each finding, say whether you agree.
  - Read `evidence.md` in the PR top to bottom, as [getting-started.md §4](getting-started.md#4-read-the-evidence-before-you-merge) says. If the change moved pixels, find the `baselines:` commit and look at the image diff.
  - Merge it on GitHub.
- **Done when:** the PR is merged by you; the folder is in `changes/archive/`; you can point to the commit of each stage in `git log`.
- **Defend it:**
  - Why does S have no spec stop and no prototype? What would make the spec-writer propose M instead? (Q5)
  - Why are the reviewers read-only, and why do they get a fresh context? (Q3, Q7)
  - The refiner skipped `pnpm check`. Where would you see it? (Q9, Q11)
  - What stops the agent from editing `AGENTS.md` during your change? What does not? (Q13)

### P4 `/review` a screen and act on its findings

- **Goal:** use the reviewers without the cycle, and turn findings into a change.
- **What to do:**
  - Run `/review PlanCard`, then `/review /join/arden-north/access`.
  - Read the findings table and the design score. Open the shots in `changes/review/` (git-ignored) that the reviewers saw.
  - Watch for: route shots need signup state. `/change` passes it through `evidence.json`; `/review` writes a session file and passes `--session` to `pnpm shots` (checked on `/join/arden-north/duration`: the shot shows step 3). If a route shot still shows step 1 or the finder, the session file lacks an earlier answer; it is a real defect: write it down, and review by component instead.
  - Choose the findings you agree with. Reject at least one and write why.
  - Start the fix as the review skill says: `/change fix the findings from this review: <the ones you chose>`.
- **Done when:** you have both findings tables; the fix change is merged or waiting at a stop; you can say why you rejected the finding you rejected.
- **Defend it:**
  - What happens when a reviewer is wrong? (Q8)
  - Why are findings under confidence 80 hidden? What would you change about the threshold?
  - Why does `/review` edit nothing?
  - The design score went up from 7.2 to 8.2 in PR #1. Does the score gate anything? (Read the Rubric in `.claude/agents/design-reviewer.md`.)

### P5 An M change: a new component variant with a prototype round

- **Goal:** practise the prototype stop: compare variants, choose or mix, and see the chosen one rebuilt properly.
- **What to do:**
  - Request a new variant with an open layout, for example: `/change add a compact variant of ClubCard for the club list at 375 px, so three clubs fit on one screen; show me options`. Keep "show me options" in the request: for M the prototype is optional, and the conductor skips it when the spec says the layout is fixed.
  - At the prototype stop, open Storybook under **Explorations**, and the shots in `changes/<id>-<slug>/shots/round-1/`. Compare the variants at 375 px in a light and a dark theme.
  - Answer once with a mix or feedback ("A's layout with C's price position") to get a second round, then choose.
  - After refine, check the new contract rows, the stories and the ClubCard Matrix. Read the `baselines:` commit.
- **Done when:** `log.md` has your choice ending `by: human` and a `chosen:` line; ClubCard's contract, stories, Matrix and tests cover the new variant; the explorations folder is gone; the PR is merged.
- **Defend it:**
  - Why may variants differ in structure, density or interaction, but never in invented style? (See "What a variant may and may not change" in `.claude/agents/prototyper.md`.)
  - Why is the chosen variant rebuilt by the refiner instead of moved over from `explorations/`?
  - Why does originality have weight 0 in the design rubric?
  - The baselines changed. Who accepted them, and how? (Q12)

### P6 Resume an interrupted change with `/change continue`

- **Goal:** see that the record in the repository, not the session, carries the work.
- **What to do:**
  - Start any change (P7's L change works well). When `log.md` shows `refine: start`, quit Claude Code.
  - Look at the branch: `git log --oneline -5`, `git status`, `change.md` (stage, status). If the tree is dirty, the stage left uncommitted work; continue refuses a dirty tree. Decide yourself: commit it, stash it or discard it, and say why.
  - Start `claude` again. Run `/change status`, then `/change continue <id>`.
  - At the next stop, run `/change continue <id>` without an answer and see the question again. Then answer it.
- **Done when:** the change goes on to its next stop after the break; `log.md` shows the stage started again; you can say what was lost and what was kept.
- **Defend it:**
  - What exactly is lost when a session dies mid-stage? Why commit before every stop?
  - Why must subagents run in the foreground? (The background fix subagent in PR #1's run, [overview §7](overview.md#7-what-is-weak).)
  - What happens if two sessions continue the same change at once? Nothing prevents it today. What would you add?
  - Two open changes could get the same id. Why did that happen before, and what closes it now? Which case is still open (two people, same minute)? (Q26)

### P7 An L change: price per workout against workouts per week

- **Goal:** the full cycle with all three stops, and a new component built on the chart tokens.
- **What to do:**
  - Use request 1, "Price of one workout by workouts per week", from [getting-started.md §6](getting-started.md#6-your-first-changes), exactly as written there.
  - Answer the spec-writer's questions as the product owner. Read the spec before you accept it: states, acceptance criteria, what is out of scope.
  - Give feedback in round 1 instead of choosing at once; choose in round 2 or later.
  - When it is built, open the chart's Matrix story and check every theme. Read what the a11y-auditor said about how a screen-reader user gets the numbers.
  - Read `evidence.md`, merge. Requests 2 and 3 in [getting-started.md §6](getting-started.md#6-your-first-changes) are the next practice at the same size.
- **Done when:** the PR is merged; every spec and prototype decision in `log.md` ends `by: human`; the chart uses only `chart-*` and other semantic tokens (lint green, contrast green); `evidence.md` is complete.
- **Defend it:**
  - Why a hand-written SVG component and not a chart library?
  - How does a person who cannot see the chart get its information? Where is that tested?
  - What contrast do `chart-1`…`chart-5` and `chart-label` need, and why are they different? (`docs/ds/colour.md`)
  - Which of your answers at the spec stop could an agent not have decided? Why?

### P8 Capstone: build your own presentation site from scratch (XL)

The last and main task. Everything before it was practice for this one.

- **Goal:** a one-page, slide-like presentation site about your own work, built through `/change` size XL: brief, product spec, plan, child changes, whole-product review.
- **What to do:**
  1. Copy [site-brief-template.md](site-brief-template.md) to `docs/briefs/<name>.md` (git-ignored) and fill it in yourself, in your own words: who you are, which cases you show, what you can honestly say about each. The main case is this repository: the signup app and its Storybook, with their live links.
  2. Put screenshots of the reference format next to the brief, in `docs/briefs/<name>/`, and name them in the brief's References. The agent cannot open a password-protected reference; it can read a screenshot. Optional: explore 2–3 looks for your site in Claude Design (claude.ai) first and add the chosen one's screenshots as a reference too; it cannot build on our Vue components, so it is a reference, not a source.
  3. Run `/change build a new presentation site from docs/briefs/<name>.md as a new app apps/site`.
  4. Decide at every stop yourself: the product spec, the plan, the plan again after the scaffold, the prototype choice for each section, the whole-product review, each merge.
- **Notes:**
  - Take the reference's format (one idea per slide, the order of a case, the pacing), not its texts or its styling. The look comes from the design system.
  - Content comes from the brief, not from a CV. Write only what you can defend in front of someone who asks "how do you know?".
  - The repository is public. Do not commit personal documents; the brief's text ends up in the change record, the screenshots stay git-ignored.
- **Done when:** the site builds, `pnpm check` is green, every PR including the record PR is merged, and the site is on Pages at `/site/`.
- **Defend it:**
  - Why did the plan change after the scaffold, and what would have gone wrong without that stop?
  - What did the whole-product review catch that the per-section reviews missed? (Q31)
  - Which content decisions were yours and which the agent's? Show the `by: human` and `by: agent` lines.
  - Why is a new product many changes and not one big one? What does the merge between children cost?

---

After P8, answer every question in [defending.md](defending.md) out loud, in your own words, with the file you would open to prove it.
