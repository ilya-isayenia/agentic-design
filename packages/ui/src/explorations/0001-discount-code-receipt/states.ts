// Throwaway. Shared story states and the Matrix story for the three variants of 0001-discount-code-receipt.
import DiscountReceipt, { type Layout } from './DiscountReceipt.vue';
import ThemeMatrix from '../../storybook/ThemeMatrix.vue';
import StateLabel from '../../storybook/StateLabel.vue';

const KEPT = 'TEST-FLEX20 works on Flex plans only. Choose Flex or try another code. TEST-10 is still in your total.';
const UNKNOWN = "We don't recognise this code. Check the spelling and try again.";

export const STATES = {
  idle: {},
  applying: { code: 'TEST-10', status: 'applying' },
  applied: { applied: 'TEST-10', announcement: 'TEST-10 applied. Your first payment is now €20.' },
  keptOnError: { applied: 'TEST-10', code: 'TEST-FLEX20', error: KEPT, announcement: KEPT },
  invalid: { code: 'NOPE', error: UNKNOWN, announcement: UNKNOWN },
} as const;

const LABELS: Record<keyof typeof STATES, string> = {
  idle: 'idle',
  applying: 'applying',
  applied: 'applied',
  keptOnError: 'kept on error',
  invalid: 'invalid, nothing applied',
};

export function matrix(layout: Layout) {
  return {
    parameters: {
      layout: 'fullscreen',
      // Many copies of the same named receipt aside share this canvas, as in Receipt's Matrix.
      a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
    },
    render: () => ({
      components: { DiscountReceipt, ThemeMatrix, StateLabel },
      setup: () => ({ layout, states: Object.entries(STATES).map(([key, args]) => ({ key, label: LABELS[key as keyof typeof STATES], args })) }),
      template: `
        <ThemeMatrix :columns="1">
          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <StateLabel v-for="state in states" :key="state.key" :label="state.label">
              <DiscountReceipt :layout="layout" v-bind="state.args" />
            </StateLabel>
          </div>
        </ThemeMatrix>`,
    }),
  };
}
