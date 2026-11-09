<script setup lang="ts">
import Button from '../Button/Button.vue';
import Icon from '../Icon/Icon.vue';

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    retryLabel?: string;
    /** Retry in progress: the button shows a spinner and ignores clicks. */
    retrying?: boolean;
    /** Announce the message when it appears (role="alert"). Turn off when it is on screen at page load. */
    announce?: boolean;
    headingLevel?: 2 | 3;
  }>(),
  { retryLabel: 'Try again', announce: true, headingLevel: 2 },
);

const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="flex flex-col items-center gap-4 px-4 py-8 text-center">
    <span class="inline-flex size-16 items-center justify-center rounded-full border-2 border-danger text-danger">
      <Icon name="alert" :size="8" />
    </span>
    <div :role="announce ? 'alert' : undefined" class="flex max-w-prose flex-col gap-2">
      <component :is="`h${headingLevel}`" class="font-display font-extrabold uppercase text-h2">{{ title }}</component>
      <p v-if="description" class="text-body text-text-muted">{{ description }}</p>
    </div>
    <Button variant="secondary" icon-end="refresh" :loading="retrying" @click="emit('retry')">{{ retryLabel }}</Button>
  </div>
</template>
