import { expect, test, type Page } from '@playwright/test';

// App screens in three themes at desktop width and the default theme at 375 px.
// Time is fixed so the promo countdown renders the same every run.
const NOW = new Date('2026-11-20T10:00:00Z');
const THEMES = [
  { brand: 'pulse', mode: 'dark', widths: [1280, 375] },
  { brand: 'volt', mode: 'dark', widths: [1280] },
  { brand: 'lumen', mode: 'light', widths: [1280] },
];

const details = {
  firstName: 'Test', lastName: 'Person', birthDate: '1990-05-01', email: 'test.person@example.com', phoneCountry: '+31',
  phone: '600000000', street: 'Sample Street', houseNumber: '1', postcode: '0000 AA', city: 'Arden', country: 'demoland',
  iban: 'NL13 TEST 0123 4567 89', bic: 'TESTNL2A', bankName: 'Test Bank (fake)', consent: true,
};
const signup = (extra: object) => ({ clubId: 'arden-north', type: 'regular', workouts: 3, access: 'area', duration: 'one-year', details, detailsSubmitted: true, referral: '', discountCode: '', verified: false, ...extra });

const SCREENS: { name: string; path: string; state?: object; ready: (p: Page) => Promise<void> }[] = [
  { name: 'finder', path: '#/', ready: (p) => expect(p.getByRole('heading', { name: /clubs in Demoland/ })).toBeVisible() },
  { name: 'step-1-type', path: '#/join/arden-north/type', state: signup({ type: null, access: null, duration: null, detailsSubmitted: false }), ready: (p) => expect(p.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'step-2-access', path: '#/join/arden-north/access', state: signup({ duration: null }), ready: (p) => expect(p.getByText('3 workouts per week')).toBeVisible() },
  { name: 'step-3-duration', path: '#/join/arden-north/duration', state: signup({}), ready: (p) => expect(p.getByText('First payment')).toBeVisible() },
  { name: 'step-4-details', path: '#/join/arden-north/details', state: signup({ detailsSubmitted: false }), ready: (p) => expect(p.getByLabel('BIC')).toHaveValue('TESTNL2A') },
  { name: 'step-5-verify', path: '#/join/arden-north/verify', state: signup({}), ready: (p) => expect(p.getByText(/We sent a 6-digit code/)).toBeVisible() },
  { name: 'success', path: '#/success', state: signup({ verified: true }), ready: (p) => expect(p.getByRole('heading', { name: /You're in/ })).toBeVisible() },
];

// Discount code in the receipt (change 0001): Home club, 2 years, TEST-10 applied, on every screen that
// shows the receipt or the first payment, in all six themes at both widths.
const discounted = (extra: object) => signup({ access: 'home', duration: 'two-years', discountCode: 'TEST-10', ...extra });
const applied = (p: Page) => expect(p.getByText('TEST-10 applied', { exact: true })).toBeVisible();
const DISCOUNT_SCREENS: typeof SCREENS = [
  { name: 'step-3-duration-discount', path: '#/join/arden-north/duration', state: discounted({}), ready: applied },
  { name: 'step-4-details-discount', path: '#/join/arden-north/details', state: discounted({ detailsSubmitted: false }), ready: applied },
  { name: 'step-5-verify-discount', path: '#/join/arden-north/verify', state: discounted({}), ready: applied },
  {
    name: 'success-discount',
    path: '#/success',
    state: discounted({ verified: true }),
    ready: (p) => expect(p.getByText('First payment').locator('xpath=following-sibling::dd[1]')).toHaveText('€20'),
  },
];
const ALL_THEMES = ['pulse', 'volt', 'lumen'].flatMap((brand) =>
  ['dark', 'light'].map((mode) => ({ brand, mode, widths: [1280, 375], screens: DISCOUNT_SCREENS })),
);

for (const theme of [...THEMES.map((t) => ({ ...t, screens: SCREENS })), ...ALL_THEMES]) {
  for (const width of theme.widths) {
    for (const screen of theme.screens) {
      test(`app ${screen.name} ${theme.brand}-${theme.mode} ${width}`, async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((state) => {
          sessionStorage.setItem('banner', 'shown');
          if (state) sessionStorage.setItem('signup', JSON.stringify(state));
        }, screen.state ?? null);
        await page.goto(`/agentic-design/?brand=${theme.brand}&mode=${theme.mode}${screen.path}`);
        await screen.ready(page);
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`app-${screen.name}--${theme.brand}-${theme.mode}--${width}.png`, { fullPage: true });
      });
    }
  }
}

// Applying a code at 375 px (change 0001, r2 #9): Apply keeps its width and stays on the field's row in the
// ~291 px receipt column while the check runs. The page clock is paused and only moved by hand, so the check
// (3 s with ?mock=slow) never answers and the shot holds the applying state.
test('app step-3-duration-applying pulse-dark 375', async ({ page }) => {
  await page.clock.install({ time: NOW });
  await page.clock.pauseAt(new Date(NOW.getTime() + 1000));
  await page.setViewportSize({ width: 375, height: 900 });
  await page.addInitScript((state) => {
    sessionStorage.setItem('banner', 'shown');
    sessionStorage.setItem('signup', JSON.stringify(state));
  }, signup({ access: 'home', duration: 'two-years' }));
  await page.goto('/agentic-design/?brand=pulse&mode=dark&mock=slow#/join/arden-north/duration');
  await page.clock.runFor(1000);
  await expect(page.getByText('First payment')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const field = page.getByRole('textbox', { name: 'Discount code (optional)' });
  const apply = page.getByRole('button', { name: 'Apply' });
  await field.fill('TEST-10');
  await apply.scrollIntoViewIfNeeded();
  const idle = await apply.boundingBox();
  await apply.click();
  await expect(apply).toHaveAttribute('aria-busy', 'true');
  const busy = await apply.boundingBox();
  const input = await field.boundingBox();
  if (!idle || !busy || !input) throw new Error('the field and Apply are rendered');
  // Same place and size as before the press, and on the input's row.
  expect(busy).toEqual(idle);
  expect(Math.abs(busy.y - input.y)).toBeLessThanOrEqual(1);
  await expect(page).toHaveScreenshot('app-step-3-duration-applying--pulse-dark--375.png', { fullPage: true });
});
