<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    name: string
    disabled?: boolean
    ariaLabel?: string
  }>(),
  {
    disabled: false,
    ariaLabel: undefined,
  },
)

const model = defineModel<boolean>({ required: true })
</script>

<template>
  <label class="relative inline-flex items-center w-12 h-6 cursor-pointer" :aria-label="ariaLabel">
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      class="peer sr-only"
      :name="name"
      value="1"
      :disabled="disabled"
    />
    <span class="absolute inset-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-primary-400 peer-disabled:opacity-50"></span>
    <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-6 peer-disabled:cursor-not-allowed"></span>
  </label>
</template>
