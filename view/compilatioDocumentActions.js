(function () {
  var ACTION_SELECTOR = [
    '.compilatio-retry-button',
    '.compilatio-analysis-button',
    '.compilatio-report-button',
  ].join(', ');

  function clearError(errorContainer) {
    if (!errorContainer) {
      return;
    }

    errorContainer.hidden = true;
    errorContainer.textContent = '';
  }

  function showError(errorContainer, error) {
    if (!errorContainer) {
      return;
    }

    errorContainer.textContent = error.message;
    errorContainer.hidden = false;
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
      throw new Error('Compilatio n’a pas retourné de lien vers le rapport.');
    }

    if (!reportWindow) {
      throw new Error('Le navigateur a bloqué l’ouverture du rapport.');
    }

    reportWindow.location.href = result.url;
  }

  function handleAnalysisResult(container, button, result) {
    container.dataset.status = result.status;
    var label = document.createElement('span');
    label.className = 'compilatio-document-label';
    label.textContent = 'Analyse en cours';
    button.replaceWith(label);
  }

  async function handleAction(event, documentsByFileId) {
    var button = event.target.closest(ACTION_SELECTOR);
    if (!button) {
      return;
    }

    event.preventDefault();

    var container = button.closest('.compilatio-document-status');
    var errorContainer = container
      ? container.querySelector('.compilatio-document-error')
      : null;
    var isRetry = button.classList.contains('compilatio-retry-button');
    var isReport = button.classList.contains('compilatio-report-button');
    var reportWindow = isReport ? window.open('', '_blank') : null;

    if (!isReport) {
      button.disabled = true
    }

    clearError(errorContainer);

    try {
      var result = await window.pkpCompilatioDocumentsApi.post(button.dataset.url);

      if (isRetry) {
        handleRetryResult(documentsByFileId, container, result);
      } else if (isReport) {
        handleReportResult(reportWindow, result);
      } else {
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
