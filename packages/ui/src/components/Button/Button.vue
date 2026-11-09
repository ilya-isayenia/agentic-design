<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon/Icon.vue';
import Spinner from '../Icon/Spinner.vue';
import type { IconName } from '../Icon/icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
    iconEnd?: IconName;
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

// Loading keeps the button focusable (aria-disabled) so focus is not lost mid-submit.
const inert = computed(() => props.disabled || props.loading);

const variantClass = computed(
  () =>
    ({
      primary: 'bg-accent text-on-accent border-accent hover:bg-accent-hover hover:border-accent-hover',
      secondary: 'bg-transparent text-text border-text hover:bg-surface-raised',
      ghost: 'bg-transparent text-text border-transparent underline underline-offset-4 hover:bg-surface-raised',
    })[props.variant],
);
const sizeClass = computed(
  () =>
    ({
      sm: 'min-h-8 px-3 text-small gap-1',
      md: 'min-h-12 px-6 text-body gap-2',
      lg: 'min-h-16 px-8 text-h3 gap-2',
    })[props.size],
);

function onClick(event: MouseEvent) {
  if (inert.value) {
    event.preventDefault();
    return;
  }
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-disabled="loading || undefined"
    :aria-busy="loading || undefined"
    :class="[
      'inline-flex items-center justify-center border-2 rounded-none font-display font-semibold uppercase transition-colors duration-fast ease-standard',
      variantClass,
      sizeClass,
      block && 'w-full',
      inert && 'cursor-not-allowed opacity-60',
    ]"
    @click="onClick"
  >
    <Spinner v-if="loading" />
    <slot />
    <Icon v-if="iconEnd && !loading" :name="iconEnd" :size="size === 'sm' ? 4 : 6" />
  </button>
</template>
