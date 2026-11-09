# agentic-design

A membership signup web app for an invented chain of gyms, built on its own multi-brand design system, and the Claude Code setup that makes every later change through one cycle: spec → prototypes → refinement → validation → integration.

Learn, show and defend it: [overview](docs/overview.md) (the story of the system) · [demo](docs/demo.md) (a 15–20 minute script) · [defending](docs/defending.md) (hard questions, honest answers) · [practice](docs/practice.md) (learning tasks).

| | |
| --- | --- |
| App | https://ilya-isayenia.github.io/agentic-design/ |
| Storybook (design system) | https://ilya-isayenia.github.io/agentic-design/storybook/ |
| Start here | [docs/getting-started.md](docs/getting-started.md) |
| What and why | [docs/spec.md](docs/spec.md) |
| Rules for agents | [AGENTS.md](AGENTS.md) |
| Change history | [changes/archive/](changes/archive/) and the merged pull requests |

The links work once the repository is public and Pages is enabled (`tools/setup-repo.sh`).

## What is inside

- **App** (`apps/web`): club finder with an abstract map, a 5-step signup with a sticky receipt, a success page. Vue 3, TypeScript, Vite, Tailwind CSS v4. Data, payment, SMS and maps are invented stubs.
- **Design system** (`packages/tokens`, `packages/ui`): W3C DTCG tokens built by Style Dictionary into CSS variables; three brands (Pulse, Volt, Lumen) × light and dark; 21 components, each with a contract, a story per state, a Matrix story over all six themes and tests.
- **Agent setup** (`.claude/`): the `/change` conductor, six subagents (spec-writer, prototyper, refiner, design-reviewer, a11y-auditor, code-reviewer), design-system and accessibility rules, and a Vue stack profile. The design system and the process do not depend on Vue; only `.claude/skills/stack-vue/` does.
- **Checks** (`pnpm check`): types, lint with a no-raw-values rule, unit tests, Storybook tests with axe as errors, WCAG contrast over every theme, visual tests in Docker, end-to-end tests with axe on every screen, and a denylist. CI runs the same command.

## Quick start

```sh
pnpm install
pnpm exec playwright install chromium
pnpm dev          # app
pnpm storybook    # design system
pnpm check        # everything; needs Docker running
```
