import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import Radio from './Radio.vue';
import RadioGroup from '../RadioGroup/RadioGroup.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

// A Radio only works inside a RadioGroup; every story wraps it in one.
const meta = {
  title: 'Components/Radio',
  component: Radio,
  args: { value: 'yes', label: 'Yes, add a towel service' },
  render: (args) => ({
    components: { Radio, RadioGroup },
    setup: () => ({ args }),
    template: '<RadioGroup legend="Towel service"><Radio v-bind="args" /><Radio value="no" label="No, thanks" /></RadioGroup>',
  }),
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const radio = canvas.getByRole('radio', { name: 'Yes, add a towel service' });
    await userEvent.click(radio);
    await expect(radio).toBeChecked();
  },
};
export const Checked: Story = {
  render: (args) => ({
    components: { Radio, RadioGroup },
    setup: () => ({ args }),
    template: '<RadioGroup legend="Towel service" model-value="yes"><Radio v-bind="args" /><Radio value="no" label="No, thanks" /></RadioGroup>',
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Yes, add a towel service' })).toBeChecked();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Yes, add a towel service' })).toBeDisabled();
    await expect(canvas.getByRole('radio', { name: 'No, thanks' })).toBeEnabled();
  },
};
export const SlotLabel: Story = {
  render: () => ({
    components: { Radio, RadioGroup },
    template:
      '<RadioGroup legend="Towel service"><Radio value="yes">Yes, <strong>towel service</strong> for €0 in the trial</Radio><Radio value="no" label="No, thanks" /></RadioGroup>',
  }),
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Radio, RadioGroup, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <RadioGroup legend="Radio states" model-value="checked">
          <StateLabel label="unchecked"><Radio value="unchecked" label="Unchecked option" /></StateLabel>
          <StateLabel label="checked"><Radio value="checked" label="Checked option" /></StateLabel>
          <StateLabel label="disabled"><Radio value="disabled" label="Unavailable option" disabled /></StateLabel>
          <StateLabel label="long label"><Radio value="long" label="An option with a long label that wraps onto a second line on narrow screens so the dot stays aligned" /></StateLabel>
        </RadioGroup>
      </ThemeMatrix>`,
  }),
};
