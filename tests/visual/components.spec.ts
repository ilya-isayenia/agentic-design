import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// One screenshot per component Matrix story: every state in all six themes.
const index = JSON.parse(readFileSync(new URL('../../storybook-static/index.json', import.meta.url), 'utf8')) as {
  entries: Record<string, { id: string; type: string; title: string }>;
};
const matrices = Object.values(index.entries).filter(
  (e) => e.type === 'story' && e.id.endsWith('--matrix') && !e.title.startsWith('Explorations/'),
);

for (const story of matrices) {
  test(`matrix ${story.id}`, async ({ page }) => {
    await page.goto(`/storybook/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator('#storybook-root > *').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
  });
}
