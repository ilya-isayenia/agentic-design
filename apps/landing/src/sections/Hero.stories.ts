import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Hero from './Hero.vue';
import { HERO } from '../content/hero';
import ThemeMatrix from '../../../../packages/ui/src/storybook/ThemeMatrix.vue';
import StateLabel from '../../../../packages/ui/src/storybook/StateLabel.vue';

const meta = {
  title: 'Landing/Hero',
  component: Hero,
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The placeholder: only the page's `h1`. Nothing in it takes focus. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { level: 1, name: HERO.heading })).toBeVisible();
    await expect(canvasElement.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0);
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Hero, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix :columns="1">
        <StateLabel label="default">
          <Hero />
        </StateLabel>
      </ThemeMatrix>`,
  }),
};
