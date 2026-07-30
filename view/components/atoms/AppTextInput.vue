<script setup lang="ts">
defineProps({
  autocomplete: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  modelValue: { type: String, required: true },
  name: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};
</script>

<template>
  <input
    class="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :name="name"
    :placeholder="placeholder"
    :required="required"
    :type="type"
    :value="modelValue"
    @input="handleInput"
  />
</template>
