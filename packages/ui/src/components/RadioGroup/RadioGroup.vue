<script setup lang="ts">
import { computed, provide, useId } from 'vue';
import FieldError from '../TextField/FieldError.vue';
import { radioGroupKey } from './radioGroup';

const model = defineModel<string>();
const props = defineProps<{
  /** Question the options answer; the fieldset's name. */
  legend: string;
  /** Keeps the legend for screen readers only, when a visible heading already says the same. */
  hideLegend?: boolean;
  /** Defaults to a generated unique name. */
  name?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
}>();
defineSlots<{ default(): unknown }>();

const id = useId();
const hintId = `${id}-hint`;
const errorId = `${id}-error`;
const describedBy = computed(() => [props.hint && hintId, props.error && errorId].filter(Boolean).join(' ') || undefined);

provide(radioGroupKey, {
  name: computed(() => props.name ?? id),
  selected: computed(() => model.value),
  disabled: computed(() => props.disabled),
  required: computed(() => props.required),
  invalid: computed(() => Boolean(props.error)),
  errorId: computed(() => (props.error ? errorId : undefined)),
  select: (value) => {
    model.value = value;
  },
});
</script>

<template>
  <fieldset :disabled="disabled" :aria-describedby="describedBy" class="m-0 min-w-0 border-0 p-0">
    <legend :class="hideLegend ? 'sr-only' : 'mb-2 p-0 text-small font-semibold text-text'">
      {{ legend }}<span v-if="required" aria-hidden="true"> *</span>
    </legend>
    <div class="flex flex-col gap-2">
      <p v-if="hint" :id="hintId" class="text-small text-text-muted">{{ hint }}</p>
      <FieldError v-if="error" :id="errorId" :message="error" />
      <slot />
    </div>
  </fieldset>
</template>
