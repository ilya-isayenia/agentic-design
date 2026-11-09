# Changes

Every piece of work is a change (`/change`, see `.claude/skills/change/SKILL.md`). A change in progress has a folder here, `<NNNN>-<slug>/`; a finished one moves to `archive/` in its PR.

| File | What |
| --- | --- |
| `change.md` | id, type, size, status, stage, branch |
| `spec.md` | what and why, acceptance criteria, states, out of scope |
| `log.md` | every stage, prototype round and decision; decisions end with `by: human` or `by: agent` |
| `review.md` | reviewers' findings and fixes, per round |
| `evidence.json` | the evidence record the refiner fills |
| `checks.json` | `pnpm check` results at a commit |
| `evidence.md` | built by `pnpm evidence <id>`; the PR body |
| `shots/` | screenshots by `pnpm shots <id>` |

The archive is also the data for a later retro over finished changes.
