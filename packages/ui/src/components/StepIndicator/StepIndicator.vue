<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon/Icon.vue';

export type StepStatus = 'done' | 'current' | 'upcoming';

const props = withDefaults(
  defineProps<{
    /** Step labels, in order. */
    steps: string[];
    /** 0-based index of the step on screen. */
    current: number;
    /** Indices of finished steps; default: every index before `current`. */
    completed?: number[];
    /** Name of the navigation landmark. */
    label?: string;
  }>(),
  { label: 'Signup progress' },
);

const emit = defineEmits<{ go: [index: number] }>();

const done = computed(() => new Set(props.completed ?? props.steps.map((_, i) => i).filter((i) => i < props.current)));

function status(index: number): StepStatus {
  if (index === props.current) return 'current';
  return done.value.has(index) ? 'done' : 'upcoming';
}

function go(index: number) {
  if (status(index) === 'done') emit('go', index);
}

// py-2 puts the circle centre 24 px down, where the connector (top-6) runs.
const item = 'flex min-h-12 min-w-12 flex-col items-center gap-1 px-1 py-2 text-center break-words';
const circle = 'flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-display text-small font-extrabold';
</script>

<template>
  <nav :aria-label="label" class="flex flex-col gap-2">
    <!-- Compact summary for narrow screens; the list below carries the same facts for screen readers. -->
    <p aria-hidden="true" class="flex flex-wrap items-baseline gap-2 md:hidden">
      <span class="text-caption text-text-muted">Step {{ current + 1 }} of {{ steps.length }}</span>
      <span class="font-display text-small font-semibold uppercase">{{ steps[current] }}</span>
    </p>
    <!-- Equal columns, label under the circle: five steps fit a half-width column on md without overflow. -->
    <ol class="grid grid-flow-col auto-cols-fr">
      <li v-for="(step, index) in steps" :key="index" class="relative flex justify-center">
        <!-- Connector from this circle to the next; inset by the circle radius plus a gap on both ends. -->
        <span
          v-if="index < steps.length - 1"
          aria-hidden="true"
          :class="[
            'absolute top-6 left-1/2 -right-1/2 mx-6 hidden border-t-2 md:block',
            status(index) === 'done' ? 'border-success' : 'border-border',
          ]"
        />
        <button
          v-if="status(index) === 'done'"
          type="button"
          :aria-label="`${step}, completed`"
          :class="[item, 'group rounded-sm']"
          @click="go(index)"
        >
          <span :class="[circle, 'border-success text-success']"><Icon name="check" :size="4" /></span>
          <span class="sr-only text-small group-hover:underline md:not-sr-only">{{ step }}</span>
        </button>
        <span v-else :aria-current="status(index) === 'current' ? 'step' : undefined" :class="item">
          <span
            aria-hidden="true"
            :class="[circle, status(index) === 'current' ? 'border-accent bg-accent text-on-accent' : 'border-border-strong text-text-muted']"
            >{{ index + 1 }}</span
          >
          <span
            :class="[
              'sr-only text-small md:not-sr-only',
              status(index) === 'current' ? 'font-semibold text-text' : 'text-text-muted',
            ]"
            >{{ step }}</span
          >
        </span>
      </li>
    </ol>
  </nav>
</template>
