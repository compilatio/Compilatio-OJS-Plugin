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
  <label class="relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer" :aria-label="ariaLabel">
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      class="peer/switch sr-only"
      :name="name"
      value="1"
      :disabled="disabled"
    />
    <span
      class="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-neutral-300
      transition-colors
      peer-checked/switch:bg-primary-500 
      peer-disabled/switch:opacity-50"
    ></span>
    <span
      class="absolute left-0 top-1/2 size-5.5 -translate-y-1/2 border border-neutral-500 rounded-full bg-white shadow-sm 
      transition-transform 
      peer-checked/switch:translate-x-6 peer-checked/switch:-translate-y-1/2 
      peer-disabled/switch:cursor-not-allowed peer-disabled/switch:opacity-50 
      peer-focus-visible/switch:ring-3 peer-focus-visible/switch:ring-focus/25"
    ></span>
  </label>
</template>
