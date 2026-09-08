(function () {
  function createLabel(text) {
    var label = document.createElement('span');
    label.className = 'compilatio-document-label';
    label.textContent = text;

    return label;
  }

  function createButton(className, url, text) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'pkp_button ' + className;
    button.dataset.url = url;
    button.textContent = text;

    return button;
  }

  function appendSendingFailedStatus(container, documentData) {
    container.appendChild(createLabel(documentData.statusLabel));
    container.appendChild(createButton(
      'compilatio-retry-button',
      documentData.retryUrl,
      'Renvoyer',
    ));
  }

  function appendSentStatus(container, documentData) {
    container.appendChild(createButton(
      'compilatio-analysis-button',
      documentData.analyseUrl,
      'Lancer l’analyse',
    ));
  }

  function appendScoredStatus(container, documentData) {
    var reportLabel = null !== documentData.score && undefined !== documentData.score
      ? Number(documentData.score).toFixed(1) + '%'
      : 'Voir le rapport';
    var reportButton = createButton(
      'compilatio-report-button',
      documentData.reportUrl,
      reportLabel,
    );
    reportButton.classList.add('compilatio-document-score');
    container.appendChild(reportButton);
  }

  function appendDefaultStatus(container, documentData) {
    container.appendChild(createLabel(documentData.statusLabel));
  }

  function appendErrorContainer(container) {
    var error = document.createElement('span');
    error.className = 'compilatio-document-error';
    error.setAttribute('role', 'alert');
    error.hidden = true;
    container.appendChild(error);
  }

  function createStatus(documentData) {
    var container = document.createElement('span');
    container.className = 'compilatio-document-status';
    container.dataset.status = documentData.status;

    var logo = document.createElement('span');
    logo.className = 'compilatio-document-logo';
    logo.setAttribute('aria-hidden', 'true');
    container.appendChild(logo);

    var content = document.createElement('span');
    content.className = 'compilatio-document-content';
    container.appendChild(content);

    if ('error_sending_failed' === documentData.status) {
      appendSendingFailedStatus(content, documentData);
    } else if ('sent' === documentData.status) {
      appendSentStatus(content, documentData);
    } else if ('scored' === documentData.status) {
      appendScoredStatus(content, documentData);
    } else {
      appendDefaultStatus(content, documentData);
    }

    appendErrorContainer(content);

    return container;
  }

  window.pkpCompilatioDocumentStatus = {
    createStatus: createStatus,
  };
}());
