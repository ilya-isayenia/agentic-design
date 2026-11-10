# Pricing rules

Source of truth for prices: `apps/web/src/data/plans.ts`; calculations: `apps/web/src/lib/pricing.ts` (unit-tested). Change the data, this page and the tests together. All amounts are for a 4-week period, in euros; code holds cents.

## Base price per access level

The price for a regular member on the 2-year plan, before any promo.

| Access level | Clubs | Base |
| --- | --- | --- |
| Home club | the club the member picked | €44 |
| Area | every club in the club's area | €56 |
| City | every club in the club's city | €68 |
| Country | every club | €80 |

## Multipliers

Applied in this order, each result rounded to the nearest €0.50:

1. Membership type: regular × 1, student × 0.8, corporate × 0.85.
2. Duration: 2 years × 1, 1 year × 1.1, flex × 1.35.

## Promo

2-year and 1-year plans: half price for the first 6 months (the 4-week price × 0.5, rounded to €0.50). The receipt shows the promo price with the regular price struck through. Flex has no promo.

## Starter package

€25: intro session with a coach, member card, water bottle. Included (€0) on 2-year and 1-year plans; charged on flex.

## First payment (the receipt total)

First 4-week price (promo applied) + starter package. The struck-through total is the same without promo and with the starter package charged.

## Discount code

Codes: `apps/web/src/data/discounts.ts`; rules: `apps/web/src/lib/discount.ts` (unit-tested).

| Code | Off | Plans | Ends |
| --- | --- | --- | --- |
| `TEST-10` | 10% | all | never |
| `TEST-FLEX20` | 20% | flex | never |
| `TEST-EXPIRED` | 10% | all | 2020-01-01 |

- One code at a time. A new code that is valid for the plan replaces the applied one. A new code that is unknown, expired or not eligible, or whose check fails, leaves the applied one in place.
- The percentage comes off the first 4-week price after the promo. On 1- and 2-year plans it applies on top of the half-price promo price. The result is rounded to the nearest €0.50, like every other price here. The discount is the difference.
- The starter package and later periods are untouched.
- First payment = discounted first 4-week price + starter package.
- The struck-through total keeps its definition: no promo, starter charged, no discount.
- Codes are trimmed and upper-cased before the check.
- A plan change checks the applied code again against the new plan; if it no longer applies, it is dropped and not applied again by itself.
- A discount code and a referral code are independent: both can be entered, and the referral code never changes the price.

| Plan (regular member) | Code | First 4 weeks | First payment |
| --- | --- | --- | --- |
| Home club, 2 years | `TEST-10` | €22 → €20 | €20 |
| Home club, flex | `TEST-FLEX20` | €59.50 → €47.50 | €72.50 |
| Home club, flex | `TEST-10` | €59.50 → €53.50 | €78.50 |
| Home club, flex | `TEST-10` applied, then `TEST-FLEX20` | €47.50 (replaces, never stacks) | €72.50 |
| Home club, 2 years | `TEST-10` applied, then `TEST-FLEX20` | not eligible; `TEST-10` stays | €20 |

## "From" price on the access level step

The lowest first-period price of that access level across durations, i.e. the 2-year promo price.

## Workouts per week

The stepper on the access level step (0–7) does not change the price. When it is above 0, each plan card also shows the price of one workout: the "from" price ÷ (workouts × 4), rounded to the cent.

## Examples (regular member)

| Plan | 4-week price | First payment |
| --- | --- | --- |
| Home club, 2 years | €22 (was €44) | €22 |
| Home club, 1 year | €24.50 (was €48.50) | €24.50 |
| Home club, flex | €59.50 | €84.50 |
| City, flex | €92 | €117 |
