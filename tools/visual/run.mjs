// `pnpm test:visual` / `pnpm test:visual:update`: builds Storybook and the app on the host, then runs
// the Playwright visual tests inside the official Playwright Docker image, so baselines are rendered
// the same way on every machine and in CI.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const update = process.argv.includes('--update');
const run = (/** @type {string} */ cmd, /** @type {string[]} */ args) => {
  const { status } = spawnSync(cmd, args, { stdio: 'inherit' });
  if (status !== 0) process.exit(status ?? 1);
};

const version = JSON.parse(readFileSync('node_modules/@playwright/test/package.json', 'utf8')).version;
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
  console.error('test:visual needs Docker running (baselines are rendered in the Playwright image).');
  process.exit(1);
}

if (!process.argv.includes('--no-build')) {
  run('pnpm', ['build-storybook']);
  run('pnpm', ['build']);
}

run('docker', [
  'run', '--rm', '--ipc=host', '--init',
  '-v', `${process.cwd()}:/work`, '-w', '/work',
  // Run as the host user, so files the tests write (results, baselines) are not owned by root.
  ...(process.getuid ? ['--user', `${process.getuid()}:${process.getgid?.()}`, '-e', 'HOME=/tmp'] : []),
  '-e', 'CI=1',
  ...(process.env.GITHUB_ACTIONS ? ['-e', 'GITHUB_ACTIONS=true'] : []),
  image,
  'node', 'node_modules/@playwright/test/cli.js', 'test', '-c', 'tests/visual/playwright.config.ts',
  ...(update ? ['--update-snapshots'] : []),
  ...process.argv.slice(2).filter((a) => !a.startsWith('--update') && a !== '--no-build'),
]);
