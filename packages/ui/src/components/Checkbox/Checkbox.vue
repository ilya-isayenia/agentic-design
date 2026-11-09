<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';
import Icon from '../Icon/Icon.vue';
import FieldError from '../TextField/FieldError.vue';

const model = defineModel<boolean>({ default: false });
const props = defineProps<{
  name?: string;
  value?: string;
  required?: boolean;
  /** Error message; when set the checkbox is invalid. */
  error?: string;
  disabled?: boolean;
  id?: string;
}>();
defineSlots<{ default(): unknown }>();

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);
const errorId = computed(() => `${inputId.value}-error`);

const input = useTemplateRef<HTMLInputElement>('input');
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-start gap-3">
      <!-- The native input is the visible box (appearance-none), so it keeps focus, click and the 24 px target. -->
      <span class="relative flex size-6 shrink-0 items-center justify-center">
        <input
          :id="inputId"
          ref="input"
          v-model="model"
          type="checkbox"
          :name="name"
          :value="value"
          :required="required"
          :disabled="disabled"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
          :class="[
            'peer absolute inset-0 m-0 size-6 appearance-none border-2 rounded-sm bg-surface transition-colors duration-fast ease-standard checked:border-accent checked:bg-accent',
            error ? 'border-danger' : 'border-border-strong',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          ]"
        />
        <Icon name="check" :size="4" class="pointer-events-none relative invisible text-on-accent peer-checked:visible" />
      </span>
      <label :for="inputId" :class="['text-body text-text', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']">
        <slot /><span v-if="required" aria-hidden="true"> *</span>
      </label>
    </div>
    <FieldError v-if="error" :id="errorId" :message="error" class="pl-8" />
  </div>
</template>
