import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Price from './Price.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/Price',
  component: Price,
  args: { amount: 4400, period: '4 weeks' },
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};
export const Promo: Story = {
  args: { amount: 2200, was: 4400, lead: 'From' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('From €22, was €44 per 4 weeks')).toBeInTheDocument();
  },
};
export const Cents: Story = { args: { amount: 4750, was: 9500 } };
export const Small: Story = { args: { amount: 2200, was: 4400, size: 'sm' } };
export const Large: Story = { args: { amount: 2200, was: 4400, size: 'lg' } };

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Price, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-wrap items-end gap-8">
          <StateLabel label="regular"><Price :amount="11500" period="4 weeks" /></StateLabel>
          <StateLabel label="promo"><Price :amount="2200" :was="4400" lead="From" period="4 weeks" /></StateLabel>
          <StateLabel label="cents, small"><Price :amount="4750" :was="9500" size="sm" /></StateLabel>
          <StateLabel label="large"><Price :amount="2200" :was="4400" size="lg" /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
