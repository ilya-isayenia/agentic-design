import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent } from 'storybook/test';
import Select from './Select.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const options = [
  { value: 'north', label: 'Testville North' },
  { value: 'centre', label: 'Testville Centre' },
  { value: 'harbour', label: 'Testville Harbour' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Home club', options, placeholder: 'Choose a club' },
  render: (args) => ({
    components: { Select },
    setup: () => ({ args, value: ref(args.modelValue ?? '') }),
    template: '<Select v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Home club' });
    await userEvent.selectOptions(select, 'centre');
    await expect(select).toHaveValue('centre');
  },
};
export const Selected: Story = { args: { modelValue: 'harbour' } };
export const WithHint: Story = {
  args: { hint: 'You can train in every club; this one is on your card.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox')).toHaveAccessibleDescription('You can train in every club; this one is on your card.');
  },
};
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Home club' })).toBeRequired();
  },
};
export const Invalid: Story = {
  args: { required: true, error: 'Choose your home club.' },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox');
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription('Error: Choose your home club.');
  },
};
export const Disabled: Story = {
  args: { modelValue: 'north', disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox')).toBeDisabled();
  },
};
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('combobox', { name: 'Home club' })).toHaveFocus();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Select, ThemeMatrix, StateLabel },
    setup: () => ({ options }),
    template: `
      <ThemeMatrix>
        <div class="grid gap-4 sm:grid-cols-2">
          <StateLabel label="placeholder"><Select label="Home club" :options="options" placeholder="Choose a club" /></StateLabel>
          <StateLabel label="selected"><Select label="Second club" :options="options" model-value="centre" /></StateLabel>
          <StateLabel label="hint, required"><Select label="Preferred club" :options="options" placeholder="Choose a club" required hint="Shown on your card." /></StateLabel>
          <StateLabel label="invalid"><Select label="Trial club" :options="options" placeholder="Choose a club" error="Choose your trial club." /></StateLabel>
          <StateLabel label="disabled"><Select label="Partner club" :options="options" model-value="north" disabled /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
