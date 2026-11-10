import { computed, reactive, watch } from 'vue';
import { CLUBS, addressOf } from '@web/data/clubs';
import { ACCESS_LEVELS, DURATIONS, MEMBERSHIP_TYPES, type AccessLevelId, type DurationId, type MembershipTypeId } from '@web/data/plans';
import { emptyDetails, validateDetails, type Details } from '@web/lib/details';
import { firstPayment, planPrice, starterPrice } from '@web/lib/pricing';
import { checkCode, discountAmount, findDiscount } from '@web/lib/discount';

export const STEPS = [
  { id: 'type', label: 'Membership type' },
  { id: 'access', label: 'Access level' },
  { id: 'duration', label: 'Duration' },
  { id: 'details', label: 'Your details' },
  { id: 'verify', label: 'Verify your phone' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

interface SignupState {
  clubId: string | null;
  type: MembershipTypeId | null;
  workouts: number;
  access: AccessLevelId | null;
  duration: DurationId | null;
  details: Details;
  detailsSubmitted: boolean;
  referral: string;
  /** The applied discount code, '' if none. */
  discountCode: string;
  verified: boolean;
}

const KEY = 'signup';

function fresh(): SignupState {
  return { clubId: null, type: null, workouts: 0, access: null, duration: null, details: emptyDetails(), detailsSubmitted: false, referral: '', discountCode: '', verified: false };
}

function load(): SignupState {
  try {
    return { ...fresh(), ...(JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Partial<SignupState>) };
  } catch {
    return fresh();
  }
}

const state = reactive<SignupState>(load());
watch(state, () => sessionStorage.setItem(KEY, JSON.stringify(state)), { deep: true });

/** Signup progress, shared by every screen. Kept in sessionStorage so a reload keeps the answers. */
export function useSignup() {
  const club = computed(() => CLUBS.find((c) => c.id === state.clubId) ?? null);
  const type = computed(() => MEMBERSHIP_TYPES.find((t) => t.id === state.type) ?? null);
  const access = computed(() => ACCESS_LEVELS.find((a) => a.id === state.access) ?? null);
  const duration = computed(() => DURATIONS.find((d) => d.id === state.duration) ?? null);

  /** Steps whose answer is complete, by index. */
  const done = computed(() => {
    const result: number[] = [];
    if (state.type) result.push(0);
    if (state.type && state.access) result.push(1);
    if (state.type && state.access && state.duration) result.push(2);
    if (result.length === 3 && state.detailsSubmitted && Object.keys(validateDetails(state.details)).length === 0) result.push(3);
    if (result.length === 4 && state.verified) result.push(4);
    return result;
  });

  /** The first step that is not done; a user cannot jump past it. */
  const firstOpen = computed(() => STEPS.findIndex((_, i) => !done.value.includes(i)));

  const price = computed(() =>
    state.type && state.access && state.duration ? planPrice(state.type, state.access, state.duration) : null,
  );
  const starter = computed(() => (state.duration ? starterPrice(state.duration) : null));
  /** The applied code and what it takes off the first 4 weeks; null when none applies to the chosen plan. */
  const discount = computed(() => {
    const found = findDiscount(state.discountCode);
    if (!found || !state.duration || !price.value || checkCode(found.code, state.duration) !== 'applied') return null;
    return { code: found.code, summary: found.summary, amount: discountAmount(price.value.amount, found.off) };
  });
  const total = computed(() =>
    state.type && state.access && state.duration
      ? firstPayment(state.type, state.access, state.duration, discount.value?.amount ?? 0)
      : null,
  );
  const clubAddress = computed(() => (club.value ? addressOf(club.value) : ''));

  function startWith(clubId: string) {
    if (state.clubId !== clubId) Object.assign(state, fresh(), { clubId });
  }

  function reset() {
    Object.assign(state, fresh());
  }

  return { state, club, clubAddress, type, access, duration, done, firstOpen, price, starter, discount, total, startWith, reset };
}
