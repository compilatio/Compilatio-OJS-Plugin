<script setup lang="ts">
import { Icon } from '@elastisafe/components'

withDefaults(
  defineProps<{
    headingId: string
    title: string
    description?: string
    defaultOpen?: boolean
  }>(),
  {
    description: undefined,
    defaultOpen: true,
  },
)
</script>

<template>
  <details class="overflow-hidden group rounded-2xl bg-white border border-neutral-300 shadow-sm" :open="defaultOpen">
    <summary
      class="flex items-center justify-between gap-3.5 list-none p-3 bg-neutral-100 border-b-0 border-neutral-300 outline-none cursor-pointer 
      focus-visible:ring-3 focus-visible:ring-focus/25 
      [&::-webkit-details-marker]:hidden
      group-open:border-b"
    >
      <div class="flex-1">
        <h2 :id="headingId" class="text-xl font-bold tracking-tight text-heading">{{ title }}</h2>
        <p v-if="description" class="mt-1 text-sm font-normal text-gray-500">{{ description }}</p>
      </div>
      <div
        class="shrink-0 transition-transform duration-150 group-open:rotate-90"
        aria-hidden="true"
      >
        <Icon name="chevron-right" />
      </div>
    </summary>
    <div class="px-5 pb-6 sm:px-7">
      <slot />
    </div>
  </details>
</template>
