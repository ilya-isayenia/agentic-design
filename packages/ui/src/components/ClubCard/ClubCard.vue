<script setup lang="ts">
import { useId } from 'vue';
import Button from '../Button/Button.vue';
import Chip from '../Chip/Chip.vue';
import Icon from '../Icon/Icon.vue';
import Price from '../Price/Price.vue';

export interface ClubPrice {
  /** Cents per 4 weeks. */
  amount: number;
  /** Cents before the promo. */
  was?: number;
}

withDefaults(
  defineProps<{
    name: string;
    address: string;
    perks?: string[];
    price: ClubPrice;
    /** Promo strip across the bottom of the photo. */
    ribbon?: string;
    /** Scroll the ribbon text as a ticker; it stays still under reduced motion. */
    ribbonMoving?: boolean;
    headingLevel?: 2 | 3;
    /** Highlight, e.g. while the club's pin is hovered on the map. */
    selected?: boolean;
  }>(),
  { perks: () => [], headingLevel: 3, ribbonMoving: false, selected: false },
);

const emit = defineEmits<{ info: []; join: [] }>();

const headingId = useId();
// Two halves of identical copies: the ticker keyframes move by -50%, so the loop is seamless.
const TICKER_COPIES = 10;
</script>

<template>
  <article
    :aria-labelledby="headingId"
    :class="[
      'flex flex-col overflow-hidden rounded-md border-2 bg-surface transition-colors duration-fast ease-standard',
      selected ? 'border-accent' : 'border-border',
    ]"
  >
    <!-- DOM order puts the heading first for screen readers; the photo is moved to the top visually. -->
    <div class="flex flex-col gap-4 p-4">
      <component :is="`h${headingLevel}`" :id="headingId" class="font-display text-h3 font-extrabold uppercase break-words">
        {{ name }}
      </component>
      <p class="flex items-start gap-1 text-small text-text-muted">
        <Icon name="pin" :size="4" />
        <span class="break-words">{{ address }}</span>
      </p>
      <ul v-if="perks.length" class="flex flex-wrap gap-2">
        <li v-for="perk in perks" :key="perk"><Chip :label="perk" /></li>
      </ul>
      <!-- The visual ribbon is aria-hidden; its text is read here, before the price it explains. -->
      <p v-if="ribbon" class="sr-only">{{ ribbon }}</p>
      <Price :amount="price.amount" :was="price.was" lead="From" period="4 weeks" />
      <div class="flex flex-wrap gap-2">
        <Button variant="secondary" icon-end="arrow-right" class="grow" @click="emit('info')">
          More info<span class="sr-only"> about {{ name }}</span>
        </Button>
        <Button icon-end="arrow-right" class="grow" @click="emit('join')">
          Join now<span class="sr-only"> at {{ name }}</span>
        </Button>
      </div>
    </div>

    <div class="relative order-first aspect-video overflow-hidden bg-surface-raised">
      <!-- Abstract placeholder; no club photos in this project. -->
      <svg aria-hidden="true" focusable="false" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" class="size-full">
        <path d="M0 90 L52 34 L104 90 Z" class="fill-border" />
        <path d="M70 90 L118 46 L160 78 L160 90 Z" class="fill-border-strong" />
        <circle cx="128" cy="24" r="11" class="fill-accent" />
        <path d="M0 62 L160 14 M0 74 L160 26" class="stroke-border" stroke-width="2" fill="none" />
        <rect x="14" y="12" width="26" height="6" class="fill-chart-2" />
        <rect x="14" y="22" width="16" height="6" class="fill-chart-3" />
      </svg>
      <div v-if="ribbon" aria-hidden="true" class="absolute inset-x-0 bottom-0 overflow-hidden bg-accent py-1 font-display text-small font-semibold uppercase text-on-accent">
        <p v-if="!ribbonMoving" class="px-4">{{ ribbon }}</p>
        <p v-else class="flex w-max animate-ticker motion-reduce:animate-none">
          <span v-for="n in TICKER_COPIES" :key="n" class="shrink-0 px-4">{{ ribbon }}</span>
        </p>
      </div>
    </div>
  </article>
</template>
