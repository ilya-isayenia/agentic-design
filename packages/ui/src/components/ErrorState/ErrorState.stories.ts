import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import ErrorState from './ErrorState.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/ErrorState',
  component: ErrorState,
  args: {
    title: 'Plans did not load',
    description: 'Check your connection and try again. Nothing was charged.',
    retryLabel: 'Try again',
    headingLevel: 2,
    onRetry: fn(),
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Plans did not load');
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};
export const Retrying: Story = {
  args: { retrying: true },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Try again' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};
export const Silent: Story = {
  args: { announce: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('alert')).toBeNull();
  },
};
export const TitleOnly: Story = { args: { description: undefined, headingLevel: 3, title: 'Clubs did not load' } };
export const Keyboard: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Try again' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { ErrorState, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-col gap-6">
          <StateLabel label="default">
            <ErrorState title="Plans did not load" description="Check your connection and try again. Nothing was charged." />
          </StateLabel>
          <StateLabel label="retrying">
            <ErrorState title="Plans did not load" description="Check your connection and try again." retrying :announce="false" :heading-level="3" />
          </StateLabel>
          <StateLabel label="title only, silent">
            <ErrorState title="Clubs did not load" :announce="false" :heading-level="3" />
          </StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
