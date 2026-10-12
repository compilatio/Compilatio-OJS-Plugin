<script setup lang="ts">
import { Icon } from '@elastisafe/components';
import { ref, useSlots } from 'vue';

const slots = useSlots();
const displayHelp = ref(false);
</script>

<template>
  <div class="flex flex-col gap-4 border-b border-neutral-200 py-6 md:flex-row md:gap-8">
    <div class="min-w-0 md:w-60 md:shrink-0">
      <div class="flex items-start gap-2">
        <slot name="label"></slot>
        <button
          v-if="slots.help"
          type="button"
          class="mt-0.5 text-primary-600 hover:text-primary-700"
          :aria-expanded="displayHelp"
          @click="displayHelp = !displayHelp"
        >
          <Icon :name="'circle-question-solid'" class="size-4" />
        </button>
      </div>
      <div v-if="displayHelp" class="mt-2 text-xs leading-5 text-neutral-500">
        <slot name="help"></slot>
      </div>
    </div>

    <div class="w-full min-w-0 self-center md:flex-1">
      <slot></slot>
    </div>
  </div>
</template>
