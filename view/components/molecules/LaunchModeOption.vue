<script setup lang="ts">
import type { PropType } from 'vue';

import type { AnalysisLaunchMode } from '../../types/settings';
import AppRadio from '../atoms/AppRadio.vue';

defineProps({
  description: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  label: { type: String, required: true },
  modelValue: { type: String as PropType<AnalysisLaunchMode>, required: true },
  value: { type: String as PropType<AnalysisLaunchMode>, required: true },
});

const emit = defineEmits<{
  'update:modelValue': [value: AnalysisLaunchMode];
}>();

const selectMode = (value: string) => {
  emit('update:modelValue', value as AnalysisLaunchMode);
};
</script>

<template>
  <label class="flex cursor-pointer items-start gap-3 border-t border-slate-200 px-4 py-3 transition first:border-t-0 hover:bg-slate-50">
    <AppRadio
      name="analysisLaunchMode"
      :checked="modelValue === value"
      :disabled="disabled"
      :value="value"
      @select="selectMode"
    />
    <span>
      <span class="block text-sm font-medium text-slate-900">{{ label }}</span>
      <span class="mt-0.5 block text-sm leading-5 text-slate-500">{{ description }}</span>
    </span>
  </label>
</template>
