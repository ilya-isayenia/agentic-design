<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import IconButton from '../IconButton/IconButton.vue';
import { describeCountdown, formatCountdown, getCountdown, toDate } from './countdown';

const props = withDefaults(
  defineProps<{
    message: string;
    endsAt: Date | string;
    /** Fixed current time for stories and tests. When absent the banner ticks every second. */
    now?: Date;
    actionLabel?: string;
    href?: string;
    dismissible?: boolean;
  }>(),
  { dismissible: true },
);

const emit = defineEmits<{ dismiss: [] }>();

const clock = ref(new Date());
const countdown = computed(() => getCountdown(props.endsAt, props.now ?? clock.value));
const digits = computed(() => formatCountdown(countdown.value));
const spoken = computed(() => describeCountdown(countdown.value));
const datetime = computed(() => toDate(props.endsAt).toISOString());

let timer: ReturnType<typeof setInterval> | undefined;
function stop() {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
}
onMounted(() => {
  if (props.now || countdown.value.ended) return;
  timer = setInterval(() => {
    clock.value = new Date();
    if (countdown.value.ended) stop();
  }, 1000);
});
onBeforeUnmount(stop);
</script>

<template>
  <div class="bg-surface text-text border-b-2 border-accent">
    <div class="flex items-center gap-2 px-4 py-2">
      <div class="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
        <span v-if="countdown.lastHour" class="bg-accent text-on-accent px-2 py-1 font-display font-semibold uppercase text-caption">
          Last hour
        </span>
        <p class="text-small font-semibold">{{ message }}</p>
        <p v-if="countdown.ended" class="text-small text-text-muted">This offer has ended</p>
        <time v-else :datetime="datetime" class="flex items-baseline gap-2">
          <span class="sr-only">{{ spoken }}</span>
          <span aria-hidden="true" class="text-caption uppercase text-text-muted">Ends in</span>
          <span aria-hidden="true" class="font-display font-extrabold text-h3 tabular" data-countdown>{{ digits }}</span>
        </time>
        <a
          v-if="actionLabel && href && !countdown.ended"
          :href="href"
          class="inline-flex min-h-12 items-center font-display font-semibold uppercase text-small underline underline-offset-4"
        >
          {{ actionLabel }}
        </a>
      </div>
      <IconButton v-if="dismissible" icon="close" label="Dismiss offer" @click="emit('dismiss')" />
    </div>
  </div>
</template>
