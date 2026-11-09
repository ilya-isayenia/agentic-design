<script setup lang="ts">
// Renders the slot once per brand × mode. Used by every component's Matrix story,
// which visual tests and axe run on, so all six themes are checked in one canvas.
import { THEMES } from '../themes';

withDefaults(defineProps<{ columns?: 1 | 2 | 3 }>(), { columns: 2 });
</script>

<template>
  <div :class="['grid', columns === 1 ? 'grid-cols-1' : columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3']">
    <section
      v-for="theme in THEMES"
      :key="`${theme.brand}-${theme.mode}`"
      :data-brand="theme.brand"
      :data-mode="theme.mode"
      :aria-label="`${theme.brand} ${theme.mode}`"
      class="bg-bg text-text p-6 flex flex-col gap-4"
    >
      <p class="font-display text-small uppercase text-text-muted">{{ theme.brand }} · {{ theme.mode }}</p>
      <slot :brand="theme.brand" :mode="theme.mode" />
    </section>
  </div>
</template>
