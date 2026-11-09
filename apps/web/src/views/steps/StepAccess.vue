<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button, PlanCard, RadioGroup, Stepper, formatMoney } from '@agentic/ui';
import { ACCESS_LEVELS, DURATIONS, WORKOUTS_PER_WEEK, type AccessLevelId } from '@web/data/plans';
import { CLUBS } from '@web/data/clubs';
import { useSignup } from '@web/composables/useSignup';
import { fromPrice, pricePerWorkout } from '@web/lib/pricing';

const emit = defineEmits<{ next: [] }>();
const { state, club } = useSignup();
const error = ref('');
const promo = DURATIONS.find((d) => d.promo)?.promo;

function clubCount(id: AccessLevelId): number {
  const home = club.value;
  if (!home) return 0;
  if (id === 'home') return 1;
  if (id === 'area') return CLUBS.filter((c) => c.area === home.area).length;
  if (id === 'city') return CLUBS.filter((c) => c.cityId === home.cityId).length;
  return CLUBS.length;
}

const cards = computed(() =>
  ACCESS_LEVELS.map((level) => {
    const price = fromPrice(state.type ?? 'regular', level.id);
    const count = clubCount(level.id);
    const perWorkout = pricePerWorkout(price.amount, state.workouts);
    const description = [`Access to ${count} ${count === 1 ? 'club' : 'clubs'}`, perWorkout !== null && `about ${formatMoney(perWorkout)} per workout`]
      .filter(Boolean)
      .join(' · ');
    return { ...level, description, price: { amount: price.amount, was: price.regular, lead: 'From', period: '4 weeks' } };
  }),
);

function choose(value: string | undefined) {
  state.access = (value ?? null) as AccessLevelId | null;
  state.duration = null;
  error.value = '';
}

function submit() {
  if (!state.access) error.value = 'Choose where you want to train';
  else emit('next');
}
</script>

<template>
  <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
    <p class="max-w-prose text-text-muted">
      More access, more clubs. Tell us how often you plan to train and each plan shows what one workout would cost you.
    </p>
    <div class="max-w-prose">
      <Stepper
        v-model="state.workouts"
        label="Workouts per week"
        :min="WORKOUTS_PER_WEEK.min"
        :max="WORKOUTS_PER_WEEK.max"
        :format="(n: number) => `${n} ${n === 1 ? 'workout' : 'workouts'} per week`"
        decrease-label="Fewer workouts"
        increase-label="More workouts"
      />
    </div>
    <RadioGroup :model-value="state.access ?? ''" legend="Where do you want to train?" :error="error" required @update:model-value="choose">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <PlanCard
          v-for="card in cards"
          :key="card.id"
          :value="card.id"
          :title="card.title"
          :description="card.description"
          :perks="card.perks"
          :price="card.price"
          :ribbon="promo?.label"
        />
      </div>
    </RadioGroup>
    <div><Button type="submit" icon-end="arrow-right">Continue</Button></div>
  </form>
</template>
