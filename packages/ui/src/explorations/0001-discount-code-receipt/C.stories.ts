import type { Meta, StoryObj } from '@storybook/vue3-vite';
import DiscountReceipt from './DiscountReceipt.vue';
import { STATES, matrix } from './states';

const meta = {
  title: 'Explorations/0001-discount-code-receipt/C',
  component: DiscountReceipt,
  args: { layout: 'c' },
} satisfies Meta<typeof DiscountReceipt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: STATES.idle };
export const Applying: Story = { args: STATES.applying };
export const Applied: Story = { args: STATES.applied };
export const KeptOnError: Story = { args: STATES.keptOnError };
export const Invalid: Story = { args: STATES.invalid };
export const Matrix: Story = matrix('c');
