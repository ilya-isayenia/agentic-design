<script setup lang="ts">
import { computed, useId } from 'vue';
import Icon from '../Icon/Icon.vue';

const model = defineModel<number>({ default: 0 });
const props = withDefaults(
  defineProps<{
    /** Visible name of the group, e.g. "Workouts per week". */
    label: string;
    min?: number;
    max?: number;
    /** Text for the shown value, e.g. (n) => `${n} workouts per week`. */
    format?: (n: number) => string;
    decreaseLabel?: string;
    increaseLabel?: string;
  }>(),
  { min: 0, max: Number.POSITIVE_INFINITY, decreaseLabel: 'Decrease', increaseLabel: 'Increase' },
);

const labelId = useId();

const clamp = (n: number) => Math.min(props.max, Math.max(props.min, n));
const value = computed(() => clamp(model.value));
const shown = computed(() => (props.format ? props.format(value.value) : String(value.value)));
const atMin = computed(() => value.value <= props.min);
const atMax = computed(() => value.value >= props.max);

function step(delta: 1 | -1) {
  const next = clamp(value.value + delta);
  if (next !== model.value) model.value = next;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') step(1);
  else if (event.key === 'ArrowDown') step(-1);
  else return;
  event.preventDefault();
}

const buttonClass =
  'flex size-12 shrink-0 items-center justify-center border-2 border-border-strong rounded-none bg-surface text-text transition-colors duration-fast ease-standard';
const activeClass = 'cursor-pointer hover:bg-surface-raised';
const inertClass = 'cursor-not-allowed opacity-60';
</script>

<template>
  <!-- Keys bubble up from the buttons; the group itself is not a tab stop. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div role="group" :aria-labelledby="labelId" class="flex flex-col gap-2" @keydown="onKeydown">
    <span :id="labelId" class="text-small font-semibold text-text">{{ label }}</span>
    <div class="flex items-center gap-4">
      <!-- aria-disabled, not disabled: a button that becomes disabled under focus would drop focus to <body>. -->
      <button
        type="button"
        :aria-label="decreaseLabel"
        :aria-disabled="atMin || undefined"
        :class="[buttonClass, atMin ? inertClass : activeClass]"
        @click="step(-1)"
      >
        <Icon name="minus" />
      </button>
      <output :aria-labelledby="labelId" aria-live="polite" class="min-w-12 text-center font-display text-h3 font-extrabold uppercase text-text tabular">{{ shown }}</output>
      <button
        type="button"
        :aria-label="increaseLabel"
        :aria-disabled="atMax || undefined"
        :class="[buttonClass, atMax ? inertClass : activeClass]"
        @click="step(1)"
      >
        <Icon name="plus" />
      </button>
    </div>
  </div>
</template>
