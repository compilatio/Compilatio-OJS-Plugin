import type { App, Component } from 'vue';
import type { CompilatioDocument } from './document';
import type { CompilatioDocumentsApi, CompilatioDocumentsConfig } from './documentsApi';



declare global {
  interface Window {
    pkpCompilatioDocuments: CompilatioDocumentsConfig;
    pkpCompilatioDocumentsApi: CompilatioDocumentsApi;
    pkpCompilatioDocumentsTable: {
      renderDocuments(documents: Map<number, CompilatioDocument>): void;
      unmountAll(): void;
    };
    mountCompilatioDocumentApp?: (
      target: HTMLElement,
      document: CompilatioDocument,
      onUpdated: (document: CompilatioDocument) => void,
    ) => App;
    mountCompilatioSettingsApp?: (target: HTMLElement) => App;
    pkp: {
      currentUser?: { csrfToken: string };
      pkpCreateVueApp(component: Component): App;
    };
  }
}
