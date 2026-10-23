import type { ConfigurationState, DetectionConfiguration } from '../types';
import { detectionIcon } from '../lib/detectionMeta';

const defaultProcesses = [
  'similarity',
  'unrecognized_text_language',
  'ai_detection',
  'spellchecker',
  'rewording',
];

export function initialConfiguration(): ConfigurationState {
  return {
    autoAnalysis: '2',
    timeAnalysis: '',
    defaultIndexing: false,
    studentReport: 'certificate',
    studentReportEnabled: false,
    warningThreshold: 10,
    criticalThreshold: 20,
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readConfiguration(settings: Record<string, unknown>): ConfigurationState {
  const thresholds = isRecord(settings.thresholds) ? settings.thresholds : {};

  return {
    ...initialConfiguration(),
    autoAnalysis: settings.analysisLaunchMode === 'automatic' ? '1'
      : settings.analysisLaunchMode === 'scheduled' ? '0' : '2',
    timeAnalysis: toLocalDateTime(settings.scheduledAnalysisAt),
    defaultIndexing: settings.automaticIndexingEnabled === true,
    warningThreshold: typeof thresholds.warning === 'number' ? thresholds.warning : 10,
    criticalThreshold: typeof thresholds.critical === 'number' ? thresholds.critical : 20,
  };
}

export function readDetections(settings: Record<string, unknown>): DetectionConfiguration[] {
  if (settings.hasFolderRecipeParameters !== true) {
    return defaultProcesses.map((process) => ({
      process,
      iconName: detectionIcon(process),
      enabled: process === 'similarity',
      configurable: false,
    }));
  }

  const value = settings.bundleDetections;
  const detections = Array.isArray(value) ? value
    : isRecord(value) ? Object.entries(value).map(([process, configuration]) => (
      isRecord(configuration) ? { ...configuration, process } : null
    )) : [];

  return detections.flatMap((detection) => {
    if (!isRecord(detection) || typeof detection.process !== 'string'
      || typeof detection.enabled !== 'boolean' || typeof detection.configurable !== 'boolean') {
      return [];
    }

    return [{
      process: detection.process,
      iconName: detectionIcon(detection.process),
      enabled: detection.enabled,
      configurable: detection.configurable,
    }];
  });
}

export function settingsPayload(
  apiKey: string,
  configuration: ConfigurationState,
  detections: DetectionConfiguration[],
) {
  return {
    apiKey: apiKey.trim(),
    automaticIndexingEnabled: configuration.defaultIndexing,
    analysisLaunchMode: configuration.autoAnalysis === '1' ? 'automatic'
      : configuration.autoAnalysis === '0' ? 'scheduled' : 'manual',
    scheduledAnalysisAt: configuration.autoAnalysis === '0'
      ? new Date(configuration.timeAnalysis).toISOString() : null,
    thresholds: {
      warning: configuration.warningThreshold,
      critical: configuration.criticalThreshold,
    },
    bundleDetections: Object.fromEntries(detections.map(({ process, enabled }) => [
      process, { enabled },
    ])),
  };
}

export function errorMessage(result: unknown, fallback: string): string {
  if (!isRecord(result)) {
    return fallback;
  }
  if (typeof result.errorMessage === 'string') {
    return result.errorMessage;
  }
  if (typeof result.error === 'string') {
    return result.error;
  }
  const firstError = isRecord(result.errors) ? Object.values(result.errors).flat()[0] : null;
  return typeof firstError === 'string' ? firstError : fallback;
}

function toLocalDateTime(value: unknown): string {
  if (typeof value !== 'string' || !value) {
    return '';
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return '';
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
