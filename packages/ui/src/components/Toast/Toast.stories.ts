import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import Toast from './Toast.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  // duration 0 keeps static stories on screen for screenshots and axe.
  args: { message: 'Your plan is saved', tone: 'info', duration: 0, onClose: fn() },
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'success', 'danger'] } },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: { message: 'Prices include VAT' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Prices include VAT');
  },
};
export const Success: Story = { args: { tone: 'success', message: 'Your plan is saved' } };
export const Danger: Story = {
  args: { tone: 'danger', message: 'Payment did not go through' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Payment did not go through');
    await expect(canvas.getByRole('img', { name: 'Error' })).toBeInTheDocument();
  },
};
export const ClosesItself: Story = {
  args: { duration: 400 },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), { timeout: 2000 });
  },
};
export const PausesOnHover: Story = {
  args: { duration: 400 },
  play: async ({ canvas, args }) => {
    const toast = canvas.getByRole('status');
    await userEvent.hover(toast);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.unhover(toast);
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), { timeout: 2000 });
  },
};
export const Keyboard: Story = {
  args: { duration: 400 },
  play: async ({ canvas, args }) => {
    await userEvent.tab();
    const close = canvas.getByRole('button', { name: 'Close notification' });
    await expect(close).toHaveFocus();
    // Focus inside pauses the timer.
    await new Promise((resolve) => setTimeout(resolve, 700));
    await expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Toast, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-col gap-4">
          <StateLabel label="info"><Toast message="Prices include VAT" :duration="0" /></StateLabel>
          <StateLabel label="success"><Toast tone="success" message="Your plan is saved" :duration="0" /></StateLabel>
          <StateLabel label="danger"><Toast tone="danger" message="Payment did not go through" :duration="0" /></StateLabel>
          <StateLabel label="long message">
            <Toast message="We sent the membership details to your email. Check spam if it is not there in a few minutes." :duration="0" />
          </StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
