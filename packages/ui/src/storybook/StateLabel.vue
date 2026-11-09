<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-caption text-text-muted">{{ label }}</span>
    <slot />
  </div>
</template>
