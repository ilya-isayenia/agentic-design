# Copy

Voice: short, direct, second person; verbs on buttons; no exclamation marks; numbers as digits. English only. All copy is invented for this demo.

| Place | Text |
| --- | --- |
| Promo banner | "Half price for your first 6 months on 1- and 2-year plans." Action: "See the offer" |
| Club finder title | "Find your club" |
| Search label | "Postcode or town" |
| Results count | "{n} clubs in {country}" / "{n} clubs match “{query}”" |
| No results | "No clubs match “{query}”" — "Check the spelling or try a town name." |
| Finder error | "We couldn't load the clubs" — "Check your connection and try again." Button "Try again" |
| Steps | 1 Membership type · 2 Access level · 3 Duration · 4 Your details · 5 Verify your phone |
| Step 1 | "Who is the membership for?" |
| Step 2 | "Where do you want to train?" Stepper label "Workouts per week" |
| Step 3 | "How long do you want to commit?" |
| Step 4 | "Tell us about you" ; IBAN intro "Enter your IBAN; we fill in the BIC and bank for banks we know." |
| Error summary | "Fix {n} problems to continue" |
| Step 5 | "We sent a 6-digit code to {phone}." Resend: "Send a new code" / "Send a new code in {m:ss}" |
| Wrong code | "That code is not right. Check the SMS and try again." |
| Expired code | "This code has expired. Send a new one." |
| Receipt | "Your membership receipt"; empty: "Choose a club and a plan to see your price here." |
| Success | "You're in" ; next steps: bring ID, collect the member card, book the intro session |

The landing page (`apps/landing`) keeps its copy in `apps/landing/src/content/` as typed constants, in the same voice.

Field labels, hints and error messages live next to the code (`apps/web/src/lib/details.ts`) and follow the same voice: say what to do, not what went wrong ("Enter your postcode", not "Postcode invalid").
