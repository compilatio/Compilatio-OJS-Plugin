<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Detection } from '../../types/settings';
import DetectionOption from '../molecules/DetectionOption.vue';
import SettingsField from '../molecules/SettingsField.vue';

const props = defineProps({
  detections: { type: Array as PropType<Detection[]>, required: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits<{
  change: [index: number, value: boolean];
}>();

const { t } = useI18n();
const visibleDetections = computed(() =>
  props.detections
    .map((detection, index) => ({ detection, index }))
    .filter(({ detection }) => 'rich_extraction' !== detection.process),
);
</script>

<template>
  <SettingsField v-if="visibleDetections.length">
    <template #label>
      <div class="text-sm">
        <p class="font-medium text-slate-900">{{ t('settings_detections') }}</p>
        <p class="mt-1 text-slate-500">
          {{ t('settings_detections_description') }}
        </p>
      </div>
    </template>

    <div class="overflow-hidden rounded-md border border-slate-200 px-4">
      <DetectionOption
        v-for="item in visibleDetections"
        :key="item.detection.process"
        :detection="item.detection"
        :disabled="disabled"
        @change="emit('change', item.index, $event)"
      />
    </div>
  </SettingsField>
</template>
