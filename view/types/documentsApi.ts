import type { CompilatioDocument } from './document';
import type { Thresholds } from './settings';

export interface CompilatioDocumentsConfig {
  product: {
    id: string;
    name: string;
  };
  apiUrl: string;
  locale: string;
  thresholds: Thresholds;
}

export interface CompilatioDocumentsApi {
  getConfig(): CompilatioDocumentsConfig;
  addActionUrls(document: CompilatioDocument): CompilatioDocument;
  getSubmissionDocuments(submissionId: string): Promise<CompilatioDocument[]>;
  post(url: string): Promise<Partial<CompilatioDocument> & { url?: string }>;
  patch(
    url: string,
    payload: { indexed: boolean },
  ): Promise<Pick<CompilatioDocument, 'submissionFileId' | 'indexed'>>;
}
