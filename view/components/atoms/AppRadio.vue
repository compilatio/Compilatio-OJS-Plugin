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
    class="mt-1 h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500"
    :checked="checked"
    :disabled="disabled"
    :name="name"
    :value="value"
    @change="$emit('select', value)"
  />
</template>
