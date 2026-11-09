---
name: review
description: Review a screen, component, story or pull request with the three read-only reviewers (design, accessibility, code) and report findings without editing anything. Use for "/review <target>".
argument-hint: "<component name | screen route | story id | PR number>"
disable-model-invocation: true
---

# /review — findings only

Target: `$ARGUMENTS`

1. Resolve the target:
   - a PR number → `gh pr diff <n>`; diff range is the PR's base...head.
   - a component name → `packages/ui/src/components/<Name>/`; its stories.
   - a route (`/join/...`) → the screen files under `apps/web/src/` that render it.
   - a story id → that story and its component.
2. Take screenshots into a scratch folder outside the repository tree that is git-ignored: `pnpm shots review --label review --stories <ids>` (or `--routes <routes>`). Routes after the first signup step need the answers of the earlier steps in sessionStorage; without them the route guard sends the shot to step 1. For such a route write `changes/review/session.json` as `{ "signup": { "clubId": "arden-north", "type": "regular", "access": "home", "duration": "two-years" } }` (the same shape as the `session` in `.claude/skills/change/templates/evidence.json`; fill only the fields the earlier steps set, see `apps/web/src/composables/useSignup.ts`) and add `--session changes/review/session.json`. The same `tools/shots` seeding path as `/change` uses, only passed by flag instead of `evidence.json`. Then check the shot shows the asked step before sending it to the reviewers. `changes/review/` is git-ignored for this.
3. Start **design-reviewer**, **a11y-auditor** and **code-reviewer** in parallel with: the target, the files or diff, the shots folder. No spec exists for a plain review; reviewers use the component contract or the screen's section in `docs/spec.md` instead.
4. Print one table of findings (reviewer, severity, confidence, where, finding, fix), critical first. Then the design score.
5. Edit nothing. If the human wants fixes, they start `/change <fix the findings from this review>`.
