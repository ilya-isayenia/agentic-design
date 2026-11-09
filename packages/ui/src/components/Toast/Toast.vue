<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Icon from '../Icon/Icon.vue';
import IconButton from '../IconButton/IconButton.vue';
import type { IconName } from '../Icon/icons';

export type ToastTone = 'info' | 'success' | 'danger';

const props = withDefaults(
  defineProps<{
    message: string;
    tone?: ToastTone;
    /** Milliseconds before it closes itself; 0 keeps it until closed. */
    duration?: number;
  }>(),
  { tone: 'info', duration: 5000 },
);

const emit = defineEmits<{ close: [] }>();

const TONES: Record<ToastTone, { icon: IconName; label: string; iconClass: string; borderClass: string }> = {
  info: { icon: 'info', label: 'Info', iconClass: 'text-text', borderClass: 'border-border-strong' },
  success: { icon: 'check-circle', label: 'Success', iconClass: 'text-success', borderClass: 'border-success' },
  danger: { icon: 'alert', label: 'Error', iconClass: 'text-danger', borderClass: 'border-danger' },
};
const tone = computed(() => TONES[props.tone]);

const open = ref(true);

// Auto-close timer that pauses while the pointer is over the toast or focus is inside it.
let timer: ReturnType<typeof setTimeout> | undefined;
let remaining = props.duration;
let startedAt = 0;
let hovered = false;
let focused = false;

function clear() {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}
function resume() {
  if (props.duration <= 0 || !open.value || hovered || focused || timer !== undefined) return;
  startedAt = Date.now();
  timer = setTimeout(close, remaining);
}
function pause() {
  if (timer === undefined) return;
  clear();
  remaining = Math.max(0, remaining - (Date.now() - startedAt));
}
function close() {
  clear();
  open.value = false;
}

function onPointerEnter() {
  hovered = true;
  pause();
}
function onPointerLeave() {
  hovered = false;
  resume();
}
function onFocusIn() {
  focused = true;
  pause();
}
function onFocusOut(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement;
  if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
  focused = false;
  resume();
}

onMounted(resume);
onBeforeUnmount(clear);
</script>

<template>
  <Transition
    appear
    enter-active-class="transition duration-base ease-standard motion-reduce:transition-none"
    enter-from-class="opacity-0 translate-y-2 motion-reduce:translate-y-0"
    leave-active-class="transition duration-fast ease-standard motion-reduce:transition-none"
    leave-to-class="opacity-0"
    @after-leave="emit('close')"
  >
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- hover and focus only pause the timer; the toast is not a control -->
    <div
      v-if="open"
      :role="props.tone === 'danger' ? 'alert' : 'status'"
      :class="['flex items-start gap-3 bg-surface-raised text-text border-2 rounded-md py-2 pl-4 pr-2', tone.borderClass]"
      @mouseenter="onPointerEnter"
      @mouseleave="onPointerLeave"
      @focusin="onFocusIn"
      @focusout="onFocusOut"
    >
      <span class="flex min-h-8 items-center" :class="tone.iconClass">
        <Icon :name="tone.icon" :label="tone.label" />
      </span>
      <p class="flex min-h-8 flex-1 items-center text-body">{{ message }}</p>
      <IconButton icon="close" label="Close notification" size="sm" @click="close" />
    </div>
  </Transition>
</template>
