// `pnpm evidence <change-id>` — builds changes/<id>-<slug>/evidence.md, the page a human reads before merge,
// from the change record, spec, log, review, evidence record, check results and shots.
// Exits 1 and lists what is missing; integrate must not open a PR until it exits 0.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const STATES = ['loading', 'empty', 'error', 'partial', 'success', 'permission'];
const BRANDS = ['pulse', 'volt', 'lumen'];

const id = process.argv[2];
if (!id) {
  console.error('usage: pnpm evidence <change-id>');
  process.exit(2);
}
const git = (/** @type {string[]} */ a) => spawnSync('git', a, { encoding: 'utf8' }).stdout.trim();
const read = (/** @type {string} */ f) => (existsSync(f) ? readFileSync(f, 'utf8') : '');
const text = (/** @type {unknown} */ v) => typeof v === 'string' && v.trim().length > 0;

const base = ['changes', 'changes/archive'].find((b) => existsSync(b) && readdirSync(b).some((d) => d.startsWith(id)));
if (!base) {
  console.error(`No change folder starting with ${id}`);
  process.exit(2);
}
const name = readdirSync(base).find((d) => d.startsWith(id)) ?? '';
const dir = join(base, name);
const missing = [];

// change.md: a two-column table of fields.
const record = Object.fromEntries(
  [...read(join(dir, 'change.md')).matchAll(/^\|\s*([a-z ]+?)\s*\|\s*(.*?)\s*\|$/gm)].map((m) => [m[1], m[2]]),
);
if (!record.size) missing.push('change.md has no size');

// spec.md: acceptance criteria section.
const spec = read(join(dir, 'spec.md'));
const criteria = spec.match(/^##+ Acceptance criteria\s*\n([\s\S]*?)(?=^##+ |(?![\s\S]))/im)?.[1]?.trim() ?? '';
if (!spec) missing.push('spec.md is missing');
else if (!criteria) missing.push('spec.md has no "Acceptance criteria" section');

// log.md: every decision line ends with by: human or by: agent.
const log = read(join(dir, 'log.md'));
const decisions = log.split('\n').filter((l) => /decision/i.test(l) && l.trim().startsWith('-'));
const unmarked = decisions.filter((l) => !/by: (human|agent)\s*$/.test(l.trim()));
if (unmarked.length) missing.push(`log.md: ${unmarked.length} decision line(s) without "by: human" or "by: agent"`);
const rounds = log.split('\n').filter((l) => /prototype/i.test(l) && l.trim().startsWith('-'));

// review.md: no open critical or required findings.
const review = read(join(dir, 'review.md'));
const rows = review.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l));
const open = rows.filter((l) => /\|\s*(critical|required)\s*\|/.test(l) && /\|\s*open\s*\|\s*$/.test(l));
if (!review) missing.push('review.md is missing (validate did not run)');
if (open.length) missing.push(`review.md: ${open.length} open critical/required finding(s)`);
const score = review.match(/Design score:\s*([\d.]+)/g)?.pop() ?? '';

// evidence.json: the evidence record.
/** @type {any} */
let ev = {};
try {
  ev = JSON.parse(read(join(dir, 'evidence.json')) || '{}');
} catch {
  missing.push('evidence.json is not valid JSON');
}
if (!text(ev.contract)) missing.push('evidence.json: contract is missing');
const stateRows = STATES.map((s) => {
  const item = ev.states?.[s];
  if (item?.status === 'pass' && text(item.evidence)) return `| ${s} | pass | ${item.evidence} |`;
  if (item?.status === 'not-applicable' && text(item.reason)) return `| ${s} | not applicable | ${item.reason} |`;
  missing.push(`evidence.json: state "${s}" needs a passing observation or a not-applicable reason`);
  return `| ${s} | **missing** | |`;
});
for (const [s, item] of Object.entries(ev.states ?? {})) {
  if (!STATES.includes(s)) stateRows.push(`| ${s} | ${/** @type {any} */ (item).status} | ${/** @type {any} */ (item).evidence ?? /** @type {any} */ (item).reason ?? ''} |`);
}
for (const k of ['accessibility', 'responsive']) {
  if (!(ev[k]?.status === 'pass' && text(ev[k]?.evidence))) missing.push(`evidence.json: ${k} needs a passing observation`);
}

// checks: .check/results.json from `pnpm check` at the current commit.
const head = git(['rev-parse', 'HEAD']);
let checks = null;
if (existsSync('.check/results.json')) {
  checks = JSON.parse(read('.check/results.json'));
  const changedSince = checks.commit === head ? [] : git(['diff', '--name-only', checks.commit, head]).split('\n').filter((f) => f && !f.startsWith('changes/'));
  if (changedSince.length) missing.push(`checks ran at ${checks.commit.slice(0, 7)}; code changed since (${changedSince.length} files) — run pnpm check again`);
  const failed = checks.steps.filter((/** @type {any} */ s) => !s.passed).map((/** @type {any} */ s) => s.id);
  if (failed.length) missing.push(`checks failed: ${failed.join(', ')}`);
  if (checks.steps.length < 9) missing.push('checks: not every step ran (use pnpm check without --only)');
  copyFileSync('.check/results.json', join(dir, 'checks.json'));
} else missing.push('no check results: run pnpm check');

// shots: after/ must cover every brand and both modes.
const after = join(dir, 'shots', 'after');
const shots = existsSync(after) ? readdirSync(after).filter((f) => f.endsWith('.png')) : [];
for (const brand of BRANDS) {
  for (const mode of ['dark', 'light']) {
    if (!shots.some((f) => f.includes(`--${brand}-${mode}--`))) missing.push(`shots/after: none for ${brand} ${mode}`);
  }
}

// Links point at the archive location on the branch, where the folder lives once the PR is open.
const origin = git(['remote', 'get-url', 'origin']).replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
const branch = record.branch || git(['branch', '--show-current']);
const archived = join('changes/archive', name);
const link = (/** @type {string} */ path) => `${origin}/blob/${branch}/${path}`;
const shotFolders = existsSync(join(dir, 'shots')) ? readdirSync(join(dir, 'shots')) : [];
const pick = shots.filter((f) => f.endsWith('--1280.png') || f.endsWith('--375.png')).filter((f) => f.includes('-dark--') || f.includes('-light--'));
const gallery = pick
  .filter((f, i, all) => all.findIndex((g) => g.split('--')[0] === f.split('--')[0] && g.split('--')[2] === f.split('--')[2]) === i || f.includes('pulse-dark'))
  .slice(0, 6)
  .map((f) => `![${f}](${link(join(archived, 'shots/after', f))}?raw=true)`);

const md = `# Evidence — ${name}

> ${record.request ?? ''}

| | |
| --- | --- |
| Type / size | ${record.type ?? '?'} / ${record.size ?? '?'} |
| Branch | \`${branch}\` |
| Decisions | ${decisions.filter((l) => /by: human/.test(l)).length} by human, ${decisions.filter((l) => /by: agent/.test(l)).length} by agent |
| Review | ${rows.length} finding(s), ${open.length} open critical/required${score ? `; ${score}` : ''} |
| Checks | ${checks ? `${checks.steps.filter((/** @type {any} */ s) => s.passed).length}/${checks.steps.length} green at \`${checks.commit.slice(0, 7)}\`` : 'not run'} |

## Evidence status

${missing.length ? missing.map((m) => `- [ ] ${m}`).join('\n') : '- [x] complete'}

## What it delivers

${ev.contract ?? '—'}

## Acceptance criteria

${criteria || '—'}

## States

| State | Status | Evidence |
| --- | --- | --- |
${stateRows.join('\n')}

Accessibility: ${ev.accessibility?.evidence ?? '—'}

Responsive: ${ev.responsive?.evidence ?? '—'}

## Checks

${checks ? checks.steps.map((/** @type {any} */ s) => `- ${s.passed ? '✅' : '❌'} ${s.id} (${s.seconds}s)`).join('\n') : '—'}

## Screenshots

Folders: ${shotFolders.map((f) => `[${f}/](${link(join(archived, 'shots', f))})`).join(' · ') || '—'}

${gallery.join('\n')}

Stories: ${(ev.stories ?? []).map((/** @type {string} */ s) => `\`${s}\``).join(', ') || '—'}

## Decisions

${decisions.join('\n') || '—'}

## Prototype rounds

${rounds.join('\n') || '—'}

## Review findings

${rows.length ? `| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}` : '—'}

---
Built by \`pnpm evidence ${id}\` from \`${relative(process.cwd(), dir)}\`. Full record: [change.md](${link(join(archived, 'change.md'))}), [log.md](${link(join(archived, 'log.md'))}), [review.md](${link(join(archived, 'review.md'))}).
`;

writeFileSync(join(dir, 'evidence.md'), md);
if (missing.length) {
  console.error(`evidence: incomplete — ${missing.length} item(s):`);
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(`evidence: complete → ${join(dir, 'evidence.md')} (${basename(dir)})`);
