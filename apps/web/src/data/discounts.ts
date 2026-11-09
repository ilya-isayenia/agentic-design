// Discount codes. Visibly fake; dates are fixed so stories and visual tests stay stable.
// Rules: docs/product/pricing.md ("Discount code"); change both together.
import type { DurationId } from './plans';

export interface Discount {
  /** Upper case, as the user sees it after normalising. */
  code: string;
  /** Share taken off the first 4-week price after the promo, e.g. 0.1 for 10%. */
  off: number;
  /** Durations the code covers. */
  durations: DurationId[];
  /** ISO date; the code no longer works from this day on. */
  endsAt?: string;
  /** Shown under "{code} applied" on the discount line. */
  summary: string;
}

const ALL: DurationId[] = ['two-years', 'one-year', 'flex'];

export const DISCOUNTS: Discount[] = [
  { code: 'TEST-10', off: 0.1, durations: ALL, summary: '10% off your first 4 weeks' },
  { code: 'TEST-FLEX20', off: 0.2, durations: ['flex'], summary: '20% off your first 4 weeks on Flex' },
  { code: 'TEST-EXPIRED', off: 0.1, durations: ALL, endsAt: '2020-01-01', summary: '10% off your first 4 weeks' },
];
