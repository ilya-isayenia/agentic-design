import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import DiscountApplied from './DiscountApplied.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/DiscountApplied',
  component: DiscountApplied,
  args: { code: 'TEST-10', summary: '10% off your first 4 weeks', onRemove: fn() },
  render: (args) => ({
    components: { DiscountApplied },
    setup: () => ({ args }),
    template: '<div class="max-w-receipt"><DiscountApplied v-bind="args" /></div>',
  }),
} satisfies Meta<typeof DiscountApplied>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('TEST-10 applied')).toBeVisible();
    await expect(canvas.getByText('10% off your first 4 weeks')).toBeVisible();
    const remove = canvas.getByRole('button', { name: 'Remove code TEST-10' });
    await expect(remove).toHaveTextContent('Remove');
    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledOnce();
    // Keyboard: Tab reaches Remove, Enter and Space activate it.
    remove.blur();
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(' ');
    await expect(args.onRemove).toHaveBeenCalledTimes(3);
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { DiscountApplied, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex max-w-receipt flex-col gap-4">
          <StateLabel label="applied, all plans"><DiscountApplied code="TEST-10" summary="10% off your first 4 weeks" /></StateLabel>
          <StateLabel label="applied, plan-limited code"><DiscountApplied code="TEST-FLEX20" summary="20% off your first 4 weeks on Flex" /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
