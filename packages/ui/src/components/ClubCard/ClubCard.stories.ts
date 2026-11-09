import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import ClubCard from './ClubCard.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const BASE = {
  name: 'Fenwick Hollow',
  address: '12 Example Lane, Brindlemoor',
  perks: ['Sauna', 'Open 24/7', 'Group classes'],
  price: { amount: 2900 },
};
const PROMO = { ribbon: 'Spring offer: half price for 4 weeks', price: { amount: 1450, was: 2900 } };
const LONG = {
  name: 'Quillby Marsh Riverside Placeholder Club and Spa',
  address: 'Unit 404, Sample Business Park, Long Test Road, Quillby Marsh',
};

const meta = {
  title: 'Components/ClubCard',
  component: ClubCard,
  args: { ...BASE, onInfo: fn(), onJoin: fn() },
  decorators: [() => ({ template: '<div class="max-w-receipt"><story /></div>' })],
} satisfies Meta<typeof ClubCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('article', { name: 'Fenwick Hollow' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /More info about Fenwick Hollow/ }));
    await expect(args.onInfo).toHaveBeenCalledOnce();
    // Keyboard: Tab to "Join now" and press Enter.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /Join now at Fenwick Hollow/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onJoin).toHaveBeenCalledOnce();
  },
};
export const Promo: Story = {
  args: PROMO,
  play: async ({ canvas }) => {
    // The ribbon is read once, from the sr-only copy in the body.
    await expect(canvas.getAllByText(PROMO.ribbon)).toHaveLength(2);
    await expect(canvas.getByText('From €14.50, was €29 per 4 weeks')).toBeInTheDocument();
  },
};
export const PromoTicker: Story = { args: { ...PROMO, ribbonMoving: true } };
export const Selected: Story = { args: { selected: true } };
export const LongText: Story = { args: LONG };
export const NoPerks: Story = {
  args: { perks: [] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
};
export const HeadingLevel2: Story = {
  args: { headingLevel: 2 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Fenwick Hollow' })).toBeInTheDocument();
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { ClubCard, ThemeMatrix, StateLabel },
    setup: () => ({ base: BASE, promo: PROMO, long: LONG }),
    template: `
      <ThemeMatrix :columns="1">
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <StateLabel label="default"><ClubCard v-bind="base" /></StateLabel>
          <StateLabel label="promo"><ClubCard v-bind="{ ...base, ...promo }" /></StateLabel>
          <StateLabel label="promo ticker"><ClubCard v-bind="{ ...base, ...promo }" ribbon-moving /></StateLabel>
          <StateLabel label="selected"><ClubCard v-bind="base" selected /></StateLabel>
          <StateLabel label="long name and address"><ClubCard v-bind="{ ...base, ...long }" /></StateLabel>
          <StateLabel label="no perks"><ClubCard v-bind="base" :perks="[]" /></StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
