<script setup lang="ts">
import { ref } from 'vue';
import { Button, PlanCard, RadioGroup } from '@agentic/ui';
import { MEMBERSHIP_TYPES, type MembershipTypeId } from '@web/data/plans';
import { useSignup } from '@web/composables/useSignup';

const emit = defineEmits<{ next: [] }>();
const { state } = useSignup();
const error = ref('');

function choose(value: string | undefined) {
  state.type = (value ?? null) as MembershipTypeId | null;
  state.access = null;
  state.duration = null;
  error.value = '';
}

function submit() {
  if (!state.type) error.value = 'Choose who the membership is for';
  else emit('next');
}
</script>

<template>
  <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
    <RadioGroup :model-value="state.type ?? ''" legend="Who is the membership for?" :error="error" required @update:model-value="choose">
      <div class="grid gap-3 md:grid-cols-3">
        <PlanCard v-for="t in MEMBERSHIP_TYPES" :key="t.id" :value="t.id" :title="t.title" :description="t.description" />
      </div>
    </RadioGroup>
    <div><Button type="submit" icon-end="arrow-right">Continue</Button></div>
  </form>
</template>
