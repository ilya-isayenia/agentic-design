<script setup lang="ts">
// Throwaway sketch of the spec's DiscountCode: the form, an optional applied row and the polite status region.
// `showApplied` is the only switch between variants: A shows the applied row here, B and C show it on the receipt line.
import { computed, ref, useTemplateRef, watch } from 'vue';
import Button from '../../components/Button/Button.vue';
import Icon from '../../components/Icon/Icon.vue';
import FieldWithApply from './FieldWithApply.vue';

const model = defineModel<string>({ default: '' });
const props = withDefaults(
  defineProps<{
    status?: 'idle' | 'applying';
    error?: string;
    appliedCode?: string;
    appliedSummary?: string;
    announcement?: string;
    showApplied?: boolean;
  }>(),
  { status: 'idle', appliedCode: '', announcement: '' },
);
const emit = defineEmits<{ apply: [code: string]; remove: [] }>();

const EMPTY = 'Enter a code to apply it.';
const emptyError = ref('');
watch(model, () => (emptyError.value = ''));

const shownError = computed(() => emptyError.value || props.error);
const live = computed(() => emptyError.value || props.announcement);

function submit() {
  if (props.status === 'applying') return;
  const code = model.value.trim().toUpperCase();
  if (!code) {
    emptyError.value = EMPTY;
    return;
  }
  emit('apply', code);
}

const field = useTemplateRef<InstanceType<typeof FieldWithApply>>('field');
defineExpose({ focus: () => field.value?.focus() });
</script>

<template>
  <form novalidate class="flex flex-col gap-3" @submit.prevent="submit">
    <div v-if="showApplied && appliedCode" class="flex items-center justify-between gap-2">
      <p class="flex min-w-0 items-start gap-2 text-small">
        <Icon name="check-circle" class="text-success" />
        <span class="flex flex-col">
          <span class="font-semibold text-success">{{ appliedCode }} applied</span>
          <span class="text-text-muted">{{ appliedSummary }}</span>
        </span>
      </p>
      <div class="shrink-0"><Button variant="ghost" :aria-label="`Remove code ${appliedCode}`" @click="emit('remove')">Remove</Button></div>
    </div>

    <FieldWithApply
      ref="field"
      v-model="model"
      label="Discount code (optional)"
      hint="One code at a time. We take it off your first 4 weeks."
      :error="shownError"
    >
      <template #action>
        <Button type="submit" variant="secondary" :loading="status === 'applying'">Apply</Button>
      </template>
    </FieldWithApply>

    <p role="status" class="sr-only">{{ live }}</p>
  </form>
</template>
