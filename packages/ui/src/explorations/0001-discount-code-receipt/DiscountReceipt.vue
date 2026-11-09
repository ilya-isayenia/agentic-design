<script setup lang="ts">
// Throwaway harness: the receipt for Home club, 2 years, regular, with the discount code placed per variant.
// Props set the starting state for a story; after that a fake 600 ms check makes it clickable.
// a: applied row above the field in the footer; b: applied state on the discount line, field in the footer;
// c: applied state on the discount line, field inside the receipt right above the total.
import { computed, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import Receipt from '../../components/Receipt/Receipt.vue';
import ReceiptLine from '../../components/ReceiptLine/ReceiptLine.vue';
import TextField from '../../components/TextField/TextField.vue';
import { formatMoney } from '../../format';
import DeductionLine from './DeductionLine.vue';
import DraftDiscountCode from './DraftDiscountCode.vue';

export type Layout = 'a' | 'b' | 'c';

const props = withDefaults(
  defineProps<{
    layout: Layout;
    code?: string;
    applied?: string;
    status?: 'idle' | 'applying';
    error?: string;
    announcement?: string;
  }>(),
  { code: '', applied: '', status: 'idle', announcement: '' },
);

const CLUB = { name: 'Fenwick Hollow', address: '12 Example Lane, Brindlemoor' };
const PRICE = 2200;
const KNOWN: Record<string, { off: number; summary: string }> = {
  'TEST-10': { off: 200, summary: '10% off your first 4 weeks' },
};
const ERRORS: Record<string, string> = {
  'TEST-FLEX20': 'TEST-FLEX20 works on Flex plans only. Choose Flex or try another code.',
  'TEST-EXPIRED': 'This code has expired. Try another code.',
};
const UNKNOWN = "We don't recognise this code. Check the spelling and try again.";

const code = ref(props.code);
const applied = ref(props.applied);
const status = ref(props.status);
const error = ref(props.error);
const announcement = ref(props.announcement);
const referral = ref('');

const discount = computed(() => KNOWN[applied.value]);
const total = computed(() => PRICE - (discount.value?.off ?? 0));

let timer: ReturnType<typeof setTimeout> | undefined;
onUnmounted(() => clearTimeout(timer));

watch(code, () => {
  if (status.value !== 'applying') return;
  clearTimeout(timer);
  status.value = 'idle';
});

function apply(next: string) {
  status.value = 'applying';
  error.value = undefined;
  timer = setTimeout(() => {
    status.value = 'idle';
    const hit = KNOWN[next];
    if (hit) {
      const before = applied.value;
      applied.value = next;
      code.value = '';
      const now = formatMoney(PRICE - hit.off);
      announcement.value =
        before && before !== next ? `${next} applied instead of ${before}. Your first payment is now ${now}.` : `${next} applied. Your first payment is now ${now}.`;
      return;
    }
    const message = ERRORS[next] ?? UNKNOWN;
    error.value = applied.value ? `${message} ${applied.value} is still in your total.` : message;
    announcement.value = error.value;
  }, 600);
}

const field = useTemplateRef<InstanceType<typeof DraftDiscountCode>>('field');
function remove() {
  applied.value = '';
  error.value = undefined;
  announcement.value = `Code removed. Your first payment is now ${formatMoney(PRICE)}.`;
  field.value?.focus();
}

const codeProps = computed(() => ({
  status: status.value,
  error: error.value,
  appliedCode: applied.value,
  appliedSummary: discount.value?.summary,
  announcement: announcement.value,
  showApplied: props.layout === 'a',
}));
const lineSummary = computed(() => (props.layout === 'a' ? undefined : discount.value?.summary));
</script>

<template>
  <!-- text-text: do not inherit the colour of <html>, which is still transitioning from the default theme when a single story is shot. -->
  <div class="text-text">
  <Receipt :club="CLUB">
    <ReceiptLine label="Home club, 2 years" :amount="PRICE" :was="4400" note="per 4 weeks">
      <ul class="flex flex-col gap-1">
        <li>Regular membership</li>
        <li>Half price for the first 6 months, then €44</li>
      </ul>
    </ReceiptLine>
    <ReceiptLine label="Starter package" :amount="0" :was="2500">
      <ul class="flex flex-col gap-1">
        <li>Intro session with a coach</li>
        <li>Member card and water bottle</li>
      </ul>
    </ReceiptLine>
    <DeductionLine v-if="discount" :code="applied" :off="discount.off" :summary="lineSummary" @remove="remove" />
    <div v-if="layout === 'c'" class="py-4">
      <DraftDiscountCode ref="field" v-model="code" v-bind="codeProps" @apply="apply" @remove="remove" />
    </div>

    <template #total>
      <ReceiptLine label="Total" :amount="total" :was="6900" note="First payment" emphasis="total" />
    </template>

    <template #footer>
      <div class="flex flex-col gap-6">
        <DraftDiscountCode v-if="layout !== 'c'" ref="field" v-model="code" v-bind="codeProps" @apply="apply" @remove="remove" />
        <TextField v-model="referral" label="Referral code (optional)" name="referral" hint="From a current member. We check it after you sign up." autocomplete="off" />
      </div>
    </template>
  </Receipt>
  </div>
</template>
