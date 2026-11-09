<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const TITLES: Record<string, string> = { terms: 'Membership terms', privacy: 'Privacy notice', rules: 'Club rules' };
const title = computed(() => TITLES[String(route.params.page)] ?? 'Legal');
</script>

<template>
  <main id="main" tabindex="-1" class="mx-auto flex w-full max-w-page flex-col gap-4 px-4 py-8 outline-none md:px-8">
    <h1 class="font-display text-h1 font-extrabold uppercase">{{ title }}</h1>
    <p class="max-w-prose text-text-muted">This is a placeholder. The demo has no real terms, no real clubs and charges nothing.</p>
    <p><a href="#" class="underline" @click.prevent="$router.back()">Go back</a></p>
  </main>
</template>
