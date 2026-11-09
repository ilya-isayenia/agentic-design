import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  outputDir: '../../test-results/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4174/agentic-design/',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'pnpm build && node tools/serve.mjs 4174 /agentic-design/=apps/web/dist',
    cwd: '../..',
    url: 'http://127.0.0.1:4174/agentic-design/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
