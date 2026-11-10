# Landing scaffold and navigation (0003-scaffold-navigation)

## Summary

The landing page gets its own app, `apps/landing` (`@agentic/landing`), served at `/agentic-design/landing/`. A visitor sees the page frame from the product spec: a skip link, a header with the "Pulse" wordmark, `main` with two placeholder sections that already hold the final headings (the hero's `h1` and the plans' `h2#plans`), and a footer that says the site is a demo and links to the signup app's legal placeholders. The theme follows the system preference (pulse dark unless the system asks for light), and `?brand=` / `?mode=` override it for shots and e2e. This is child 1 of `0002-landing-page`. Hero (child 3) and plans (child 4) build on this frame, and the frame is reviewed on the page before they start.

## Size and type

Size: M. The human's hint, and it fits: a new app frame with a theme composable and an e2e project, but no new component, token or data. Type: feature.

## User-facing behaviour

1. The visitor opens `/agentic-design/landing/` (in e2e and shots: `./`). The theme is set before the first render of the app:
   - a valid `?mode=` (`dark` | `light`) wins;
   - otherwise `prefers-color-scheme: light` gives light, and anything else (dark, no preference, no `matchMedia`) gives dark;
   - a valid `?brand=` (any brand in `BRANDS`) wins, otherwise `pulse`. Invalid values are ignored one by one.
2. Focus stays at the top of the document. Nothing moves focus without a user action.
3. Top to bottom, at both widths:
   - **Skip link** "Skip to content". It is hidden until it gets focus, then shows at the top left on an `accent` fill (the same classes as `apps/web`'s skip link).
   - **Header** (`banner` landmark). The wordmark "Pulse" is plain text: not a heading, not a link.
   - **`main`** (`id="main"`, `tabindex="-1"`), holding two sections:
     - Hero placeholder: only the `h1` "Train close to home or anywhere".
     - Plans placeholder: only the `h2` "Choose where you train", with `id="plans"` and `tabindex="-1"`.
   - **Footer** (`contentinfo` landmark): the demo line, then the links "Membership terms" → `../#/legal/terms` and "Privacy notice" → `../#/legal/privacy`.
4. Tab order: skip link → "Membership terms" → "Privacy notice". The placeholders hold nothing focusable. Enter on the skip link moves focus to `main`, and the next Tab goes to "Membership terms".
5. A footer link opens the signup app's legal placeholder page in the same tab (both apps share one origin on Pages, in `pnpm preview` and in e2e).
6. If no `?mode=` is set and the system preference changes while the page is open, the page switches mode with it. If `?mode=` is set, a preference change does nothing.
7. Layout:
   - **375 px**: header, sections and footer stack in one column with page padding 4. The footer links sit on one row if they fit and wrap if they do not.
   - **1280 px**: the content is centred in `max-w-page` with padding 8 from `md`.
   - **320 px**: nothing scrolls sideways.
   - `main` grows (`flex-1`), so the footer sits at the bottom of a tall window.

Copy (all quoted from `changes/0002-landing-page/product-spec.md` § Content per section, Frame, 1 and 2; nothing reworded):

| Place | Text |
| --- | --- |
| Document title (`index.html`) | "Pulse gyms — train close to home or anywhere (demo)" |
| Meta description (`index.html`) | "Demo landing page for an invented gym chain: access levels and prices from the signup demo. All data is invented." |
| Skip link | "Skip to content" |
| Header wordmark | "Pulse" |
| Hero heading (`h1`) | "Train close to home or anywhere" |
| Plans heading (`h2#plans`) | "Choose where you train" |
| Footer line | "Demo site with invented clubs and prices. Nothing is charged, sent or stored." |
| Footer links | "Membership terms", "Privacy notice" |

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

The page is static: copy is compiled into the bundle, nothing is fetched, there are no forms and no accounts. The scaffold has one screen.

| State | Trigger | Feedback (what the user sees and hears) | Safe next action |
| --- | --- | --- | --- |
| loading | — | not applicable: no request is made after the bundle runs; all content is typed constants inside it, so there is nothing to wait for | — |
| empty | — | not applicable: the frame's copy is typed constants, and `vue-tsc` fails the build if one is missing; the page cannot render without its text | — |
| error | — | not applicable: no request, no form, no input. The only links go to static pages of the signup app on the same origin | — |
| partial | — | not applicable: there is one bundled source and nothing arrives in parts | — |
| success | open `./` | frame as in "User-facing behaviour" 3: header "Pulse", `h1`, `h2`, footer line and 2 links; a screen reader can jump by landmark (banner, main, contentinfo) and by heading (1, 2) | Tab to the skip link, read on, or follow a legal link (e2e `frame renders`) |
| permission | — | not applicable: no accounts and no gated content; every visitor gets the same page | — |
| dark (default) | no valid `?mode=`, and the system does not prefer light | pulse dark | read on; nothing to do (e2e `theme follows the system unless the query sets it`) |
| light (system) | no valid `?mode=`, `prefers-color-scheme: light`; also a live change to light | pulse light; switches back if the preference changes back | read on (same e2e; unit `useTheme.test.ts` for the live change) |
| query override | valid `?brand=` and/or `?mode=` | that brand and mode, whatever the system prefers | remove the query to get the default (same e2e) |
| invalid query | `?brand=` or `?mode=` with an unknown value | that value is ignored: brand pulse, mode from the system | same as dark/light (same e2e, unit `resolveTheme` case) |
| skip link focused | first Tab | "Skip to content" appears at the top left on an `accent` fill with the focus outline; read as "Skip to content, link" | Enter → focus on `main`; Tab → "Membership terms" (e2e `skip link moves focus to main`) |

## Component API

No component in `packages/ui` is added or changed. The app-local parts:

### App (new, `apps/landing/src/App.vue`)
| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| — | | | none |

Slot: none. Event: none. v-model: none.

Structure:
- a root `div` with `min-h-screen flex flex-col bg-bg text-text` holds the skip link, `header`, `<main id="main" tabindex="-1" class="flex-1">` with `<Hero />` and `<Plans />`, and `footer`;
- `header` and `footer` are direct children of that root, never inside `main` or a `section`, so they keep their landmark roles;
- the footer links are a `ul` of two `li`.

Calls `useTheme()` once in `setup`.

Tokens:
- roles: `bg`, `text`, `text-muted` (footer), `accent` + `on-accent` (skip link only), `focus` (global outline);
- type: `font-display text-h2 font-extrabold uppercase` (wordmark), `font-text text-small` (footer);
- spacing: `px-4 md:px-8`, `py-6` (header), `py-8` (footer), `gap-4` (footer links);
- layout: `max-w-page`, and `max-w-prose` on the footer line;
- target size: footer links `inline-flex min-h-12 items-center underline`;
- motion: none.

Stories: none (see "Assumption: no section stories in this child" below).

### Hero placeholder (new, `apps/landing/src/sections/Hero.vue`)
No props, slots, events or v-model. A `<section>` with `<h1 class="font-display text-h1 font-extrabold uppercase">`. The text comes from `HERO.heading` in `src/content/hero.ts`. Padding `py-12`, inside `mx-auto max-w-page px-4 md:px-8`. Child 3 replaces the body and may change the heading's size (`text-display` is allowed). Child 3 keeps the `h1` as the page's only one.

### Plans placeholder (new, `apps/landing/src/sections/Plans.vue`)
No props, slots, events or v-model. A `<section>` with `<h2 id="plans" tabindex="-1" class="font-display text-h2 font-extrabold uppercase">`, text from `PLANS.heading` in `src/content/plans.ts`, same padding and width as the hero. Child 4 fills it and keeps `id="plans"` and `tabindex="-1"`.

### useTheme (new composable, `apps/landing/src/composables/useTheme.ts`)
| Export | Signature | Notes |
| --- | --- | --- |
| `resolveTheme` | `(search: string, prefersLight: boolean) => { brand: Brand; mode: Mode; modeFromQuery: boolean }` | pure; valid values from `BRANDS` / `MODES` of `@agentic/ui` |
| `useTheme` | `() => { brand: Readonly<Ref<Brand>>; mode: Readonly<Ref<Mode>> }` | reads `location.search` and `matchMedia('(prefers-color-scheme: light)')` (absent → not light); writes `data-brand` / `data-mode` on `document.documentElement`; adds a `change` listener only when `modeFromQuery` is false and removes it in `onScopeDispose`; no storage |

Child 3 reads `mode` from it to build "Find your club"'s `mode=` parameter. That is why `mode` is returned and not only applied.

### Content (new, `apps/landing/src/content/`)
- `frame.ts`: `FRAME = { skipLink, wordmark, demoLine, legal: [{ label, href }, { label, href }] } as const`.
- `hero.ts`: `HERO = { heading } as const`.
- `plans.ts`: `PLANS = { heading } as const`.

Children 3 and 4 extend `HERO` and `PLANS` instead of creating new files. Title and description stay in `index.html` only (see Assumptions).

## Accessibility

- **Names and roles**:
  - `<html lang="en">`;
  - landmarks `banner` (header), `main`, `contentinfo` (footer); the sections have no accessible name, so they add no region landmarks;
  - skip link: a link named "Skip to content";
  - legal links: named by their visible text;
  - wordmark: plain text, not a heading;
  - headings `h1` → `h2`, no skipped level, one `h1`.
- **Keyboard**:
  - Tab order: skip link → "Membership terms" → "Privacy notice";
  - Enter on the skip link focuses `main` (native fragment navigation to a `tabindex="-1"` target; no script);
  - Enter on a legal link navigates in the same tab;
  - `h2#plans` is focusable only by script or fragment (`tabindex="-1"`), never by Tab;
  - no key handlers in this child.
- **Announcements**: none. Nothing changes without a user action except the theme on a system preference change, which is visual only and needs no announcement.
- **Other**:
  - links are underlined, so colour is never the only signal (SC 1.4.1);
  - footer links are `min-h-12` (S5);
  - the skip link is keyboard-only, uses the same classes as `apps/web`'s, and is above 24 px (SC 2.5.8);
  - nothing animates, so reduced motion needs no still version here;
  - text reflows at 320 px (SC 1.4.10);
  - heights are `min-h-*` only (S6);
  - forced colours: underlines and the focus outline survive.
- Assumption: `main` keeps the global `:focus-visible` outline when the skip link focuses it, and does not use `outline-none` as `apps/web` does. DS rule C7 forbids `outline-none` without a replacement, and the outline shows where focus went. If the human prefers no ring around `main`, it is a one-class change.

## Data

- No mock data, no changes in `apps/web/src/data/` or `apps/web/src/lib/`, no rules from `docs/product/pricing.md`. The `@web` alias belongs to child 4. This child imports nothing from `apps/web`.
- `docs/product/legal.md` already defines `#/legal/terms` and `#/legal/privacy`. The landing reuses them through `../` (product spec, Frame, Assumption).
- `docs/product/copy.md` gets one line after the table, in this wording: "The landing page (`apps/landing`) keeps its copy in `apps/landing/src/content/` as typed constants, in the same voice."
- Triggering the states:
  - pulse dark: `./?brand=pulse&mode=dark`;
  - pulse light: `./?brand=pulse&mode=light`;
  - system preference: no query, then in Chrome DevTools → Rendering → `prefers-color-scheme`, or `page.emulateMedia({ colorScheme })` in Playwright;
  - invalid query: `./?brand=nope&mode=nope`.
- Evidence: in `evidence.json`, `brands: ["pulse"]` (the product is pulse only) and `routes: [{ "route": "/", "app": "landing" }]`. Shots: `pnpm shots 0003 --app landing --routes / --brands pulse` at 375 and 1280 in both modes.

## Paths to touch

```
apps/landing/package.json
apps/landing/index.html
apps/landing/vite.config.ts
apps/landing/src/**
tests/e2e/landing/smoke.spec.ts
docs/product/copy.md
pnpm-lock.yaml
```

Details:
- `package.json`: `@agentic/landing`, private, `"type": "module"`, scripts `dev`, `build`, `preview` (`vite preview --port 4175 --strictPort`); dependencies `@agentic/ui: workspace:*` and `vue: 3.5.45`; no `vue-router`.
- `index.html`: `<html lang="en" data-brand="pulse" data-mode="dark">`, title, description.
- `vite.config.ts`: `base: '/agentic-design/landing/'`, plugins vue + tailwindcss, no alias, `server.port` 5174, `preview.port` 4175.
- `src/**` covers `main.ts`, `App.vue`, `composables/useTheme.ts` + `.test.ts`, `sections/Hero.vue`, `sections/Plans.vue`, `content/frame.ts`, `content/hero.ts`, `content/plans.ts`, and `styles.css` only if the Tailwind fallback below is needed.

Not touched: `packages/ui/**` (the parent log keeps this child off the design system), `apps/web/**`, `tests/e2e/playwright.config.ts` and `tools/apps.mjs` (both already find `apps/*`), `tests/visual/**`.

## Assumptions

- **Ports.** Assumption: dev 5174 and preview 4175. 5173 and 4173 are `apps/web`'s, and 4174 is the e2e server's.
- **Tailwind sources.** Assumption: Tailwind's automatic source detection in the landing's Vite build (root `apps/landing`) and in Storybook/Vitest (root = repository) finds `apps/landing/src`. Then `packages/ui/src/styles/index.css`, which names only `packages/ui` and `apps/web/src` with `@source`, needs no change. The refiner checks this:
  - after `pnpm build`, look in `apps/landing/dist/assets/*.css` for a class used only in the landing (e.g. `min-h-screen` if `apps/web` does not use it);
  - if a class is missing, add `apps/landing/src/styles.css` with `@import '@agentic/ui/styles.css';` and `@source './';`, and import it from `main.ts` instead.

  Both stay inside `apps/landing`.
- **Title and description.** Assumption: they live only in `index.html`, not in `src/content/`. They are static HTML that a crawler reads before any script, and putting them in `content/` would need a build plugin for two strings.
- **Live preference.** Assumption: the page follows a live system preference change when `?mode=` is absent. The product spec says the page "follows the system preference", and a page that ignored a change until reload would contradict the system after the visitor's OS switches at dusk.
- **Brand and mode are independent.** Assumption: `?brand=lumen` alone still gives the system's mode, not light as in `apps/web`. The product is pulse, `?brand=` exists only for shots and e2e, and those always pass both values.
- **First frame.** Assumption: a visitor whose system prefers light may see one dark frame before the module script runs, because `index.html` carries `data-mode="dark"`. There is no inline script in `index.html` to avoid this, because it would be a second copy of the theme rule that drifts from `useTheme`.
- **No section stories in this child.** Assumption: `Hero` and `Plans` are placeholders holding one heading each. Their `Landing/Hero` and `Landing/Plans` stories and Matrix belong to children 3 and 4 (plan rows 3 and 4). A Matrix story now would add visual baselines that those children replace at once. The frame is proven by the e2e scenarios and shots.
- **No placeholder text.** Assumption: the placeholders show only their final headings, with no "coming soon" copy. Between this child and child 4 the page reads as a heading-only outline.

## Out of scope

- The hero's lead, offer line and calls to action; "See the plans" and the `#plans` scroll and focus behaviour, including opening the page at `#plans` (child 3).
- `Button` with `href` (child 2); nothing in this child is styled as a button.
- Plan cards, prices, the `@web` alias and the `pricing.md` line (child 4); the full Tab order of the finished page (child 4's e2e).
- Section stories and Matrix stories, visual baselines for the landing.
- A theme or brand switcher, storing the theme, a no-JavaScript fallback, a root `pnpm dev` script for the landing, changes to `docs/getting-started.md`.
- Legal pages of the landing's own; a `nav` landmark (the page has no navigation menu).

## Open questions

None.
