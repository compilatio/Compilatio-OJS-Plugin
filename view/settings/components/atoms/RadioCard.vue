<script setup lang="ts">
defineProps<{
  name: string
  value: string|boolean
  title: string
}>()

const model = defineModel<string|boolean>({ required: true })
</script>

<template>
  <label class="flex cursor-pointer items-center gap-2.5">
    <div class="relative flex items-center">
      <input
        v-model="model"
        type="radio"
        :name="name"
        :value="value"
        class="
          peer/radio 
          h-3.5 w-3.5 shrink-0 cursor-pointer appearance-none rounded-full
          border border-neutral-400 bg-neutral-200
          checked:border-primary-500 checked:bg-primary-500
          disabled:opacity-50
          transition-[border-color,background-color] duration-150
        "
      />
      <span class="
          top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          absolute bg-white w-1.5 h-1.5 rounded-full opacity-0
          peer-checked/radio:opacity-100 
          transition-opacity duration-200 
          "></span>
    </div>
    <span class="flex flex-col">
      <span class="text-sm font-semibold text-black">{{ title }}</span>
      <small v-if="$slots.default" class="mt-0.5 text-xs text-gray-500"><slot /></small>
    </span>
  </label>
</template>

