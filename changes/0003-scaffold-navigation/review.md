# Review 0003-scaffold-navigation

## Round 1

| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | design-reviewer | required | 90 | `apps/landing/src/App.vue:22`, `:26` | Footer links "Membership terms" and "Privacy notice" inherit `text-text-muted`, so the only text of an action is muted (DS rule C2); only the underline sets them apart from the demo line | `text-text` on the footer `<a>`, keep `underline`; move `text-text-muted` from `<footer>` to the demo line `<p>` | open |
| 2 | design-reviewer | required | 85 | spec state "skip link focused"; `shots/after/`; `App.vue:12` | No shot shows the focused skip link or the focused `main`; at 375 px the link at `top-4 left-4` may cover the wordmark | Add shots of the skip link after Tab and of `main` after Enter, pulse dark and light, 375 and 1280; check fill, outline offset, overlap | open |
| 3 | design-reviewer | required | 85 | `apps/landing/src/sections/Plans.vue:7` | Plans `h2` is `font-extrabold`; every section `h2` in `apps/web` is `font-semibold` | `font-display text-h2 font-semibold uppercase`; update the spec's placeholder line | open |
| 4 | code-reviewer | required | 85 | `apps/landing/src/sections/Hero.vue:1`, `Plans.vue` | Sections ship with no `.stories.ts`, no per-state and no `Matrix` story (stack-vue "A new app", AGENTS.md rule 3, ds-rules P1, C9); a child spec cannot waive that, and this child merges to `main` alone | Add `Landing/Hero` and `Landing/Plans` stories with `Default` and `Matrix` (`ThemeMatrix`); baselines in their own `baselines:` commit | open |
| 5 | design-reviewer | optional | 80 | `App.vue:15` | Wordmark and plans `h2` have identical classes and read as the same level | Resolved by #3 (h2 to `font-semibold`); keep the wordmark `text-h2 font-extrabold` | open |
| 6 | code-reviewer | optional | 80 | `apps/landing/src/composables/useTheme.ts:21` | Each `useTheme()` call makes its own refs and listener; if `Hero` calls it in child 3, the Matrix story reads the iframe URL, not the cell's theme | JSDoc: "Call once, in App; sections receive `mode` as a prop" | open |

Design score: 6.8/10. a11y-auditor: no findings.
