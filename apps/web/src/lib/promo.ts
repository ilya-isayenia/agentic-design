/** The running promo ends at the end of the current month, so the countdown always runs in the demo. */
export function promoEndsAt(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
}

export const PROMO_MESSAGE = 'Half price for your first 6 months on 1- and 2-year plans.';
