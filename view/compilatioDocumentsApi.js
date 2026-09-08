(function () {
  function getConfig() {
    return window.pkpCompilatioDocuments;
  }

  function addActionUrls(documentData) {
    var documentUrl = getConfig().apiUrl + '/' + documentData.submissionFileId;

    documentData.retryUrl = documentUrl + '/retry';
    documentData.analyseUrl = documentUrl + '/analyse';
    documentData.reportUrl = documentUrl + '/report';

    return documentData;
  }

  async function getErrorMessage(response) {
    try {
      var body = await response.json();
      return body.errorMessage || 'Erreur Compilatio (' + response.status + ')';
    } catch (error) {
      return 'Erreur Compilatio (' + response.status + ')';
    }
  }

  async function request(url, options) {
    var response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return response.json();
  }

  function getSubmissionDocuments(submissionId) {
    var config = getConfig();

    return request(
      config.apiUrl + '/submission/' + encodeURIComponent(submissionId),
      {
        credentials: 'same-origin',
        headers: {Accept: 'application/json'},
      },
    );
  }

  function post(url) {
    return request(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Csrf-Token': window.pkp && window.pkp.currentUser
          ? window.pkp.currentUser.csrfToken
          : '',
      },
    });
  }

  window.pkpCompilatioDocumentsApi = {
    addActionUrls: addActionUrls,
    getConfig: getConfig,
    getSubmissionDocuments: getSubmissionDocuments,
    post: post,
  };
}());
