<script setup lang="ts">
// Abstract map: invented land shape and one marker per town with its club count. Not a real map;
// markers are buttons that filter the list.
import { computed } from 'vue';
import { CITIES, type Club } from '@web/data/clubs';

const props = defineProps<{ clubs: Club[]; selectedCity?: string | null }>();
const emit = defineEmits<{ select: [cityId: string | null] }>();

const markers = computed(() =>
  CITIES.map((city) => ({ ...city, count: props.clubs.filter((c) => c.cityId === city.id).length })).filter((m) => m.count > 0),
);
</script>

<template>
  <div class="relative w-full overflow-hidden border-2 border-border bg-surface" role="group" aria-label="Map of towns with clubs">
    <svg viewBox="0 0 100 60" class="block w-full" aria-hidden="true" focusable="false">
      <path class="fill-surface-raised stroke-border" stroke-width="0.4" d="M6 30 C8 14 22 6 38 8 C50 4 62 2 76 6 C90 10 96 22 94 34 C92 46 82 56 66 56 C54 58 44 54 34 56 C20 58 6 50 6 30 Z" />
      <path class="stroke-border" fill="none" stroke-width="0.3" stroke-dasharray="1 1" d="M30 22 L68 14 M30 22 L52 40 L68 14 M30 22 L18 48 L52 40" />
    </svg>
    <ul class="absolute inset-0">
      <li v-for="m in markers" :key="m.id" class="absolute -translate-x-1/2 -translate-y-1/2" :style="{ left: `${m.x}%`, top: `${(m.y / 60) * 100}%` }">
        <button
          type="button"
          :aria-pressed="selectedCity === m.id"
          :class="[
            'flex min-h-12 min-w-12 flex-col items-center justify-center rounded-full border-2 px-2 font-display font-extrabold transition-colors duration-fast',
            selectedCity === m.id ? 'bg-accent text-on-accent border-accent' : 'bg-bg text-text border-border-strong hover:border-accent',
          ]"
          @click="emit('select', selectedCity === m.id ? null : m.id)"
        >
          <span class="text-h3">{{ m.count }}</span>
          <span class="sr-only">{{ m.count === 1 ? 'club' : 'clubs' }} in</span>
          <span class="text-caption font-semibold">{{ m.name }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
