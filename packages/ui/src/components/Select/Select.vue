<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';
import Icon from '../Icon/Icon.vue';
import FieldError from '../TextField/FieldError.vue';

export interface SelectOption {
  value: string;
  label: string;
}

const model = defineModel<string>({ default: '' });
const props = defineProps<{
  /** Visible label above the control. */
  label: string;
  options: SelectOption[];
  /** Disabled first option shown while nothing is chosen, e.g. "Choose a club". */
  placeholder?: string;
  name?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  autocomplete?: string;
  disabled?: boolean;
  id?: string;
}>();
const emit = defineEmits<{ blur: [event: FocusEvent] }>();

const autoId = useId();
const selectId = computed(() => props.id ?? autoId);
const hintId = computed(() => `${selectId.value}-hint`);
const errorId = computed(() => `${selectId.value}-error`);
const describedBy = computed(
  () => [props.hint && hintId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined,
);

const select = useTemplateRef<HTMLSelectElement>('select');
defineExpose({ focus: () => select.value?.focus() });
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="selectId" class="text-small font-semibold text-text">
      {{ label }}<span v-if="required" aria-hidden="true"> *</span>
    </label>
    <p v-if="hint" :id="hintId" class="text-small text-text-muted">{{ hint }}</p>
    <div class="relative">
      <select
        :id="selectId"
        ref="select"
        v-model="model"
        :name="name"
        :required="required"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="[
          'block w-full min-h-12 appearance-none py-2 pl-4 pr-12 border-2 rounded-none bg-surface font-text text-body transition-colors duration-fast ease-standard',
          error ? 'border-danger' : 'border-border-strong',
          model === '' ? 'text-text-muted' : 'text-text',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ]"
        @blur="emit('blur', $event)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value" class="text-text">{{ option.label }}</option>
      </select>
      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text">
        <Icon name="chevron-down" />
      </span>
    </div>
    <FieldError v-if="error" :id="errorId" :message="error" />
  </div>
</template>
