import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { appMounts, apps, basePath } from '../../tools/apps.mjs';

// One project per app in apps/*: the signup app's tests sit in this folder, another app's in tests/e2e/<app>/.
// One server serves every built app under its base path.
const origin = 'http://127.0.0.1:4174';
const others = apps().filter((a) => a !== 'web' && existsSync(new URL(`./${a}`, import.meta.url)));

export default defineConfig({
  testDir: '.',
  outputDir: '../../test-results/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'web', testIgnore: others.map((a) => `${a}/**`), use: { baseURL: `${origin}${basePath('web')}` } },
    ...others.map((a) => ({ name: a, testDir: `./${a}`, use: { baseURL: `${origin}${basePath(a)}` } })),
  ],
  webServer: {
    command: `pnpm build && node tools/serve.mjs 4174 ${appMounts('.').join(' ')}`,
    cwd: '../..',
    url: `${origin}${basePath('web')}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
