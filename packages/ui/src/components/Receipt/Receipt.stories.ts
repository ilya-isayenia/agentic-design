import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import Receipt from './Receipt.vue';
import ReceiptLine from '../ReceiptLine/ReceiptLine.vue';
import DiscountApplied from '../DiscountApplied/DiscountApplied.vue';
import DiscountCode from '../DiscountCode/DiscountCode.vue';
import TextField from '../TextField/TextField.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const CLUB = { name: 'Fenwick Hollow', address: '12 Example Lane, Brindlemoor' };

const LINES = `
  <ReceiptLine label="Membership fee" :amount="1200" :was="2400" note="Every 4 weeks">Area access: 3 clubs in Brindlemoor, 2 workouts a week.</ReceiptLine>
  <ReceiptLine label="Starter package" :amount="1900" note="First payment" />
  <ReceiptLine label="Towel service" :amount="400" />`;
const TOTAL = `<template #total><ReceiptLine label="Total" :amount="3500" emphasis="total" note="First payment" /></template>`;

// Home club, 2 years, regular, with TEST-10 applied (docs/product/pricing.md).
const DISCOUNT_LINES = `
  <ReceiptLine label="Home club, 2 years" :amount="2200" :was="4400" note="per 4 weeks">Regular membership. Half price for 6 months, then €44.</ReceiptLine>
  <ReceiptLine label="Starter package" :amount="0" :was="2500">Intro session with a coach, member card, water bottle.</ReceiptLine>
  <ReceiptLine label="Discount" :amount="-200">
    <template #below><DiscountApplied code="TEST-10" summary="10% off your first 4 weeks" /></template>
  </ReceiptLine>`;
const DISCOUNT_TOTAL = `<template #total><ReceiptLine label="Total" :amount="2000" :was="6900" emphasis="total" note="First payment" /></template>`;
const DISCOUNT_FOOTER = `
  <template #footer>
    <div class="flex flex-col gap-6">
      <DiscountCode hint="One code at a time. We take it off your first 4 weeks." announcement="TEST-10 applied. Your first payment is now €20." />
      <TextField label="Referral code (optional)" hint="From a current member. We check it after you sign up." autocomplete="off" />
    </div>
  </template>`;

const meta = {
  title: 'Components/Receipt',
  component: Receipt,
  args: {},
} satisfies Meta<typeof Receipt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('complementary', { name: 'Your membership receipt' })).toBeInTheDocument();
    await expect(canvas.getByText('Choose a club and a plan to see your price here.')).toBeInTheDocument();
  },
};

export const ClubOnly: Story = {
  args: { club: CLUB },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Fenwick Hollow')).toBeInTheDocument();
    await expect(canvas.getByText('Choose a plan to see your price.')).toBeInTheDocument();
  },
};

export const Filled: Story = {
  args: { club: CLUB },
  render: (args) => ({
    components: { Receipt, ReceiptLine },
    setup: () => ({ args }),
    template: `<Receipt v-bind="args">${LINES}${TOTAL}</Receipt>`,
  }),
  play: async ({ canvas }) => {
    // Visible total plus its sr-only twin.
    await expect(canvas.getAllByText('€35')).toHaveLength(2);
    await expect(canvas.getByText('€12, was €24')).toBeInTheDocument();
  },
};

export const WithFooter: Story = {
  args: { club: CLUB },
  render: (args) => ({
    components: { Receipt, ReceiptLine },
    setup: () => ({ args }),
    template: `
      <Receipt v-bind="args">${LINES}${TOTAL}
        <template #footer><p class="text-small text-text-muted">Footer slot: the app puts the referral code field here.</p></template>
      </Receipt>`,
  }),
};

export const WithDiscount: Story = {
  args: { club: CLUB },
  render: (args) => ({
    components: { Receipt, ReceiptLine, DiscountApplied, DiscountCode, TextField },
    setup: () => ({ args }),
    template: `<Receipt v-bind="args">${DISCOUNT_LINES}${DISCOUNT_TOTAL}${DISCOUNT_FOOTER}</Receipt>`,
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('\u2212€2')).toBeVisible();
    await expect(canvas.getByText('€20, was €69')).toBeInTheDocument();
    // The code shows once: on the discount line, not in the footer.
    await expect(canvas.getAllByText(/TEST-10 applied/)).toHaveLength(2); // the note, and the sr-only status sentence
    await expect(canvas.getByRole('status')).toHaveTextContent('TEST-10 applied. Your first payment is now €20.');
    // Tab order: Remove on the discount line, then the discount field, then Apply.
    const remove = canvas.getByRole('button', { name: 'Remove code TEST-10' });
    remove.focus();
    await userEvent.tab();
    const input = canvas.getByRole('textbox', { name: 'Discount code (optional)' });
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue('');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Apply' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Referral code (optional)' })).toHaveFocus();
  },
};

export const Matrix: Story = {
  parameters: {
    layout: 'fullscreen',
    // Six copies of the same named aside share this canvas on purpose. landmark-unique is an axe best-practice
    // (not WCAG) rule that only this layout breaks; the single-state stories keep it on.
    a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
  },
  render: () => ({
    components: { Receipt, ReceiptLine, DiscountApplied, DiscountCode, TextField, ThemeMatrix, StateLabel },
    setup: () => ({ club: CLUB }),
    template: `
      <ThemeMatrix :columns="1">
        <div class="grid gap-6 lg:grid-cols-3">
          <StateLabel label="empty"><Receipt /></StateLabel>
          <StateLabel label="club only"><Receipt :club="club" /></StateLabel>
          <StateLabel label="filled"><Receipt :club="club">${LINES}${TOTAL}</Receipt></StateLabel>
          <StateLabel label="with discount"><Receipt :club="club">${DISCOUNT_LINES}${DISCOUNT_TOTAL}${DISCOUNT_FOOTER}</Receipt></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
