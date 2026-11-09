<script setup lang="ts">
import { computed, inject } from 'vue';
import { radioGroupKey } from '../RadioGroup/radioGroup';

const props = defineProps<{
  value: string;
  /** Visible text; the default slot replaces it. */
  label?: string;
  disabled?: boolean;
}>();
defineSlots<{ default?(): unknown }>();

const injected = inject(radioGroupKey);
if (!injected) throw new Error('Radio must be placed inside a RadioGroup.');
const group = injected;

const checked = computed(() => group.selected.value === props.value);
const inert = computed(() => props.disabled || group.disabled.value);
</script>

<template>
  <label :class="['flex min-h-12 items-start gap-3 py-3 text-body text-text', inert ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']">
    <span class="relative flex size-6 shrink-0 items-center justify-center">
      <input
        type="radio"
        :name="group.name.value"
        :value="value"
        :checked="checked"
        :disabled="inert"
        :required="group.required.value"
        :aria-invalid="group.invalid.value ? 'true' : undefined"
        :aria-describedby="group.errorId.value"
        :class="[
          'peer absolute inset-0 m-0 size-6 appearance-none rounded-full border-2 bg-surface transition-colors duration-fast ease-standard checked:border-accent',
          group.invalid.value ? 'border-danger' : 'border-border-strong',
          inert ? 'cursor-not-allowed' : 'cursor-pointer',
        ]"
        @change="group.select(value)"
      />
      <span aria-hidden="true" class="pointer-events-none relative invisible size-3 rounded-full bg-accent peer-checked:visible"></span>
    </span>
    <span><slot>{{ label }}</slot></span>
  </label>
</template>
