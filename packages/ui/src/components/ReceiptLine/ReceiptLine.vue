<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import Icon from '../Icon/Icon.vue';
import { formatMoney } from '../../format';

const props = withDefaults(
  defineProps<{
    label: string;
    /** Cents. Negative for a deduction: shown as "−€2", read as "€2 off", never struck through. */
    amount: number;
    /** Price before the promo, in cents; shown struck through when higher than `amount`. */
    was?: number;
    /** Small muted text under the value, e.g. "First payment". */
    note?: string;
    emphasis?: 'default' | 'total';
    /** Details start expanded (only with the default slot). */
    defaultOpen?: boolean;
  }>(),
  { emphasis: 'default', defaultOpen: false },
);

const slots = defineSlots<{
  /** Details behind the disclosure. */
  default?: () => unknown;
  /** Always visible under the label and price, e.g. the applied note and Remove of a discount line. */
  below?: () => unknown;
}>();

const open = ref(props.defaultOpen);
const detailsId = useId();

const deduction = computed(() => props.amount < 0);
const now = computed(() => formatMoney(Math.abs(props.amount)));
// U+2212 minus sign, not a hyphen.
const shown = computed(() => (deduction.value ? `\u2212${now.value}` : now.value));
const before = computed(() =>
  !deduction.value && props.was !== undefined && props.was > props.amount ? formatMoney(props.was) : null,
);
// Screen readers do not announce <del> or read a minus sign reliably, so both are spoken in words.
const spoken = computed(() => {
  if (deduction.value) return `${now.value} off`;
  return before.value ? `${now.value}, was ${before.value}` : now.value;
});
const total = computed(() => props.emphasis === 'total');
</script>

<template>
  <div class="flex flex-col gap-2 py-3 text-text">
    <div class="flex items-baseline justify-between gap-4">
      <button
        v-if="slots.default"
        type="button"
        :aria-expanded="open"
        :aria-controls="detailsId"
        :class="[
          'inline-flex min-h-8 items-center gap-1 rounded-sm text-left hover:underline underline-offset-4',
          total ? 'font-display text-h3 font-extrabold uppercase' : 'text-small',
        ]"
        @click="open = !open"
      >
        {{ label }}
        <Icon
          name="chevron-down"
          :size="4"
          :class="['transition-transform duration-fast ease-standard', open && 'rotate-180']"
        />
      </button>
      <span v-else :class="total ? 'font-display text-h3 font-extrabold uppercase' : 'text-small'">{{ label }}</span>

      <span class="flex shrink-0 flex-col items-end text-right tabular">
        <span class="sr-only">{{ spoken }}</span>
        <span aria-hidden="true" class="flex items-baseline gap-2">
          <del v-if="before" class="text-small text-text-muted">{{ before }}</del>
          <span :class="total ? 'font-display text-h2 font-extrabold' : 'text-small font-semibold'">{{ shown }}</span>
        </span>
        <span v-if="note" class="text-caption text-text-muted">{{ note }}</span>
      </span>
    </div>
    <div v-if="slots.below">
      <slot name="below" />
    </div>
    <div v-if="slots.default" v-show="open" :id="detailsId" class="text-small text-text-muted">
      <slot />
    </div>
  </div>
</template>
