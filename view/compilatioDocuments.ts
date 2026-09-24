import type { CompilatioDocument } from './types/document';

(function () {
  const documentsByFileId = new Map<number, CompilatioDocument>();
  let activeSubmissionId: string | null = null;

  function renderDocuments() {
    window.pkpCompilatioDocumentsTable.renderDocuments(documentsByFileId);
  }

  async function loadDocuments(submissionId: string) {
    try {
      const documents = await window.pkpCompilatioDocumentsApi.getSubmissionDocuments(submissionId);

      if (submissionId !== activeSubmissionId) {
        return;
      }

      documents.forEach(function (documentData: CompilatioDocument) {
        window.pkpCompilatioDocumentsApi.addActionUrls(documentData);
        documentsByFileId.set(documentData.submissionFileId, documentData);
      });

      renderDocuments();
    } catch (error) {
      window.console.error('[Compilatio] Unable to load submission documents.', error);
    }
  }

  function synchronizeSubmission() {
    const config = window.pkpCompilatioDocumentsApi.getConfig();
    const submissionId = new URLSearchParams(window.location.search).get('workflowSubmissionId');

    if (!config || !config.apiUrl || !submissionId) {
      if (null === activeSubmissionId) {
        return;
      }

      activeSubmissionId = null;
      documentsByFileId.clear();
      window.pkpCompilatioDocumentsTable.unmountAll();
      return;
    }

    if (submissionId === activeSubmissionId) {
      renderDocuments();
      return;
    }

    window.pkpCompilatioDocumentsTable.unmountAll();
    activeSubmissionId = submissionId;
    documentsByFileId.clear();
    loadDocuments(submissionId);
  }

  function initialize() {
    window.addEventListener('compilatio:document-app-ready', renderDocuments);

    new MutationObserver(synchronizeSubmission).observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('popstate', synchronizeSubmission);
    synchronizeSubmission();
  }

  if ('loading' === document.readyState) {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
