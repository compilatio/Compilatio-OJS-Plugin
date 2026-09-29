<script setup lang="ts">
defineProps({
  modelValue: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
});

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<template>
  <button
    type="button"
    class="group relative inline-flex h-5 w-10 items-center justify-center rounded-full bg-transparent focus:outline-none"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out"
      :class="modelValue ? 'bg-primary-400' : 'bg-neutral-200'"
    ></span>
    <span
      aria-hidden="true"
      class="compilatio-switch-thumb"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
    ></span>
  </button>
</template>
