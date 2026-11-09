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

// The receipt line is 236 px wide at 320 px; Remove wraps below about 155 px, which happens there with
// text enlarged to 200 %. A third of the receipt column (128 px) stands in for that.
export const Narrow: Story = {
  render: (args) => ({
    components: { DiscountApplied },
    setup: () => ({ args }),
    template: '<div class="max-w-receipt"><div class="w-1/3"><DiscountApplied v-bind="args" /></div></div>',
  }),
  play: async ({ canvas, args }) => {
    const note = canvas.getByText('TEST-10 applied').closest('p');
    const remove = canvas.getByRole('button', { name: 'Remove code TEST-10' });
    const row = remove.parentElement;
    if (!note || !row) throw new Error('DiscountApplied renders a note paragraph and a row around Remove');
    await expect(note).toBeVisible();
    // Remove sits under the note, not beside it, and nothing overflows the line.
    await expect(remove.getBoundingClientRect().top).toBeGreaterThanOrEqual(note.getBoundingClientRect().bottom - 1);
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    // Keyboard: Tab reaches Remove, Enter activates it, focus stays on it.
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledOnce();
    await expect(remove).toHaveFocus();
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
          <StateLabel label="narrow: Remove wraps under the note"><div class="w-1/3"><DiscountApplied code="TEST-10" summary="10% off your first 4 weeks" /></div></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
