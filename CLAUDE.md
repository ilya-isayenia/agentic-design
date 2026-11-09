@AGENTS.md

## Claude Code specifics

- `/change <request>`, `/change continue <id> [— answer]`, `/change status` — the change cycle. `/review <target>` — the three reviewers, findings only.
- Subagents live in `.claude/agents/`; the `change` skill starts them. Subagents cannot start subagents, so the conductor runs in the main conversation.
- Subagents load `ds-rules`, `a11y-checklist` and the active stack profile through their `skills:` field.
- When a subagent returns questions, the conductor stops and asks the human; it never guesses on scope, product rules or missing tokens.
- Permissions: `.claude/settings.json`. Personal overrides go into `.claude/settings.local.json` (git-ignored).
