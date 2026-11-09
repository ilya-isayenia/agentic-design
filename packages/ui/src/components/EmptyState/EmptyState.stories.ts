import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import EmptyState from './EmptyState.vue';
import Button from '../Button/Button.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    icon: 'search',
    title: 'No clubs match',
    description: 'Try a wider area or remove a filter.',
    headingLevel: 2,
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'No clubs match' })).toBeInTheDocument();
  },
};
const onClearFilters = fn();
export const WithAction: Story = {
  render: (args) => ({
    components: { EmptyState, Button },
    setup: () => ({ args, onClearFilters }),
    template: `
      <EmptyState v-bind="args">
        <template #action><Button variant="secondary" @click="onClearFilters">Clear filters</Button></template>
      </EmptyState>`,
  }),
  play: async ({ canvas }) => {
    onClearFilters.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await expect(onClearFilters).toHaveBeenCalledOnce();
  },
};
export const TitleOnly: Story = { args: { icon: undefined, description: undefined } };
export const SubsectionHeading: Story = {
  args: { headingLevel: 3, icon: 'calendar', title: 'No classes booked', description: 'Booked classes show up here.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent('No classes booked');
  },
};

export const Matrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { EmptyState, Button, ThemeMatrix, StateLabel },
    template: `
      <ThemeMatrix>
        <div class="flex flex-col gap-6">
          <StateLabel label="icon, description, action">
            <EmptyState icon="search" title="No clubs match" description="Try a wider area or remove a filter.">
              <template #action><Button variant="secondary">Clear filters</Button></template>
            </EmptyState>
          </StateLabel>
          <StateLabel label="heading level 3, no action">
            <EmptyState icon="calendar" title="No classes booked" description="Booked classes show up here." :heading-level="3" />
          </StateLabel>
          <StateLabel label="title only">
            <EmptyState title="Nothing here yet" :heading-level="3" />
          </StateLabel>
        </div>
      </ThemeMatrix>`,
  }),
};
