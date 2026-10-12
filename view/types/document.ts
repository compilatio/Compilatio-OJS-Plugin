import type { IconName } from '@elastisafe/components';

export type DocumentAction =
  | {
      kind: 'play' | 'report' | 'retry';
      icon: IconName;
      label: 'launch' | 'report' | 'retry';
      url: string;
    }
  | {
      kind: 'loading';
      icon: IconName;
      label: 'queue' | 'analysing';
    };

export type Document = {
  submissionFileId: string;
};
export interface CompilatioDocument {
  submissionFileId: number;
  status: string;
  statusLabel: string;
  score: number | null;
  indexed: boolean;
  canIndex: boolean;
  retryUrl?: string;
  analyseUrl?: string;
  reportUrl?: string;
  indexingUrl?: string;
}
