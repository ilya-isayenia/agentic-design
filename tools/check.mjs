// `pnpm check`: every check in the order of docs/spec.md §6, the same locally and in CI.
// Runs all steps (so one red step does not hide the next), prints a summary, writes .check/results.json
// for tools/evidence, and exits non-zero if any step failed. `--only a,b` runs a subset.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

export const STEPS = [
  { id: 'tokens', run: 'pnpm tokens' },
  { id: 'typecheck', run: 'pnpm exec vue-tsc --noEmit -p tsconfig.json' },
  { id: 'lint', run: 'pnpm lint' },
  { id: 'unit', run: 'pnpm exec vitest run --project unit' },
  { id: 'storybook', run: 'pnpm exec vitest run --project storybook' },
  { id: 'contrast', run: 'node tools/contrast/index.mjs' },
  { id: 'visual', run: 'pnpm test:visual' },
  { id: 'e2e', run: 'pnpm test:e2e' },
  { id: 'denylist', run: 'pnpm denylist' },
];

const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(',')) : null;
const git = (/** @type {string[]} */ args) => spawnSync('git', args, { encoding: 'utf8' }).stdout.trim();

const results = [];
for (const step of STEPS) {
  if (only && !only.has(step.id)) continue;
  console.log(`\n▶ ${step.id}: ${step.run}`);
  const started = Date.now();
  const { status } = spawnSync(step.run, { shell: true, stdio: 'inherit' });
  results.push({ id: step.id, passed: status === 0, seconds: Math.round((Date.now() - started) / 1000) });
}

console.log('\ncheck summary');
for (const r of results) console.log(`  ${r.passed ? 'pass' : 'FAIL'}  ${r.id} (${r.seconds}s)`);

mkdirSync('.check', { recursive: true });
writeFileSync(
  '.check/results.json',
  JSON.stringify({ commit: git(['rev-parse', 'HEAD']), dirty: git(['status', '--porcelain']) !== '', at: new Date().toISOString(), steps: results }, null, 2) + '\n',
);
process.exit(results.every((r) => r.passed) ? 0 : 1);
