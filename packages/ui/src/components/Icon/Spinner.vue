<script setup lang="ts">
withDefaults(defineProps<{ size?: 4 | 6 }>(), { size: 4 });
</script>

<template>
  <svg :class="['inline-block shrink-0 animate-spin', size === 4 ? 'size-4' : 'size-6']" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.3" stroke-width="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>
