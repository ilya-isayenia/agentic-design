import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent } from 'storybook/test';
import Checkbox from './Checkbox.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {},
  render: (args) => ({
    components: { Checkbox },
    setup: () => ({ args, value: ref(args.modelValue ?? false) }),
    template: '<Checkbox v-bind="args" v-model="value">Send me club news and offers</Checkbox>',
  }),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox', { name: 'Send me club news and offers' });
    await userEvent.click(canvas.getByText('Send me club news and offers'));
    await expect(box).toBeChecked();
  },
};
export const Checked: Story = { args: { modelValue: true } };
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox')).toBeRequired();
  },
};
export const WithLink: Story = {
  args: { required: true },
  render: (args) => ({
    components: { Checkbox },
    setup: () => ({ args, value: ref(false) }),
    template:
      '<Checkbox v-bind="args" v-model="value">I accept the <a href="#terms" class="underline">membership terms</a></Checkbox>',
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'membership terms' })).toBeVisible();
  },
};
export const Invalid: Story = {
  args: { required: true, error: 'Accept the membership terms to continue.' },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox');
    await expect(box).toHaveAttribute('aria-invalid', 'true');
    await expect(box).toHaveAccessibleDescription('Error: Accept the membership terms to continue.');
  },
};
export const Disabled: Story = {
  args: { disabled: true, modelValue: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox')).toBeDisabled();
  },
};
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    const box = canvas.getByRole('checkbox');
    await expect(box).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(box).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Checkbox, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-col gap-4">
          <StateLabel label="unchecked"><Checkbox>Send me club news</Checkbox></StateLabel>
          <StateLabel label="checked"><Checkbox :model-value="true">Remind me before my first visit</Checkbox></StateLabel>
          <StateLabel label="required, link"><Checkbox required>I accept the <a href="#terms" class="underline">membership terms</a></Checkbox></StateLabel>
          <StateLabel label="invalid"><Checkbox required error="Accept the privacy notice to continue.">I have read the privacy notice</Checkbox></StateLabel>
          <StateLabel label="disabled"><Checkbox disabled :model-value="true">Direct debit mandate</Checkbox></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
