<script setup lang="ts">
import { computed } from 'vue';
import { ICONS, type IconName } from './icons';

const props = withDefaults(defineProps<{ name: IconName; size?: 4 | 6 | 8; label?: string }>(), { size: 6 });
const path = computed(() => ICONS[props.name]);
const sizeClass = computed(() => ({ 4: 'size-4', 6: 'size-6', 8: 'size-8' })[props.size]);
</script>

<template>
  <svg
    :class="['inline-block shrink-0', sizeClass]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <path :d="path" />
  </svg>
</template>
