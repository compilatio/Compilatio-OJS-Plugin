(function () {
  var ACTION_SELECTOR = [
    '.compilatio-retry-button',
    '.compilatio-analysis-button',
    '.compilatio-report-button',
    '.compilatio-indexing-button',
  ].join(', ');

  function clearError(errorContainer) {
    if (!errorContainer) {
      return;
    }

    window.pkpCompilatioDocumentStatus.setError(errorContainer, null);
  }

  function showError(errorContainer, error) {
    if (!errorContainer) {
      return;
    }

    window.pkpCompilatioDocumentStatus.setError(errorContainer, error.message);
  }

  function handleRetryResult(documentsByFileId, container, result) {
    window.pkpCompilatioDocumentsApi.addActionUrls(result);
    documentsByFileId.set(result.submissionFileId, result);

    container.replaceWith(
      window.pkpCompilatioDocumentsTable.createRenderedStatus(result),
    );
  }

  function handleReportResult(reportWindow, result) {
    if (!result.url) {
      throw new Error(window.pkpCompilatioDocuments.messages.reportMissing);
    }

    if (!reportWindow) {
      throw new Error(window.pkpCompilatioDocuments.messages.reportBlocked);
    }

    reportWindow.location.href = result.url;
  }

  function handleAnalysisResult(container, button, result) {
    container.dataset.status = result.status;
    button.replaceWith(window.pkpCompilatioDocumentStatus.createLoadingButton(result.status));
  }

  async function handleAction(event, documentsByFileId) {
    var button = event.target.closest(ACTION_SELECTOR);
    if (!button || button.disabled) {
      return;
    }

    event.preventDefault();

    var container = button.closest('.compilatio-document-status');
    var errorContainer = container
      ? container.querySelector('.compilatio-document-error')
      : null;
    var isRetry = button.classList.contains('compilatio-retry-button');
    var isReport = button.classList.contains('compilatio-report-button');
    var isIndexing = button.classList.contains('compilatio-indexing-button');
    var reportWindow = isReport ? window.open('', '_blank') : null;

    if (!isReport) {
      button.disabled = true;
    }

    clearError(errorContainer);

    try {
      var result = isIndexing
        ? await window.pkpCompilatioDocumentsApi.patch(button.dataset.url, {
          indexed: 'true' !== button.dataset.indexed,
        })
        : await window.pkpCompilatioDocumentsApi.post(button.dataset.url);

      if (isIndexing) {
        var documentData = documentsByFileId.get(result.submissionFileId);
        if (documentData) {
          documentData.indexed = result.indexed;
        }
        window.pkpCompilatioDocumentStatus.updateIndexingButton(button, result.indexed);
        button.disabled = false;
      } else if (isRetry) {
        handleRetryResult(documentsByFileId, container, result);
      } else if (isReport) {
        handleReportResult(reportWindow, result);
      } else {
        var currentDocument = documentsByFileId.get(Number(container.dataset.fileId));
        if (currentDocument) {
          currentDocument.status = result.status;
        }

        handleAnalysisResult(container, button, result);
      }
    } catch (error) {
      if (reportWindow) {
        reportWindow.close();
      }

      button.disabled = false;
      showError(errorContainer, error);
    }
  }

  function register(documentsByFileId) {
    document.addEventListener('click', function (event) {
      handleAction(event, documentsByFileId);
    });
  }

  window.pkpCompilatioDocumentActions = {
    register: register,
  };
}());
