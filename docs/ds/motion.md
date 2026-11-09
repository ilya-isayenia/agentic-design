# Motion

| Token | Value | Use |
| --- | --- | --- |
| `duration-fast` | 120 ms | hover, press, colour changes |
| `duration-base` | 200 ms | disclosure, toast enter |
| `duration-slow` | 320 ms | page-level transitions |
| `ease-standard` | cubic-bezier(0.2, 0, 0, 1) | almost everything |
| `ease-emphasized` | cubic-bezier(0.3, 0, 0, 1) | entering elements |

Animations: `animate-spin` (spinner), `animate-pulse` (skeleton), `animate-ticker` (promo ribbon).

## Reduced motion

The base stylesheet cuts every animation and transition to near zero under `prefers-reduced-motion: reduce`. Components still add `motion-reduce:` variants where the reduced version should look different (the ribbon stops and shows one copy of its text). Nothing conveys meaning only through motion (SC 2.3.3 is AAA, but the rule is ours). Nothing flashes.
