import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Receipt from './Receipt.vue';
import ReceiptLine from '../ReceiptLine/ReceiptLine.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const CLUB = { name: 'Fenwick Hollow', address: '12 Example Lane, Brindlemoor' };

const LINES = `
  <ReceiptLine label="Membership fee" :amount="1200" :was="2400" note="Every 4 weeks">Area access: 3 clubs in Brindlemoor, 2 workouts a week.</ReceiptLine>
  <ReceiptLine label="Starter package" :amount="1900" note="First payment" />
  <ReceiptLine label="Towel service" :amount="400" />`;
const TOTAL = `<template #total><ReceiptLine label="Total" :amount="3500" emphasis="total" note="First payment" /></template>`;

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

export const Matrix: Story = {
  parameters: {
    layout: 'fullscreen',
    // Six copies of the same named aside share this canvas on purpose. landmark-unique is an axe best-practice
    // (not WCAG) rule that only this layout breaks; the single-state stories keep it on.
    a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
  },
  render: () => ({
    components: { Receipt, ReceiptLine, ThemeMatrix, StateLabel },
    setup: () => ({ club: CLUB }),
    template: `
      <ThemeMatrix :columns="1">
        <div class="grid gap-6 lg:grid-cols-3">
          <StateLabel label="empty"><Receipt /></StateLabel>
          <StateLabel label="club only"><Receipt :club="club" /></StateLabel>
          <StateLabel label="filled"><Receipt :club="club">${LINES}${TOTAL}</Receipt></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
