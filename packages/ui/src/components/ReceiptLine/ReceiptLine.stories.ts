import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import ReceiptLine from './ReceiptLine.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/ReceiptLine',
  component: ReceiptLine,
  args: { label: 'Membership fee', amount: 2400, emphasis: 'default' },
  argTypes: { emphasis: { control: 'inline-radio', options: ['default', 'total'] } },
  decorators: [() => ({ template: '<div class="max-w-receipt"><story /></div>' })],
} satisfies Meta<typeof ReceiptLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};
export const Promo: Story = {
  args: { amount: 1200, was: 2400 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('€12, was €24')).toBeInTheDocument();
  },
};
export const WithNote: Story = { args: { label: 'Starter package', amount: 1950, note: 'First payment' } };
export const Total: Story = { args: { label: 'Total', amount: 4350, emphasis: 'total', note: 'Every 4 weeks' } };

export const WithDetails: Story = {
  render: (args) => ({
    components: { ReceiptLine },
    setup: () => ({ args }),
    template: '<ReceiptLine v-bind="args">2 workouts a week, 4 weeks, any time of day.</ReceiptLine>',
  }),
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Membership fee' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText(/2 workouts a week/)).not.toBeVisible();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/2 workouts a week/)).toBeVisible();
    // Keyboard: Enter closes it again.
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  },
};
export const Expanded: Story = {
  ...WithDetails,
  args: { defaultOpen: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Membership fee' })).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { ReceiptLine, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex max-w-receipt flex-col gap-2">
          <StateLabel label="regular"><ReceiptLine label="Membership fee" :amount="2400" /></StateLabel>
          <StateLabel label="promo"><ReceiptLine label="Membership fee" :amount="1200" :was="2400" /></StateLabel>
          <StateLabel label="note"><ReceiptLine label="Starter package" :amount="1950" note="First payment" /></StateLabel>
          <StateLabel label="collapsed"><ReceiptLine label="Access level" :amount="600">Area access: 3 clubs in Brindlemoor.</ReceiptLine></StateLabel>
          <StateLabel label="expanded"><ReceiptLine label="Access level" :amount="600" default-open>Area access: 3 clubs in Brindlemoor.</ReceiptLine></StateLabel>
          <StateLabel label="total"><ReceiptLine label="Total" :amount="4350" emphasis="total" note="Every 4 weeks" /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
