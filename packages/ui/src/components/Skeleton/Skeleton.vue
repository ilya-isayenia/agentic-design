<script setup lang="ts">
import { computed } from 'vue';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

const props = withDefaults(
  defineProps<{
    variant?: SkeletonVariant;
    /** Number of lines for `text`; the last one is shorter. */
    lines?: number;
    /** What is loading, e.g. "plans"; read once as "Loading plans". */
    label?: string;
  }>(),
  { variant: 'text', lines: 3 },
);

const lineCount = computed(() => Math.max(1, Math.floor(props.lines)));
// `border` rather than `surface-raised`: in lumen light `surface-raised` equals `bg`, so the shape would vanish.
const rootClass = computed(
  () => ({ text: 'flex w-full flex-col gap-2', rect: 'flex h-full min-h-16 w-full', circle: 'inline-flex' })[props.variant],
);
const shape = 'bg-border animate-pulse motion-reduce:animate-none';
</script>

<template>
  <div :class="rootClass">
    <span v-if="label" role="status" class="sr-only">Loading {{ label }}</span>
    <template v-if="variant === 'text'">
      <span
        v-for="n in lineCount"
        :key="n"
        aria-hidden="true"
        :class="['block h-4 rounded-sm', shape, n === lineCount && lineCount > 1 ? 'w-2/3' : 'w-full']"
        data-skeleton-line
      />
    </template>
    <span v-else-if="variant === 'rect'" aria-hidden="true" :class="['block flex-1 rounded-md', shape]" />
    <span v-else aria-hidden="true" :class="['block size-12 rounded-full', shape]" />
  </div>
</template>
