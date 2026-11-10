---
name: change
description: Run any work in this repository — feature, edit, design-system change, fix, or a new site, app or product (size XL) — as a change through spec, prototype, refine, validate and integrate. Use for "/change <request>", "/change continue <id> [— answer]" and "/change status".
argument-hint: "<request> | continue <id> [— answer] | status"
disable-model-invocation: true
---

# /change — the change cycle

You are the **conductor**. You hold the stage order and the human stops, start one subagent per stage, keep `change.md` and `log.md` up to date and commit at the end of every stage. You do no design or code work yourself: if something needs writing, a subagent writes it. You run in the main conversation because subagents cannot start subagents.

Arguments: `$ARGUMENTS`

## 0. Parse the arguments

| Arguments | Mode |
| --- | --- |
| `status` | list open changes (section 7) and stop |
| `continue <id>` or `continue <id> — <answer>` | resume (section 6) |
| anything else | a new change; the text is the request. If it asks for a new site, app or product, names a filled brief (`docs/site-brief-template.md`) or says "size XL", it is a new product: section 9 |

## 1. Folder, branch, record

A new change:

1. `git switch main && git pull --ff-only` (skip the pull if there is no remote). The tree must be clean; if not, stop and say what is dirty.
2. Id: `git fetch --prune` (skip if no remote), then `pnpm evidence --next-id`: the highest `NNNN` among the folders in `changes/` and `changes/archive/` and the open `change/*` branches (`git branch -a --list '*change/*'`), plus one, four digits. This keeps ids unique while another change's PR is open. Slug: 2–4 words of the request in kebab case.
3. `git switch -c change/<id>-<slug>`.
4. Create `changes/<id>-<slug>/` with `change.md` and `log.md` from `templates/`. Fill `request` with the request verbatim and `parent` with `—` (a child of a new product: section 9.3).

Folder contents over the life of a change:

| File | Written by | What |
| --- | --- | --- |
| `change.md` | conductor | the record: id, type, size, status, stage, waiting-for, branch, rounds |
| `spec.md` | spec-writer | what and why, acceptance criteria, state table, out of scope, questions |
| `log.md` | conductor | one line per stage start/end, prototype round and decision |
| `review.md` | conductor, from reviewer output | findings per round and what was fixed |
| `evidence.json` | refiner | the evidence record: states, stories, routes, viewports (format in `templates/evidence.json`) |
| `checks.json` | `pnpm check` (copied by `pnpm evidence`) | result of every check at a commit |
| `evidence.md` | `pnpm evidence <id>` | what the human reads before merge |
| `shots/` | `pnpm shots <id>` | screenshots: `before/`, `round-N/`, `after/` |

## 2. Size decides the stages

| Size | Stages | Human stops |
| --- | --- | --- |
| S | spec (short) → refine → validate → integrate | merge |
| M | spec → prototype (1 round, optional) → refine → validate → integrate | prototype choice, merge |
| L | spec → prototype (rounds until chosen) → refine → validate → integrate | spec, prototype choice, merge |
| XL | new product: product spec → plan → child changes (each S, M or L, own branch and PR) → whole-product review; section 9 | product spec, plan, each child's merge, re-plan after the first child, whole-product findings, merge of the record |

The spec-writer proposes the size and the type (`feature | edit | ds | fix`). The human can change the size at any stop ("size M"); then follow the new row from the current stage.

Questions from any subagent are an extra stop at any size.

## 3. Stages

Before each stage: set `stage` in `change.md`, add `- <date> <stage>: start` to `log.md`. After it: add the outcome line, commit everything with `change <id>: <stage> — <one-line outcome>`.

### 3.1 spec

Start **spec-writer** with: the request, the change folder path, the size hint if the human gave one. It writes `spec.md` and returns `{ size, type, questions[] }`.

- `size: XL` (it found a new product, not a change to this one): continue with section 9.1 in this folder.
- Write `size` and `type` into `change.md`.
- If `questions` is not empty: **stop** (section 5) with the questions.
- Size L: **stop** for spec approval ("accept", or what to change). Changes go back to spec-writer with the answer; then stop again.
- Size S or M: continue.

### 3.2 prototype (M optional, L required)

Start **prototyper** with: the spec path, the change folder, the round number, and every earlier round's feedback from `log.md` (including rejected ideas). It writes 2–3 variants as stories under `explorations/` and returns `{ variants: [{ name, storyIds[], differs }], questions[] }`.

Then run `pnpm shots <id> --label round-<N> --stories <all variant story ids>` (all brands, both modes, 375 and 1280 px). Shots of variants go under `shots/round-<N>/`.

**Stop** with: one line per variant (`A — <differs>`), the story ids, the shot folder, and the question "Which variant, or what to change?". Answers like "B", "A's layout with B's accent", "more options towards denser cards" are all valid.

- A choice ("B", "the second") → log it, write `chosen: <story id>` in `log.md`, go to refine.
- Feedback → round N+1 with the feedback. There is no round limit for L; for M, after round 1 a "none" answer means: skip prototypes, refine from the spec.

For M the prototype is optional: if the spec says the layout is fixed (a new state of an existing component), skip it and log `prototype: skipped (<reason>) by: agent`.

### 3.3 refine

Start **refiner** in mode `refine` with: spec path, chosen variant story id (or "from spec" for S), change folder. It builds the finished components or screens with all states, brands, modes, keyboard and tests, updates baselines if visuals changed (separate commit `baselines: <reason>`), writes `evidence.json`, runs `pnpm check`, and returns `{ status: done | blocked, questions[], checks }`.

- `blocked` or questions → **stop**.
- Then run `pnpm shots <id> --label after --from-record` and continue.

### 3.4 validate

Reviewers have read-only tools (Read, Grep, Glob), so prepare their inputs first: `git diff main...HEAD > changes/<id>/.review/diff.patch` and `git diff --stat main...HEAD > changes/<id>/.review/files.txt` (`.review/` is git-ignored). Then start **design-reviewer**, **a11y-auditor** and **code-reviewer** in parallel (one message, three Task calls). Give each: the change folder, the spec path, the `.review/` files, `checks.json` if present, and the shots folder. They return findings: `{ severity: critical | required | optional | nit, confidence: 0-100, where, what, why, fix }`; they only report confidence ≥ 80.

Append a round section to `review.md` (template in `templates/review.md`), one row per finding with its reviewer.

- No critical or required findings → integrate.
- Otherwise start **refiner** in mode `fix` with the critical and required findings only, then re-run the three reviewers on the new diff. Record what was fixed in `review.md`.
- After **two** fix rounds with critical or required findings still open: **stop** and ask the human which to fix, defer or reject.

Optional and nit findings are listed in `review.md` and the PR; they never block.

### 3.5 integrate

Start **refiner** in mode `integrate`: wire the work into the app (data, state, routes), add the e2e scenario from the spec's acceptance criteria, delete `explorations/` of this change, run `pnpm check`. It returns `{ status, checks }`.

Then, yourself:

1. `pnpm evidence <id>`. It exits non-zero and lists what is missing (a state without evidence, a failed check, no shots for a brand, an open required finding). Missing items go back to the refiner once; if still missing, **stop** and show the list. Never open a PR with an incomplete evidence record.
2. `git mv changes/<id>-<slug> changes/archive/<id>-<slug>`; set `status: done`, `stage: merge` in `change.md`; commit `change <id>: integrate — evidence complete`.
3. **Sync with main** (also on every continue while waiting for merge, section 6): `git fetch` and `git merge origin/main`, never a rebase. If anything came in, run `pnpm check` and `pnpm evidence <id>` again and commit. Resolve a conflict yourself only when both sides can be kept as they are (rows added to the same table in a doc, two records, `pnpm-lock.yaml` through `pnpm install`); any other conflict: **stop** with the files.
   Then `git push -u origin HEAD` and `gh pr create --base main --title "<type>: <summary> (<id>)" --body-file changes/archive/<id>-<slug>/evidence.md`. Write the PR link into `pr` in `change.md`, commit `change <id>: pr link`, push.
4. **Stop** for merge: print the PR link. The human merges on GitHub; you never merge. A child of a new product stops as section 9.3 step 6 says.

## 4. Subagents

Start every subagent in the **foreground** (never `run_in_background`) and wait for its result before you write the stage outcome. In print mode (`claude -p`) the process ends with your last turn and background subagents are stopped mid-work. The three reviewers run in parallel as three foreground Task calls in one message.

Routes in `evidence.json` that need signup state carry it (`{ "route": …, "session": { "signup": … } }`, see the template); `pnpm shots --from-record` seeds sessionStorage before each such route.

| Subagent | Writes | Never |
| --- | --- | --- |
| spec-writer | `changes/<id>/spec.md` | code |
| prototyper | `**/explorations/**` stories and components | production paths |
| refiner | paths the spec names; app paths in integrate; `evidence.json`; baselines via `pnpm test:visual:update` | `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.github/**` |
| design-reviewer, a11y-auditor, code-reviewer | nothing (read-only) | edits |

When a subagent returns questions (a missing token or component, an ambiguous or contradicting spec, work outside its write scope), you stop and ask. You do not answer them yourself unless the change runs unattended (section 5).

## 5. Stops

A stop:

1. Set `status: waiting` and `waiting for: <what>` in `change.md`.
2. Log the question in `log.md`.
3. Commit (`change <id>: waiting — <what>`) so a new session can resume from the branch.
4. Print, and end your turn:

```
Change <id> waits for: <what>
<the question, the options, links to shots or stories>
Answer with: /change continue <id> — <your answer>
```

**Answers.** Write each answer into `log.md` as a decision line ending with `by: human`. An answer that starts with `agent:` was made by an agent standing in for the human (an unattended run); log it with `by: agent` and the reason it gives.

**Unattended runs.** If the request or the answer contains `--unattended`, do not stop at spec, prototype or question stops: choose yourself, log `<decision> — <reason> by: agent`, and go on. Still stop for merge.

Every decision line in `log.md` ends with `by: human` or `by: agent`. No other decisions exist.

## 6. Continue

`/change continue <id> [— <answer>]`:

1. Find the folder whose name starts with `<id>` in `changes/` (or `changes/archive/` if it is waiting for merge). Not on this checkout: `git fetch --prune` and `pnpm evidence --find <id>` print the branch (or `main`) holding its newest copy.
2. `git switch` to its `branch` from `change.md` (or the one `--find` printed); the tree must be clean.
   - Size XL (a parent): section 9.4.
   - A child (`parent` is set) waiting for merge whose PR is merged (`gh pr view <pr> --json state`): continue its parent (section 9.4).
   - Waiting for merge and the PR is not merged: if `gh pr view <pr> --json mergeable` says `CONFLICTING`, or `main` moved, sync with main (3.5 step 3) and push. Then print the merge stop again and end.
3. Read `change.md`, `log.md` and, if it exists, `review.md`. The stage and `waiting for` say where you are.
4. If waiting and an answer is given: log it (section 5) and act on it from that stage. If waiting and no answer: print the stop again and end.
5. If not waiting (the session broke mid-stage): rerun the current stage from its start; work already committed on the branch stays.

## 7. Status

For each folder in `changes/` (not the archive): id, slug, size, stage, status, waiting for, parent — one table. For each XL parent, its `plan.md` children table under it. Then the last three archived changes with their PR state (`gh pr list --head <branch> --state all --json state,url`).

## 8. Rules

- One change, one branch, one PR. Do not mix two requests; propose a second change instead. A new product is many changes: its children, each with its own branch and PR, and one last PR for its record.
- Commit at the end of every stage and before every stop.
- `pnpm check` red means the stage is not done.
- The conductor's own writes are limited to `changes/**`.

## 9. XL — new product: spec → plan → child changes → whole-product review

A new site, app or product. The **parent** change holds the product's intent, its plan and the whole-product review, and builds nothing itself. Every piece is built by a **child**: a normal change (S, M or L, sections 1–5) with its own folder, branch and PR, linked to the parent by `parent` in its `change.md`. The person usually fills `docs/site-brief-template.md` first and names the file in the request.

Parent folder `changes/<id>-<slug>/`, on branch `change/<id>-<slug>`:

| File | Written by | What |
| --- | --- | --- |
| `change.md`, `log.md` | conductor | as for any change; `size: XL`, `type: feature`; `stage` is `product spec`, `plan`, `child <n>`, `product review` or `merge` |
| `brief.md` | conductor | the filled brief, copied verbatim when the request names a file |
| `product-spec.md` | spec-writer, mode `product` | purpose, audience, sections or screens, content per section, brand, constraints, out of scope, questions |
| `plan.md` | spec-writer, modes `plan` and `replan` | the app and its routes, and the children table in build order: `\| # \| Child \| Size \| Scope \| Id \| Status \| PR \|`. A living file: it changes at the re-plan stop and when the product review adds a fix child |
| `review.md`, `shots/product/` | conductor, from reviewer output; `pnpm shots` | the whole-product review rounds |
| `evidence.md` | `pnpm evidence <id>` | the parent summary: every child with its PR and evidence status, and the product review |

You keep the `Id`, `Status` and `PR` columns of `plan.md`; the spec-writer keeps them as they are. Status is one of `planned`, `doing`, `pr-open`, `merged`, `dropped`.

### 9.1 product spec

Create the parent folder as in section 1 (or keep the one 3.1 created). If the request names a brief file, copy it to `brief.md`; reference screenshots next to it (`docs/briefs/<name>/`, git-ignored) stay where they are, and `brief.md` lists their paths. Start **spec-writer** in mode `product` with the request, the folder and `brief.md`. It writes `product-spec.md` and returns `{ size: "XL", type, questions[] }`.

**Stop** always: "accept, or what to change", with its questions. Changes go back to the spec-writer (mode `product`) with the answer; then stop again.

### 9.2 plan

Start **spec-writer** in mode `plan` with the folder. It writes `plan.md`: child 1 is always the scaffold and navigation of the new app, then the children in build order, each with size and scope. **Stop**: "accept, or reorder, add, drop or resize children". Changes go back to mode `plan`.

### 9.3 children

Take the first row with status `planned`:

1. **Base.** The first child branches from the parent branch, so the parent record reaches `main` with the first child's PR. Every later child branches from an up-to-date `main` (`git switch main && git pull --ff-only`).
2. New id (`pnpm evidence --next-id`), slug from the row's Child column, `git switch -c change/<cid>-<slug>`, folder from `templates/` with `parent: <id>-<slug>`, `request: <id> child <n>: <scope from the row>`, `size: <row size>` as the size hint.
3. In `plan.md` set the row's Id and `doing`; in the parent `change.md` set `stage: child <n>`, `status: open`; log it in the parent `log.md`; commit `change <cid>: start (child <n> of <id>)`.
4. Run sections 3–5 for the child. Its spec-writer runs in mode `child` with the parent's `product-spec.md` and the row. The child's own stops print `/change continue <cid>`.
5. At the child's integrate, before the push: row status `pr-open`; parent `status: waiting`, `waiting for: merge of <cid>` (first child: `merge of <cid>, then re-plan`). After `gh pr create`, the PR link goes into the row as well.
6. **Stop** for merge, with the parent's next step:
   - first child — the **re-plan checkpoint**: "Merge <PR link>. Then answer with `/change continue <id> — <the plan as is, or what to reorder, add, drop or resize>`", and print the plan's table;
   - later children: "Merge <PR link>, then `/change continue <id>`".

### 9.4 continue the parent

`/change continue <id> [— answer]`:

1. `git fetch --prune`, `pnpm evidence --find <id>`. If the newest copy is on a child branch and that child is not waiting for merge, print the child's stop (`/change continue <cid>`) and end.
2. The active child's PR (`gh pr view <pr> --json state`) is not `MERGED`: sync it with main if it conflicts (section 6), print the stop again and end. Never take a re-plan answer before the merge.
3. Merged: `git switch main && git pull --ff-only`; the parent folder is on `main` now. In the working tree (not committed on `main`): row `merged`, the answer as a decision line in the parent `log.md`.
4. Re-plan answer: start **spec-writer** in mode `replan` with the answer; it rewrites the rows that are still `planned` and adds a line under "Changes to the plan". "As is" changes nothing.
5. A row is `planned`: 9.3 from step 2 (`git switch -c` carries the uncommitted record onto the child branch, and its first commit holds it). None: section 9.5, whose step 1 carries it the same way.

### 9.5 whole-product review

Every child is `merged` or `dropped`. Per-child reviewers saw only their slice; this round looks at the assembled product once.

1. `git switch -C change/<id>-<slug> main` (the parent branch; its own commits reached `main` with the first child). Parent `stage: product review`.
2. `pnpm shots <id> --label product --app <app> --routes <routes from plan.md> --brands <brands from plan.md>`: every route of the product, each brand × mode it uses, 375 and 1280 px.
3. Prepare `.review/files.txt` with `git ls-files apps/<app> tests/e2e/<app>`. Start **design-reviewer** and **a11y-auditor** in parallel in mode `product` with: the parent folder, `product-spec.md`, `plan.md`, `shots/product/`, `.review/files.txt` and every child's `review.md`. They judge narrative order, visual rhythm and consistency across sections, navigation and the keyboard flow end to end.
4. Append a round `## Product review <N>` to the parent `review.md`; commit.
5. No critical or required findings: section 9.6.
6. Otherwise **stop**: the findings, and "fix child (default), defer <n>, or reject <n> with a reason". A fix child is a new row `fix-product-review-<N>`, size S or M, type fix, its scope the findings; run it as in 9.3 (it branches from the parent branch, which carries the review). After its merge, `/change continue <id>` runs 9.5 again with round N+1. After two fix children with critical or required findings still open, stop and the human decides each one.

### 9.6 close

On the parent branch: `pnpm evidence <id>` must exit 0; it lists what is missing otherwise (a child not merged, a child's evidence not complete, an open finding, no product shots). Then `git mv` the folder to `changes/archive/`, `status: done`, `stage: merge`, commit `change <id>: product complete`, `git push -u origin HEAD`, `gh pr create --base main --title "product: <name> — record and whole-product review (<id>)" --body-file changes/archive/<id>-<slug>/evidence.md`. **Stop** for merge.

`--unattended` on a new product: you decide the product-spec, plan, re-plan and product-review stops (`by: agent`); every merge is still a stop.
