import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// axe on every app screen in every theme; Storybook covers components, this covers composition.
const THEMES = ['pulse/dark', 'pulse/light', 'volt/dark', 'volt/light', 'lumen/dark', 'lumen/light'];

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

for (const theme of THEMES) {
  const [brand, mode] = theme.split('/');
  test(`screens pass axe in ${theme}`, async ({ page }) => {
    await page.goto(`?brand=${brand}&mode=${mode}#/`);
    await expect(page.getByRole('heading', { name: /clubs in Demoland/ })).toBeVisible();
    await audit(page);

    await page.getByRole('button', { name: 'Join now at Arden North' }).click();
    await page.getByText('Regular', { exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('Area', { exact: true }).click();
    await audit(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('1 year', { exact: true }).click();
    await audit(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText(/Fix \d+ problems/)).toBeVisible();
    await audit(page);
  });
}
