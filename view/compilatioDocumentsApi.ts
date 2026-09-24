import { CompilatioDocument } from "./types/document";

(function () {
  function getConfig() {
    return window.pkpCompilatioDocuments;
  }

  function addActionUrls(documentData: CompilatioDocument) {
    const documentUrl = window.pkpCompilatioDocuments.apiUrl + '/' + documentData.submissionFileId;

    documentData.retryUrl = documentUrl + '/retry';
    documentData.analyseUrl = documentUrl + '/analyse';
    documentData.reportUrl = documentUrl + '/report';
    documentData.indexingUrl = documentUrl + '/indexing';

    return documentData;
  }

  async function getErrorMessage(response: Response) {
    try {
      const body = await response.json();
      return (
        body.errorMessage ||
        window.pkpCompilatioDocuments.messages.apiError + ' (' + response.status + ')'
      );
    } catch {
      return window.pkpCompilatioDocuments.messages.apiError + ' (' + response.status + ')';
    }
  }

  async function request(url: string, options: RequestInit) {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return response.json();
  }

  function getSubmissionDocuments(submissionId: string) {
    const config = window.pkpCompilatioDocuments;

    return request(config.apiUrl + '/submission/' + encodeURIComponent(submissionId), {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
  }

  function patch(url: string, payload: Record<string, unknown>) {
    return request(url, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Csrf-Token':
          window.pkp && window.pkp.currentUser ? window.pkp.currentUser.csrfToken : '',
      },
      body: JSON.stringify(payload),
    });
  }

  function post(url: string) {
    return request(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Csrf-Token':
          window.pkp && window.pkp.currentUser ? window.pkp.currentUser.csrfToken : '',
      },
    });
  }

  window.pkpCompilatioDocumentsApi = {
    addActionUrls: addActionUrls,
    getConfig: getConfig,
    getSubmissionDocuments: getSubmissionDocuments,
    post: post,
    patch: patch,
  };
})();
