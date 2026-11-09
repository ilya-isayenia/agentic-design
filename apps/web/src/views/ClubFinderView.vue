<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, ClubCard, EmptyState, ErrorState, Icon, Skeleton, TextField } from '@agentic/ui';
import ClubMap from '@web/components/ClubMap.vue';
import { COUNTRY, CITIES, addressOf, type Club } from '@web/data/clubs';
import { fromPrice } from '@web/lib/pricing';
import { searchClubs } from '@web/lib/api';

type Status = 'loading' | 'ready' | 'error';

const router = useRouter();
const query = ref('');
const searched = ref('');
const status = ref<Status>('loading');
const clubs = ref<Club[]>([]);
const city = ref<string | null>(null);
const selected = ref<string | null>(null);
let controller: AbortController | null = null;

async function search() {
  controller?.abort();
  controller = new AbortController();
  status.value = 'loading';
  city.value = null;
  try {
    clubs.value = await searchClubs(query.value, controller.signal);
    searched.value = query.value.trim();
    status.value = 'ready';
  } catch (error) {
    if ((error as Error).name !== 'AbortError') status.value = 'error';
  }
}

onMounted(search);

const visible = computed(() => (city.value ? clubs.value.filter((c) => c.cityId === city.value) : clubs.value));
const summary = computed(() => {
  const n = visible.value.length;
  const noun = n === 1 ? 'club' : 'clubs';
  if (city.value) return `${n} ${noun} in ${CITIES.find((c) => c.id === city.value)?.name}`;
  return searched.value ? `${n} ${noun} match “${searched.value}”` : `${n} ${noun} in ${COUNTRY}`;
});

function showAll() {
  query.value = '';
  search();
}

function join(club: Club) {
  router.push({ name: 'signup', params: { clubId: club.id, step: 'type' } });
}

const price = (club: Club) => {
  const p = fromPrice('regular', 'home');
  return club.ribbon ? { amount: p.amount, was: p.regular } : { amount: p.regular };
};
</script>

<template>
  <main id="main" tabindex="-1" class="mx-auto flex w-full max-w-page flex-col gap-8 px-4 pb-12 outline-none md:px-8">
    <div class="flex flex-col gap-2">
      <h1 class="font-display text-display font-extrabold uppercase">Find your club</h1>
      <p class="max-w-prose text-text-muted">Pick the club you will train at most. Your plan can include more clubs later.</p>
    </div>

    <form role="search" class="flex max-w-prose flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="search">
      <div class="flex-1">
        <TextField v-model="query" label="Postcode or town" name="q" autocomplete="postal-code" hint="For example AR 1010 or Belmar">
          <template #end><Icon name="search" /></template>
        </TextField>
      </div>
      <Button type="submit" class="sm:mb-6">Search</Button>
    </form>

    <div class="grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="results-heading" class="flex flex-col gap-4" :aria-busy="status === 'loading'">
        <h2 id="results-heading" class="font-display text-h3 font-semibold uppercase" aria-live="polite">
          {{ status === 'ready' ? summary : status === 'loading' ? 'Looking for clubs…' : 'Clubs' }}
        </h2>

        <div v-if="status === 'loading'" class="flex flex-col gap-4">
          <Skeleton variant="rect" label="clubs" />
          <Skeleton variant="rect" />
        </div>

        <ErrorState
          v-else-if="status === 'error'"
          title="We couldn't load the clubs"
          description="Check your connection and try again."
          :heading-level="3"
          @retry="search"
        />

        <EmptyState
          v-else-if="visible.length === 0"
          icon="search"
          :title="`No clubs match “${searched}”`"
          description="Check the spelling or try a town name."
          :heading-level="3"
        >
          <template #action><Button variant="secondary" @click="showAll">Show all clubs</Button></template>
        </EmptyState>

        <ul v-else class="flex flex-col gap-4">
          <li v-for="club in visible" :key="club.id">
            <ClubCard
              :name="club.name"
              :address="addressOf(club)"
              :perks="club.perks"
              :price="price(club)"
              :ribbon="club.ribbon"
              :selected="selected === club.id"
              @info="selected = selected === club.id ? null : club.id"
              @join="join(club)"
            />
          </li>
        </ul>
      </section>

      <section aria-labelledby="map-heading" class="order-first flex flex-col gap-4 lg:order-none lg:sticky lg:top-4 lg:self-start">
        <h2 id="map-heading" class="font-display text-h3 font-semibold uppercase">Towns</h2>
        <ClubMap :clubs="clubs" :selected-city="city" @select="(id) => (city = id)" />
        <p class="text-small text-text-muted">Pick a town to see only its clubs. The map is a sketch, not to scale.</p>
      </section>
    </div>
  </main>
</template>
