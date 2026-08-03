<script setup lang="ts">
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Detection } from '../../types/settings';
import AppSwitch from '../atoms/AppSwitch.vue';

const props = defineProps({
  detection: { type: Object as PropType<Detection>, required: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits<{
  change: [value: boolean];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="flex min-h-12 items-center justify-between gap-4 border-t border-slate-200 py-3 first:border-t-0">
    <label
      :for="`detection_${detection.process}`"
      class="text-sm text-slate-800"
      :class="detection.configurable && detection.availableInSubscription ? 'cursor-pointer' : ''"
    >
      {{ t(`detection_${detection.process}`) }}
      <span
        v-if="!detection.availableInSubscription"
        class="mt-0.5 block text-xs italic text-slate-500"
      >
        {{ t('detection_not_in_subscription') }}
      </span>
      <span
        v-else-if="!detection.configurable"
        class="mt-0.5 block text-xs italic text-slate-500"
      >
        {{ detection.enabled ? t('detection_always_enabled') : t('detection_disabled_by_admin') }}
      </span>
    </label>

    <AppSwitch
      :id="`detection_${detection.process}`"
      :model-value="detection.enabled"
      :disabled="disabled || !detection.configurable || !detection.availableInSubscription"
      @update:model-value="emit('change', $event)"
    />
  </div>
</template>
