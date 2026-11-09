<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Button, Spinner, TextField, Toast } from '@agentic/ui';
import { useSignup } from '@web/composables/useSignup';
import { SMS, sendSmsCode, verifySmsCode, type SmsSession } from '@web/lib/api';

type Phase = 'sending' | 'waiting' | 'checking' | 'wrong' | 'expired';

const emit = defineEmits<{ next: [] }>();
const { state } = useSignup();
const code = ref('');
const phase = ref<Phase>('sending');
const session = ref<SmsSession | null>(null);
const now = ref(Date.now());
const toast = ref('');
const field = ref<{ focus: () => void } | null>(null);
const timer = setInterval(() => (now.value = Date.now()), 1000);
onUnmounted(() => clearInterval(timer));

const phone = computed(() => `${state.details.phoneCountry} ${state.details.phone}`);
const resendIn = computed(() => (session.value ? Math.max(0, Math.ceil((session.value.sentAt + SMS.resendAfterMs - now.value) / 1000)) : 0));
const validFor = computed(() => (session.value ? Math.max(0, Math.ceil((session.value.expiresAt - now.value) / 1000)) : 0));
const expired = computed(() => phase.value === 'expired' || (session.value !== null && validFor.value === 0));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const error = computed(() => {
  if (expired.value) return 'This code has expired. Send a new one.';
  if (phase.value === 'wrong') return 'That code is not right. Check the SMS and try again.';
  return undefined;
});

async function send(again = false) {
  phase.value = 'sending';
  code.value = '';
  session.value = await sendSmsCode();
  now.value = Date.now();
  phase.value = 'waiting';
  if (again) toast.value = `We sent a new code to ${phone.value}.`;
  field.value?.focus();
}

async function verify() {
  if (!session.value || expired.value) return;
  phase.value = 'checking';
  const result = await verifySmsCode(code.value, session.value);
  if (result === 'ok') {
    state.verified = true;
    emit('next');
  } else {
    phase.value = result;
    field.value?.focus();
  }
}

onMounted(() => send());
</script>

<template>
  <form class="flex max-w-prose flex-col gap-6" novalidate @submit.prevent="verify">
    <p v-if="phase === 'sending'" class="flex items-center gap-2 text-text-muted" role="status"><Spinner /> Sending a code to {{ phone }}…</p>
    <p v-else class="text-text-muted">We sent a 6-digit code to {{ phone }}. It is valid for 2 minutes.</p>

    <TextField
      ref="field"
      v-model="code"
      label="Code from the SMS"
      name="code"
      inputmode="numeric"
      autocomplete="one-time-code"
      :maxlength="6"
      required
      :disabled="phase === 'sending'"
      :hint="session && !expired ? `Valid for ${clock(validFor)}. Demo code: 123456.` : undefined"
      :error="error"
    />

    <div class="flex flex-wrap items-center gap-4">
      <Button type="submit" :loading="phase === 'checking'" :disabled="phase === 'sending' || expired" icon-end="arrow-right">Verify and join</Button>
      <Button variant="ghost" :disabled="phase === 'sending' || (resendIn > 0 && !expired)" @click="send(true)">
        {{ resendIn > 0 && !expired ? `Send a new code in ${clock(resendIn)}` : 'Send a new code' }}
      </Button>
    </div>

    <div class="fixed bottom-4 right-4 z-10">
      <Toast v-if="toast" :message="toast" tone="success" @close="toast = ''" />
    </div>
  </form>
</template>
