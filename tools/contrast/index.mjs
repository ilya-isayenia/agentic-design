// Checks every foreground/background pair in every brand × mode against WCAG 2.2 AA.
// Text pairs need 4.5:1 (SC 1.4.3); control boundaries, focus and chart marks need 3:1 (SC 1.4.11).
import { readFileSync } from 'node:fs';
import { contrast } from './wcag.mjs';

const surfaces = ['bg', 'surface', 'surface-raised'];
const on = (/** @type {string} */ fg, /** @type {string[]} */ bgs, /** @type {number} */ min) => bgs.map((bg) => ({ fg, bg, min }));

export const PAIRS = [
  ...on('text', surfaces, 4.5),
  ...on('text-muted', surfaces, 4.5),
  ...on('success', surfaces, 4.5),
  ...on('danger', surfaces, 4.5),
  ...on('chart-label', ['bg', 'surface'], 4.5),
  ...on('on-accent', ['accent', 'accent-hover'], 4.5),
  ...on('border-strong', surfaces, 3),
  ...on('accent', surfaces, 3),
  ...on('focus', surfaces, 3), // the focus ring is offset, so it always sits on a surface
  ...['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].flatMap((c) => on(c, ['bg', 'surface'], 3)),
];

const themes = JSON.parse(readFileSync(new URL('../../packages/tokens/build/themes.json', import.meta.url), 'utf8'));
let failures = 0;
for (const [theme, colors] of Object.entries(themes)) {
  for (const { fg, bg, min } of PAIRS) {
    const ratio = contrast(colors[fg], colors[bg]);
    if (ratio < min) {
      failures++;
      console.error(`FAIL ${theme}: ${fg} on ${bg} = ${ratio.toFixed(2)} (needs ${min})`);
    }
  }
}
const total = Object.keys(themes).length * PAIRS.length;
console.log(`contrast: ${total - failures}/${total} pairs pass (${Object.keys(themes).length} themes × ${PAIRS.length} pairs)`);
process.exit(failures ? 1 : 0);
