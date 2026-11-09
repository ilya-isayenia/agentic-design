import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, fn, userEvent } from 'storybook/test';
import Chip from './Chip.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  args: { label: 'Sauna', tone: 'neutral', as: 'span', onToggle: fn() },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'accent'] },
    as: { control: 'inline-radio', options: ['span', 'button'] },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Accent: Story = { args: { label: 'Pool', tone: 'accent' } };
export const WithIcon: Story = { args: { label: 'Open 24/7', icon: 'calendar' } };

// The parent owns `pressed`; this render plays the parent so the toggle can be tried.
export const Toggle: Story = {
  args: { as: 'button', label: 'Has sauna' },
  render: (args) => ({
    components: { Chip },
    setup() {
      const pressed = ref(false);
      const onToggle = (next: boolean) => {
        pressed.value = next;
        args.onToggle?.(next);
      };
      return { args, pressed, onToggle };
    },
    template: '<Chip v-bind="args" :pressed="pressed" @toggle="onToggle" />',
  }),
  play: async ({ canvas, args }) => {
    const chip = canvas.getByRole('button', { name: 'Has sauna' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(args.onToggle).toHaveBeenLastCalledWith(true);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    // Keyboard: Space turns it off again.
    await userEvent.keyboard(' ');
    await expect(args.onToggle).toHaveBeenLastCalledWith(false);
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  },
};
export const TogglePressed: Story = {
  args: { as: 'button', label: 'Has sauna', pressed: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Has sauna' })).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Chip, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-wrap items-end gap-4">
          <StateLabel label="neutral"><Chip label="Sauna" /></StateLabel>
          <StateLabel label="accent"><Chip label="Pool" tone="accent" /></StateLabel>
          <StateLabel label="icon"><Chip label="Open 24/7" icon="calendar" /></StateLabel>
          <StateLabel label="toggle off"><Chip as="button" label="Has sauna" /></StateLabel>
          <StateLabel label="toggle on"><Chip as="button" label="Has pool" pressed /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
