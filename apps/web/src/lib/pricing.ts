import { ACCESS_LEVELS, DURATIONS, MEMBERSHIP_TYPES, STARTER_PACKAGE } from '@web/data/plans';
import type { AccessLevelId, DurationId, MembershipTypeId } from '@web/data/plans';

/** Prices are rounded to the nearest 50 cents after every multiplier. */
export function roundToHalfEuro(cents: number): number {
  return Math.round(cents / 50) * 50;
}

export interface PlanPrice {
  /** 4-week price after the promo, in cents. */
  amount: number;
  /** 4-week price without the promo, in cents; equal to amount when there is no promo. */
  regular: number;
}

function find<T extends { id: string }>(list: T[], id: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new Error(`Unknown id ${id}`);
  return item;
}

export function planPrice(type: MembershipTypeId, access: AccessLevelId, duration: DurationId): PlanPrice {
  const base = find(ACCESS_LEVELS, access).base;
  const plan = find(DURATIONS, duration);
  const regular = roundToHalfEuro(roundToHalfEuro(base * find(MEMBERSHIP_TYPES, type).factor) * plan.factor);
  const amount = plan.promo ? roundToHalfEuro(regular * (1 - plan.promo.off)) : regular;
  return { amount, regular };
}

/** The lowest price of an access level over all durations, shown as "From" on the access step. */
export function fromPrice(type: MembershipTypeId, access: AccessLevelId): PlanPrice {
  return DURATIONS.map((d) => planPrice(type, access, d.id)).reduce((best, p) => (p.amount < best.amount ? p : best));
}

export function starterPrice(duration: DurationId): number {
  return find(DURATIONS, duration).starterFree ? 0 : STARTER_PACKAGE.price;
}

/** First payment: the first 4 weeks plus the starter package. */
export function firstPayment(type: MembershipTypeId, access: AccessLevelId, duration: DurationId): PlanPrice {
  const plan = planPrice(type, access, duration);
  const starter = starterPrice(duration);
  return { amount: plan.amount + starter, regular: plan.regular + STARTER_PACKAGE.price };
}

/** Price of one workout over a 4-week period; null when no workouts are planned. */
export function pricePerWorkout(fourWeekPrice: number, workoutsPerWeek: number): number | null {
  if (workoutsPerWeek <= 0) return null;
  return Math.round(fourWeekPrice / (workoutsPerWeek * 4));
}
