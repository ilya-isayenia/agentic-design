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
const signup = (extra: object) => ({ clubId: 'arden-north', type: 'regular', workouts: 3, access: 'area', duration: 'one-year', details, detailsSubmitted: true, referral: '', verified: false, ...extra });

const SCREENS: { name: string; path: string; state?: object; ready: (p: Page) => Promise<void> }[] = [
  { name: 'finder', path: '#/', ready: (p) => expect(p.getByRole('heading', { name: /clubs in Demoland/ })).toBeVisible() },
  { name: 'step-1-type', path: '#/join/arden-north/type', state: signup({ type: null, access: null, duration: null, detailsSubmitted: false }), ready: (p) => expect(p.getByRole('heading', { level: 1 })).toBeVisible() },
  { name: 'step-2-access', path: '#/join/arden-north/access', state: signup({ duration: null }), ready: (p) => expect(p.getByText('3 workouts per week')).toBeVisible() },
  { name: 'step-3-duration', path: '#/join/arden-north/duration', state: signup({}), ready: (p) => expect(p.getByText('First payment')).toBeVisible() },
  { name: 'step-4-details', path: '#/join/arden-north/details', state: signup({ detailsSubmitted: false }), ready: (p) => expect(p.getByLabel('BIC')).toHaveValue('TESTNL2A') },
  { name: 'step-5-verify', path: '#/join/arden-north/verify', state: signup({}), ready: (p) => expect(p.getByText(/We sent a 6-digit code/)).toBeVisible() },
  { name: 'success', path: '#/success', state: signup({ verified: true }), ready: (p) => expect(p.getByRole('heading', { name: /You're in/ })).toBeVisible() },
];

for (const theme of THEMES) {
  for (const width of theme.widths) {
    for (const screen of SCREENS) {
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
