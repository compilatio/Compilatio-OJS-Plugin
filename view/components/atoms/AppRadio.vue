<script setup lang="ts">
defineProps({
  checked: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
  name: { type: String, required: true },
  value: { type: String, required: true },
});

defineEmits<{
  select: [value: string];
}>();
</script>

<template>
  <input
    type="radio"
    class="mt-1 size-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
    :checked="checked"
    :disabled="disabled"
    :name="name"
    :value="value"
    @change="$emit('select', value)"
  />
</template>
