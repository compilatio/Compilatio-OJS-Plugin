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
    class="group relative inline-flex h-5 w-10 shrink-0 items-center justify-center rounded-full bg-transparent focus:outline-none [&>[data-circle]]:focus:ring-1 [&>[data-circle]]:focus:ring-blue-500 [&>[data-circle]]:focus:ring-offset-2"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out"
      :class="modelValue ? 'bg-blue-400' : 'bg-gray-200'"
    ></span>
    <span
      data-circle
      aria-hidden="true"
      class="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-300 bg-white shadow transition-transform duration-200 ease-in-out"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
    ></span>
  </button>
</template>
