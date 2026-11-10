// `pnpm evidence <change-id>` — builds changes/<id>-<slug>/evidence.md, the page a human reads before merge,
// from the change record, spec, log, review, evidence record, check results and shots.
// For a size XL change (a new product) it builds the parent summary instead: product spec, plan, every
// child with its PR and evidence status, and the whole-product review.
// Exits 1 and lists what is missing; integrate must not open a PR until it exits 0.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { brands as tokenBrands } from '../apps.mjs';

const STATES = ['loading', 'empty', 'error', 'partial', 'success', 'permission'];

const git = (/** @type {string[]} */ a) => spawnSync('git', a, { encoding: 'utf8' }).stdout.trim();

// `pnpm evidence --next-id` prints the next change id: 1 + the highest NNNN among the folders in changes/ and
// changes/archive/ on this checkout and the open change branches (change/NNNN-slug, local and remote).
// Run `git fetch --prune` first so closed branches drop out.
if (process.argv[2] === '--next-id') {
  const ids = ['changes', 'changes/archive']
    .flatMap((b) => (existsSync(b) ? readdirSync(b) : []))
    .concat(git(['branch', '-a', '--list', '*change/*']).split('\n'))
    .map((n) => /(?:^|[\s/])(\d{4})-/.exec(n)?.[1])
    .filter(Boolean)
    .map(Number);
  console.log(String(Math.max(0, ...ids) + 1).padStart(4, '0'));
  process.exit(0);
}

// `pnpm evidence --find <id>` prints "<ref> <folder>": the branch (or main) holding the newest copy of the
// change folder, so `/change continue` can find a parent whose record moves along its child branches.
if (process.argv[2] === '--find') {
  const want = process.argv[3] ?? '';
  const refs = ['main', 'origin/main', ...git(['branch', '-a', '--format=%(refname:short)', '--list', '*change/*']).split('\n')].filter(Boolean);
  let best = { time: -1, ref: '', folder: '' };
  for (const ref of new Set(refs)) {
    for (const base of ['changes', 'changes/archive']) {
      const folder = git(['ls-tree', '-d', '--name-only', `${ref}:${base}`])
        .split('\n')
        .find((d) => want && d.startsWith(want));
      if (!folder) continue;
      const time = Number(git(['log', '-1', '--format=%ct', ref, '--', `${base}/${folder}`]) || 0);
      if (time > best.time) best = { time, ref, folder: `${base}/${folder}` };
    }
  }
  if (!best.ref) {
    console.error(`No change folder starting with ${want} on main or any change branch`);
    process.exit(2);
  }
  console.log(`${best.ref.replace(/^origin\//, '')} ${best.folder}`);
  process.exit(0);
}

const id = process.argv[2];
if (!id) {
  console.error('usage: pnpm evidence <change-id> | pnpm evidence --next-id');
  process.exit(2);
}
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
if (record.size === 'XL') parentEvidence();

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

// shots: after/ must cover every brand of the record (default: every brand with tokens) and both modes.
const after = join(dir, 'shots', 'after');
const shots = existsSync(after) ? readdirSync(after).filter((f) => f.endsWith('.png')) : [];
for (const brand of ev.brands?.length ? ev.brands : tokenBrands()) {
  for (const mode of ['dark', 'light']) {
    // A Matrix shot (--all-themes--) shows every brand and mode at once.
    if (!shots.some((f) => f.includes(`--${brand}-${mode}--`) || f.includes('--all-themes--'))) missing.push(`shots/after: none for ${brand} ${mode}`);
  }
}

// Links point at the archive location on the branch, where the folder lives once the PR is open.
const origin = git(['remote', 'get-url', 'origin']).replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
const branch = record.branch || git(['branch', '--show-current']);
const archived = join('changes/archive', name);
const link = (/** @type {string} */ path) => `${origin}/blob/${branch}/${path}`;
const shotFolders = existsSync(join(dir, 'shots')) ? readdirSync(join(dir, 'shots')) : [];
const pick = shots.filter((f) => f.endsWith('--1280.png') || f.endsWith('--375.png')).filter((f) => f.includes('-dark--') || f.includes('-light--') || f.includes('--all-themes--'));
const gallery = pick
  .filter((f, i, all) => all.findIndex((g) => g.split('--')[0] === f.split('--')[0] && g.split('--')[2] === f.split('--')[2]) === i || f.includes('pulse-dark'))
  .slice(0, 6)
  .map((f) => `![${f}](${link(join(archived, 'shots/after', f))}?raw=true)`);

const md = `# Evidence — ${name}

> ${record.request ?? ''}

| | |
| --- | --- |
| Type / size | ${record.type ?? '?'} / ${record.size ?? '?'} |${record.parent && record.parent !== '—' ? `\n| Part of | ${record.parent} (new product; its plan is in \`changes/**/${record.parent}/plan.md\`) |` : ''}
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

// The parent of a new product (size XL): it builds nothing itself, so its evidence is its children and the
// whole-product review. Missing: a child not merged (dropped ones excepted), a child folder or its evidence
// not complete, no product review, an open critical/required finding, no product shots.
function findFolder(/** @type {string} */ cid) {
  for (const b of ['changes/archive', 'changes']) {
    const hit = existsSync(b) ? readdirSync(b).find((d) => d.startsWith(`${cid}-`)) : undefined;
    if (hit) return join(b, hit);
  }
  return '';
}

function parentEvidence() {
  const missing = [];
  const productSpec = read(join(dir, 'product-spec.md'));
  if (!productSpec) missing.push('product-spec.md is missing');
  const plan = read(join(dir, 'plan.md'));
  if (!plan) missing.push('plan.md is missing');
  // plan.md children table: | # | Child | Size | Scope | Id | Status | PR |
  const children = plan
    .split('\n')
    .filter((l) => /^\|\s*\d+\s*\|/.test(l))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
    .map(([n, child, size, scope, cid, status, pr]) => ({ n, child, size, scope, cid, status, pr }));
  if (plan && !children.length) missing.push('plan.md has no children rows');
  const rows = children.map((c) => {
    if (c.status === 'dropped') return `| ${c.n} | ${c.child} | ${c.size} | — | dropped | — | — |`;
    const folder = /^\d{4}$/.test(c.cid ?? '') ? findFolder(c.cid) : '';
    const childEvidence = folder ? read(join(folder, 'evidence.md')) : '';
    const complete = /## Evidence status\s*\n+- \[x\] complete/.test(childEvidence);
    if (c.status !== 'merged') missing.push(`child ${c.n} (${c.child}) is ${c.status || 'not started'}, not merged`);
    else if (!folder) missing.push(`child ${c.n} (${c.child}): no folder for id ${c.cid || '?'} on this checkout`);
    else if (!complete) missing.push(`child ${c.n} (${c.child}): its evidence.md is not complete`);
    return `| ${c.n} | ${c.child} | ${c.size} | ${c.cid || '—'} | ${c.status || '—'} | ${c.pr || '—'} | ${folder ? (complete ? 'complete' : '**incomplete**') : '—'} |`;
  });

  const log = read(join(dir, 'log.md'));
  const decisions = log.split('\n').filter((l) => /decision/i.test(l) && l.trim().startsWith('-'));
  const unmarked = decisions.filter((l) => !/by: (human|agent)\s*$/.test(l.trim()));
  if (unmarked.length) missing.push(`log.md: ${unmarked.length} decision line(s) without "by: human" or "by: agent"`);

  const review = read(join(dir, 'review.md'));
  const findings = review.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l));
  const open = findings.filter((l) => /\|\s*(critical|required)\s*\|/.test(l) && /\|\s*open\s*\|\s*$/.test(l));
  if (!review) missing.push('review.md is missing (the whole-product review did not run)');
  if (open.length) missing.push(`review.md: ${open.length} open critical/required finding(s)`);

  const productShots = join(dir, 'shots', 'product');
  const shots = existsSync(productShots) ? readdirSync(productShots).filter((f) => f.endsWith('.png')) : [];
  if (!shots.length) missing.push('shots/product: no screenshots of the assembled product');

  const origin = git(['remote', 'get-url', 'origin']).replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
  const branch = git(['branch', '--show-current']);
  const archived = join('changes/archive', name);
  const link = (/** @type {string} */ path) => `${origin}/blob/${branch}/${path}`;
  const summary = productSpec.match(/^##+ Purpose\s*\n([\s\S]*?)(?=^##+ |(?![\s\S]))/im)?.[1]?.trim() ?? '';

  const md = `# Evidence — ${name} (new product)

> ${record.request ?? ''}

| | |
| --- | --- |
| Size | XL — new product: spec → plan → child changes → whole-product review |
| Children | ${children.filter((c) => c.status === 'merged').length} merged, ${children.filter((c) => c.status === 'dropped').length} dropped, ${children.length} planned |
| Decisions | ${decisions.filter((l) => /by: human/.test(l)).length} by human, ${decisions.filter((l) => /by: agent/.test(l)).length} by agent |
| Product review | ${findings.length} finding(s), ${open.length} open critical/required |

## Evidence status

${missing.length ? missing.map((m) => `- [ ] ${m}`).join('\n') : '- [x] complete'}

## Purpose

${summary || '—'}

Product spec: [product-spec.md](${link(join(archived, 'product-spec.md'))}) · plan: [plan.md](${link(join(archived, 'plan.md'))})

## Children

| # | Child | Size | Id | Status | PR | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Whole-product review

${findings.length ? `| # | Reviewer | Severity | Confidence | Where | Finding | Fix | Status |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${findings.join('\n')}` : review ? 'No findings.' : '—'}

Shots of the assembled product: [shots/product/](${link(join(archived, 'shots/product'))}) (${shots.length} files)

## Decisions

${decisions.join('\n') || '—'}

---
Built by \`pnpm evidence ${id}\` from \`${relative(process.cwd(), dir)}\`.
`;
  writeFileSync(join(dir, 'evidence.md'), md);
  if (missing.length) {
    console.error(`evidence: incomplete — ${missing.length} item(s):`);
    for (const m of missing) console.error(`  - ${m}`);
    process.exit(1);
  }
  console.log(`evidence: complete → ${join(dir, 'evidence.md')} (${basename(dir)}, new product)`);
  process.exit(0);
}
