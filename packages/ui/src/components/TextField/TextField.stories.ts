import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, fn, userEvent } from 'storybook/test';
import TextField from './TextField.vue';
import Button from '../Button/Button.vue';
import Icon from '../Icon/Icon.vue';
import Spinner from '../Icon/Spinner.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: { label: 'First name', autocomplete: 'given-name' },
  render: (args) => ({
    components: { TextField },
    setup: () => ({ args, value: ref(args.modelValue ?? '') }),
    template: '<TextField v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'First name' });
    await userEvent.type(input, 'Testy');
    await expect(input).toHaveValue('Testy');
  },
};
export const Filled: Story = { args: { modelValue: 'Testy' } };
export const WithHint: Story = {
  args: { label: 'Email', type: 'email', autocomplete: 'email', hint: 'We send the contract here.' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toHaveAccessibleDescription('We send the contract here.');
  },
};
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'First name' })).toBeRequired();
  },
};
export const Invalid: Story = {
  args: {
    label: 'IBAN',
    autocomplete: 'off',
    modelValue: 'NL00TEST01',
    hint: 'Starts with two letters, e.g. NL00TEST0123456789.',
    error: 'Enter the full IBAN, 18 characters for this country.',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'IBAN' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Starts with two letters, e.g. NL00TEST0123456789. Error: Enter the full IBAN, 18 characters for this country.',
    );
  },
};
export const Disabled: Story = {
  args: { modelValue: 'Testy', disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox')).toBeDisabled();
  },
};
export const Readonly: Story = { args: { label: 'BIC', modelValue: 'TESTNL00', readonly: true, hint: 'Filled in from your IBAN.' } };
export const WithEndSlot: Story = {
  args: { label: 'IBAN', modelValue: 'NL00TEST0123456789' },
  render: (args) => ({
    components: { TextField, Icon },
    setup: () => ({ args, value: ref(args.modelValue ?? '') }),
    template: '<TextField v-bind="args" v-model="value"><template #end><Icon name="check-circle" label="Valid" /></template></TextField>',
  }),
};
export const WithAction: Story = {
  args: { label: 'Gift card number', autocomplete: 'off', hint: 'The 8 characters on the back of the card.' },
  render: (args) => ({
    components: { TextField, Button },
    setup: () => ({ args, value: ref(args.modelValue ?? ''), onCheck: fn() }),
    template: `
      <TextField v-bind="args" v-model="value">
        <template #action><Button variant="secondary" @click="onCheck">Check</Button></template>
      </TextField>`,
  }),
  play: async ({ canvas }) => {
    // Tab order: input, then the action.
    await userEvent.tab();
    const input = canvas.getByRole('textbox', { name: 'Gift card number' });
    await expect(input).toHaveFocus();
    await userEvent.keyboard('TEST0001');
    await userEvent.tab();
    const action = canvas.getByRole('button', { name: 'Check' });
    await expect(action).toHaveFocus();
    // The action is not part of the input's name or description.
    await expect(input).toHaveAccessibleName('Gift card number');
    await expect(input).toHaveAccessibleDescription('The 8 characters on the back of the card.');
    // The input comes first in the DOM too.
    await expect(input.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};
export const WithActionInvalid: Story = {
  args: {
    label: 'Gift card number',
    autocomplete: 'off',
    modelValue: 'TEST',
    hint: 'The 8 characters on the back of the card.',
    error: 'Enter all 8 characters of the card number.',
  },
  render: WithAction.render,
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Gift card number' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'The 8 characters on the back of the card. Error: Enter all 8 characters of the card number.',
    );
    // The error sits under the whole row, after the action.
    const action = canvas.getByRole('button', { name: 'Check' });
    const error = canvas.getByText('Enter all 8 characters of the card number.');
    await expect(action.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};
export const Keyboard: Story = {
  args: { label: 'Phone', type: 'tel', autocomplete: 'tel', inputmode: 'tel' },
  play: async ({ canvas }) => {
    await userEvent.tab();
    const input = canvas.getByRole('textbox', { name: 'Phone' });
    await expect(input).toHaveFocus();
    await userEvent.keyboard('+00 000 000 000');
    await expect(input).toHaveValue('+00 000 000 000');
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { TextField, ThemeMatrix, StateLabel, Icon, Spinner, Button },
    template: `
      <ThemeMatrix>
        <div class="grid gap-4 sm:grid-cols-2">
          <StateLabel label="empty"><TextField label="First name" /></StateLabel>
          <StateLabel label="filled"><TextField label="Last name" model-value="Testerson" /></StateLabel>
          <StateLabel label="hint, required"><TextField label="Email" type="email" required hint="We send the contract here." /></StateLabel>
          <StateLabel label="invalid"><TextField label="IBAN" model-value="NL00TEST01" error="Enter the full IBAN, 18 characters for this country." /></StateLabel>
          <StateLabel label="checking"><TextField label="Postcode" model-value="0000 XX"><template #end><Spinner :size="6" /></template></TextField></StateLabel>
          <StateLabel label="valid"><TextField label="IBAN, checked" model-value="NL00TEST0123456789"><template #end><Icon name="check-circle" label="Valid" /></template></TextField></StateLabel>
          <StateLabel label="readonly"><TextField label="BIC" model-value="TESTNL00" readonly /></StateLabel>
          <StateLabel label="disabled"><TextField label="Country" model-value="Testland" disabled /></StateLabel>
          <StateLabel label="with action"><TextField label="Gift card number" hint="The 8 characters on the back of the card."><template #action><Button variant="secondary">Check</Button></template></TextField></StateLabel>
          <StateLabel label="with action, invalid"><TextField label="Gift card, checked" model-value="TEST" error="Enter all 8 characters of the card number."><template #action><Button variant="secondary">Check</Button></template></TextField></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
