import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Plans from './Plans.vue';
import { PLANS } from '../content/plans';
import ThemeMatrix from '../../../../packages/ui/src/storybook/ThemeMatrix.vue';
import StateLabel from '../../../../packages/ui/src/storybook/StateLabel.vue';

const meta = {
  title: 'Landing/Plans',
  component: Plans,
} satisfies Meta<typeof Plans>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The placeholder: only `h2#plans`, the target of "See the plans"; script can focus it, Tab skips it. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 2, name: PLANS.heading });
    await expect(heading).toHaveAttribute('id', 'plans');
    await expect(heading).toHaveAttribute('tabindex', '-1');
    heading.focus();
    await expect(heading).toHaveFocus();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Plans, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix :columns="1">
        <StateLabel label="default">
          <Plans />
        </StateLabel>
      </ThemeMatrix>`,
  }),
};
