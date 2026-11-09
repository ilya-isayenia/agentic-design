import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent } from 'storybook/test';
import RadioGroup from './RadioGroup.vue';
import Radio from '../Radio/Radio.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: { legend: 'How did you hear about us?' },
  render: (args) => ({
    components: { RadioGroup, Radio },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: `
      <RadioGroup v-bind="args" v-model="value">
        <Radio value="friend" label="A friend" />
        <Radio value="online" label="Online" />
        <Radio value="street" label="Walked past a club" />
      </RadioGroup>`,
  }),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoneSelected: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'How did you hear about us?' })).toBeVisible();
    await userEvent.click(canvas.getByText('Online'));
    await expect(canvas.getByRole('radio', { name: 'Online' })).toBeChecked();
  },
};
export const Selected: Story = { args: { modelValue: 'friend' } };
export const WithHint: Story = { args: { hint: 'Helps us plan our posters, nothing else.' } };
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeRequired();
  },
};
export const Invalid: Story = {
  args: { required: true, error: 'Choose one answer.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group')).toHaveAccessibleDescription('Error: Choose one answer.');
    await expect(canvas.getByRole('radio', { name: 'A friend' })).toHaveAttribute('aria-invalid', 'true');
  },
};
export const Disabled: Story = {
  args: { disabled: true, modelValue: 'online' },
  play: async ({ canvas }) => {
    for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeDisabled();
  },
};
export const HiddenLegend: Story = {
  args: { hideLegend: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'How did you hear about us?' })).toBeInTheDocument();
  },
};
export const Keyboard: Story = {
  args: { modelValue: 'friend' },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'A friend' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const online = canvas.getByRole('radio', { name: 'Online' });
    await expect(online).toHaveFocus();
    await expect(online).toBeChecked();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { RadioGroup, Radio, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="grid gap-6 sm:grid-cols-2">
          <StateLabel label="none selected">
            <RadioGroup legend="Preferred time">
              <Radio value="am" label="Mornings" /><Radio value="pm" label="Evenings" />
            </RadioGroup>
          </StateLabel>
          <StateLabel label="selected, hint">
            <RadioGroup legend="Training goal" model-value="strength" hint="We use it to suggest classes.">
              <Radio value="strength" label="Strength" /><Radio value="cardio" label="Cardio" />
            </RadioGroup>
          </StateLabel>
          <StateLabel label="invalid">
            <RadioGroup legend="Contact by" required error="Choose how we contact you.">
              <Radio value="email" label="Email" /><Radio value="phone" label="Phone" />
            </RadioGroup>
          </StateLabel>
          <StateLabel label="disabled">
            <RadioGroup legend="Locker" model-value="none" disabled>
              <Radio value="none" label="No locker" /><Radio value="rent" label="Rent a locker" />
            </RadioGroup>
          </StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
