// Discount code rules and copy. Rules: docs/product/pricing.md ("Discount code"); copy: docs/product/copy.md.
import { DISCOUNTS, type Discount } from '@web/data/discounts';
import { DURATIONS, type DurationId } from '@web/data/plans';
import { roundToHalfEuro } from './pricing';

/** The answer of a code check. A failed check (network) is `failed`, from the app, never from `checkCode`. */
export type CheckResult = 'applied' | 'unknown' | 'expired' | 'not-eligible';
export type ApplyResult = CheckResult | 'failed';

/** Codes are trimmed and upper-cased before the check. */
export function normaliseCode(code: string): string {
  return code.trim().toUpperCase();
}

export function findDiscount(code: string): Discount | undefined {
  const normal = normaliseCode(code);
  return DISCOUNTS.find((d) => d.code === normal);
}

export function checkCode(code: string, duration: DurationId, now = new Date()): CheckResult {
  const discount = findDiscount(code);
  if (!discount) return 'unknown';
  if (discount.endsAt && now >= new Date(discount.endsAt)) return 'expired';
  if (!discount.durations.includes(duration)) return 'not-eligible';
  return 'applied';
}

/** The first 4-week price with the code: the percentage off the promo price, rounded to €0.50. */
export function discountedPrice(fourWeekPrice: number, off: number): number {
  return roundToHalfEuro(fourWeekPrice * (1 - off));
}

/** Cents the code takes off the first 4-week price. */
export function discountAmount(fourWeekPrice: number, off: number): number {
  return fourWeekPrice - discountedPrice(fourWeekPrice, off);
}

/** One code at a time: a code that applies replaces the current one; any other answer keeps it. */
export function nextApplied(current: string, newCode: string, result: ApplyResult): string {
  return result === 'applied' ? normaliseCode(newCode) : current;
}

/** "Flex", or "2-year and 1-year" for a code that covers two durations. */
export function durationsPhrase(durations: DurationId[]): string {
  const names = DURATIONS.filter((d) => durations.includes(d.id)).map((d) => d.title.replace(/ years?$/, '-year'));
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : (names[0] ?? '');
}

const UNKNOWN = "We don't recognise this code. Check the spelling and try again.";
const EXPIRED = 'This code has expired. Try another code.';
const FAILED = "We couldn't check the code. Check your connection and try again.";

/** The message under the field for a code that was not applied, without the "still in your total" sentence. */
export function rejectionMessage(result: Exclude<ApplyResult, 'applied'>, code: string): string {
  if (result === 'unknown') return UNKNOWN;
  if (result === 'expired') return EXPIRED;
  if (result === 'failed') return FAILED;
  const durations = durationsPhrase(findDiscount(code)?.durations ?? []);
  return `${normaliseCode(code)} works on ${durations} plans only. Choose ${durations} or try another code.`;
}

/** The message when a plan change drops an applied code. */
export function noLongerAppliesMessage(code: string, result: Exclude<CheckResult, 'applied'>): string {
  if (result !== 'not-eligible') return rejectionMessage(result, code);
  const durations = durationsPhrase(findDiscount(code)?.durations ?? []);
  return `${normaliseCode(code)} works on ${durations} plans only, so it's no longer in your total. Choose ${durations} and apply it again.`;
}

/** Added after a rejection message while another code stays applied. */
export function keptSentence(applied: string): string {
  return `${applied} is still in your total.`;
}

export function appliedAnnouncement(code: string, previous: string, total: string): string {
  return previous && previous !== code
    ? `${code} applied instead of ${previous}. Your first payment is now ${total}.`
    : `${code} applied. Your first payment is now ${total}.`;
}

export function removedAnnouncement(total: string): string {
  return `Code removed. Your first payment is now ${total}.`;
}
