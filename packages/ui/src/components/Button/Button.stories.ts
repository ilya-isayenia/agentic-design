import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import Button from './Button.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { variant: 'primary', size: 'md', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Join now</Button>',
  }),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Join now' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const WithIcon: Story = { args: { iconEnd: 'arrow-right' } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Join now' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Button, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-wrap items-end gap-4">
          <StateLabel label="primary"><Button icon-end="arrow-right">Join now</Button></StateLabel>
          <StateLabel label="secondary"><Button variant="secondary" icon-end="arrow-right">More info</Button></StateLabel>
          <StateLabel label="ghost"><Button variant="ghost">Skip</Button></StateLabel>
          <StateLabel label="small"><Button size="sm">Apply</Button></StateLabel>
          <StateLabel label="loading"><Button loading>Sending</Button></StateLabel>
          <StateLabel label="disabled"><Button disabled>Continue</Button></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
