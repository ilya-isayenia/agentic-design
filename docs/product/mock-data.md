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
