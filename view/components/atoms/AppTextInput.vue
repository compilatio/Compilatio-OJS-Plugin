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
    class="compilatio-input"
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
