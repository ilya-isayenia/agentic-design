---
name: change
description: Run any work in this repository — feature, edit, design-system change or fix — as a change through spec, prototype, refine, validate and integrate. Use for "/change <request>", "/change continue <id> [— answer]" and "/change status".
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
| anything else | a new change; the text is the request |

## 1. Folder, branch, record

A new change:

1. `git switch main && git pull --ff-only` (skip the pull if there is no remote). The tree must be clean; if not, stop and say what is dirty.
2. Id: the highest `NNNN` in `changes/` and `changes/archive/`, plus one, four digits. Slug: 2–4 words of the request in kebab case.
3. `git switch -c change/<id>-<slug>`.
4. Create `changes/<id>-<slug>/` with `change.md` and `log.md` from `templates/`. Fill `request` with the request verbatim.

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

The spec-writer proposes the size and the type (`feature | edit | ds | fix`). The human can change the size at any stop ("size M"); then follow the new row from the current stage.

Questions from any subagent are an extra stop at any size.

## 3. Stages

Before each stage: set `stage` in `change.md`, add `- <date> <stage>: start` to `log.md`. After it: add the outcome line, commit everything with `change <id>: <stage> — <one-line outcome>`.

### 3.1 spec

Start **spec-writer** with: the request, the change folder path, the size hint if the human gave one. It writes `spec.md` and returns `{ size, type, questions[] }`.

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
3. `git push -u origin HEAD` and `gh pr create --base main --title "<type>: <summary> (<id>)" --body-file changes/archive/<id>-<slug>/evidence.md`.
4. **Stop** for merge: print the PR link. The human merges on GitHub; you never merge.

## 4. Subagents

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

1. Find the folder whose name starts with `<id>` in `changes/` (or `changes/archive/` if it is waiting for merge).
2. `git switch` to its `branch` from `change.md`; the tree must be clean.
3. Read `change.md`, `log.md` and, if it exists, `review.md`. The stage and `waiting for` say where you are.
4. If waiting and an answer is given: log it (section 5) and act on it from that stage. If waiting and no answer: print the stop again and end.
5. If not waiting (the session broke mid-stage): rerun the current stage from its start; work already committed on the branch stays.

## 7. Status

For each folder in `changes/` (not the archive): id, slug, size, stage, status, waiting for — one table. Then the last three archived changes with their PR state (`gh pr list --head <branch> --state all --json state,url`).

## 8. Rules

- One change, one branch, one PR. Do not mix two requests; propose a second change instead.
- Commit at the end of every stage and before every stop.
- `pnpm check` red means the stage is not done.
- The conductor's own writes are limited to `changes/**`.
