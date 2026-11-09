<script setup lang="ts">
// Throwaway. Imitates TextField with a control beside the input (TextField has no such slot):
// same label, hint, input classes and FieldError, plus an `action` slot on the input row.
import { computed, useId, useTemplateRef } from 'vue';
import FieldError from '../../components/TextField/FieldError.vue';

const model = defineModel<string>({ default: '' });
const props = defineProps<{ label: string; hint?: string; error?: string }>();
defineSlots<{ action?(): unknown }>();

const id = useId();
const hintId = `${id}-hint`;
const errorId = `${id}-error`;
const describedBy = computed(() => [props.hint && hintId, props.error && errorId].filter(Boolean).join(' ') || undefined);

const input = useTemplateRef<HTMLInputElement>('input');
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="text-small font-semibold text-text">{{ label }}</label>
    <p v-if="hint" :id="hintId" class="text-small text-text-muted">{{ hint }}</p>
    <div class="flex flex-wrap gap-2">
      <input
        :id="id"
        ref="input"
        v-model="model"
        type="text"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        :size="10"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="[
          'block min-h-12 flex-1 px-4 py-2 border-2 rounded-none bg-surface font-text text-body text-text transition-colors duration-fast ease-standard',
          error ? 'border-danger' : 'border-border-strong',
        ]"
      />
      <slot name="action" />
    </div>
    <FieldError v-if="error" :id="errorId" :message="error" />
  </div>
</template>
