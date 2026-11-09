<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button, PlanCard, RadioGroup } from '@agentic/ui';
import { DURATIONS, type DurationId } from '@web/data/plans';
import { useSignup } from '@web/composables/useSignup';
import { planPrice } from '@web/lib/pricing';

const emit = defineEmits<{ next: [] }>();
const { state } = useSignup();
const error = ref('');

const cards = computed(() =>
  DURATIONS.map((d) => {
    const price = planPrice(state.type ?? 'regular', state.access ?? 'home', d.id);
    return { ...d, price: { amount: price.amount, was: price.regular, period: '4 weeks' } };
  }),
);

function choose(value: string | undefined) {
  state.duration = (value ?? null) as DurationId | null;
  error.value = '';
}

function submit() {
  if (!state.duration) error.value = 'Choose how long you want to commit';
  else emit('next');
}
</script>

<template>
  <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
    <p class="max-w-prose text-text-muted">A longer commitment lowers your 4-week price. Flex costs more but you can stop any month.</p>
    <RadioGroup :model-value="state.duration ?? ''" legend="How long do you want to commit?" :error="error" required @update:model-value="choose">
      <div class="grid gap-3 md:grid-cols-3">
        <PlanCard
          v-for="card in cards"
          :key="card.id"
          :value="card.id"
          :title="card.title"
          :perks="card.perks"
          :price="card.price"
          :ribbon="card.promo?.label"
        />
      </div>
    </RadioGroup>
    <div><Button type="submit" icon-end="arrow-right">Continue</Button></div>
  </form>
</template>
