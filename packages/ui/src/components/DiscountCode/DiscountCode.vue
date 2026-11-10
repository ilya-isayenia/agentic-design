<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import Button from '../Button/Button.vue';
import TextField from '../TextField/TextField.vue';

export type DiscountCodeStatus = 'idle' | 'applying';

const model = defineModel<string>({ default: '' });
const props = withDefaults(
  defineProps<{
    /** `applying` puts Apply in its loading state; the field stays as it is. */
    status?: DiscountCodeStatus;
    /** Message under the field row; the app writes it, including "… is still in your total." */
    error?: string;
    /** Text of the polite status region; the app sets it after every result and after a Remove on the discount line. */
    announcement?: string;
    label?: string;
    hint?: string;
  }>(),
  { status: 'idle', announcement: '', label: 'Discount code (optional)' },
);
const emit = defineEmits<{ apply: [code: string] }>();

const EMPTY = 'Enter a code to apply it.';

// The empty-submit message is this component's own; every other message comes from the app.
const emptyError = ref(false);
watch(model, () => (emptyError.value = false));
const shownError = computed(() => (emptyError.value ? EMPTY : props.error));

// The region keeps its last text until there is a new one, so clearing the empty message
// never makes an older announcement be read again.
const live = ref(props.announcement);
watch(
  () => props.announcement,
  (text) => (live.value = text),
);

function submit() {
  if (props.status === 'applying') return;
  const code = model.value.trim().toUpperCase();
  if (!code) {
    emptyError.value = true;
    // Empty the region first, so a second empty submit is announced again.
    live.value = '';
    void nextTick(() => {
      if (emptyError.value) live.value = EMPTY;
    });
    return;
  }
  emit('apply', code);
}

const field = useTemplateRef<InstanceType<typeof TextField>>('field');
defineExpose({ focus: () => field.value?.focus() });
</script>

<template>
  <!-- A form so Enter in the field applies. Never nest it in another form. -->
  <form novalidate @submit.prevent="submit">
    <TextField ref="field" v-model="model" :label="label" :hint="hint" :error="shownError" name="discount-code" autocomplete="off">
      <template #action>
        <!-- Apply is as wide while idle as while applying: a hidden loading copy shares its grid cell and sets the
             width, so the spinner never widens the button or wraps the row when a check starts. -->
        <div class="grid">
          <div class="col-start-1 row-start-1 grid">
            <Button type="submit" variant="secondary" :loading="status === 'applying'">Apply</Button>
          </div>
          <div class="invisible col-start-1 row-start-1" aria-hidden="true" inert>
            <Button variant="secondary" loading tabindex="-1">Apply</Button>
          </div>
        </div>
      </template>
    </TextField>
    <p role="status" class="sr-only">{{ live }}</p>
  </form>
</template>
