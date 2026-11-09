<script setup lang="ts">
import { computed } from 'vue';
import { formatMoney } from '../../format';

const props = withDefaults(
  defineProps<{
    /** Current price in cents. */
    amount: number;
    /** Price before the promo, in cents; shown struck through. */
    was?: number;
    /** e.g. "4 weeks"; rendered as "/4 weeks". */
    period?: string;
    /** Small label above, e.g. "From". */
    lead?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md' },
);

const now = computed(() => formatMoney(props.amount));
const before = computed(() => (props.was !== undefined && props.was > props.amount ? formatMoney(props.was) : null));
const spoken = computed(() =>
  [props.lead, before.value ? `${now.value}, was ${before.value}` : now.value, props.period && `per ${props.period}`]
    .filter(Boolean)
    .join(' '),
);
const sizeClass = computed(() => ({ sm: 'text-body', md: 'text-h2', lg: 'text-h1' })[props.size]);
</script>

<template>
  <p class="flex flex-col gap-1 tabular">
    <span class="sr-only">{{ spoken }}</span>
    <span v-if="lead" aria-hidden="true" class="text-caption text-text-muted">{{ lead }}</span>
    <span aria-hidden="true" class="flex items-baseline gap-2 font-display font-extrabold">
      <del v-if="before" class="text-text-muted font-semibold" :class="size === 'sm' ? 'text-small' : 'text-h3'">{{ before }}</del>
      <span :class="sizeClass">{{ now }}</span>
    </span>
    <span v-if="period" aria-hidden="true" class="text-caption text-text-muted">/{{ period }}</span>
  </p>
</template>
