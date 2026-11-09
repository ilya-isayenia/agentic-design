<script setup lang="ts">
import Icon from '../Icon/Icon.vue';
import type { IconName } from '../Icon/icons';

withDefaults(
  defineProps<{
    icon?: IconName;
    title: string;
    description?: string;
    headingLevel?: 2 | 3;
  }>(),
  { headingLevel: 2 },
);

defineSlots<{ action?: () => unknown }>();
</script>

<template>
  <div class="flex flex-col items-center gap-4 px-4 py-8 text-center">
    <span v-if="icon" class="inline-flex size-16 items-center justify-center rounded-full border-2 border-border text-text-muted">
      <Icon :name="icon" :size="8" />
    </span>
    <div class="flex max-w-prose flex-col gap-2">
      <component :is="`h${headingLevel}`" class="font-display font-extrabold uppercase text-h2">{{ title }}</component>
      <p v-if="description" class="text-body text-text-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="flex flex-wrap justify-center gap-4">
      <slot name="action" />
    </div>
  </div>
</template>
