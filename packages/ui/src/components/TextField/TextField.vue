<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';
import FieldError from './FieldError.vue';

export type TextFieldType = 'text' | 'email' | 'tel' | 'password' | 'url' | 'search' | 'date' | 'number';
export type TextFieldInputmode = 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search' | 'none';

const model = defineModel<string>({ default: '' });
const props = withDefaults(
  defineProps<{
    /** Visible label above the input. Required: placeholders are never labels. */
    label: string;
    type?: TextFieldType;
    name?: string;
    required?: boolean;
    /** Help text under the label, read after the label. */
    hint?: string;
    /** Error message; when set the field is invalid. */
    error?: string;
    autocomplete?: string;
    inputmode?: TextFieldInputmode;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    /** Overrides the generated id, e.g. for links from an error summary. */
    id?: string;
    maxlength?: number;
  }>(),
  { type: 'text' },
);
const emit = defineEmits<{ blur: [event: FocusEvent] }>();
const slots = defineSlots<{
  /** Inside the input on the right: a spinner or a check mark. Not interactive. */
  end?(): unknown;
  /** One control after the input on the same row, outside its border, e.g. an Apply button. */
  action?(): unknown;
}>();

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);
const hintId = computed(() => `${inputId.value}-hint`);
const errorId = computed(() => `${inputId.value}-error`);
const describedBy = computed(
  () => [props.hint && hintId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined,
);

const input = useTemplateRef<HTMLInputElement>('input');
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="inputId" class="text-small font-semibold text-text">
      {{ label }}<span v-if="required" aria-hidden="true"> *</span>
    </label>
    <p v-if="hint" :id="hintId" class="text-small text-text-muted">{{ hint }}</p>
    <!-- With an action the row wraps: the input keeps at least three fifths of the row, otherwise the action goes under it. -->
    <div :class="slots.action && 'flex flex-wrap gap-2'">
      <div :class="['relative', slots.action && 'grow basis-3/5']">
        <input
          :id="inputId"
          ref="input"
          v-model="model"
          :type="type"
          :name="name"
          :required="required"
          :autocomplete="autocomplete"
          :inputmode="inputmode"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="describedBy"
          :class="[
            'block w-full min-h-12 px-4 py-2 border-2 rounded-none font-text text-body text-text placeholder:text-text-muted transition-colors duration-fast ease-standard',
            error ? 'border-danger' : 'border-border-strong',
            readonly ? 'bg-surface-raised' : 'bg-surface',
            disabled && 'cursor-not-allowed opacity-60',
            slots.end && 'pr-12',
          ]"
          @blur="emit('blur', $event)"
        />
        <span v-if="slots.end" class="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted">
          <slot name="end" />
        </span>
      </div>
      <div v-if="slots.action" class="shrink-0">
        <slot name="action" />
      </div>
    </div>
    <FieldError v-if="error" :id="errorId" :message="error" />
  </div>
</template>
