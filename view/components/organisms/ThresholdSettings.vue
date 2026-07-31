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

  if (field === 'warning') {
    emit('update:warning', normalizedValue);
    return;
  }

  emit('update:critical', normalizedValue);
};
</script>

<template>
  <SettingsField>
    <template #label>
      <div>
        <p class="text-sm font-medium text-slate-900">{{ t('settings_thresholds') }}</p>
        <p class="mt-1 text-sm leading-5 text-slate-500">
          {{ t('settings_thresholds_description') }}
        </p>
      </div>
    </template>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block text-sm text-slate-700">
        <span class="mb-1 block font-medium">{{ t('settings_threshold_warning') }}</span>
        <input
          class="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          :disabled="disabled"
          max="100"
          min="0"
          :value="warning"
          type="number"
          @input="updateNumber('warning', $event)"
        />
      </label>

      <label class="block text-sm text-slate-700">
        <span class="mb-1 block font-medium">{{ t('settings_threshold_critical') }}</span>
        <input
          class="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
      class="mt-3 text-sm font-medium text-red-700"
      role="alert"
    >
      {{ t('settings_error_threshold_order') }}
    </p>
  </SettingsField>
</template>
