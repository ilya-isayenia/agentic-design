<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon/Icon.vue';
import type { IconName } from '../Icon/icons';

export type ChipTone = 'neutral' | 'accent';

const props = withDefaults(
  defineProps<{
    /** Text of the chip; the default slot overrides it. */
    label?: string;
    /** Decorative icon before the label. */
    icon?: IconName;
    tone?: ChipTone;
    /** `span` = static tag (perks); `button` = toggle filter. */
    as?: 'span' | 'button';
    /** Only for `as="button"`: whether the filter is on. */
    pressed?: boolean;
  }>(),
  { tone: 'neutral', as: 'span', pressed: false },
);

const emit = defineEmits<{ toggle: [pressed: boolean] }>();
defineSlots<{ default?: () => unknown }>();

// Text stays `text` or `text-muted`: accent is only guaranteed 3:1, so it colours the border, never the words.
const staticClass = computed(() =>
  props.tone === 'accent' ? 'border-accent text-text' : 'border-border text-text-muted',
);
// A pressed filter gets a filled background and a check, so the state is not carried by colour alone.
const toggleClass = computed(() =>
  props.pressed
    ? 'bg-accent border-accent text-on-accent hover:bg-accent-hover hover:border-accent-hover'
    : 'bg-transparent border-border-strong text-text hover:bg-surface-raised',
);
const shownIcon = computed<IconName | undefined>(() => (props.as === 'button' && props.pressed ? 'check' : props.icon));
</script>

<template>
  <button
    v-if="as === 'button'"
    type="button"
    :aria-pressed="pressed"
    :class="[
      'inline-flex min-h-8 items-center gap-1 rounded-full border-2 px-3 text-small font-semibold transition-colors duration-fast ease-standard',
      toggleClass,
    ]"
    @click="emit('toggle', !pressed)"
  >
    <Icon v-if="shownIcon" :name="shownIcon" :size="4" />
    <slot>{{ label }}</slot>
  </button>
  <span
    v-else
    :class="['inline-flex items-center gap-1 rounded-full border bg-transparent px-2 py-1 text-caption font-semibold', staticClass]"
  >
    <Icon v-if="shownIcon" :name="shownIcon" :size="4" />
    <slot>{{ label }}</slot>
  </span>
</template>
