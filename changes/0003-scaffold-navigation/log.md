# Log 0003-scaffold-navigation

Stage lines: `- <YYYY-MM-DD> <stage>: <start | outcome>`.
Decision lines: `- <YYYY-MM-DD> decision (<stage>): <what was decided> — <why> by: <human | agent>`.

- 2026-11-10 spec: start
- 2026-11-10 spec: written — size M, type feature, 13 acceptance criteria, no questions
- 2026-11-10 prototype: skipped (the frame's layout is fixed by the spec; sections are designed in children 3 and 4) by: agent
- 2026-11-10 refine: start
- 2026-11-10 refine: done — apps/landing frame, useTheme, content, smoke e2e (10 tests); pnpm check green; 4 after shots (pulse dark/light × 375/1280)
- 2026-11-10 validate: start
- 2026-11-10 validate: round 1 — 4 required (design 3, code 1), 2 optional, a11y clean; fix round 1
- 2026-11-10 validate: fix round 1 — r1 #1, #3–#6 fixed; #2 layout fixed, shot evidence blocked: the shots tool cannot press a key in a route state; pnpm check green
- 2026-11-10 waiting (validate): evidence for the "skip link focused" state — (a) accept the e2e test as evidence, (b) a tools change adding `keys` to route states, (c) a Landing/Frame story with a play function
- 2026-11-10 decision (validate): option (a) — the e2e test is the evidence for the skip-link-focused state; it checks the link is visible, does not cover the wordmark at 375 and 1280 px, and that Enter moves focus to `main` by: agent
- 2026-11-10 decision (validate): a `keys` option for route states in `pnpm shots` and the `apps/web` skip-link overlap (`apps/web/src/App.vue:25`) are follow-up changes, not part of 0003 by: agent
- 2026-11-10 validate: round 2 — start
- 2026-11-10 validate: round 2 — 1 critical (design), 1 required (design + a11y: the accepted e2e cannot detect a hidden skip link), 1 optional, code clean; fix round 2
- 2026-11-10 validate: fix round 2 — r2 #1 and #2 fixed (78e7a88, faee45b, 54ed76b); pnpm check green
- 2026-11-10 decision (validate): the reduced-motion `transition-property: all` effect on theme switches (stale `body` colour in shots, transitions under e2e measurement) is a follow-up ds or tools change, not part of 0003 — outside this change's paths and not blocking it once the sections set their own colour by: agent
- 2026-11-10 validate: round 3 — start
