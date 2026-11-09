import { expect, test, type Page } from '@playwright/test';

async function pickClub(page: Page) {
  await page.goto('#/');
  await page.getByRole('button', { name: 'Join now at Arden North' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '1. Membership type' })).toBeVisible();
}

async function fillDetails(page: Page) {
  await page.getByLabel('First name').fill('Test');
  await page.getByLabel('Last name').fill('Person');
  await page.getByLabel('Date of birth').fill('1990-05-01');
  await page.getByLabel('Email').fill('test.person@example.com');
  await page.getByLabel('Mobile number').fill('600000000');
  await page.getByLabel('Street').fill('Sample Street');
  await page.getByLabel('House number').fill('1');
  await page.getByLabel('Postcode').fill('0000 AA');
  await page.getByLabel('Town or city').fill('Arden');
  await page.locator('#field-country').selectOption('demoland');
  await page.getByLabel('IBAN').fill('NL13TEST0123456789');
  await page.getByLabel('IBAN').blur();
  await page.getByRole('checkbox').check();
}

test('a member signs up from club to success', async ({ page }) => {
  await pickClub(page);
  await page.getByText('Regular', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { level: 1, name: '2. Access level' })).toBeFocused();
  await page.getByRole('button', { name: 'More workouts' }).click();
  await expect(page.getByText('1 workout per week')).toBeVisible();
  await page.getByText('Home club', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { level: 1, name: '3. Duration' })).toBeFocused();
  await page.getByText('2 years', { exact: true }).click();
  const receipt = page.getByRole('complementary');
  await expect(receipt).toContainText('Arden North');
  await expect(receipt).toContainText('€22');
  await page.getByRole('button', { name: 'Continue' }).click();

  await fillDetails(page);
  await expect(page.getByLabel('BIC')).toHaveValue('TESTNL2A');
  await expect(page.getByLabel('Bank name')).toHaveValue('Test Bank (fake)');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { level: 1, name: '5. Verify your phone' })).toBeFocused();
  await page.getByLabel('Code from the SMS').fill('000000');
  await page.getByRole('button', { name: 'Verify and join' }).click();
  await expect(page.getByText('That code is not right')).toBeVisible();
  await page.getByLabel('Code from the SMS').fill('123456');
  await page.getByRole('button', { name: 'Verify and join' }).click();

  await expect(page.getByRole('heading', { level: 1, name: /You're in, Test/ })).toBeVisible();
  await expect(page.getByText('First payment')).toBeVisible();
});

test('the details step lists every error and links to the field', async ({ page }) => {
  await pickClub(page);
  await page.getByText('Student', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('City', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('Flex', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('button', { name: 'Continue' }).click();
  const summary = page.getByRole('alert').filter({ hasText: 'Fix 14 problems to continue' });
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: /IBAN/ }).click();
  await expect(page.getByLabel('IBAN')).toBeFocused();
  await page.getByLabel('IBAN').fill('NL00TEST0123456789');
  await page.getByLabel('IBAN').blur();
  await expect(page.getByText('This IBAN is not valid')).toBeVisible();
});

test('done steps can be revisited from the step indicator', async ({ page }) => {
  await pickClub(page);
  await page.getByText('Corporate', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Membership type, completed' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '1. Membership type' })).toBeFocused();
  await expect(page.getByRole('radio', { name: 'Corporate' })).toBeChecked();
});

test('a step that is not reached yet redirects to the first open step', async ({ page }) => {
  await page.goto('#/join/arden-north/details');
  await expect(page.getByRole('heading', { level: 1, name: '1. Membership type' })).toBeVisible();
});

test.describe('club finder', () => {
  test('no results offers to show all clubs', async ({ page }) => {
    await page.goto('#/');
    await page.getByLabel('Postcode or town').fill('zzz');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('heading', { name: 'No clubs match “zzz”' })).toBeVisible();
    await page.getByRole('button', { name: 'Show all clubs' }).click();
    await expect(page.getByRole('heading', { name: '11 clubs in Demoland' })).toBeVisible();
  });

  test('a town on the map filters the list', async ({ page }) => {
    await page.goto('#/');
    await page.getByRole('button', { name: /clubs in Belmar/ }).click();
    await expect(page.getByRole('heading', { name: '3 clubs in Belmar' })).toBeVisible();
  });

  test('a failing service shows an error with retry', async ({ page }) => {
    await page.goto('?mock=error#/');
    await expect(page.getByRole('heading', { name: "We couldn't load the clubs" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
