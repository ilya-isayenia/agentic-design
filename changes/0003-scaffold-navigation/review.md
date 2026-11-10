# Review 0003-scaffold-navigation

## Round 1

| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | design-reviewer | required | 90 | `apps/landing/src/App.vue:22`, `:26` | Footer links "Membership terms" and "Privacy notice" inherit `text-text-muted`, so the only text of an action is muted (DS rule C2); only the underline sets them apart from the demo line | `text-text` on the footer `<a>`, keep `underline`; move `text-text-muted` from `<footer>` to the demo line `<p>` | fixed in de37c9c |
| 2 | design-reviewer | required | 85 | spec state "skip link focused"; `shots/after/`; `App.vue:12` | No shot shows the focused skip link or the focused `main`; at 375 px the link at `top-4 left-4` may cover the wordmark | Add shots of the skip link after Tab and of `main` after Enter, pulse dark and light, 375 and 1280; check fill, outline offset, overlap | layout fixed in f3dec4c (skip link in the flow, e2e at 375 and 1280); shot evidence replaced by e2e `smoke.spec.ts` (visible, no overlap at 375 and 1280, focus to `main`), decision by: agent |
| 3 | design-reviewer | required | 85 | `apps/landing/src/sections/Plans.vue:7` | Plans `h2` is `font-extrabold`; every section `h2` in `apps/web` is `font-semibold` | `font-display text-h2 font-semibold uppercase`; update the spec's placeholder line | fixed in 6e9aae0 |
| 4 | code-reviewer | required | 85 | `apps/landing/src/sections/Hero.vue:1`, `Plans.vue` | Sections ship with no `.stories.ts`, no per-state and no `Matrix` story (stack-vue "A new app", AGENTS.md rule 3, ds-rules P1, C9); a child spec cannot waive that, and this child merges to `main` alone | Add `Landing/Hero` and `Landing/Plans` stories with `Default` and `Matrix` (`ThemeMatrix`); baselines in their own `baselines:` commit | fixed in 2ece21b, baselines 3947545 |
| 5 | design-reviewer | optional | 80 | `App.vue:15` | Wordmark and plans `h2` have identical classes and read as the same level | Resolved by #3 (h2 to `font-semibold`); keep the wordmark `text-h2 font-extrabold` | fixed in 6e9aae0 |
| 6 | code-reviewer | optional | 80 | `apps/landing/src/composables/useTheme.ts:21` | Each `useTheme()` call makes its own refs and listener; if `Hero` calls it in child 3, the Matrix story reads the iframe URL, not the cell's theme | JSDoc: "Call once, in App; sections receive `mode` as a prop" | fixed in c8db513 |

Design score: 6.8/10. a11y-auditor: no findings.

Fix round 1 notes (refiner): the `apps/web` skip link classes put the focused link over the wordmark (`focus:not-sr-only` resets the padding, `focus:absolute top-4 left-4` lands on the header); the landing link now sits in the flow. `apps/web/src/App.vue:25` has the same defect, out of scope here.

## Round 2

| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | design-reviewer | critical | 90 | `apps/landing/src/sections/Hero.vue:6`, `Plans.vue:6`; `shots/after/landing-{hero,plans}--default--pulse-light--*` | In the light Default stories the headings are white on the light page and nearly invisible; the sections set no colour role and only read right inside a wrapper with `text-text` (App, ThemeMatrix). No gate catches it: baselines cover only Matrix, axe on Default runs in pulse dark | `text-text` on each section's root; retake the light Default shots (DS rule C9) | open |
| 2 | design-reviewer, a11y-auditor | required | 90 | `tests/e2e/landing/smoke.spec.ts:45-54`, `:62-73` | The e2e accepted as the skip-link-focused evidence cannot tell a shown link from a hidden one: an `sr-only` link has a 1×1 px box inside the viewport and above the wordmark, so both checks pass even if `focus:not-sr-only` never applies; no check of size (SC 2.5.8), outline (SC 2.4.7) or fill | After Tab assert width and height ≥ 24, `position: static` (or `clip-path: none`), outline style solid; compare overlap only once the box is ≥ 24 px; a `toHaveScreenshot` of the focused link in pulse dark and light records the fill and outline | open |
| 3 | design-reviewer | optional | 80 | `apps/landing/src/sections/Plans.stories.ts:22`, `Plans.vue:7` | The Plans Default play function focuses `h2#plans`, so the Default shot shows the focused state; the outline spans the full column (~1190 px) around a ~220 px heading | Move the focus check to a `FocusTarget` story or blur after it; `w-fit` on the h2 | open |

Design score: 6.9/10. code-reviewer: no findings (round 1 #1, #3, #4, #6 hold).
