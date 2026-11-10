<script setup lang="ts">
import { FRAME } from './content/frame';
import { useTheme } from './composables/useTheme';
import Hero from './sections/Hero.vue';
import Plans from './sections/Plans.vue';

useTheme();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg text-text">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 bg-accent text-on-accent px-4 py-2">{{ FRAME.skipLink }}</a>
    <header>
      <div class="mx-auto w-full max-w-page px-4 py-6 md:px-8">
        <p class="font-display text-h2 font-extrabold uppercase">{{ FRAME.wordmark }}</p>
      </div>
    </header>
    <main id="main" tabindex="-1" class="flex-1">
      <Hero />
      <Plans />
    </main>
    <footer class="mx-auto w-full max-w-page px-4 py-8 font-text text-small md:px-8">
      <p class="max-w-prose text-text-muted">{{ FRAME.demoLine }}</p>
      <ul class="flex flex-wrap gap-4">
        <li v-for="link in FRAME.legal" :key="link.href">
          <a :href="link.href" class="inline-flex min-h-12 items-center text-text underline">{{ link.label }}</a>
        </li>
      </ul>
    </footer>
  </div>
</template>
