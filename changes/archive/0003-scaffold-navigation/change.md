# Change 0003-scaffold-navigation

| Field | Value |
| --- | --- |
| id | 0003 |
| slug | scaffold-navigation |
| request | 0002 child 1: `apps/landing` (`@agentic/landing`) per the stack profile's "A new app": `useTheme` (`?brand=&mode=` wins, else `prefers-color-scheme`, pulse dark by default, no storage), real title and description, skip link, header wordmark, `main`, footer with the demo line and the two legal links to `../#/legal/…`; `src/content/` for frame copy plus a pointer line in `docs/product/copy.md`; placeholders: Hero holding the page's only `h1`, Plans holding `h2#plans` with `tabindex="-1"`; `tests/e2e/landing/smoke.spec.ts` (main and `h1` visible, axe clean in pulse dark and light, skip link then Enter focuses `main`) |
| parent | 0002-landing-page |
| type | feature |
| size | M |
| status | done |
| stage | merge |
| waiting for | — |
| branch | change/0003-scaffold-navigation |
| prototype rounds | 0 |
| review rounds | 3 |
| pr | — |
