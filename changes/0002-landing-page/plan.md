# Plan — Pulse landing page (0002-landing-page)

App: `apps/landing` · served at `/agentic-design/landing/` · brands: pulse · modes: dark, light
Routes: `/` (one page, no router; `#plans` is an in-page anchor, not a route)

| # | Child | Size | Scope | Id | Status | PR |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | scaffold-navigation | M | `apps/landing` (`@agentic/landing`) per the stack profile's "A new app": `useTheme` (`?brand=&mode=` wins, else `prefers-color-scheme`, pulse dark by default, no storage), real title and description, skip link, header wordmark, `main`, footer with the demo line and the two legal links to `../#/legal/…`; `src/content/` for frame copy plus a pointer line in `docs/product/copy.md`; placeholders: Hero holding the page's only `h1`, Plans holding `h2#plans` with `tabindex="-1"`; `tests/e2e/landing/smoke.spec.ts` (main and `h1` visible, axe clean in pulse dark and light, skip link then Enter focuses `main`) | 0003 | pr-open | https://github.com/ilya-isayenia/agentic-design/pull/2 |
| 2 | button-link | M | `ds`: `Button` gets an `href` prop that renders `<a href>` with the same variants, sizes, `block`, `iconEnd` and focus ring; `type`, `loading` and `disabled` do not apply to the link form (the contract says how); contract, link stories in every variant and in the Matrix, tests for the rendered element and attributes; baselines for the changed Matrix in their own commit. Existing `<button>` output unchanged in `apps/web` | — | planned | — |
| 3 | hero | M | Hero section from `product-spec.md` §1: `h1`, lead, offer line with `accent` only as a fill or mark (C4), primary "Find your club" as `Button` `href` to `../?brand=pulse&mode=<current mode>#/`, secondary "See the plans" to `#plans` (focus moves to the heading, URL shows `#plans`, smooth scroll only without reduced motion); optional decorative SVG from semantic roles, `aria-hidden`; layout at 375 and 1280 px; `Landing/Hero` stories and Matrix; e2e for both calls to action and opening the page at `#plans` | — | planned | — |
| 4 | plans-teaser | L | Plans section from `product-spec.md` §2: `h2`, intro, 4 section-local cards (`surface`, `border-strong`, `h3`, 2 perks with the check `Icon`, `Price` with "From" and `was`) read from `@web/data/plans` and `@web/lib/pricing` (`fromPrice('regular', id)`), note, "Find your club" as in the hero; the `@web` alias in `apps/landing/vite.config.ts` only, imports limited to those two files; one line in `docs/product/pricing.md` that both apps read them; 1/2/4 columns; unit test pinning 4 levels and their from-prices; `Landing/Plans` stories and Matrix; e2e for the full Tab order of the page | — | planned | — |

## Order

- 1 scaffold-navigation: first by rule. It is also the re-plan checkpoint, so the frame, theme handling and e2e project are judged on the page before any section is built on them. It needs no button-styled link (the footer links are plain text links), so it does not wait for child 2.
- 2 button-link: after the scaffold and before the hero, because both sections' calls to action are `Button` links. Placing it second rather than first keeps child 1 the scaffold and lets the `ds` change be reviewed alone, in `packages/ui`, with no landing code mixed in; it changes nothing the scaffold uses, so the order between them costs nothing.
- 3 hero: first section, in the order a visitor meets it. It replaces the scaffold's Hero placeholder and needs `Button` `href` from child 2 and the `h2#plans` target from child 1's Plans placeholder for "See the plans".
- 4 plans-teaser: last, because it carries the only data dependency (the `@web` alias and the `pricing.md` line) and completes the page, so the end-to-end Tab order (skip link → hero calls to action → plans call to action → footer links) can be tested here. It needs `Button` `href` from child 2 and keeps the `#plans` heading the hero links to.

## Changes to the plan
