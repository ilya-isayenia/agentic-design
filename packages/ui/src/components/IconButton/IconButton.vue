<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon/Icon.vue';
import type { IconName } from '../Icon/icons';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost';
export type IconButtonSize = 'sm' | 'md';

const props = withDefaults(
  defineProps<{
    icon: IconName;
    /** Accessible name; there is no visible text. */
    label: string;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    disabled?: boolean;
    /** Toggle state; leave undefined for a plain action button. */
    pressed?: boolean;
  }>(),
  { variant: 'ghost', size: 'md', pressed: undefined },
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const variantClass = computed(() => {
  // Pressed inverts the colours in every variant, so the state does not hang on the accent hue.
  if (props.pressed) return 'bg-text text-bg border-text';
  return {
    primary: 'bg-accent text-on-accent border-accent hover:bg-accent-hover hover:border-accent-hover',
    secondary: 'bg-transparent text-text border-text hover:bg-surface-raised',
    ghost: 'bg-transparent text-text border-transparent hover:bg-surface-raised',
  }[props.variant];
});
const sizeClass = computed(() => ({ sm: 'size-8', md: 'size-12' })[props.size]);
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :aria-pressed="pressed === undefined ? undefined : pressed"
    :disabled="disabled"
    :class="[
      'inline-flex shrink-0 items-center justify-center border-2 rounded-none transition-colors duration-fast ease-standard',
      variantClass,
      sizeClass,
      disabled && 'cursor-not-allowed opacity-60',
    ]"
    @click="emit('click', $event)"
  >
    <Icon :name="icon" :size="size === 'sm' ? 4 : 6" />
  </button>
</template>
