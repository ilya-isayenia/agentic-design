import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, userEvent } from 'storybook/test';
import PlanCard from './PlanCard.vue';
import RadioGroup from '../RadioGroup/RadioGroup.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const perks = ['Train in your home club', 'All group classes', 'App with workout plans'];

/** What a real pointer hits at the centre of `el`: the stretched label covers the whole card. */
function hitAt(el: HTMLElement): HTMLElement {
  const box = el.getBoundingClientRect();
  return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) as HTMLElement;
}

// A PlanCard only works inside a RadioGroup; stories pair it with a second card so selection can move.
const meta = {
  title: 'Components/PlanCard',
  component: PlanCard,
  args: { value: 'club', title: 'One club', description: 'For training close to home.', perks, price: { amount: 2400, period: '4 weeks' } },
  render: (args) => ({
    components: { PlanCard, RadioGroup },
    setup: () => ({ args, value: ref<string>() }),
    template: `
      <RadioGroup legend="Access level" v-model="value">
        <div class="grid gap-4 sm:grid-cols-2">
          <PlanCard v-bind="args" />
          <PlanCard value="area" title="Area" :perks="['Every club in your area']" :price="{ amount: 3200, period: '4 weeks' }" />
        </div>
      </RadioGroup>`,
  }),
} satisfies Meta<typeof PlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const radio = canvas.getByRole('radio', { name: 'One club' });
    await expect(radio).toHaveAccessibleDescription(
      '€24 per 4 weeks For training close to home. Train in your home club All group classes App with workout plans',
    );
    const hit = hitAt(canvas.getByText('For training close to home.'));
    await expect(hit.tagName).toBe('LABEL');
    await userEvent.click(hit);
    await expect(radio).toBeChecked();
  },
};
export const Selected: Story = {
  render: (args) => ({
    components: { PlanCard, RadioGroup },
    setup: () => ({ args }),
    template: '<RadioGroup legend="Access level" model-value="club"><div class="grid max-w-receipt"><PlanCard v-bind="args" /></div></RadioGroup>',
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'One club' })).toBeChecked();
  },
};
export const Promo: Story = {
  args: {
    ribbon: 'First 4 weeks half price',
    price: { amount: 1200, was: 2400, period: '4 weeks', lead: 'From' },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'One club' })).toHaveAccessibleDescription(
      'First 4 weeks half price From €12, was €24 per 4 weeks For training close to home. Train in your home club All group classes App with workout plans',
    );
  },
};
export const Disabled: Story = {
  args: { disabled: true, description: 'Not available in your area yet.' },
  play: async ({ canvas }) => {
    const radio = canvas.getByRole('radio', { name: 'One club' });
    await expect(radio).toBeDisabled();
    await userEvent.click(hitAt(canvas.getByText('Not available in your area yet.')));
    await expect(radio).not.toBeChecked();
  },
};
export const NoPrice: Story = {
  args: { value: 'student', title: 'Student', description: 'With a valid student card.', perks: ['Same access as regular', 'Card checked at your first visit'], price: undefined },
};
export const LongText: Story = {
  args: {
    title: 'Whole country, every club and every class',
    description: 'For people who travel a lot and want to train wherever they are, any day of the week, including the partner clubs.',
    perks: [...perks, 'Bring a friend twice a month on weekdays after lunch', 'Massage chairs'],
  },
};
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    const first = canvas.getByRole('radio', { name: 'One club' });
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const second = canvas.getByRole('radio', { name: 'Area' });
    await expect(second).toHaveFocus();
    await expect(second).toBeChecked();
    // The input is sr-only, so the card draws the focus ring.
    await expect(getComputedStyle(second.parentElement as HTMLElement).outlineStyle).toBe('solid');
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { PlanCard, RadioGroup, ThemeMatrix, StateLabel },
    setup: () => ({ perks }),
    template: `
      <ThemeMatrix :columns="1">
        <RadioGroup legend="Plan card states" hide-legend model-value="selected">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StateLabel label="default"><PlanCard value="default" title="One club" :perks="perks" :price="{ amount: 2400, period: '4 weeks' }" /></StateLabel>
            <StateLabel label="selected"><PlanCard value="selected" title="Area" description="Every club in your area." :perks="perks" :price="{ amount: 3200, period: '4 weeks' }" /></StateLabel>
            <StateLabel label="promo"><PlanCard value="promo" title="City" ribbon="First 4 weeks half price" :perks="perks" :price="{ amount: 1800, was: 3600, period: '4 weeks', lead: 'From' }" /></StateLabel>
            <StateLabel label="disabled"><PlanCard value="disabled" title="Country" description="Not available in your area yet." :perks="perks" :price="{ amount: 4400, period: '4 weeks' }" disabled /></StateLabel>
            <StateLabel label="no price"><PlanCard value="student" title="Student" description="With a valid student card." :perks="['Same access as regular']" /></StateLabel>
            <StateLabel label="long text"><PlanCard value="long" title="Whole country, every club and every class" description="For people who travel a lot and want to train wherever they are, any day of the week." :perks="[...perks, 'Bring a friend twice a month on weekdays after lunch']" :price="{ amount: 4950, period: '4 weeks' }" /></StateLabel>
          </div>
        </RadioGroup>
      </ThemeMatrix>`,
  }),
};
