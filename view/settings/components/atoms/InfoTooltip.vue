<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div
    class="size-3.5 shrink-0 flex items-center justify-center rounded-full bg-neutral-900 text-xs text-white cursor-pointer"
    v-tooltip="text"
  >
    i
  </div>
</template>
