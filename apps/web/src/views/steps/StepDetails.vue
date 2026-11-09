<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Button, Checkbox, Icon, Select, TextField } from '@agentic/ui';
import { useSignup } from '@web/composables/useSignup';
import { FIELD_ORDER, validateDetails, validateField, type DetailsErrors, type DetailsField } from '@web/lib/details';
import { formatIban, lookupBank } from '@web/lib/iban';
import { submitDetails } from '@web/lib/api';
import { COUNTRY } from '@web/data/clubs';

const emit = defineEmits<{ next: [] }>();
const { state } = useSignup();
const d = state.details;

const errors = reactive<DetailsErrors>({});
const touched = reactive<Partial<Record<DetailsField, boolean>>>({});
const summaryErrors = ref<{ field: DetailsField; message: string }[]>([]);
const summary = ref<HTMLElement | null>(null);
const submitting = ref(false);
const failed = ref(false);
const fields: Partial<Record<DetailsField, { focus: () => void }>> = {};
const setRef = (field: DetailsField) => (el: unknown) => {
  if (el) fields[field] = el as { focus: () => void };
};

const LABELS: Record<DetailsField, string> = {
  firstName: 'First name', lastName: 'Last name', birthDate: 'Date of birth', email: 'Email',
  phoneCountry: 'Country code', phone: 'Mobile number', street: 'Street', houseNumber: 'House number',
  postcode: 'Postcode', city: 'Town or city', country: 'Country', iban: 'IBAN', bic: 'BIC', bankName: 'Bank name',
  consent: 'Terms and direct debit',
};

function check(field: DetailsField) {
  touched[field] = true;
  errors[field] = validateField(field, d);
}

// Re-check a touched field as the user fixes it, so the error clears without another blur.
watch(
  () => ({ ...d }),
  () => {
    for (const f of FIELD_ORDER) if (touched[f] && errors[f]) errors[f] = validateField(f, d);
  },
);

// BIC and bank name fill themselves for banks we know; the user can still edit them.
const bank = computed(() => lookupBank(d.iban));
watch(bank, (found) => {
  if (found) {
    d.bic = found.bic;
    d.bankName = found.name;
    errors.bic = undefined;
    errors.bankName = undefined;
  }
});

function onIbanBlur() {
  d.iban = formatIban(d.iban);
  check('iban');
}

async function submit() {
  const all = validateDetails(d);
  for (const f of FIELD_ORDER) {
    touched[f] = true;
    errors[f] = all[f];
  }
  summaryErrors.value = FIELD_ORDER.filter((f) => all[f]).map((f) => ({ field: f, message: all[f]! }));
  if (summaryErrors.value.length) {
    await nextTick();
    summary.value?.focus();
    return;
  }
  submitting.value = true;
  failed.value = false;
  try {
    await submitDetails();
    state.detailsSubmitted = true;
    emit('next');
  } catch {
    failed.value = true;
  } finally {
    submitting.value = false;
  }
}

const countries = [
  { value: 'demoland', label: COUNTRY },
  { value: 'nl', label: 'Netherlands' },
  { value: 'be', label: 'Belgium' },
  { value: 'de', label: 'Germany' },
];
const phoneCodes = ['+31', '+32', '+49', '+44'].map((c) => ({ value: c, label: c }));
</script>

<template>
  <form class="flex max-w-prose flex-col gap-8" novalidate @submit.prevent="submit">
    <p class="text-text-muted">We need these to set up your membership and the monthly direct debit. Fields marked * are required.</p>

    <div
      v-if="summaryErrors.length"
      ref="summary"
      tabindex="-1"
      role="alert"
      aria-labelledby="error-summary-title"
      class="flex flex-col gap-3 border-2 border-danger bg-surface p-4 outline-none"
    >
      <h2 id="error-summary-title" class="flex items-center gap-2 font-display text-h3 font-semibold uppercase">
        <Icon name="alert" class="text-danger" />
        Fix {{ summaryErrors.length }} {{ summaryErrors.length === 1 ? 'problem' : 'problems' }} to continue
      </h2>
      <ul class="flex flex-col gap-1">
        <li v-for="e in summaryErrors" :key="e.field">
          <a :href="`#field-${e.field}`" class="text-small underline" @click.prevent="fields[e.field]?.focus()">{{ LABELS[e.field] }}: {{ e.message }}</a>
        </li>
      </ul>
    </div>

    <fieldset class="flex flex-col gap-4">
      <legend class="mb-4 font-display text-h2 font-semibold uppercase">About you</legend>
      <div class="grid gap-4 sm:grid-cols-2">
        <TextField id="field-firstName" :ref="setRef('firstName')" v-model="d.firstName" label="First name" name="firstName" required autocomplete="given-name" :error="errors.firstName" @blur="check('firstName')" />
        <TextField id="field-lastName" :ref="setRef('lastName')" v-model="d.lastName" label="Last name" name="lastName" required autocomplete="family-name" :error="errors.lastName" @blur="check('lastName')" />
      </div>
      <TextField id="field-birthDate" :ref="setRef('birthDate')" v-model="d.birthDate" type="date" label="Date of birth" name="birthDate" required autocomplete="bday" hint="You must be 16 or older." :error="errors.birthDate" @blur="check('birthDate')" />
    </fieldset>

    <fieldset class="flex flex-col gap-4">
      <legend class="mb-4 font-display text-h2 font-semibold uppercase">Contact</legend>
      <TextField id="field-email" :ref="setRef('email')" v-model="d.email" type="email" label="Email" name="email" required autocomplete="email" :error="errors.email" @blur="check('email')" />
      <div class="grid gap-4 sm:grid-cols-3">
        <Select id="field-phoneCountry" :ref="setRef('phoneCountry')" v-model="d.phoneCountry" label="Country code" name="phoneCountry" :options="phoneCodes" required autocomplete="tel-country-code" :error="errors.phoneCountry" />
        <div class="sm:col-span-2">
          <TextField id="field-phone" :ref="setRef('phone')" v-model="d.phone" type="tel" label="Mobile number" name="phone" required inputmode="numeric" autocomplete="tel-national" hint="We send a code to this number." :error="errors.phone" @blur="check('phone')" />
        </div>
      </div>
    </fieldset>

    <fieldset class="flex flex-col gap-4">
      <legend class="mb-4 font-display text-h2 font-semibold uppercase">Address</legend>
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="sm:col-span-2">
          <TextField id="field-street" :ref="setRef('street')" v-model="d.street" label="Street" name="street" required autocomplete="address-line1" :error="errors.street" @blur="check('street')" />
        </div>
        <TextField id="field-houseNumber" :ref="setRef('houseNumber')" v-model="d.houseNumber" label="House number" name="houseNumber" required autocomplete="address-line2" :error="errors.houseNumber" @blur="check('houseNumber')" />
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <TextField id="field-postcode" :ref="setRef('postcode')" v-model="d.postcode" label="Postcode" name="postcode" required autocomplete="postal-code" :error="errors.postcode" @blur="check('postcode')" />
        <div class="sm:col-span-2">
          <TextField id="field-city" :ref="setRef('city')" v-model="d.city" label="Town or city" name="city" required autocomplete="address-level2" :error="errors.city" @blur="check('city')" />
        </div>
      </div>
      <Select id="field-country" :ref="setRef('country')" v-model="d.country" label="Country" name="country" :options="countries" placeholder="Choose a country" required autocomplete="country-name" :error="errors.country" @blur="check('country')" />
    </fieldset>

    <fieldset class="flex flex-col gap-4">
      <legend class="mb-4 font-display text-h2 font-semibold uppercase">Bank account</legend>
      <p class="text-small text-text-muted">Enter your IBAN; we fill in the BIC and bank for banks we know.</p>
      <TextField id="field-iban" :ref="setRef('iban')" v-model="d.iban" label="IBAN" name="iban" required autocomplete="off" hint="For example NL13 TEST 0123 4567 89 (a test number)." :error="errors.iban" @blur="onIbanBlur" />
      <p class="text-small text-text-muted" aria-live="polite">
        <template v-if="bank"><Icon name="check-circle" :size="4" class="text-success" /> Bank found: {{ bank.name }}</template>
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <TextField id="field-bic" :ref="setRef('bic')" v-model="d.bic" label="BIC" name="bic" required autocomplete="off" hint="8 or 11 characters." :error="errors.bic" @blur="check('bic')" />
        <TextField id="field-bankName" :ref="setRef('bankName')" v-model="d.bankName" label="Bank name" name="bankName" required autocomplete="off" :error="errors.bankName" @blur="check('bankName')" />
      </div>
    </fieldset>

    <Checkbox id="field-consent" :ref="setRef('consent')" v-model="d.consent" name="consent" required :error="errors.consent" @update:model-value="check('consent')">
      I agree to the <RouterLink to="/legal/terms" class="underline">membership terms</RouterLink>,
      the <RouterLink to="/legal/privacy" class="underline">privacy notice</RouterLink> and the
      <RouterLink to="/legal/rules" class="underline">club rules</RouterLink>, and authorise monthly direct debit from this account.
    </Checkbox>

    <p v-if="failed" role="alert" class="flex items-center gap-2 text-danger">
      <Icon name="alert" /> We couldn't save your details. Your answers are kept; try again.
    </p>
    <div><Button type="submit" :loading="submitting" icon-end="arrow-right">{{ submitting ? 'Saving' : 'Continue' }}</Button></div>
  </form>
</template>
