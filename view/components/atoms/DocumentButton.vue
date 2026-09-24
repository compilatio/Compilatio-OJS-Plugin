<script setup lang="ts">
defineProps({
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});
defineEmits(['click']);
</script>

<template>
  <button
    type="button"
    class="pkp_button compilatio-icon-button compilatio-focus disabled:cursor-default disabled:opacity-65"
    :title="label"
    :aria-label="label"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
