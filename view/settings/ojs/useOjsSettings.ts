import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useTranslations } from '../lib/i18n';
import type { DetectionConfiguration } from '../types';
import { errorMessage, initialConfiguration, isRecord, readConfiguration, readDetections, settingsPayload } from './settingsMapper';

export function useOjsSettings(apiUrl: string, csrfToken: string) {
  const { t } = useTranslations();
  const apiKey = ref('');
  const configuration = reactive(initialConfiguration());
  const detections = ref<DetectionConfiguration[]>([]);
  const isLoading = ref(true);
  const isSaving = ref(false);
  const loaded = ref(false);
  const hasError = ref(false);
  const message = ref('');
  const controller = new AbortController();

  const thresholdError = computed(() => configuration.warningThreshold > configuration.criticalThreshold);
  const canSave = computed(() => loaded.value && !isSaving.value && Boolean(apiKey.value.trim())
    && Number.isInteger(configuration.warningThreshold)
    && Number.isInteger(configuration.criticalThreshold)
    && configuration.warningThreshold >= 0 && configuration.criticalThreshold <= 100
    && !thresholdError.value
    && (configuration.autoAnalysis !== '0' || Number.isFinite(new Date(configuration.timeAnalysis).getTime())));

  function applySettings(settings: Record<string, unknown>) {
    if (typeof settings.apiKey === 'string') {
      apiKey.value = settings.apiKey;
    }
    Object.assign(configuration, readConfiguration(settings));
    detections.value = readDetections(settings);
  }

  async function request(method: 'GET' | 'PUT') {
    const fallback = t(method === 'GET' ? 'settings_error_loading' : 'settings_error_saving');
    const response = await fetch(apiUrl, {
      method,
      credentials: 'same-origin',
      signal: controller.signal,
      headers: method === 'GET' ? { Accept: 'application/json' } : {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Csrf-Token': csrfToken,
      },
      body: method === 'PUT'
        ? JSON.stringify(settingsPayload(apiKey.value, configuration, detections.value)) : undefined,
    });
    const result: unknown = await response.json();
    if (!response.ok) {
      throw new Error(errorMessage(result, fallback));
    }
    // OJS returns [] before the first API key is configured.
    if (method === 'GET' && Array.isArray(result) && result.length === 0) {
      return {};
    }
    if (!isRecord(result)) {
      throw new Error(fallback);
    }
    return result;
  }

  function showError(error: unknown, fallback: string) {
    hasError.value = true;
    message.value = error instanceof Error ? error.message : fallback;
  }

  async function load() {
    isLoading.value = true;
    hasError.value = false;
    message.value = '';
    loaded.value = false;
    try {
      if (!apiUrl) {
        throw new Error(t('settings_error_missing_api_url'));
      }
      applySettings(await request('GET'));
      loaded.value = true;
    } catch (error) {
      if (!controller.signal.aborted) {
        showError(error, t('settings_error_loading'));
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function save() {
    if (!canSave.value || !csrfToken) {
      showError(new Error(t('settings_error_required_fields')), '');
      return;
    }
    isSaving.value = true;
    hasError.value = false;
    message.value = '';
    try {
      applySettings(await request('PUT'));
      message.value = t('settings_saved');
    } catch (error) {
      if (!controller.signal.aborted) {
        showError(error, t('settings_error_saving'));
      }
    } finally {
      isSaving.value = false;
    }
  }

  onMounted(load);
  onUnmounted(() => controller.abort());

  return {
    apiKey, configuration, detections, isLoading, isSaving, loaded,
    hasError, message, thresholdError, canSave, save, load,
  };
}
