<script setup lang="ts">
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AnalysisLaunchMode } from '../../types/settings';
import AppSwitch from '../atoms/AppSwitch.vue';
import AppTextInput from '../atoms/AppTextInput.vue';
import LaunchModeOption from '../molecules/LaunchModeOption.vue';
import SettingsField from '../molecules/SettingsField.vue';

defineProps({
  automaticIndexingEnabled: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
  launchMode: { type: String as PropType<AnalysisLaunchMode>, required: true },
  scheduledAt: { type: String, required: true },
});

defineEmits<{
  'update:automaticIndexingEnabled': [value: boolean];
  'update:launchMode': [value: AnalysisLaunchMode];
  'update:scheduledAt': [value: string];
}>();

const { t } = useI18n();

const launchModes: Array<{
  value: AnalysisLaunchMode;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: 'automatic',
    labelKey: 'settings_launch_mode_automatic',
    descriptionKey: 'settings_launch_mode_automatic_description',
  },
  {
    value: 'manual',
    labelKey: 'settings_launch_mode_manual',
    descriptionKey: 'settings_launch_mode_manual_description',
  },
  {
    value: 'scheduled',
    labelKey: 'settings_launch_mode_scheduled',
    descriptionKey: 'settings_launch_mode_scheduled_description',
  },
];
</script>

<template>
  <SettingsField>
    <template #label>
      <div>
        <p class="text-sm font-medium text-slate-900">{{ t('settings_automatic_indexing') }}</p>
        <p class="mt-1 text-sm leading-5 text-slate-500">
          {{ t('settings_automatic_indexing_description') }}
        </p>
      </div>
    </template>

    <div class="flex items-center gap-3">
      <AppSwitch
        id="automatic-indexing"
        :disabled="disabled"
        :model-value="automaticIndexingEnabled"
        @update:model-value="$emit('update:automaticIndexingEnabled', $event)"
      />
      <label for="automatic-indexing" class="cursor-pointer text-sm text-slate-700">
        {{ automaticIndexingEnabled ? t('common_enabled') : t('common_disabled') }}
      </label>
    </div>
  </SettingsField>

  <SettingsField>
    <template #label>
      <div>
        <p class="text-sm font-medium text-slate-900">{{ t('settings_launch_mode') }}</p>
        <p class="mt-1 text-sm leading-5 text-slate-500">
          {{ t('settings_launch_mode_description') }}
        </p>
      </div>
    </template>

    <div class="overflow-hidden rounded-md border border-slate-200">
      <LaunchModeOption
        v-for="mode in launchModes"
        :key="mode.value"
        :description="t(mode.descriptionKey)"
        :disabled="disabled"
        :label="t(mode.labelKey)"
        :model-value="launchMode"
        :value="mode.value"
        @update:model-value="$emit('update:launchMode', $event)"
      />
    </div>
  </SettingsField>

  <SettingsField v-if="launchMode === 'scheduled'">
    <template #label>
      <div>
        <label for="compilatio-scheduled-at" class="block text-sm font-medium text-slate-900">
          {{ t('settings_scheduled_at') }}
        </label>
        <p class="mt-1 text-sm leading-5 text-slate-500">
          {{ t('settings_scheduled_at_description') }}
        </p>
      </div>
    </template>

    <AppTextInput
      id="compilatio-scheduled-at"
      :disabled="disabled"
      :model-value="scheduledAt"
      required
      type="datetime-local"
      @update:model-value="$emit('update:scheduledAt', $event)"
    />
  </SettingsField>
</template>
