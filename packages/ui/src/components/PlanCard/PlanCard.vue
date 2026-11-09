<script setup lang="ts">
import { computed, inject, useId } from 'vue';
import Icon from '../Icon/Icon.vue';
import Price from '../Price/Price.vue';
import { radioGroupKey } from '../RadioGroup/radioGroup';

export interface PlanCardPrice {
  /** Cents. */
  amount: number;
  /** Cents, before the promo. */
  was?: number;
  period?: string;
  lead?: string;
}

const props = withDefaults(
  defineProps<{
    value: string;
    title: string;
    description?: string;
    perks?: string[];
    price?: PlanCardPrice;
    /** Promo strip at the top, e.g. "First 4 weeks half price". */
    ribbon?: string;
    disabled?: boolean;
  }>(),
  { perks: () => [] },
);

const injected = inject(radioGroupKey);
if (!injected) throw new Error('PlanCard must be placed inside a RadioGroup.');
const group = injected;

const id = useId();
const ids = { input: `${id}-input`, ribbon: `${id}-ribbon`, price: `${id}-price`, description: `${id}-description`, perks: `${id}-perks` };

const checked = computed(() => group.selected.value === props.value);
const inert = computed(() => props.disabled || group.disabled.value);
// The name is the title; everything else is the description, in reading priority.
const describedBy = computed(() =>
  [
    props.ribbon && ids.ribbon,
    props.price && ids.price,
    props.description && ids.description,
    props.perks.length > 0 && ids.perks,
    group.errorId.value,
  ]
    .filter(Boolean)
    .join(' '),
);
</script>

<template>
  <div
    :class="[
      'group relative flex h-full flex-col overflow-hidden rounded-none border-2 transition-colors duration-fast ease-standard has-focus-visible:focus-ring',
      inert ? 'border-dashed border-border bg-bg' : 'bg-surface hover:bg-surface-raised',
      !inert && (checked ? 'border-accent' : group.invalid.value ? 'border-danger' : 'border-border-strong'),
    ]"
  >
    <input
      :id="ids.input"
      type="radio"
      class="sr-only"
      :name="group.name.value"
      :value="value"
      :checked="checked"
      :disabled="inert"
      :required="group.required.value"
      :aria-invalid="group.invalid.value ? 'true' : undefined"
      :aria-describedby="describedBy || undefined"
      @change="group.select(value)"
    />

    <div v-if="ribbon" class="overflow-hidden bg-accent py-1 font-display text-small font-semibold uppercase text-on-accent">
      <span :id="ids.ribbon" class="sr-only">{{ ribbon }}</span>
      <!-- Two identical halves; the ticker moves by -50 %, so the loop is seamless. Static under reduced motion. -->
      <span aria-hidden="true" class="plan-card-ticker flex w-max animate-ticker motion-reduce:animate-none">
        <span v-for="half in 2" :key="half" class="flex shrink-0">
          <span v-for="n in 4" :key="n" class="px-4">{{ ribbon }}</span>
        </span>
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-4 p-4">
      <div class="flex items-start justify-between gap-3">
        <!-- Stretched label: its ::after covers the card, so a click anywhere selects the radio. -->
        <label
          :for="ids.input"
          :class="[
            'font-display text-h3 font-extrabold uppercase after:absolute after:inset-0',
            inert ? 'cursor-not-allowed text-text-muted' : 'cursor-pointer text-text',
          ]"
        >
          {{ title }}
        </label>
        <span
          aria-hidden="true"
          :class="[
            'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-fast ease-standard',
            checked ? 'border-accent bg-accent text-on-accent' : 'border-border-strong',
          ]"
        >
          <Icon v-if="checked" name="check" :size="4" />
        </span>
      </div>

      <p v-if="description" :id="ids.description" class="text-small text-text-muted">{{ description }}</p>

      <ul v-if="perks.length > 0" :id="ids.perks" class="flex flex-col gap-2">
        <li v-for="perk in perks" :key="perk" class="flex items-start gap-2 text-body text-text">
          <Icon name="check" :size="4" class="mt-1 text-accent" />
          <span>{{ perk }}</span>
        </li>
      </ul>

      <div v-if="price" :id="ids.price" class="mt-auto pt-2">
        <Price v-bind="price" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* WCAG 2.2.2: moving content can be paused. Hover or focus inside the card stops the ticker. */
.group:hover .plan-card-ticker,
.group:focus-within .plan-card-ticker {
  animation-play-state: paused;
}
</style>
