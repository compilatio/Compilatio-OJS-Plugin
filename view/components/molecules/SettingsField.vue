<script setup lang="ts">
import { ref, useSlots } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

const slots = useSlots();
const displayHelp = ref(false);
</script>

<template>
  <div class="grid gap-4 border-b border-slate-200 py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-8">
    <div class="min-w-0">
      <div class="flex items-start gap-2">
        <slot name="label"></slot>
        <button
          v-if="slots.help"
          type="button"
          class="mt-0.5 text-blue-600 hover:text-blue-700"
          :aria-expanded="displayHelp"
          @click="displayHelp = !displayHelp"
        >
          <FontAwesomeIcon :icon="faCircleQuestion" />
        </button>
      </div>
      <div v-if="displayHelp" class="mt-2 text-xs leading-5 text-slate-500">
        <slot name="help"></slot>
      </div>
    </div>

    <div class="min-w-0 self-center">
      <slot></slot>
    </div>
  </div>
</template>
