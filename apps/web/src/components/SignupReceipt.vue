<script setup lang="ts">
import { computed } from 'vue';
import { Receipt, ReceiptLine, TextField, formatMoney } from '@agentic/ui';
import { STARTER_PACKAGE } from '@web/data/plans';
import { useSignup } from '@web/composables/useSignup';
import { fromPrice } from '@web/lib/pricing';

const { state, club, clubAddress, type, access, duration, price, starter, total } = useSignup();

const receiptClub = computed(() => (club.value ? { name: club.value.name, address: clubAddress.value } : undefined));
const from = computed(() => (state.type && state.access && !state.duration ? fromPrice(state.type, state.access) : null));
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
    <template v-if="total" #total>
      <ReceiptLine label="Total" :amount="total.amount" :was="total.regular" note="First payment" emphasis="total" />
    </template>
    <template #footer>
      <TextField v-model="state.referral" label="Referral code (optional)" name="referral" hint="From a current member. We check it after you sign up." autocomplete="off" />
    </template>
  </Receipt>
</template>
