<script setup lang="ts">
import Button from '../Button/Button.vue';
import Icon from '../Icon/Icon.vue';

defineProps<{
  /** The applied code, already normalised by the app, e.g. "TEST-10". */
  code: string;
  /** What the code does, e.g. "10% off your first 4 weeks". */
  summary: string;
}>();
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <!-- Remove sits at the right of the note and wraps under it when the line is too narrow. -->
  <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
    <p class="flex-1 font-text text-small">
      <Icon name="check-circle" :size="4" class="mr-1 align-middle text-success" /><span class="font-semibold text-success">{{ code }} applied</span> <span class="text-text-muted">{{ summary }}</span>
    </p>
    <Button variant="ghost" :aria-label="`Remove code ${code}`" @click="emit('remove')">Remove</Button>
  </div>
</template>
