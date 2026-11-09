<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button, Icon, formatMoney } from '@agentic/ui';
import { useSignup } from '@web/composables/useSignup';

const router = useRouter();
const { state, club, clubAddress, type, access, duration, total } = useSignup();
const name = state.details.firstName;

const steps = [
  'Bring photo ID to your first visit; we check it once.',
  'Collect your member card at the desk.',
  'Book the intro session with a coach in your first two weeks.',
];

function again() {
  useSignup().reset();
  router.push({ name: 'finder' });
}
</script>

<template>
  <main id="main" tabindex="-1" class="mx-auto flex w-full max-w-page flex-col gap-8 px-4 py-8 outline-none md:px-8">
    <div class="flex flex-col gap-2">
      <p class="flex items-center gap-2 text-success"><Icon name="check-circle" /> Membership confirmed</p>
      <h1 class="font-display text-display font-extrabold uppercase">You're in{{ name ? `, ${name}` : '' }}</h1>
      <p class="max-w-prose text-text-muted">We sent the details to {{ state.details.email }}. Nothing was charged: this is a demo.</p>
    </div>

    <section aria-labelledby="summary-heading" class="flex max-w-prose flex-col gap-4 border-2 border-border bg-surface p-6">
      <h2 id="summary-heading" class="font-display text-h2 font-semibold uppercase">Summary</h2>
      <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-small">
        <dt class="text-text-muted">Club</dt>
        <dd>{{ club?.name }}<br /><span class="text-text-muted">{{ clubAddress }}</span></dd>
        <dt class="text-text-muted">Membership</dt>
        <dd>{{ type?.title }}</dd>
        <dt class="text-text-muted">Access</dt>
        <dd>{{ access?.title }}</dd>
        <dt class="text-text-muted">Duration</dt>
        <dd>{{ duration?.title }}</dd>
        <dt class="text-text-muted">First payment</dt>
        <dd class="tabular font-semibold">{{ total ? formatMoney(total.amount) : '—' }}</dd>
      </dl>
    </section>

    <section aria-labelledby="next-heading" class="flex max-w-prose flex-col gap-4">
      <h2 id="next-heading" class="font-display text-h2 font-semibold uppercase">Next steps</h2>
      <ol class="flex flex-col gap-3">
        <li v-for="(s, i) in steps" :key="s" class="flex gap-3">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-display font-extrabold text-on-accent" aria-hidden="true">{{ i + 1 }}</span>
          <span>{{ s }}</span>
        </li>
      </ol>
    </section>

    <div><Button variant="secondary" @click="again">Start a new signup</Button></div>
  </main>
</template>
