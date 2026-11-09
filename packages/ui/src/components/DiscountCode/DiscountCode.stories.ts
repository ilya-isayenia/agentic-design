import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import DiscountCode from './DiscountCode.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

// Copy as the app writes it (docs/product/copy.md).
const HINT = 'One code at a time. We take it off your first 4 weeks.';
const EMPTY = 'Enter a code to apply it.';
const UNKNOWN = "We don't recognise this code. Check the spelling and try again.";
const EXPIRED = 'This code has expired. Try another code.';
const NOT_ELIGIBLE = 'TEST-FLEX20 works on Flex plans only. Choose Flex or try another code.';
const NO_LONGER = "TEST-FLEX20 works on Flex plans only, so it's no longer in your total. Choose Flex and apply it again.";
const FAILED = "We couldn't check the code. Check your connection and try again.";
const KEPT = `${NOT_ELIGIBLE} TEST-10 is still in your total.`;
const APPLIED = 'TEST-10 applied. Your first payment is now €20.';

const meta = {
  title: 'Components/DiscountCode',
  component: DiscountCode,
  args: { hint: HINT, status: 'idle', onApply: fn() },
  argTypes: { status: { control: 'inline-radio', options: ['idle', 'applying'] } },
  render: (args) => ({
    components: { DiscountCode },
    setup: () => ({ args, value: ref(args.modelValue ?? '') }),
    template: '<div class="max-w-receipt"><DiscountCode v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof DiscountCode>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Error states share their wiring: message under the row, aria-invalid, described by hint then message, announced. */
async function expectError(canvas: Parameters<NonNullable<Story['play']>>[0]['canvas'], message: string, code: string) {
  const input = canvas.getByRole('textbox', { name: 'Discount code (optional)' });
  await expect(input).toHaveValue(code);
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription(`${HINT} Error: ${message}`);
  await expect(canvas.getByRole('status')).toHaveTextContent(message);
}

export const Idle: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Discount code (optional)' });
    await expect(input).toHaveAccessibleDescription(HINT);
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(canvas.getByRole('button', { name: 'Apply' })).toHaveAttribute('type', 'submit');
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement();
  },
};

export const EmptySubmit: Story = {
  args: { modelValue: '   ' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(args.onApply).not.toHaveBeenCalled();
    const input = canvas.getByRole('textbox', { name: 'Discount code (optional)' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(`${HINT} Error: ${EMPTY}`);
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(EMPTY));
  },
};

export const Applying: Story = {
  args: { modelValue: 'TEST-10', status: 'applying' },
  play: async ({ canvas, args }) => {
    const apply = canvas.getByRole('button', { name: 'Apply' });
    await expect(apply).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(apply);
    await expect(apply).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onApply).not.toHaveBeenCalled();
    await expect(apply).toHaveFocus();
    await expect(canvas.getByRole('textbox', { name: 'Discount code (optional)' })).toHaveValue('TEST-10');
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement();
  },
};

/** The app's reply to a valid code, faked here: the field empties and the region announces the new total. */
export const Applied: Story = {
  render: (args) => ({
    components: { DiscountCode },
    setup: () => {
      const value = ref('');
      const announcement = ref('');
      const onApply = (code: string) => {
        args.onApply?.(code);
        value.value = '';
        announcement.value = `${code} applied. Your first payment is now €20.`;
      };
      return { args, value, announcement, onApply };
    },
    template: '<div class="max-w-receipt"><DiscountCode v-bind="args" v-model="value" :announcement="announcement" @apply="onApply" /></div>',
  }),
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Discount code (optional)' });
    await userEvent.type(input, 'test-10');
    const apply = canvas.getByRole('button', { name: 'Apply' });
    await userEvent.click(apply);
    await expect(args.onApply).toHaveBeenCalledWith('TEST-10');
    await expect(canvas.getByRole('status')).toHaveTextContent(APPLIED);
    await expect(input).toHaveValue('');
    await expect(input).toBeEnabled();
    await expect(apply).toHaveFocus();
  },
};

export const Invalid: Story = {
  args: { modelValue: 'NOPE', error: UNKNOWN, announcement: UNKNOWN },
  play: async ({ canvas }) => expectError(canvas, UNKNOWN, 'NOPE'),
};

export const Expired: Story = {
  args: { modelValue: 'TEST-EXPIRED', error: EXPIRED, announcement: EXPIRED },
  play: async ({ canvas }) => expectError(canvas, EXPIRED, 'TEST-EXPIRED'),
};

export const NotEligible: Story = {
  args: { modelValue: 'TEST-FLEX20', error: NOT_ELIGIBLE, announcement: NOT_ELIGIBLE },
  play: async ({ canvas }) => expectError(canvas, NOT_ELIGIBLE, 'TEST-FLEX20'),
};

export const NoLongerApplies: Story = {
  args: { modelValue: 'TEST-FLEX20', error: NO_LONGER, announcement: NO_LONGER },
  play: async ({ canvas }) => expectError(canvas, NO_LONGER, 'TEST-FLEX20'),
};

export const NetworkError: Story = {
  args: { modelValue: 'TEST-10', error: FAILED, announcement: FAILED },
  play: async ({ canvas, args }) => {
    await expectError(canvas, FAILED, 'TEST-10');
    // Retry: Apply sends the same code again.
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(args.onApply).toHaveBeenCalledWith('TEST-10');
  },
};

export const KeptOnError: Story = {
  args: { modelValue: 'TEST-FLEX20', error: KEPT, announcement: KEPT },
  play: async ({ canvas }) => expectError(canvas, KEPT, 'TEST-FLEX20'),
};

export const Keyboard: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.tab();
    const input = canvas.getByRole('textbox', { name: 'Discount code (optional)' });
    await expect(input).toHaveFocus();
    await userEvent.keyboard(' test-10 ');
    // Enter in the field applies and focus stays in the field.
    await userEvent.keyboard('{Enter}');
    await expect(args.onApply).toHaveBeenLastCalledWith('TEST-10');
    await expect(input).toHaveFocus();
    // Tab order: field, then Apply; Space activates it.
    await userEvent.tab();
    const apply = canvas.getByRole('button', { name: 'Apply' });
    await expect(apply).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onApply).toHaveBeenCalledTimes(2);
    await expect(apply).toHaveFocus();
  },
};

const MATRIX_STATES = [
  { label: 'idle, or applied (field emptied)', props: {} },
  { label: 'empty submit', props: { error: EMPTY } },
  { label: 'applying', props: { modelValue: 'TEST-10', status: 'applying' } },
  { label: 'invalid', props: { modelValue: 'NOPE', error: UNKNOWN } },
  { label: 'expired', props: { modelValue: 'TEST-EXPIRED', error: EXPIRED } },
  { label: 'not eligible', props: { modelValue: 'TEST-FLEX20', error: NOT_ELIGIBLE } },
  { label: 'no longer applies', props: { modelValue: 'TEST-FLEX20', error: NO_LONGER } },
  { label: 'network error', props: { modelValue: 'TEST-10', error: FAILED } },
  { label: 'kept on error', props: { modelValue: 'TEST-FLEX20', error: KEPT } },
];

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { DiscountCode, ThemeMatrix, StateLabel },
    setup: () => ({ states: MATRIX_STATES, hint: HINT }),
    template: `
      <ThemeMatrix>
        <div class="grid gap-6 xl:grid-cols-2">
          <StateLabel v-for="state in states" :key="state.label" :label="state.label">
            <div class="max-w-receipt"><DiscountCode v-bind="state.props" :hint="hint" /></div>
          </StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
