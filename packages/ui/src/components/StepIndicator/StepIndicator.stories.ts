import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import StepIndicator from './StepIndicator.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const STEPS = ['Membership', 'Access', 'Duration', 'Your details', 'Verify'];

const meta = {
  title: 'Components/StepIndicator',
  component: StepIndicator,
  args: { steps: STEPS, current: 2, onGo: fn() },
  argTypes: { current: { control: { type: 'number', min: 0, max: 4 } } },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = {
  args: { current: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    const list = within(canvas.getByRole('list'));
    await expect(list.getByText('Membership').closest('[aria-current]')).toHaveAttribute('aria-current', 'step');
  },
};

export const Middle: Story = {
  play: async ({ canvas, args }) => {
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Access, completed' }));
    await expect(args.onGo).toHaveBeenCalledWith(1);
    // Upcoming steps are text, not controls.
    await userEvent.click(within(canvas.getByRole('list')).getByText('Your details'));
    await expect(args.onGo).toHaveBeenCalledOnce();
  },
};

export const Keyboard: Story = {
  args: { current: 3 },
  play: async ({ canvas, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Membership, completed' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Duration, completed' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onGo).toHaveBeenCalledWith(2);
  },
};

// The user went back to step 2; steps 3 and 4 stay finished and reachable.
export const WentBack: Story = {
  args: { current: 1, completed: [0, 2, 3] },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(3);
  },
};

export const Last: Story = { args: { current: 4 } };

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { StepIndicator, ThemeMatrix, StateLabel },
    setup: () => ({ steps: STEPS }),
    // Six copies share a page here, so each nav gets its own name (axe landmark-unique).
    template: `
      <ThemeMatrix v-slot="{ brand, mode }">
        <StateLabel label="first step"><StepIndicator :steps="steps" :current="0" :label="'First step, ' + brand + ' ' + mode" /></StateLabel>
        <StateLabel label="middle"><StepIndicator :steps="steps" :current="2" :label="'Middle, ' + brand + ' ' + mode" /></StateLabel>
        <StateLabel label="went back"><StepIndicator :steps="steps" :current="1" :completed="[0, 2, 3]" :label="'Went back, ' + brand + ' ' + mode" /></StateLabel>
        <StateLabel label="last step"><StepIndicator :steps="steps" :current="4" :label="'Last step, ' + brand + ' ' + mode" /></StateLabel>
      </ThemeMatrix>`,
  }),
};
