# Log 0002-landing-page

Stage lines: `- <YYYY-MM-DD> <stage>: <start | outcome>`.
Decision lines: `- <YYYY-MM-DD> decision (<stage>): <what was decided> — <why> by: <human | agent>`.

- 2026-11-10 decision (product spec): size XL — the request asks for a new app apps/landing by: agent
- 2026-11-10 product spec: start
- 2026-11-10 product spec: written — Pulse, hero + plans teaser, plan data read from apps/web through @web; 1 question
- 2026-11-10 waiting (product spec): accept the product spec, or what to change; question 1 — calls to action are links but Button renders only <button>: (a) ds child adds href to Button, (b) landing styles a plain <a>, (c) Button with location handler
- 2026-11-10 decision (product spec): accept the product spec as written, including the bounded @web import of plans.ts and pricing.ts — one price source beats a copy for one consumer by: agent
- 2026-11-10 decision (product spec): question 1 — option (a), a ds child gives Button an href and renders <a> with the same variants, placed before the hero — the standard button-as-link pattern, and it keeps one button style by: agent
- 2026-11-10 product spec: accepted
- 2026-11-10 plan: start
- 2026-11-10 plan: written — 4 children: scaffold-navigation (M), button-link (M, ds), hero (M), plans-teaser (L); no questions
- 2026-11-10 waiting (plan): accept the plan, or reorder, add, drop or resize children
- 2026-11-10 decision (plan): accept the plan as written — scaffold first keeps the ds PR free of landing code by: agent
- 2026-11-10 plan: accepted — 4 children, build order as written
- 2026-11-10 child 1: start — 0003-scaffold-navigation on change/0003-scaffold-navigation, branched from the parent branch
