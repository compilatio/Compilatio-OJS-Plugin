<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AnalysisLaunchMode, Detection } from '../types/settings';
import AnalysisLaunchSettings from './organisms/AnalysisLaunchSettings.vue';
import ApiKeySettings from './organisms/ApiKeySettings.vue';
import DetectionSettings from './organisms/DetectionSettings.vue';

const { t } = useI18n();

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
});

const canSave = computed(() => {
  if (!data.apiKey.trim()) {
    return false;
  }

  return data.analysisLaunchMode !== 'scheduled' || Boolean(data.scheduledAnalysisAt);
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
        scheduledAnalysisAt:
          data.analysisLaunchMode === 'scheduled'
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
  if (typeof settings.apiKey === 'string') {
    data.apiKey = settings.apiKey;
  }

  data.automaticIndexingEnabled = settings.automaticIndexingEnabled === true;
  data.analysisLaunchMode = isLaunchMode(settings.analysisLaunchMode)
    ? settings.analysisLaunchMode
    : 'manual';
  data.scheduledAnalysisAt = toLocalDateTime(
    typeof settings.scheduledAnalysisAt === 'string' ? settings.scheduledAnalysisAt : null,
  );
  data.hasFolderRecipeParameters = settings.hasFolderRecipeParameters === true;
  data.bundleDetections = normalizeDetections(settings.bundleDetections);
};

const serializeDetections = (detections: Detection[]): Record<string, { enabled: boolean }> =>
  Object.fromEntries(
    detections.map((detection) => [
      detection.process,
      { enabled: detection.enabled },
    ]),
  );

const normalizeDetections = (value: unknown): Detection[] => {
  if (Array.isArray(value)) {
    return value.filter(isDetection);
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
      enabled: configuration.enabled === true,
      configurable: configuration.configurable === true,
    }];
  });
};

const isDetection = (value: unknown): value is Detection =>
  isRecord(value)
  && typeof value.process === 'string'
  && typeof value.enabled === 'boolean'
  && typeof value.configurable === 'boolean';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const updateDetection = (index: number, enabled: boolean) => {
  const detection = data.bundleDetections[index];
  if (detection?.configurable) {
    detection.enabled = enabled;
  }
};

const isLaunchMode = (value: unknown): value is AnalysisLaunchMode =>
  value === 'automatic' || value === 'manual' || value === 'scheduled';

const setError = (message: string) => {
  data.hasError = true;
  data.message = message;
};

const getErrorMessage = (result: any, fallback: string): string => {
  if (typeof result?.errorMessage === 'string') {
    return result.errorMessage;
  }

  if (typeof result?.error === 'string') {
    return result.error;
  }

  const firstError = result?.errors ? Object.values(result.errors).flat()[0] : null;
  return typeof firstError === 'string' ? firstError : fallback;
};

const toLocalDateTime = (value: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
    <header class="border-b border-slate-200 px-6 py-5 sm:px-8">
      <img
        src="../img/compilatio_logo.svg"
        :alt="t('settings_logo_alt')"
        class="h-10 w-auto"
      />
      <div class="mt-5">
        <h2 class="text-xl font-semibold tracking-tight">{{ t('settings_title') }}</h2>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          {{ t('settings_description') }}
        </p>
      </div>
    </header>

    <div v-if="data.isLoading" class="flex items-center gap-3 px-6 py-10 text-sm text-slate-600 sm:px-8">
      <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></span>
      {{ t('settings_loading') }}
    </div>

    <form v-else @submit.prevent="saveSettings">
      <div class="px-6 sm:px-8">
        <ApiKeySettings
          v-model="data.apiKey"
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
          v-if="data.apiKey && data.hasFolderRecipeParameters"
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
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-green-200 bg-green-50 text-green-700'"
      >
        {{ data.message }}
      </div>

      <footer class="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
        <button
          type="submit"
          class="inline-flex min-w-36 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="data.isSaving || !canSave"
        >
          {{ data.isSaving ? t('settings_saving') : t('settings_save') }}
        </button>
      </footer>
    </form>
  </section>
</template>
