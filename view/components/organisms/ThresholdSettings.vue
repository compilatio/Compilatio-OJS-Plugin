<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import SettingsField from '../molecules/SettingsField.vue';

const props = defineProps({
  critical: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  warning: { type: Number, required: true },
});

const emit = defineEmits<{
  'update:critical': [value: number];
  'update:warning': [value: number];
}>();

const { t } = useI18n();
const warningExceedsCritical = computed(() => props.warning > props.critical);

const updateNumber = (field: 'critical' | 'warning', event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  const normalizedValue = Number.isFinite(value) ? value : 0;

  if ('warning' === field) {
    emit('update:warning', normalizedValue);
    return;
  }

  emit('update:critical', normalizedValue);
};
</script>

<template>
  <SettingsField>
    <template #label>
      <div class="text-sm">
        <p class="font-medium text-neutral-900">{{ t('settings_thresholds') }}</p>
        <p class="mt-1 text-neutral-500">
          {{ t('settings_thresholds_description') }}
        </p>
      </div>
    </template>

    <div class="grid gap-4 text-sm text-neutral-700 sm:grid-cols-2">
      <label>
        <span class="mb-1 block font-medium">{{ t('settings_threshold_warning') }}</span>
        <input
          class="compilatio-input"
          :disabled="disabled"
          max="100"
          min="0"
          :value="warning"
          type="number"
          @input="updateNumber('warning', $event)"
        />
      </label>

      <label>
        <span class="mb-1 block font-medium">{{ t('settings_threshold_critical') }}</span>
        <input
          class="compilatio-input"
          :disabled="disabled"
          max="100"
          :min="warning"
          :value="critical"
          type="number"
          @input="updateNumber('critical', $event)"
        />
      </label>
    </div>

    <p
      v-if="warningExceedsCritical"
      class="mt-3 text-sm font-medium text-danger-700"
      role="alert"
    >
      {{ t('settings_error_threshold_order') }}
    </p>
  </SettingsField>
</template>
