<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AnalysisLaunchMode, Detection, Thresholds } from '../../types/settings.js';
import AnalysisLaunchSettings from '../organisms/AnalysisLaunchSettings.vue';
import ApiKeySettings from '../organisms/ApiKeySettings.vue';
import DetectionSettings from '../organisms/DetectionSettings.vue';
import ThresholdSettings from '../organisms/ThresholdSettings.vue';
import Compilatiologo from '../../img/compilatio_logo.vue';
import LetimioLogo from '../../img/letimio_logo.vue';

const { t } = useI18n();
const defaultThresholds: Thresholds = { warning: 10, critical: 20 };
const unavailableSubscriptionDetections: Detection[] = [
  {
    process: 'similarity',
    enabled: true,
    configurable: false,
    availableInSubscription: true,
  },
  {
    process: 'unrecognized_text_language',
    enabled: false,
    configurable: false,
    availableInSubscription: false,
  },
  {
    process: 'ai_detection',
    enabled: false,
    configurable: false,
    availableInSubscription: false,
  },
  {
    process: 'spellchecker',
    enabled: false,
    configurable: false,
    availableInSubscription: false,
  },
  {
    process: 'rewording',
    enabled: false,
    configurable: false,
    availableInSubscription: false,
  },
];

const data = reactive({
  apiKey: '',
  apiUrl: '',
  analysisLaunchMode: 'manual' as AnalysisLaunchMode,
  automaticIndexingEnabled: false,
  bundleDetections: [] as Detection[],
  csrfToken: '',
  hasError: false,
  hasFolderRecipeParameters: false,
  isLoading: true,
  isSaving: false,
  message: '',
  scheduledAnalysisAt: '',
  thresholds: { ...defaultThresholds },
});

const canSave = computed(() => {
  if (!data.apiKey.trim()) {
    return false;
  }

  const scheduledDateIsValid = 'scheduled' !== data.analysisLaunchMode
    || Boolean(data.scheduledAnalysisAt);
  const thresholdsAreValid = Number.isInteger(data.thresholds.warning)
    && Number.isInteger(data.thresholds.critical)
    && data.thresholds.warning >= 0
    && data.thresholds.critical <= 100
    && data.thresholds.warning <= data.thresholds.critical;

  return scheduledDateIsValid && thresholdsAreValid;
});

onMounted(() => {
  const root = document.querySelector('#compilatioSettingsPanelRoot') as HTMLElement | null;

  if (!root) {
    setError(t('settings_error_initialization'));
    data.isLoading = false;
    return;
  }

  data.apiUrl = root.dataset.apiUrl || '';
  data.csrfToken = root.dataset.csrfToken || '';
  loadSettings();
});

const loadSettings = async () => {
  if (!data.apiUrl) {
    setError(t('settings_error_missing_api_url'));
    data.isLoading = false;
    return;
  }

  try {
    const response = await fetch(data.apiUrl, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(result, t('settings_error_loading')));
    }

    applySettings(result);
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : t('settings_error_loading'));
  } finally {
    data.isLoading = false;
  }
};

const saveSettings = async () => {
  if (!data.apiUrl || !data.csrfToken || !canSave.value) {
    setError(t('settings_error_required_fields'));
    return;
  }

  data.hasError = false;
  data.isSaving = true;
  data.message = '';

  try {
    const response = await fetch(data.apiUrl, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Csrf-Token': data.csrfToken,
      },
      body: JSON.stringify({
        apiKey: data.apiKey.trim(),
        automaticIndexingEnabled: data.automaticIndexingEnabled,
        analysisLaunchMode: data.analysisLaunchMode,
        bundleDetections: serializeDetections(data.bundleDetections),
        thresholds: data.thresholds,
        scheduledAnalysisAt:
          'scheduled' === data.analysisLaunchMode
            ? new Date(data.scheduledAnalysisAt).toISOString()
            : null,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(result, t('settings_error_saving')));
    }

    applySettings(result);
    data.message = t('settings_saved');
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : t('settings_error_saving'));
  } finally {
    data.isSaving = false;
  }
};

const applySettings = (settings: Record<string, unknown>) => {
  if ('string' === typeof settings.apiKey) {
    data.apiKey = settings.apiKey;
  }

  data.automaticIndexingEnabled = true === settings.automaticIndexingEnabled;
  data.analysisLaunchMode = isLaunchMode(settings.analysisLaunchMode)
    ? settings.analysisLaunchMode
    : 'manual';
  data.scheduledAnalysisAt = toLocalDateTime(
    'string' === typeof settings.scheduledAnalysisAt ? settings.scheduledAnalysisAt : null,
  );
  data.hasFolderRecipeParameters = true === settings.hasFolderRecipeParameters;
  data.bundleDetections = normalizeDetections(
    settings.bundleDetections,
    data.hasFolderRecipeParameters,
  );
  data.thresholds = normalizeThresholds(settings.thresholds);
};

const normalizeThresholds = (value: unknown): Thresholds => {
  if (!isRecord(value)) {
    return { ...defaultThresholds };
  }

  return {
    warning: 'number' === typeof value.warning
      ? value.warning
      : defaultThresholds.warning,
    critical: 'number' === typeof value.critical
      ? value.critical
      : defaultThresholds.critical,
  };
};

const serializeDetections = (detections: Detection[]): Record<string, { enabled: boolean }> =>
  Object.fromEntries(
    detections.map((detection) => [
      detection.process,
      { enabled: detection.enabled },
    ]),
  );

const normalizeDetections = (
  value: unknown,
  canConfigureDetections: boolean,
): Detection[] => {
  if (!canConfigureDetections) {
    return unavailableSubscriptionDetections.map((detection) => ({ ...detection }));
  }

  if (Array.isArray(value)) {
    return value.filter(isApiDetection).map((detection) => ({
      ...detection,
      availableInSubscription: true,
    }));
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([process, configuration]) => {
    if (!isRecord(configuration)) {
      return [];
    }

    return [{
      process,
      enabled: true === configuration.enabled,
      configurable: true === configuration.configurable,
      availableInSubscription: true,
    }];
  });
};

const isApiDetection = (
  value: unknown,
): value is Omit<Detection, 'availableInSubscription'> =>
  isRecord(value)
  && 'string' === typeof value.process
  && 'boolean' === typeof value.enabled
  && 'boolean' === typeof value.configurable;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  'object' === typeof value && null !== value;

const updateDetection = (index: number, enabled: boolean) => {
  const detection = data.bundleDetections[index];
  if (detection?.configurable) {
    detection.enabled = enabled;
  }
};

const isLaunchMode = (value: unknown): value is AnalysisLaunchMode =>
  'string' === typeof value
  && ['automatic', 'manual', 'scheduled'].includes(value);

const setError = (message: string) => {
  data.hasError = true;
  data.message = message;
};

const getErrorMessage = (result: any, fallback: string): string => {
  if ('string' === typeof result?.errorMessage) {
    return result.errorMessage;
  }

  if ('string' === typeof result?.error ) {
    return result.error;
  }

  const firstError = result?.errors ? Object.values(result.errors).flat()[0] : null;
  return 'string' === typeof firstError && null !== firstError ? firstError : fallback;
};

const toLocalDateTime = (value: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const product = window.pkpCompilatioDocuments.product;
const productStyleClass = 'compilatio' === product.id ? 'service-magister' : 'service-letimio';
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 shadow-sm" :class="productStyleClass">
    <header class="border-b border-neutral-200 px-6 py-5 sm:px-8">
      <Compilatiologo v-if="'compilatio' === product.id" class="block h-16 w-auto max-w-full"/>
      <LetimioLogo v-else class="block h-16 w-auto max-w-full"/>

      <div class="mt-5">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('settings_title', { productName: product.name }) }}</h2>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
          {{ t('settings_description') }}
        </p>
      </div>
    </header>

    <div v-if="data.isLoading" class="flex items-center gap-3 px-6 py-10 text-sm text-neutral-600 sm:px-8">
      <span class="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600"></span>
      {{ t('settings_loading') }}
    </div>

    <form v-else @submit.prevent="saveSettings">
      <div class="px-6 sm:px-8">
        <ApiKeySettings
          v-model="data.apiKey"
          :disabled="data.isSaving"
        />

        <ThresholdSettings
          v-if="data.apiKey"
          v-model:warning="data.thresholds.warning"
          v-model:critical="data.thresholds.critical"
          :disabled="data.isSaving"
        />

        <AnalysisLaunchSettings
          v-if="data.apiKey"
          v-model:automatic-indexing-enabled="data.automaticIndexingEnabled"
          v-model:launch-mode="data.analysisLaunchMode"
          v-model:scheduled-at="data.scheduledAnalysisAt"
          :disabled="data.isSaving"
        />

        <DetectionSettings
          v-if="data.apiKey"
          :detections="data.bundleDetections"
          :disabled="data.isSaving"
          @change="updateDetection"
        />
      </div>

      <div
        v-if="data.message"
        role="status"
        class="mx-6 mb-5 rounded-md border px-4 py-3 text-sm sm:mx-8"
        :class="data.hasError
          ? 'border-danger-200 bg-danger-50 text-danger-700'
          : 'border-success-200 bg-success-50 text-success-700'"
      >
        {{ data.message }}
      </div>

      <footer class="flex justify-end border-t border-neutral-200 px-6 py-4 sm:px-8">
        <button
          type="submit"
          class="compilatio-save-button"
          :disabled="data.isSaving || !canSave"
        >
          {{ data.isSaving ? t('settings_saving') : t('settings_save') }}
        </button>
      </footer>
    </form>
  </section>
</template>
