import type { CompilatioDocument } from './types/document';

(function () {
  const documentsByFileId = new Map<number, CompilatioDocument>();
  let activeSubmissionId: string | null = null;
  let refreshTimer: number | undefined;

  function renderDocuments() {
    window.pkpCompilatioDocumentsTable.renderDocuments(documentsByFileId);
  }

  async function loadDocuments(submissionId: string) {
    try {
      const documents = await window.pkpCompilatioDocumentsApi.getSubmissionDocuments(submissionId);
      if (submissionId !== activeSubmissionId) {
        return;
      }

      documentsByFileId.clear();
      documents.forEach((document) => {
        window.pkpCompilatioDocumentsApi.addActionUrls(document);
        documentsByFileId.set(document.submissionFileId, document);
      });
      renderDocuments();
    } catch (error) {
      window.console.error('[Compilatio] Unable to load submission documents.', error);
    } finally {
      if (submissionId === activeSubmissionId) {
        refreshTimer = window.setTimeout(() => loadDocuments(submissionId), 20_000);
      }
    }
  }

  function synchronizeSubmission() {
    const config = window.pkpCompilatioDocumentsApi.getConfig();
    const submissionId = config?.apiUrl
      ? new URLSearchParams(window.location.search).get('workflowSubmissionId')
      : null;

    if (submissionId === activeSubmissionId) {
      renderDocuments();
      return;
    }

    window.clearTimeout(refreshTimer);
    window.pkpCompilatioDocumentsTable.unmountAll();
    activeSubmissionId = submissionId;
    documentsByFileId.clear();
    if (submissionId) {
      void loadDocuments(submissionId);
    }
  }

  function initialize() {
    window.addEventListener('compilatio:document-app-ready', renderDocuments);
    new MutationObserver(synchronizeSubmission).observe(document.body, {
      childList: true,
      subtree: true,
    });
    window.addEventListener('popstate', synchronizeSubmission);
    window.addEventListener('pagehide', () => {
      window.clearTimeout(refreshTimer);
      activeSubmissionId = null;
    });
    window.addEventListener('pageshow', synchronizeSubmission);
    synchronizeSubmission();
  }

  if ('loading' === document.readyState) {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
