<script setup lang="ts">
import { Comment, Fragment, Text, useId, type VNode } from 'vue';
import Icon from '../Icon/Icon.vue';

export interface ReceiptClub {
  name: string;
  address: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    club?: ReceiptClub;
    /** Force the empty state; by default it shows when there is no club and no lines. */
    empty?: boolean;
  }>(),
  { title: 'Your membership receipt', empty: undefined },
);

const slots = defineSlots<{
  /** ReceiptLine items; dashed dividers are drawn between them. */
  default?: () => VNode[];
  /** One ReceiptLine with `emphasis="total"`. */
  total?: () => VNode[];
  /** Extra content under the receipt, e.g. a referral code field. */
  footer?: () => VNode[];
}>();

const titleId = useId();

// A slot can be passed but render nothing (v-for over an empty list, v-if false), so look at what it renders.
function rendersSomething(nodes: VNode[] | undefined): boolean {
  return (nodes ?? []).some((node) => {
    if (node.type === Comment) return false;
    if (node.type === Text) return String(node.children).trim() !== '';
    if (node.type === Fragment) return rendersSomething(node.children as VNode[]);
    return true;
  });
}

// Plain functions called from the template, not computeds: a slot read outside render would not be tracked.
const hasLines = () => rendersSomething(slots.default?.());
const isEmpty = () => props.empty ?? (!props.club && !hasLines());
</script>

<template>
  <aside :aria-labelledby="titleId" class="flex w-full max-w-receipt flex-col gap-4 rounded-md border-2 border-border bg-surface p-6">
    <h2 :id="titleId" class="font-display text-body font-semibold uppercase text-text-muted">{{ title }}</h2>

    <div v-if="isEmpty()" class="flex flex-col items-center gap-3 py-8 text-center text-text-muted">
      <Icon name="dumbbell" :size="8" />
      <p class="max-w-prose text-small">Choose a club and a plan to see your price here.</p>
    </div>

    <template v-else>
      <div v-if="club" class="flex flex-col gap-1 border-b-2 border-dashed border-border pb-4">
        <p class="font-display text-h3 font-extrabold uppercase break-words">{{ club.name }}</p>
        <p class="flex items-start gap-1 text-small text-text-muted">
          <Icon name="pin" :size="4" />
          <span class="break-words">{{ club.address }}</span>
        </p>
      </div>

      <div v-if="hasLines()" class="flex flex-col divide-y-2 divide-dashed divide-border">
        <slot />
      </div>
      <p v-else class="text-small text-text-muted">Choose a plan to see your price.</p>

      <div v-if="slots.total" class="border-t-2 border-dashed border-border-strong">
        <slot name="total" />
      </div>
    </template>

    <div v-if="slots.footer" class="border-t-2 border-border pt-4">
      <slot name="footer" />
    </div>
  </aside>
</template>
