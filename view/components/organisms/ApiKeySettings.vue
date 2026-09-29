<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AppTextInput from '../atoms/AppTextInput.vue';
import SettingsField from '../molecules/SettingsField.vue';

defineProps({
  disabled: { type: Boolean, default: false },
  modelValue: { type: String, required: true },
});

defineEmits<{
  'update:modelValue': [value: string];
}>();

const { t } = useI18n();
</script>

<template>
  <SettingsField>
    <template #label>
      <div class="text-sm">
        <label for="compilatio-api-key" class="block font-medium text-neutral-900">
          {{ t('settings_api_key') }}
        </label>
        <p class="mt-1 text-neutral-500">
          {{ t('settings_api_key_description') }}
        </p>
      </div>
    </template>

    <AppTextInput
      id="compilatio-api-key"
      autocomplete="new-password"
      :disabled="disabled"
      :model-value="modelValue"
      name="apiKey"
      :placeholder="t('settings_api_key_placeholder')"
      type="text"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </SettingsField>
</template>
