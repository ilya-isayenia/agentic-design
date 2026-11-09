<script setup lang="ts">
// Error line shared by the form fields: alert icon + "Error:" prefix for screen readers + text,
// so an error is never shown by colour alone. Link it to the control with aria-describedby.
import Icon from '../Icon/Icon.vue';

defineProps<{ id: string; message: string }>();
</script>

<template>
  <p :id="id" class="text-small font-semibold text-danger">
    <Icon name="alert" :size="4" class="mr-1 align-middle" /><span class="sr-only">Error: </span>{{ message }}
  </p>
</template>
