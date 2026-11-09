import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import IconButton from './IconButton.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: 'close', label: 'Dismiss offer', variant: 'ghost', size: 'md', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss offer' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const Primary: Story = { args: { variant: 'primary', icon: 'arrow-right', label: 'Next step' } };
export const Secondary: Story = { args: { variant: 'secondary', icon: 'chevron-right', label: 'Next month' } };
export const Small: Story = { args: { size: 'sm' } };
export const Keyboard: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Dismiss offer' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
export const Pressed: Story = {
  args: { variant: 'secondary', icon: 'check', label: 'Add to favourites', pressed: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Add to favourites' })).toHaveAttribute('aria-pressed', 'true');
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { IconButton, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-wrap items-end gap-4">
          <StateLabel label="ghost"><IconButton icon="close" label="Dismiss offer" /></StateLabel>
          <StateLabel label="secondary"><IconButton variant="secondary" icon="chevron-right" label="Next month" /></StateLabel>
          <StateLabel label="primary"><IconButton variant="primary" icon="arrow-right" label="Next step" /></StateLabel>
          <StateLabel label="small"><IconButton size="sm" icon="close" label="Close notification" /></StateLabel>
          <StateLabel label="pressed"><IconButton variant="secondary" icon="check" label="Add to favourites" :pressed="true" /></StateLabel>
          <StateLabel label="not pressed"><IconButton variant="secondary" icon="check" label="Add to favourites" :pressed="false" /></StateLabel>
          <StateLabel label="disabled"><IconButton variant="secondary" icon="plus" label="Add a guest" disabled /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
