export type AnalysisLaunchMode = 'automatic' | 'manual' | 'scheduled';

export interface Detection {
  process: string;
  enabled: boolean;
  configurable: boolean;
}
