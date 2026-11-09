import { defineConfig, devices } from '@playwright/test';

// Runs inside the Playwright Docker image (tools/visual/run.mjs). Serves the static builds.
export default defineConfig({
  testDir: '.',
  outputDir: '../../test-results/visual',
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['json', { outputFile: '../../test-results/visual/results.json' }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide', scale: 'css' } },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:6107',
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'node tools/serve.mjs 6107 /storybook/=storybook-static /agentic-design/=apps/web/dist',
    cwd: '../..',
    url: 'http://127.0.0.1:6107/storybook/index.json',
    reuseExistingServer: false,
  },
});
