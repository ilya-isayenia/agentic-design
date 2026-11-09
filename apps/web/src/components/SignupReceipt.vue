<script setup lang="ts">
import { computed, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import { DiscountApplied, DiscountCode, Receipt, ReceiptLine, TextField, formatMoney, type DiscountCodeStatus } from '@agentic/ui';
import { STARTER_PACKAGE } from '@web/data/plans';
import { useSignup } from '@web/composables/useSignup';
import { checkDiscountCode } from '@web/lib/api';
import {
  appliedAnnouncement,
  checkCode,
  keptSentence,
  nextApplied,
  noLongerAppliesMessage,
  rejectionMessage,
  removedAnnouncement,
  type ApplyResult,
} from '@web/lib/discount';
import { fromPrice } from '@web/lib/pricing';

const { state, club, clubAddress, type, access, duration, price, starter, discount, total } = useSignup();

const receiptClub = computed(() => (club.value ? { name: club.value.name, address: clubAddress.value } : undefined));
const from = computed(() => (state.type && state.access && !state.duration ? fromPrice(state.type, state.access) : null));

// Discount code field: the text, the pending check and the last result. The applied code itself is signup state.
const codeText = ref('');
const codeStatus = ref<DiscountCodeStatus>('idle');
/** The message for the last code that was not applied, and the code that stayed applied meanwhile. */
const rejection = ref<{ message: string; kept: string } | null>(null);
const announcement = ref('');
const codeField = useTemplateRef<InstanceType<typeof DiscountCode>>('codeField');

const codeError = computed(() =>
  rejection.value ? [rejection.value.message, rejection.value.kept && keptSentence(rejection.value.kept)].filter(Boolean).join(' ') : undefined,
);
const totalText = () => (total.value ? formatMoney(total.value.amount) : '');

let pending: AbortController | null = null;
function cancelCheck() {
  pending?.abort();
  pending = null;
  codeStatus.value = 'idle';
}
onUnmounted(() => pending?.abort());

// Editing the field throws away the pending result.
watch(codeText, () => {
  if (codeStatus.value === 'applying') cancelCheck();
});

async function apply(code: string) {
  if (!state.duration) return;
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  codeStatus.value = 'applying';
  announcement.value = '';

  let result: ApplyResult;
  try {
    result = await checkDiscountCode(code, state.duration, controller.signal);
  } catch {
    if (controller.signal.aborted) return;
    result = 'failed';
  }
  pending = null;
  codeStatus.value = 'idle';

  const before = state.discountCode;
  state.discountCode = nextApplied(before, code, result);
  if (result === 'applied') {
    rejection.value = null;
    codeText.value = '';
    announcement.value = appliedAnnouncement(code, before, totalText());
  } else {
    rejection.value = { message: rejectionMessage(result, code), kept: before };
    announcement.value = codeError.value ?? '';
  }
}

function remove() {
  // Remove goes away with the line; the field is the next control after it in tab order.
  codeField.value?.focus();
  state.discountCode = '';
  if (rejection.value) rejection.value = { ...rejection.value, kept: '' };
  announcement.value = removedAnnouncement(totalText());
}

// A plan change checks the applied code again, locally: the code's rules came with the first answer.
watch(
  () => state.duration,
  (next) => {
    cancelCheck();
    const applied = state.discountCode;
    if (!applied || !next) return;
    const result = checkCode(applied, next);
    if (result === 'applied') return;
    state.discountCode = '';
    if (!codeText.value.trim()) codeText.value = applied;
    rejection.value = { message: noLongerAppliesMessage(applied, result), kept: '' };
    announcement.value = codeError.value ?? '';
  },
);
</script>

<template>
  <Receipt :club="receiptClub">
    <ReceiptLine
      v-if="access && duration && price"
      :label="`${access.title}, ${duration.title}`"
      :amount="price.amount"
      :was="price.regular"
      note="per 4 weeks"
    >
      <ul class="flex flex-col gap-1 text-small text-text-muted">
        <li v-if="type">{{ type.title }} membership</li>
        <li v-for="perk in access.perks" :key="perk">{{ perk }}</li>
        <li v-if="duration.promo">{{ duration.promo.label }}, then {{ formatMoney(price.regular) }}</li>
      </ul>
    </ReceiptLine>
    <ReceiptLine v-else-if="access && from" :label="access.title" :amount="from.amount" :was="from.regular" note="from, per 4 weeks" />
    <ReceiptLine v-if="duration && starter !== null" :label="STARTER_PACKAGE.title" :amount="starter" :was="STARTER_PACKAGE.price">
      <ul class="flex flex-col gap-1 text-small text-text-muted">
        <li v-for="item in STARTER_PACKAGE.includes" :key="item">{{ item }}</li>
      </ul>
    </ReceiptLine>
    <!-- Not keyed by the code: a replaced code updates the line in place, so a focused Remove keeps focus. -->
    <ReceiptLine v-if="discount" label="Discount" :amount="-discount.amount">
      <template #below>
        <DiscountApplied :code="discount.code" :summary="discount.summary" @remove="remove" />
      </template>
    </ReceiptLine>
    <template v-if="total" #total>
      <ReceiptLine label="Total" :amount="total.amount" :was="total.regular" note="First payment" emphasis="total" />
    </template>
    <template #footer>
      <div class="flex flex-col gap-6">
        <DiscountCode
          v-if="total"
          ref="codeField"
          v-model="codeText"
          :status="codeStatus"
          :error="codeError"
          :announcement="announcement"
          hint="One code at a time. We take it off your first 4 weeks."
          @apply="apply"
        />
        <TextField v-model="state.referral" label="Referral code (optional)" name="referral" hint="From a current member. We check it after you sign up." autocomplete="off" />
      </div>
    </template>
  </Receipt>
</template>
