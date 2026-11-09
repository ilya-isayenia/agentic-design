<script setup lang="ts">
import { ref } from 'vue';
import { Banner, Select, BRANDS, type Brand, type Mode } from '@agentic/ui';
import { useTheme } from '@web/composables/useTheme';
import { PROMO_MESSAGE, promoEndsAt } from '@web/lib/promo';

const { brand, mode } = useTheme();
const showBanner = ref(sessionStorage.getItem('banner') !== 'dismissed');
const endsAt = promoEndsAt();

function dismissBanner() {
  showBanner.value = false;
  sessionStorage.setItem('banner', 'dismissed');
}

const brandOptions = BRANDS.map((b) => ({ value: b, label: b[0]!.toUpperCase() + b.slice(1) }));
const modeOptions = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];
</script>

<template>
  <div class="min-h-screen bg-bg text-text flex flex-col">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 bg-accent text-on-accent px-4 py-2">Skip to content</a>
    <header>
      <Banner v-if="showBanner" :message="PROMO_MESSAGE" :ends-at="endsAt" action-label="See the offer" href="#/" dismissible @dismiss="dismissBanner" />
      <div class="mx-auto flex w-full max-w-page flex-wrap items-end justify-between gap-4 px-4 py-6 md:px-8">
        <RouterLink to="/" class="font-display text-h1 font-extrabold uppercase">
          {{ brand }}<span class="sr-only"> — home</span>
        </RouterLink>
        <div class="flex gap-3" aria-label="Demo theme" role="group">
          <Select id="theme-brand" :model-value="brand" label="Brand" :options="brandOptions" @update:model-value="(v: string) => (brand = v as Brand)" />
          <Select id="theme-mode" :model-value="mode" label="Mode" :options="modeOptions" @update:model-value="(v: string) => (mode = v as Mode)" />
        </div>
      </div>
    </header>
    <div class="flex-1">
      <RouterView />
    </div>
    <footer class="mx-auto w-full max-w-page px-4 py-8 text-caption text-text-muted md:px-8">
      Demo app with invented clubs, prices and people. Nothing is charged, sent or stored.
      <RouterLink to="/legal/terms" class="underline">Membership terms</RouterLink> ·
      <RouterLink to="/legal/privacy" class="underline">Privacy notice</RouterLink>
    </footer>
  </div>
</template>
