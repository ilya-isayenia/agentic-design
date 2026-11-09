import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent } from 'storybook/test';
import Stepper from './Stepper.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const perWeek = (n: number) => `${n} ${n === 1 ? 'workout' : 'workouts'} per week`;

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  args: { label: 'Workouts per week', min: 1, max: 7, modelValue: 3, format: perWeek },
  render: (args) => ({
    components: { Stepper },
    setup: () => ({ args, value: ref(args.modelValue ?? 0) }),
    template: '<Stepper v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Workouts per week' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Increase' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('4 workouts per week');
    await userEvent.click(canvas.getByRole('button', { name: 'Decrease' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('3 workouts per week');
  },
};
export const AtMin: Story = {
  args: { modelValue: 1 },
  play: async ({ canvas }) => {
    const decrease = canvas.getByRole('button', { name: 'Decrease' });
    await expect(decrease).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(decrease);
    await expect(canvas.getByRole('status')).toHaveTextContent('1 workout per week');
  },
};
export const AtMax: Story = {
  args: { modelValue: 7 },
  play: async ({ canvas }) => {
    const increase = canvas.getByRole('button', { name: 'Increase' });
    await expect(increase).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(increase);
    await expect(canvas.getByRole('status')).toHaveTextContent('7 workouts per week');
  },
};
export const PlainNumber: Story = { args: { label: 'Guest passes', min: 0, max: 4, modelValue: 0, format: undefined } };
export const Keyboard: Story = {
  args: { modelValue: 6 },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.tab();
    const increase = canvas.getByRole('button', { name: 'Increase' });
    await expect(increase).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('7 workouts per week');
    // At the limit the button keeps focus (aria-disabled, not disabled).
    await expect(increase).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(canvas.getByRole('status')).toHaveTextContent('5 workouts per week');
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('status')).toHaveTextContent('6 workouts per week');
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Stepper, ThemeMatrix, StateLabel },
    setup: () => ({ perWeek }),
    template: `
      <ThemeMatrix>
        <div class="flex flex-wrap gap-8">
          <StateLabel label="in range"><Stepper label="Workouts per week" :min="1" :max="7" :model-value="3" :format="perWeek" /></StateLabel>
          <StateLabel label="at min"><Stepper label="Visits per week" :min="1" :max="7" :model-value="1" :format="perWeek" /></StateLabel>
          <StateLabel label="at max"><Stepper label="Sessions per week" :min="1" :max="7" :model-value="7" :format="perWeek" /></StateLabel>
          <StateLabel label="plain number"><Stepper label="Guest passes" :max="4" :model-value="0" /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
