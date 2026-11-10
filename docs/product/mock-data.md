# Mock data and how to trigger states

All data is invented (`apps/web/src/data/`). The fake API (`apps/web/src/lib/api.ts`) adds a delay so loading states are visible.

| Want to see | Do |
| --- | --- |
| clubs loading | any search; `?mock=slow` makes it 3 s |
| no results | search `zzz` |
| finder error | open `/?mock=error` (the query goes before `#`, e.g. `/agentic-design/?mock=error#/`) |
| details submit error | `?mock=submit-error`, then submit step 4 |
| valid IBAN with bank auto-fill | `NL13 TEST 0123 4567 89`, `NL45 DEMO 0987 6543 21` |
| valid IBAN, unknown bank (type BIC and bank) | `BE68 0001 2345 6789` |
| invalid IBAN | `NL00 TEST 0123 4567 89` |
| SMS code | `123456` is right, anything else is wrong |
| expired code | wait 2 minutes, or `?mock=sms-expired` |
| discount code applied | `TEST-10` on any plan, in the receipt once a duration is chosen |
| discount code replaced | on flex, apply `TEST-10`, then `TEST-FLEX20` |
| discount code kept | on a 2-year plan, apply `TEST-10`, then `TEST-FLEX20`, `TEST-EXPIRED` or `NOPE` |
| discount code not eligible / no longer applies | `TEST-FLEX20` on a 2-year or 1-year plan, or apply it on flex and switch to 2 years |
| discount code expired | `TEST-EXPIRED` |
| discount code unknown | any other code, e.g. `NOPE` |
| discount code empty | Apply with an empty field |
| slow discount check | `?mock=slow` (3 s instead of 600 ms) |
| discount check fails | `?mock=code-error` |
