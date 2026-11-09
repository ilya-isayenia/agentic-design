import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import Banner from './Banner.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

// Fixed clock: stories never read the real time, so screenshots stay stable.
const END = new Date('2026-06-01T12:00:00Z');
const before = (seconds: number) => new Date(END.getTime() - seconds * 1000);
const RUNNING = before(2 * 86400 + 7 * 3600 + 52 * 60 + 36);
const LAST_HOUR = before(42 * 60 + 9);
const ENDED = new Date(END.getTime() + 60_000);

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    message: 'Half price on the first 4 weeks',
    endsAt: END,
    now: RUNNING,
    actionLabel: 'See plans',
    href: '#plans',
    dismissible: true,
    onDismiss: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Offer ends in 2 days 7 hours')).toBeInTheDocument();
    await expect(canvas.getByText('02d 07h 52m 36s')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByRole('link', { name: 'See plans' })).toHaveAttribute('href', '#plans');
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss offer' }));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};
export const LastHour: Story = {
  args: { now: LAST_HOUR },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Last hour')).toBeInTheDocument();
    await expect(canvas.getByText('42m 09s')).toBeInTheDocument();
  },
};
export const Ended: Story = {
  args: { now: ENDED },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('This offer has ended')).toBeInTheDocument();
    await expect(canvas.queryByRole('link')).toBeNull();
  },
};
export const WithoutAction: Story = { args: { actionLabel: undefined, href: undefined } };
export const NonDismissible: Story = {
  args: { dismissible: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};
export const Keyboard: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'See plans' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Dismiss offer' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Banner, ThemeMatrix, StateLabel },
    setup: () => ({ END, RUNNING, LAST_HOUR, ENDED }),
    template: `
      <ThemeMatrix :columns="1">
        <StateLabel label="running">
          <Banner message="Half price on the first 4 weeks" :ends-at="END" :now="RUNNING" action-label="See plans" href="#plans" />
        </StateLabel>
        <StateLabel label="last hour">
          <Banner message="Half price on the first 4 weeks" :ends-at="END" :now="LAST_HOUR" action-label="See plans" href="#plans" />
        </StateLabel>
        <StateLabel label="ended">
          <Banner message="Half price on the first 4 weeks" :ends-at="END" :now="ENDED" />
        </StateLabel>
        <StateLabel label="without action">
          <Banner message="No joining fee this month" :ends-at="END" :now="RUNNING" />
        </StateLabel>
        <StateLabel label="non-dismissible">
          <Banner message="No joining fee this month" :ends-at="END" :now="RUNNING" action-label="Join now" href="#join" :dismissible="false" />
        </StateLabel>
      </ThemeMatrix>`,
  }),
};
