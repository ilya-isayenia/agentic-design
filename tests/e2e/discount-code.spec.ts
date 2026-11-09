import { expect, test, type Page } from '@playwright/test';

// Discount code in the receipt: acceptance criteria of change 0001 (criterion number in each title).
// The signup is seeded once per tab through sessionStorage, so a reload keeps what the app saved since.

const details = {
  firstName: 'Test', lastName: 'Person', birthDate: '1990-05-01', email: 'test.person@example.com', phoneCountry: '+31',
  phone: '600000000', street: 'Sample Street', houseNumber: '1', postcode: '0000 AA', city: 'Arden', country: 'demoland',
  iban: 'NL13 TEST 0123 4567 89', bic: 'TESTNL2A', bankName: 'Test Bank (fake)', consent: true,
};

async function openDuration(page: Page, extra: object = {}, query = '') {
  const state = {
    clubId: 'arden-north', type: 'regular', workouts: 0, access: 'home', duration: 'two-years', details,
    detailsSubmitted: false, referral: '', discountCode: '', verified: false, ...extra,
  };
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem('e2e-seeded')) return;
    sessionStorage.setItem('e2e-seeded', '1');
    sessionStorage.setItem('banner', 'shown');
    sessionStorage.setItem('signup', JSON.stringify(seed));
  }, state);
  await page.goto(`${query}#/join/arden-north/duration`);
  await expect(page.getByRole('heading', { level: 1, name: '3. Duration' })).toBeVisible();
  return receipt(page);
}

function receipt(page: Page) {
  const aside = page.getByRole('complementary', { name: 'Your membership receipt' });
  return {
    aside,
    field: aside.getByRole('textbox', { name: 'Discount code (optional)' }),
    apply: aside.getByRole('button', { name: 'Apply' }),
    status: aside.getByRole('status'),
    /** The visible message under the field row ("Error: " is a screen-reader prefix). */
    fieldError: aside.locator('p[id$="-error"]'),
    discountLine: aside.getByText('Discount', { exact: true }),
    /** The total line's spoken price, e.g. "€20, was €69". */
    total: (spoken: string) => aside.getByText(spoken, { exact: true }),
  };
}

async function applyCode(r: ReturnType<typeof receipt>, code: string) {
  await r.field.fill(code);
  await r.apply.click();
}

test('the field appears once the plan has a price (AC 1)', async ({ page }) => {
  const r = await openDuration(page, { duration: null });
  await expect(r.aside).toContainText('from, per 4 weeks');
  await expect(r.field).toHaveCount(0);

  await page.getByText('2 years', { exact: true }).click();
  await expect(r.field).toBeVisible();
  await expect(r.apply).toBeVisible();
  // Apply sits on the input's row.
  const [field, apply] = [await r.field.boundingBox(), await r.apply.boundingBox()];
  expect(apply && field && Math.abs(apply.y - field.y)).toBeLessThan(2);
  expect(apply && field && apply.x).toBeGreaterThan((field?.x ?? 0) + (field?.width ?? 0));
});

test('a valid code lowers the total (AC 2, 10)', async ({ page }) => {
  const r = await openDuration(page);
  await expect(r.total('€22, was €69')).toBeAttached();

  await applyCode(r, 'TEST-10');
  await expect(r.discountLine).toBeVisible();
  await expect(r.aside.getByText('€2 off', { exact: true })).toBeAttached();
  await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toBeVisible();
  await expect(r.aside.getByText('10% off your first 4 weeks')).toBeVisible();
  await expect(r.total('€20, was €69')).toBeAttached();
  // The discount line sits above the total.
  const line = await r.discountLine.boundingBox();
  const total = await r.aside.getByText('Total', { exact: true }).boundingBox();
  expect(line && total && line.y).toBeLessThan(total?.y ?? 0);

  // Criterion 10: field emptied and usable, focus kept, announced once, code shown only on the line.
  await expect(r.field).toHaveValue('');
  await expect(r.field).toBeEnabled();
  await expect(r.apply).toBeFocused();
  await expect(r.status).toHaveText('TEST-10 applied. Your first payment is now €20.');
  await expect(r.aside.getByRole('button', { name: 'Remove code TEST-10' })).toBeVisible();
  await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toHaveCount(1);
});

test('an unknown code shows the message (AC 5)', async ({ page }) => {
  const r = await openDuration(page);
  const message = "We don't recognise this code. Check the spelling and try again.";
  await applyCode(r, 'NOPE');
  await expect(r.fieldError).toHaveText(`Error: ${message}`);
  await expect(r.fieldError).toBeVisible();
  await expect(r.field).toHaveAttribute('aria-invalid', 'true');
  await expect(r.field).toHaveAccessibleDescription(new RegExp(`Error: ${message}`));
  await expect(r.field).toHaveValue('NOPE');
  await expect(r.status).toHaveText(message);
  await expect(r.apply).toBeFocused();
  await expect(r.total('€22, was €69')).toBeAttached();
  await expect(r.discountLine).toHaveCount(0);
});

test('a failed check offers a retry (AC 9)', async ({ page }) => {
  const r = await openDuration(page, {}, '?mock=code-error');
  const message = "We couldn't check the code. Check your connection and try again.";
  await applyCode(r, 'TEST-10');
  await expect(r.fieldError).toHaveText(`Error: ${message}`);
  await expect(r.fieldError).toBeVisible();
  await expect(r.field).toHaveValue('TEST-10');
  // Apply again sends the same code: the check runs and fails the same way.
  await r.apply.click();
  await expect(r.apply).toHaveAttribute('aria-busy', 'true');
  await expect(r.status).toHaveText('');
  await expect(r.status).toHaveText(message);
  await expect(r.field).toHaveValue('TEST-10');
  await expect(r.total('€22, was €69')).toBeAttached();
});

test('removing the code restores the total (AC 11)', async ({ page }) => {
  const r = await openDuration(page);
  await applyCode(r, 'TEST-10');
  await expect(r.total('€20, was €69')).toBeAttached();
  await r.field.fill('typed');

  await r.aside.getByRole('button', { name: 'Remove code TEST-10' }).click();
  await expect(r.discountLine).toHaveCount(0);
  await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toHaveCount(0);
  await expect(r.total('€22, was €69')).toBeAttached();
  await expect(r.field).toBeFocused();
  await expect(r.field).toHaveValue('typed');
  await expect(r.status).toHaveText('Code removed. Your first payment is now €22.');
});

test('a new code replaces the applied one (AC 12)', async ({ page }) => {
  const r = await openDuration(page, { duration: 'flex' });
  await applyCode(r, 'TEST-10');
  await expect(r.total('€78.50, was €84.50')).toBeAttached();

  await applyCode(r, 'TEST-FLEX20');
  await expect(r.status).toHaveText('TEST-FLEX20 applied instead of TEST-10. Your first payment is now €72.50.');
  await expect(r.discountLine).toHaveCount(1);
  await expect(r.aside.getByText('TEST-FLEX20 applied', { exact: true })).toBeVisible();
  await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toHaveCount(0);
  await expect(r.aside.getByRole('button', { name: 'Remove code TEST-FLEX20' })).toBeVisible();
  await expect(r.total('€72.50, was €84.50')).toBeAttached();
});

test.describe('a rejected new code keeps the applied one (AC 13)', () => {
  const cases = [
    { code: 'TEST-FLEX20', message: 'TEST-FLEX20 works on Flex plans only. Choose Flex or try another code.' },
    { code: 'TEST-EXPIRED', message: 'This code has expired. Try another code.' },
    { code: 'NOPE', message: "We don't recognise this code. Check the spelling and try again." },
  ];
  for (const { code, message } of cases) {
    test(`${code} keeps TEST-10`, async ({ page }) => {
      const r = await openDuration(page);
      await applyCode(r, 'TEST-10');
      await expect(r.total('€20, was €69')).toBeAttached();
      await applyCode(r, code);
      const kept = `${message} TEST-10 is still in your total.`;
      await expect(r.status).toHaveText(kept);
      await expect(r.fieldError).toHaveText(`Error: ${kept}`);
      await expect(r.fieldError).toBeVisible();
      await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toBeVisible();
      await expect(r.total('€20, was €69')).toBeAttached();
    });
  }

  test('a failed check keeps TEST-10', async ({ page }) => {
    const r = await openDuration(page, { discountCode: 'TEST-10' }, '?mock=code-error');
    await expect(r.total('€20, was €69')).toBeAttached();
    await applyCode(r, 'TEST-FLEX20');
    const kept = "We couldn't check the code. Check your connection and try again. TEST-10 is still in your total.";
    await expect(r.status).toHaveText(kept);
    await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toBeVisible();
    await expect(r.total('€20, was €69')).toBeAttached();
  });
});

test('a plan change drops a code that no longer applies (AC 14)', async ({ page }) => {
  const r = await openDuration(page, { duration: 'flex' });
  await applyCode(r, 'TEST-FLEX20');
  await expect(r.total('€72.50, was €84.50')).toBeAttached();

  await page.getByText('2 years', { exact: true }).click();
  const message = "TEST-FLEX20 works on Flex plans only, so it's no longer in your total. Choose Flex and apply it again.";
  await expect(r.discountLine).toHaveCount(0);
  await expect(r.aside.getByRole('button', { name: /Remove code/ })).toHaveCount(0);
  await expect(r.total('€22, was €69')).toBeAttached();
  await expect(r.field).toHaveValue('TEST-FLEX20');
  await expect(r.fieldError).toHaveText(`Error: ${message}`);
  await expect(r.fieldError).toBeVisible();
  await expect(r.status).toHaveText(message);
  // Not applied again by itself when the user switches back.
  await page.getByText('Flex', { exact: true }).click();
  await expect(r.discountLine).toHaveCount(0);
});

test('the discount reaches the success page (AC 16)', async ({ page }) => {
  const r = await openDuration(page);
  await applyCode(r, 'TEST-10');
  await expect(r.total('€20, was €69')).toBeAttached();

  await page.reload();
  await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toBeVisible();
  await expect(r.total('€20, was €69')).toBeAttached();

  // Skip the details and SMS steps (covered by signup.spec.ts): mark them done in the saved signup.
  await page.evaluate(() => {
    const saved = JSON.parse(sessionStorage.getItem('signup') ?? '{}') as Record<string, unknown>;
    sessionStorage.setItem('signup', JSON.stringify({ ...saved, detailsSubmitted: true, verified: true }));
  });
  await page.reload();
  await page.goto('#/success');
  await expect(page.getByRole('heading', { level: 1, name: /You're in/ })).toBeVisible();
  const firstPayment = page.getByText('First payment').locator('xpath=following-sibling::dd[1]');
  await expect(firstPayment).toHaveText('€20');
});

test('the referral code leaves the discounted total alone (AC 20)', async ({ page }) => {
  const r = await openDuration(page);
  await applyCode(r, 'TEST-10');
  await expect(r.total('€20, was €69')).toBeAttached();
  const referral = r.aside.getByRole('textbox', { name: 'Referral code (optional)' });
  await referral.fill('FRIEND-0000');
  await referral.blur();
  await expect(referral).toHaveValue('FRIEND-0000');
  await expect(r.total('€20, was €69')).toBeAttached();
  await expect(r.aside.getByText('TEST-10 applied', { exact: true })).toBeVisible();
});

test('the field and Apply share a row at 375 px and wrap at 320 px without overflow (AC 19, 21)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const r = await openDuration(page, { discountCode: 'TEST-10' });
  let [field, apply] = [await r.field.boundingBox(), await r.apply.boundingBox()];
  expect(apply && field && Math.abs(apply.y - field.y)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

  await page.setViewportSize({ width: 320, height: 800 });
  [field, apply] = [await r.field.boundingBox(), await r.apply.boundingBox()];
  expect(apply && field && apply.y).toBeGreaterThanOrEqual((field?.y ?? 0) + (field?.height ?? 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
