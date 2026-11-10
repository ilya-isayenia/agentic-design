# Pulse landing page (0002-landing-page)

## Purpose

A one-page site for the gym chain that a visitor reaches before the signup app. It says what a membership covers and what it costs, then sends the visitor to the club finder to start the signup. After it, the visitor knows the 4 access levels, the lowest 4-week price of each, and that 1- and 2-year plans are half price for the first 6 months.

## Audience

People who are thinking about joining a gym and arrive from a link (an ad, a message from a friend, a search result). Most use a phone at 375 px; some use a laptop at 1280 px or wider. They don't know the chain's plans or prices yet, and they have not picked a club.

## Sections

| # | Section or screen | Goal | Content | Media | Interaction |
| --- | --- | --- | --- | --- | --- |
| 1 | Hero | say what the chain offers and start the signup | heading, one-line lead, the offer line, two calls to action | none; the section is type-led. Assumption: no image. The hero child's prototypes may try a decorative shape coded in SVG from semantic roles, `aria-hidden`. It must not show clubs, people or data, so it needs no "illustration only" label. No photos, no logos | "Find your club" leaves for the signup app; "See the plans" moves to section 2 |
| 2 | Plans teaser | show the 4 access levels with their "from" price | heading, intro line, 4 plan cards, a note on how the price is worked out, one call to action | none; prices are computed from the existing plan data | "Find your club" leaves for the signup app; the cards are not interactive |

The page frame around them (from the scaffold child) has a skip link, a header with the wordmark, `main` with both sections, and a footer.

## Content per section

Voice from `docs/product/copy.md`: short, direct, second person, verbs on buttons, no exclamation marks, numbers as digits. Copy is written in sentence case; display headings are shown in capitals by the `uppercase` class, never typed in capitals.

### Frame

| Place | Text |
| --- | --- |
| Document title | "Pulse gyms — train close to home or anywhere (demo)" |
| Meta description | "Demo landing page for an invented gym chain: access levels and prices from the signup demo. All data is invented." |
| Skip link | "Skip to content" (as in `apps/web`) |
| Header wordmark | "Pulse", plain text, not a heading and not a link. Assumption: the chain is named after the brand, as the signup app's header already does. |
| Footer | "Demo site with invented clubs and prices. Nothing is charged, sent or stored." Links: "Membership terms" → `../#/legal/terms`, "Privacy notice" → `../#/legal/privacy`. Assumption: the landing reuses the signup app's legal placeholders (`docs/product/legal.md`) and has no legal pages of its own. |

### 1. Hero

| Place | Text |
| --- | --- |
| Heading (`h1`, the page's only one) | "Train close to home or anywhere" |
| Lead | "Pick your home club or train at every club in the country. Join online in 5 steps." |
| Offer line | "Half price for your first 6 months on 1- and 2-year plans." This sentence is already in `docs/product/copy.md` (promo banner); it is reused word for word. |
| Primary call to action | "Find your club" → the signup app's club finder (see "Navigation and flow") |
| Secondary call to action | "See the plans" → `#plans` |

- Assumption: the offer has no end date or countdown on the landing. `pricing.md` gives the promo no end date. The signup app's end-of-month countdown (`apps/web/src/lib/promo.ts`) is only there to keep the demo's Banner running.
- The offer line uses `accent` only as a fill or a mark next to the text (rule C4: never as text colour on `bg`/`surface`). The words carry the offer, so colour is never the only signal.

### 2. Plans teaser

| Place | Text |
| --- | --- |
| Heading (`h2`, `id="plans"`) | "Choose where you train" |
| Intro | "Prices are per 4 weeks. You choose the duration when you join." |
| Card heading (`h3`) | the access level's `title` from data: "Home club", "Area", "City", "Country" |
| Card perks | the access level's `perks` from data, 2 per card, as they are in `apps/web/src/data/plans.ts` |
| Card price | Price component, lead "From", period "4 weeks", `amount` and `was` from `fromPrice('regular', id)` |
| Note under the cards | "From-prices are for a regular membership on a 2-year plan, at half price for the first 6 months. Students and corporate members pay less; 1-year and flex plans cost more." |
| Call to action | "Find your club", the same text and destination as in the hero (SC 3.2.4) |

Every fact in the note comes from `docs/product/pricing.md`: the "from" price is the 2-year promo price, the student factor is 0.8, the corporate factor is 0.85, the 1-year factor is 1.1 and the flex factor is 1.35.

**Where the plan data comes from.** The cards read `ACCESS_LEVELS` from `apps/web/src/data/plans.ts` and `fromPrice` from `apps/web/src/lib/pricing.ts`. These are the signup app's source of truth (`docs/product/pricing.md`), so there is no second copy of prices or perks. With today's data the cards show €22 (was €44), €28 (was €56), €34 (was €68) and €40 (was €80). These numbers are listed only to check against; the page computes them and never types them in.

- Assumption: the landing imports those two files through the `@web` alias. `tsconfig.json`, `vitest.config.ts` and `.storybook/main.ts` already resolve `@web`; only `apps/landing/vite.config.ts` has to add it. This departs from the stack profile's "A new app" recipe ("without the alias"), and that is deliberate. The landing may import only `@web/data/plans` and `@web/lib/pricing`, never views, composables or `api.ts`. The consequence: a change to `plans.ts` or `pricing.ts` now shows in two apps, so `docs/product/pricing.md` gets one line saying so. The alternative was to move both files into a shared workspace package. It is cleaner, but it means refactoring `apps/web` and is not needed for one consumer.
- Assumption: prices are for the `regular` membership type. That is the base in `pricing.md`; other types are named in the note.
- Assumption: the cards are a section-local composition in `apps/landing`. Each is a `surface` card with a `border-strong` boundary, an `h3`, the perks with the `Icon` check and `Price`. They are built only from exported `@agentic/ui` parts and semantic tokens, with no new component and no new token. `PlanCard` is not usable here: it is a radio that throws outside a `RadioGroup`, and its contract forbids links inside it. If the whole-product review finds the composition drifting from `PlanCard`'s look, a static `PlanCard` variant is a later `ds` change.
- Assumption: the cards have no call to action of their own. The signup needs a club before it shows plans, so a "Choose this plan" link on each card would lead to the same club finder 4 times under 4 different-sounding names.
- Layout: 1 column at 375 px, 2 columns from `md`, 4 columns at 1280 px inside `max-w-page`; the intro and note sit in `max-w-prose`.

## Brand

Existing brand `pulse`, both modes. Dark is the default, as in the signup app.

- No new tokens and no new roles. Roles used: `bg`, `surface`, `surface-raised`, `text`, `text-muted`, `border`, `border-strong`, `accent`, `accent-hover`, `on-accent`, `focus`. Type: `font-display` with `text-display`/`text-h1`/`text-h2`/`text-h3`, `font-text` with `text-body`/`text-small`/`text-caption`. These pairs already pass `pnpm contrast` in pulse dark and pulse light.
- Assumption on mode: `?mode=` (and `?brand=`, for shots and e2e) wins. Otherwise the page follows the system preference: `prefers-color-scheme: light` gives pulse light, and anything else gives pulse dark. There is no theme switcher. The landing does not write the theme to storage.
- Section stories still render all 6 themes in their Matrix story (DS rule C9). As a product, the landing is checked only in pulse dark and pulse light.

## Navigation and flow

- One page, no router, no `vue-router` dependency. Visitors scroll from the hero to the plans.
- Tab order at both widths: skip link → "Find your club" (hero) → "See the plans" → "Find your club" (plans) → "Membership terms" → "Privacy notice". The cards hold no focusable elements.
- Skip link: the first Tab shows it; Enter moves focus to `main` (`tabindex="-1"`).
- "See the plans" is a link to `#plans` on the plans `h2`, which has `tabindex="-1"`. Activating it scrolls to the heading and moves focus there, and the URL shows `#plans`. Opening the page with `#plans` lands on the same heading. Smooth scrolling runs only without `prefers-reduced-motion`.
- "Find your club" is a link (not a button) to the signup app's club finder, in the same tab. Its href is relative so it works on Pages, in `pnpm preview` and in e2e, where both apps share one origin: `../?brand=pulse&mode=<current mode>#/`. Assumption: it carries the mode so a visitor in light mode does not land in a dark signup. Assumption: with `pnpm --filter @agentic/landing dev` alone the link does not resolve, because the signup app runs on another port. That is accepted for local development.
- On arrival focus stays at the top of the document; nothing moves focus without a user action.

## Constraints

- App folder `apps/landing`, package `@agentic/landing`, served at `/agentic-design/landing/` (`tools/apps.mjs`). It is built on `@agentic/ui` and the tokens only, plus the two read-only `@web` imports named above.
- Tokens only (DS rules R1–R4, C1–C9); no raw values, no `dark:` variants, no Tailwind arbitrary values.
- WCAG 2.2 AA is a build gate: axe clean on every section story and on the page in pulse dark and pulse light; touch targets at least 48 px (Button `md`); one `h1`; headings `h1` → `h2` → `h3` with no skipped level.
- Works at 375 px and at 1280 px; nothing scrolls sideways at 320 px (SC 1.4.10).
- Reduced motion: no smooth scroll and no ticker; nothing on the page animates without a state change.
- Static content: no requests, no forms, no cookies or storage, no tracking, no backend. The section state tables in the child specs mark loading, empty, error, partial and permission as not applicable for that reason. The one data dependency (`ACCESS_LEVELS`) is a bundled constant with 4 entries, and a unit test pins that.
- Copy is English, invented and in the voice of `docs/product/copy.md`. Strings live in `apps/landing/src/content/` as typed constants (stack profile). `docs/product/copy.md` gets one line pointing there instead of a second copy.
- Data is visibly a demo: the footer says that clubs and prices are invented.
- Size of the whole: two sections and a frame. Fonts come from `@agentic/ui` (self-hosted Barlow Condensed and Inter), and no other assets are loaded.

## Out of scope

- A club finder, map or club list on the landing.
- Pre-selecting an access level in the signup from a card. The signup asks for a club first; a deep link would need a change to `apps/web`.
- Comparing durations or membership types, a price calculator, the workouts-per-week stepper.
- The promo countdown Banner, and any end date for the offer.
- A theme or brand switcher; Volt or Lumen versions of the landing as a product.
- Photos, logos, testimonials, opening hours, club counts, FAQ, newsletter or contact forms.
- Legal pages of its own, cookie banner, analytics, SEO beyond title and description, other languages.

## Open questions

1. Both calls to action are navigation, so they must be links, but `Button` renders only a `<button>`, and the design system has no link that looks like a button. Options:
   - (a) a `ds` child before the hero adds an `href` prop to `Button` that renders `<a href>` with the same variants, sizes and focus ring, plus its contract, stories and tests (my pick);
   - (b) the landing styles a plain `<a>` with token classes copied from `Button`, which gives a second copy of the button look that will drift (rule P2);
   - (c) `Button` with a click handler that sets `location`, which gives the wrong role (announced as a button) and breaks open-in-new-tab.
