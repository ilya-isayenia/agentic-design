# Evidence — 0003-scaffold-navigation

> 0002 child 1: `apps/landing` (`@agentic/landing`) per the stack profile's "A new app": `useTheme` (`?brand=&mode=` wins, else `prefers-color-scheme`, pulse dark by default, no storage), real title and description, skip link, header wordmark, `main`, footer with the demo line and the two legal links to `../#/legal/…`; `src/content/` for frame copy plus a pointer line in `docs/product/copy.md`; placeholders: Hero holding the page's only `h1`, Plans holding `h2#plans` with `tabindex="-1"`; `tests/e2e/landing/smoke.spec.ts` (main and `h1` visible, axe clean in pulse dark and light, skip link then Enter focuses `main`)

| | |
| --- | --- |
| Type / size | feature / M |
| Part of | 0002-landing-page (new product; its plan is in `changes/**/0002-landing-page/plan.md`) |
| Branch | `change/0003-scaffold-navigation` |
| Decisions | 0 by human, 3 by agent |
| Review | 10 finding(s), 0 open critical/required; Design score: 8.4 |
| Checks | 9/9 green at `b4547cc` |

## Evidence status

- [x] complete

## What it delivers

A visitor opening /agentic-design/landing/ gets the landing page frame (skip link, Pulse header, main with the final h1 and h2#plans, footer with the demo line and the signup app's legal links) in pulse dark or light following the system preference, with ?brand=/?mode= overriding it.

## Acceptance criteria

Every e2e scenario is in `tests/e2e/landing/smoke.spec.ts`. Playwright emulates `colorScheme: 'light'` by default, so any scenario that does not test the preference sets `?brand=pulse&mode=<mode>` or calls `page.emulateMedia({ colorScheme })` explicitly.

1. `pnpm build` builds `apps/landing/dist` with base `/agentic-design/landing/`, and the e2e config runs it as its own Playwright project `landing` (it picks it up because `tests/e2e/landing/` exists; the config is not edited). → e2e `landing` project runs and passes in `pnpm test:e2e`
2. On `./?brand=pulse&mode=dark`:
   - `main`, the `banner` and the `contentinfo` landmarks are visible;
   - there is exactly one `h1`, named "Train close to home or anywhere";
   - one `h2` named "Choose where you train" has `id="plans"` and `tabindex="-1"`;
   - the banner contains the text "Pulse", with no heading and no link inside it. → e2e `frame renders`
3. `document.title` and `meta[name=description]` equal the copy table. → e2e `title and description`
4. The first Tab focuses a link named "Skip to content" that is visible (its bounding box lies inside the viewport). Enter then moves focus to `#main`. → e2e `skip link moves focus to main`
5. After the skip link, Tab reaches "Membership terms", then "Privacy notice"; no other element takes focus in between. → e2e `frame tab order`
6. The footer shows the demo line. "Membership terms" has `href="../#/legal/terms"` and "Privacy notice" has `href="../#/legal/privacy"`. Clicking "Membership terms" opens `/agentic-design/#/legal/terms`, where an `h1` named "Membership terms" is visible. → e2e `legal links open the signup app's placeholders`
7. axe (the tags of `tests/e2e/a11y.spec.ts`) reports no violations on `./?brand=pulse&mode=dark` and `./?brand=pulse&mode=light`, at 1280 px and at 375 px. → e2e `axe in pulse/dark`, `axe in pulse/light`
8. Theme on the page:
   - no query + `colorScheme: 'dark'` → `<html data-brand="pulse" data-mode="dark">`;
   - no query + `colorScheme: 'light'` → `data-mode="light"`;
   - `?mode=dark` + `colorScheme: 'light'` → `data-mode="dark"`;
   - `?brand=nope&mode=nope` + `colorScheme: 'dark'` → pulse dark. → e2e `theme follows the system unless the query sets it`
9. After load, Tab, and Enter on the skip link, `localStorage.length` and `sessionStorage.length` are both 0. → e2e `nothing is stored`
10. At 320 px and at 375 px, `document.documentElement.scrollWidth` is not greater than the viewport width. → e2e `no sideways scroll at 320 and 375 px`
11. `resolveTheme(search, prefersLight)` returns:
    - pulse dark for `''`, false;
    - pulse light for `''`, true;
    - pulse dark for `'?mode=dark'`, true;
    - volt light for `'?brand=volt&mode=light'`, false;
    - pulse plus the preference's mode for an unknown brand and an unknown mode. → unit `apps/landing/src/composables/useTheme.test.ts`
12. `useTheme()`:
    - sets `data-brand` and `data-mode` on `document.documentElement`;
    - follows a `change` event of `(prefers-color-scheme: light)` when there is no valid `?mode=`, and ignores it when there is one;
    - removes its listener when the host unmounts (assert with the stubbed `matchMedia`'s `removeEventListener`);
    - returns readonly `brand` and `mode`;
    - never calls `Storage.prototype.getItem` or `setItem`;
    - falls back to dark when `window.matchMedia` is undefined. → unit `apps/landing/src/composables/useTheme.test.ts`
13. `docs/product/copy.md` has one line saying the landing page's copy lives in `apps/landing/src/content/`. No landing string is copied into it. → review of the diff (no runtime proof possible; the file is documentation)

## States

| State | Status | Evidence |
| --- | --- | --- |
| loading | not applicable | no request is made after the bundle runs; all content is typed constants inside it, so there is nothing to wait for |
| empty | not applicable | the frame's copy is typed constants in apps/landing/src/content/, and vue-tsc fails the build if one is missing; the page cannot render without its text |
| error | not applicable | no request, no form, no input; the only links go to static pages of the signup app on the same origin |
| partial | not applicable | there is one bundled source and nothing arrives in parts |
| success | pass | e2e tests/e2e/landing/smoke.spec.ts › frame renders, › title and description, › legal links open the signup app's placeholders; stories Landing/Hero › Default, Matrix and Landing/Plans › Default, Matrix (h1 and h2#plans with tabindex -1, nothing focusable in the placeholders, all six themes, axe clean) |
| permission | not applicable | no accounts and no gated content; every visitor gets the same page |
| dark (default) | pass | e2e smoke.spec.ts › theme follows the system unless the query sets it; unit useTheme.test.ts › resolveTheme gives pulse dark with no query and no light preference, › falls back to dark when window.matchMedia is undefined |
| light (system) | pass | e2e smoke.spec.ts › theme follows the system unless the query sets it (on load and on a live preference change); unit useTheme.test.ts › follows a change of the system preference when there is no valid ?mode= |
| query override | pass | e2e smoke.spec.ts › theme follows the system unless the query sets it (?mode=dark under a light preference); unit useTheme.test.ts › lets a valid ?mode= win over the preference, › ignores a change of the system preference when ?mode= is set |
| invalid query | pass | e2e smoke.spec.ts › theme follows the system unless the query sets it (?brand=nope&mode=nope); unit useTheme.test.ts › ignores an unknown brand and an unknown mode one by one |
| skip link focused | pass | e2e tests/e2e/landing/smoke.spec.ts › skip link moves focus to main (pulse dark and light at 375 and 1280 px: after the first Tab the link is focused, its box is at least 24 × 24 px and inside the viewport, position static and clip-path none, its text not clipped, a solid focus outline at least 2 px wide, the accent fill with on-accent text; Enter focuses #main, the next Tab reaches Membership terms), › focused skip link does not cover the wordmark at 375 and 1280 px (the same visibility checks first, then the bottom of the link is above the wordmark) |

Accessibility: axe (wcag2a/2aa/21a/21aa/22aa) clean on ./?brand=pulse&mode=dark and ./?brand=pulse&mode=light at 1280 and 375 px (e2e › axe in pulse/dark, › axe in pulse/light); landmarks banner, main, contentinfo and one h1 then h2 (› frame renders); keyboard path: first Tab focuses the skip link, shown at least 24 × 24 px out of sr-only with a solid focus outline in pulse dark and light at 375 and 1280 px, Enter moves focus to main, Tab order skip link → Membership terms → Privacy notice with nothing in between (› skip link moves focus to main, › frame tab order); no announcements needed (nothing changes without a user action except the visual theme); footer links underlined and min-h-12; nothing stored (› nothing is stored)

Responsive: no sideways scroll at 320 and 375 px (e2e › no sideways scroll at 320 and 375 px); one column with padding 4 at 375 px and max-w-page with padding 8 from md at 1280 px checked on local screenshots; main is flex-1 so the footer sits at the bottom of a tall window

## Checks

- ✅ tokens (0s)
- ✅ typecheck (2s)
- ✅ lint (2s)
- ✅ unit (3s)
- ✅ storybook (7s)
- ✅ contrast (0s)
- ✅ visual (13s)
- ✅ e2e (11s)
- ✅ denylist (0s)

## Screenshots

Folders: [after/](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/shots/after)

![app-landing_home--pulse-dark--1280.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/shots/after/app-landing_home--pulse-dark--1280.png?raw=true)
![app-landing_home--pulse-dark--375.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/shots/after/app-landing_home--pulse-dark--375.png?raw=true)
![landing-hero--default--pulse-dark--1280.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/shots/after/landing-hero--default--pulse-dark--1280.png?raw=true)
![landing-hero--default--pulse-dark--375.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/shots/after/landing-hero--default--pulse-dark--375.png?raw=true)
![landing-hero--default--pulse-light--1280.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/shots/after/landing-hero--default--pulse-light--1280.png?raw=true)
![landing-hero--matrix--all-themes--1280.png](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/shots/after/landing-hero--matrix--all-themes--1280.png?raw=true)

Stories: `landing-hero--default`, `landing-hero--matrix`, `landing-plans--default`, `landing-plans--matrix`

## Decisions

- 2026-11-10 decision (validate): option (a) — the e2e test is the evidence for the skip-link-focused state; it checks the link is visible, does not cover the wordmark at 375 and 1280 px, and that Enter moves focus to `main` by: agent
- 2026-11-10 decision (validate): a `keys` option for route states in `pnpm shots` and the `apps/web` skip-link overlap (`apps/web/src/App.vue:25`) are follow-up changes, not part of 0003 by: agent
- 2026-11-10 decision (validate): the reduced-motion `transition-property: all` effect on theme switches (stale `body` colour in shots, transitions under e2e measurement) is a follow-up ds or tools change, not part of 0003 — outside this change's paths and not blocking it once the sections set their own colour by: agent

## Prototype rounds

- 2026-11-10 prototype: skipped (the frame's layout is fixed by the spec; sections are designed in children 3 and 4) by: agent

## Review findings

| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | design-reviewer | required | 90 | `apps/landing/src/App.vue:22`, `:26` | Footer links "Membership terms" and "Privacy notice" inherit `text-text-muted`, so the only text of an action is muted (DS rule C2); only the underline sets them apart from the demo line | `text-text` on the footer `<a>`, keep `underline`; move `text-text-muted` from `<footer>` to the demo line `<p>` | fixed in de37c9c |
| 2 | design-reviewer | required | 85 | spec state "skip link focused"; `shots/after/`; `App.vue:12` | No shot shows the focused skip link or the focused `main`; at 375 px the link at `top-4 left-4` may cover the wordmark | Add shots of the skip link after Tab and of `main` after Enter, pulse dark and light, 375 and 1280; check fill, outline offset, overlap | layout fixed in f3dec4c (skip link in the flow, e2e at 375 and 1280); shot evidence replaced by e2e `smoke.spec.ts` (visible, no overlap at 375 and 1280, focus to `main`), decision by: agent |
| 3 | design-reviewer | required | 85 | `apps/landing/src/sections/Plans.vue:7` | Plans `h2` is `font-extrabold`; every section `h2` in `apps/web` is `font-semibold` | `font-display text-h2 font-semibold uppercase`; update the spec's placeholder line | fixed in 6e9aae0 |
| 4 | code-reviewer | required | 85 | `apps/landing/src/sections/Hero.vue:1`, `Plans.vue` | Sections ship with no `.stories.ts`, no per-state and no `Matrix` story (stack-vue "A new app", AGENTS.md rule 3, ds-rules P1, C9); a child spec cannot waive that, and this child merges to `main` alone | Add `Landing/Hero` and `Landing/Plans` stories with `Default` and `Matrix` (`ThemeMatrix`); baselines in their own `baselines:` commit | fixed in 2ece21b, baselines 3947545 |
| 5 | design-reviewer | optional | 80 | `App.vue:15` | Wordmark and plans `h2` have identical classes and read as the same level | Resolved by #3 (h2 to `font-semibold`); keep the wordmark `text-h2 font-extrabold` | fixed in 6e9aae0 |
| 6 | code-reviewer | optional | 80 | `apps/landing/src/composables/useTheme.ts:21` | Each `useTheme()` call makes its own refs and listener; if `Hero` calls it in child 3, the Matrix story reads the iframe URL, not the cell's theme | JSDoc: "Call once, in App; sections receive `mode` as a prop" | fixed in c8db513 |
| 1 | design-reviewer | critical | 90 | `apps/landing/src/sections/Hero.vue:6`, `Plans.vue:6`; `shots/after/landing-{hero,plans}--default--pulse-light--*` | In the light Default stories the headings are white on the light page and nearly invisible; the sections set no colour role and only read right inside a wrapper with `text-text` (App, ThemeMatrix). No gate catches it: baselines cover only Matrix, axe on Default runs in pulse dark | `text-text` on each section's root; retake the light Default shots (DS rule C9) | fixed in 78e7a88 |
| 2 | design-reviewer, a11y-auditor | required | 90 | `tests/e2e/landing/smoke.spec.ts:45-54`, `:62-73` | The e2e accepted as the skip-link-focused evidence cannot tell a shown link from a hidden one: an `sr-only` link has a 1×1 px box inside the viewport and above the wordmark, so both checks pass even if `focus:not-sr-only` never applies; no check of size (SC 2.5.8), outline (SC 2.4.7) or fill | After Tab assert width and height ≥ 24, `position: static` (or `clip-path: none`), outline style solid; compare overlap only once the box is ≥ 24 px; a `toHaveScreenshot` of the focused link in pulse dark and light records the fill and outline | fixed in faee45b, 54ed76b (each visibility assertion fails with `focus:not-sr-only` removed; fill and outline checked in code, no e2e screenshot mechanism exists) |
| 3 | design-reviewer | optional | 80 | `apps/landing/src/sections/Plans.stories.ts:22`, `Plans.vue:7` | The Plans Default play function focuses `h2#plans`, so the Default shot shows the focused state; the outline spans the full column (~1190 px) around a ~220 px heading | Move the focus check to a `FocusTarget` story or blur after it; `w-fit` on the h2 | open |
| 1 | design-reviewer | optional | 85 | `apps/landing/src/sections/Plans.stories.ts:22`, `Plans.vue:7`; `shots/after/landing-plans--default--*` | Round 2 #3 again: the Plans Default story ends focused, so its shots show a full-column outline around a ~220 px heading; Hero Default shows none | Move the focus check to a `FocusTarget` story or blur after it; `w-fit` on the h2 | open (optional) |

---
Built by `pnpm evidence 0003` from `changes/0003-scaffold-navigation`. Full record: [change.md](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/change.md), [log.md](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/log.md), [review.md](https://github.com/ilya-isayenia/agentic-design/blob/change/0003-scaffold-navigation/changes/archive/0003-scaffold-navigation/review.md).
