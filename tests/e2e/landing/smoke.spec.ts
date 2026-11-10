import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// The landing frame: landmarks, headings, skip link, footer links, theme rule. Playwright emulates
// colorScheme 'light' by default, so every scenario that is not about the preference pins the theme.
const DARK = './?brand=pulse&mode=dark';

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test('frame renders', async ({ page }) => {
  await page.goto(DARK);
  await expect(page.getByRole('main')).toBeVisible();
  const banner = page.getByRole('banner');
  await expect(banner).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Train close to home or anywhere');
  const plans = page.getByRole('heading', { level: 2, name: 'Choose where you train' });
  await expect(plans).toHaveAttribute('id', 'plans');
  await expect(plans).toHaveAttribute('tabindex', '-1');

  await expect(banner).toContainText('Pulse');
  await expect(banner.getByRole('heading')).toHaveCount(0);
  await expect(banner.getByRole('link')).toHaveCount(0);
});

test('title and description', async ({ page }) => {
  await page.goto(DARK);
  await expect(page).toHaveTitle('Pulse gyms — train close to home or anywhere (demo)');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Demo landing page for an invented gym chain: access levels and prices from the signup demo. All data is invented.',
  );
});

test('skip link moves focus to main', async ({ page }) => {
  await page.goto(DARK);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (box && viewport) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }

  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Membership terms' })).toBeFocused();
});

test('focused skip link does not cover the wordmark at 375 and 1280 px', async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(DARK);
    await page.keyboard.press('Tab');
    const skip = await page.getByRole('link', { name: 'Skip to content' }).boundingBox();
    const wordmark = await page.getByRole('banner').getByText('Pulse').boundingBox();
    expect(skip).not.toBeNull();
    expect(wordmark).not.toBeNull();
    if (skip && wordmark) expect(skip.y + skip.height, `at ${width} px`).toBeLessThanOrEqual(wordmark.y);
  }
});

test('frame tab order', async ({ page }) => {
  await page.goto(DARK);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Membership terms' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Privacy notice' })).toBeFocused();
});

test("legal links open the signup app's placeholders", async ({ page }) => {
  await page.goto(DARK);
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText('Demo site with invented clubs and prices. Nothing is charged, sent or stored.');
  const terms = footer.getByRole('link', { name: 'Membership terms' });
  await expect(terms).toHaveAttribute('href', '../#/legal/terms');
  await expect(footer.getByRole('link', { name: 'Privacy notice' })).toHaveAttribute('href', '../#/legal/privacy');

  await terms.click();
  await expect(page).toHaveURL(/\/agentic-design\/#\/legal\/terms$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Membership terms' })).toBeVisible();
});

for (const mode of ['dark', 'light'] as const) {
  test(`axe in pulse/${mode}`, async ({ page }) => {
    for (const width of [1280, 375]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`./?brand=pulse&mode=${mode}`);
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await audit(page);
    }
  });
}

test('theme follows the system unless the query sets it', async ({ page }) => {
  const html = page.locator('html');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await expect(html).toHaveAttribute('data-brand', 'pulse');
  await expect(html).toHaveAttribute('data-mode', 'dark');

  // A live change of the preference switches the page while no ?mode= is set.
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(html).toHaveAttribute('data-mode', 'light');

  await page.goto('./');
  await expect(html).toHaveAttribute('data-mode', 'light');

  await page.goto('./?mode=dark');
  await expect(html).toHaveAttribute('data-mode', 'dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(html).toHaveAttribute('data-mode', 'dark');

  await page.goto('./?brand=nope&mode=nope');
  await expect(html).toHaveAttribute('data-mode', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./?brand=nope&mode=nope');
  await expect(html).toHaveAttribute('data-brand', 'pulse');
  await expect(html).toHaveAttribute('data-mode', 'dark');
});

test('nothing is stored', async ({ page }) => {
  await page.goto(DARK);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const lengths = await page.evaluate(() => [localStorage.length, sessionStorage.length]);
  expect(lengths).toEqual([0, 0]);
});

test('no sideways scroll at 320 and 375 px', async ({ page }) => {
  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(DARK);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width);
  }
});
