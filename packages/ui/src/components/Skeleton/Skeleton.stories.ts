import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Skeleton from './Skeleton.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { variant: 'text', lines: 3 },
  argTypes: { variant: { control: 'inline-radio', options: ['text', 'rect', 'circle'] } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const SingleLine: Story = { args: { lines: 1 } };
export const Rect: Story = { args: { variant: 'rect' } };
export const Circle: Story = { args: { variant: 'circle' } };
export const Labelled: Story = {
  args: { label: 'plans' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading plans');
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Skeleton, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-col gap-6">
          <StateLabel label="text, 3 lines"><Skeleton :lines="3" /></StateLabel>
          <StateLabel label="text, 1 line"><Skeleton :lines="1" /></StateLabel>
          <StateLabel label="rect"><Skeleton variant="rect" /></StateLabel>
          <StateLabel label="circle"><Skeleton variant="circle" /></StateLabel>
          <StateLabel label="card (circle + text), labelled">
            <div class="flex items-start gap-4 bg-surface p-4">
              <Skeleton variant="circle" />
              <Skeleton :lines="2" label="club details" />
            </div>
          </StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
