// `pnpm shots <change-id> [options]` — screenshots of stories and app routes for a change, for humans and
// reviewers (not baselines). Output: changes/<id>-<slug>/shots/<label>/<target>--<brand>-<mode>--<width>.png
//
//   --label <name>        sub-folder: before | round-1 | after | review (default: after)
//   --stories a,b         Storybook story ids
//   --routes r1,r2        app routes after '#', e.g. /join/arden-north/access
//   --session file.json   sessionStorage to set before each route, { "<key>": <value> } (e.g. the signup state)
//   --from-record         stories, routes and viewports from changes/<id>/evidence.json; a route there is
//                         a string or { "route": "/join/…", "session": { "signup": { … } } }
//   --brands, --modes     default: all brands, both modes
//   --viewports 375,1280  widths in CSS px (default 375,1280)
//   --before              build Storybook and the app at the merge base with main, label "before"
//   --no-build            reuse storybook-static/ and apps/web/dist/
// Matrix stories (ids ending in --matrix) already render all six themes, so they are shot once per
// width as <id>--all-themes--<width>.png.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const id = args[0];
if (!id || id.startsWith('--')) {
  console.error('usage: pnpm shots <change-id> [--label after] [--stories ids] [--routes routes] [--from-record] [--before]');
  process.exit(2);
}
const opt = (/** @type {string} */ name, /** @type {string} */ fallback = '') => {
  const i = args.indexOf(`--${name}`);
  return i > -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const flag = (/** @type {string} */ name) => args.includes(`--${name}`);
const list = (/** @type {string} */ s) => s.split(',').map((x) => x.trim()).filter(Boolean);

function changeDir() {
  if (id === 'review') return resolve('changes/review');
  for (const base of ['changes', 'changes/archive']) {
    if (!existsSync(base)) continue;
    const hit = readdirSync(base).find((d) => d.startsWith(id));
    if (hit) return resolve(base, hit);
  }
  console.error(`No change folder starting with ${id}`);
  process.exit(2);
}

const dir = changeDir();
const before = flag('before');
const label = before ? 'before' : opt('label', 'after');
let stories = list(opt('stories'));
const globalSession = opt('session') ? JSON.parse(readFileSync(opt('session'), 'utf8')) : null;
/** @type {{ route: string, session: Record<string, unknown> | null }[]} */
let routes = list(opt('routes')).map((route) => ({ route, session: globalSession }));
let viewports = list(opt('viewports', '375,1280')).map(Number);
if (flag('from-record')) {
  const record = JSON.parse(readFileSync(join(dir, 'evidence.json'), 'utf8'));
  stories = [...stories, ...(record.stories ?? [])];
  routes = [
    ...routes,
    ...(record.routes ?? []).map((/** @type {any} */ r) =>
      typeof r === 'string' ? { route: r.replace(/^.*#/, ''), session: globalSession } : { route: String(r.route).replace(/^.*#/, ''), session: r.session ?? globalSession },
    ),
  ];
  if (record.viewports?.length) viewports = record.viewports.map(Number);
}
if (!stories.length && !routes.length) {
  console.error('Nothing to shoot: pass --stories, --routes or --from-record');
  process.exit(2);
}
const brands = list(opt('brands', 'pulse,volt,lumen'));
const modes = list(opt('modes', 'dark,light'));

const run = (/** @type {string} */ cmd, /** @type {string} */ cwd) => {
  const { status } = spawnSync(cmd, { cwd, shell: true, stdio: 'inherit' });
  if (status !== 0) process.exit(status ?? 1);
};

// Build the sources to shoot: the current tree, or the merge base in a temporary worktree.
let root = process.cwd();
let worktree = '';
if (before) {
  const base = spawnSync('git', ['merge-base', 'main', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  worktree = mkdtempSync(join(tmpdir(), 'shots-before-'));
  run(`git worktree add --detach "${worktree}" ${base}`, root);
  run('pnpm install --frozen-lockfile --prefer-offline', worktree);
  root = worktree;
}
if (before || !flag('no-build')) {
  if (stories.length) run('pnpm build-storybook', root);
  if (routes.length) run('pnpm build', root);
}

const port = 6200 + Math.floor(Math.random() * 500);
const server = spawn('node', [resolve('tools/serve.mjs'), String(port), `/storybook/=${join(root, 'storybook-static')}`, `/agentic-design/=${join(root, 'apps/web/dist')}`], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 500));

const out = join(dir, 'shots', label);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const safe = (/** @type {string} */ s) => s.replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '') || 'home';
let count = 0;
try {
  for (const width of viewports) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const brand of brands) {
      for (const mode of modes) {
        for (const story of stories) {
          const matrix = story.endsWith('--matrix');
          if (matrix && (brand !== brands[0] || mode !== modes[0])) continue;
          await page.goto(`http://127.0.0.1:${port}/storybook/iframe.html?id=${story}&viewMode=story&globals=brand:${brand};mode:${mode}`);
          await page.locator('#storybook-root > *').first().waitFor({ timeout: 15_000 });
          await page.evaluate(() => document.fonts.ready);
          const theme = matrix ? 'all-themes' : `${brand}-${mode}`;
          await page.screenshot({ path: join(out, `${safe(story)}--${theme}--${width}.png`), fullPage: true, animations: 'disabled' });
          count++;
        }
        for (const { route, session } of routes) {
          const url = `http://127.0.0.1:${port}/agentic-design/?brand=${brand}&mode=${mode}#${route}`;
          if (session) {
            // Seed sessionStorage on a neutral page first, so the route's guards see the state.
            await page.goto(`http://127.0.0.1:${port}/agentic-design/#/legal/terms`);
            await page.evaluate((items) => {
              sessionStorage.clear();
              for (const [k, v] of Object.entries(items)) sessionStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
            }, session);
          }
          await page.goto(url);
          if (session) await page.reload();
          await page.waitForLoadState('networkidle');
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({ path: join(out, `app_${safe(route)}--${brand}-${mode}--${width}.png`), fullPage: true, animations: 'disabled' });
          count++;
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
  if (worktree) {
    spawnSync('git', ['worktree', 'remove', '--force', worktree]);
    rmSync(worktree, { recursive: true, force: true });
  }
}
console.log(`shots: ${count} screenshots in ${out}`);
