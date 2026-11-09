<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { StepIndicator } from '@agentic/ui';
import { STEPS, useSignup, type StepId } from '@web/composables/useSignup';
import SignupReceipt from '@web/components/SignupReceipt.vue';
import StepType from './steps/StepType.vue';
import StepAccess from './steps/StepAccess.vue';
import StepDuration from './steps/StepDuration.vue';
import StepDetails from './steps/StepDetails.vue';
import StepVerify from './steps/StepVerify.vue';

const route = useRoute();
const router = useRouter();
const signup = useSignup();

const stepId = computed(() => route.params.step as StepId);
const index = computed(() => STEPS.findIndex((s) => s.id === stepId.value));
const components = { type: StepType, access: StepAccess, duration: StepDuration, details: StepDetails, verify: StepVerify };
const heading = ref<HTMLHeadingElement | null>(null);

// Focus moves to the new step's heading, so keyboard and screen-reader users start at the top of the step.
watch(stepId, async () => {
  await nextTick();
  heading.value?.focus();
});

function go(i: number) {
  const step = STEPS[i];
  if (step) router.push({ name: 'signup', params: { clubId: route.params.clubId, step: step.id } });
}

function next() {
  if (index.value === STEPS.length - 1) router.push({ name: 'success' });
  else go(index.value + 1);
}
</script>

<template>
  <div class="flex flex-col">
    <div class="border-y-2 border-border bg-surface">
      <div class="mx-auto w-full max-w-page px-4 py-4 md:px-8">
        <StepIndicator :steps="STEPS.map((s) => s.label)" :current="index" :completed="signup.done.value.filter((i) => i !== index)" @go="go" />
      </div>
    </div>
    <div class="mx-auto grid w-full max-w-page gap-8 px-4 py-8 md:px-8 lg:grid-cols-3">
      <main id="main" tabindex="-1" class="flex flex-col gap-6 outline-none lg:col-span-2">
        <h1 ref="heading" tabindex="-1" class="font-display text-h1 font-extrabold uppercase outline-none">
          {{ index + 1 }}. {{ STEPS[index]?.label }}
        </h1>
        <component :is="components[stepId]" :key="stepId" @next="next" />
      </main>
      <div class="lg:sticky lg:top-4 lg:self-start">
        <SignupReceipt />
      </div>
    </div>
  </div>
</template>
