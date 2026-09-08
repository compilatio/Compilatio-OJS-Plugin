(function () {
  var documentsByFileId = new Map();
  var activeSubmissionId = null;

  function renderDocuments() {
    window.pkpCompilatioDocumentsTable.renderDocuments(documentsByFileId);
  }

  async function loadDocuments(submissionId) {
    try {
      var documents = await window.pkpCompilatioDocumentsApi
        .getSubmissionDocuments(submissionId);

      if (submissionId !== activeSubmissionId) {
        return;
      }

      documents.forEach(function (documentData) {
        window.pkpCompilatioDocumentsApi.addActionUrls(documentData);
        documentsByFileId.set(documentData.submissionFileId, documentData);
      });

      renderDocuments();
    } catch (error) {
      window.console.error(
        '[Compilatio] Unable to load submission documents.',
        error,
      );
    }
  }

  function synchronizeSubmission() {
    var config = window.pkpCompilatioDocumentsApi.getConfig();
    var submissionId = new URLSearchParams(window.location.search)
      .get('workflowSubmissionId');

    if (!config || !config.apiUrl || !submissionId) {
      if (activeSubmissionId === null) {
        return;
      }

      activeSubmissionId = null;
      documentsByFileId.clear();
    }

    if (submissionId === activeSubmissionId) {
      renderDocuments();
      return;
    }

    activeSubmissionId = submissionId;
    documentsByFileId.clear();
    loadDocuments(submissionId);
  }

  function initialize() {
    window.pkpCompilatioDocumentActions.register(documentsByFileId);

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
}());
