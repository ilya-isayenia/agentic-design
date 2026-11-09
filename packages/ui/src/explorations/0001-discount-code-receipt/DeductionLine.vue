<script setup lang="ts">
// Throwaway. Imitates the spec's ReceiptLine with a negative amount ("−€2", read as "€2 off"),
// plus, for variants B and C, the applied state and Remove on the line itself.
import { computed } from 'vue';
import Button from '../../components/Button/Button.vue';
import Icon from '../../components/Icon/Icon.vue';
import { formatMoney } from '../../format';

const props = defineProps<{
  code: string;
  /** Cents taken off, positive. */
  off: number;
  /** With a summary the line also shows the applied state and Remove. */
  summary?: string;
}>();
const emit = defineEmits<{ remove: [] }>();

const amount = computed(() => formatMoney(props.off));
</script>

<template>
  <div class="flex flex-col gap-2 py-3">
    <div class="flex items-baseline justify-between gap-4">
      <span class="text-small">Discount {{ code }}</span>
      <span class="shrink-0 text-right tabular">
        <span class="sr-only">{{ amount }} off</span>
        <span aria-hidden="true" class="text-small font-semibold">&minus;{{ amount }}</span>
      </span>
    </div>
    <div v-if="summary" class="flex items-center justify-between gap-2">
      <p class="min-w-0 text-small">
        <Icon name="check-circle" :size="4" class="mr-1 align-middle text-success" /><span class="font-semibold text-success">Applied:</span> <span class="text-text-muted">{{ summary }}</span>
      </p>
      <div class="shrink-0"><Button variant="ghost" :aria-label="`Remove code ${code}`" @click="emit('remove')">Remove</Button></div>
    </div>
  </div>
</template>
