(function () {
  function addCompilatioHeader(row) {
    var table = row.closest('table');
    var headerRow = table ? table.querySelector('thead tr') : null;

    if (!headerRow || headerRow.querySelector('.compilatio-document-header')) {
      return;
    }

    var currentHeader = headerRow.children.length > 2
      ? headerRow.children[2]
      : null;

    if (!currentHeader) {
      return;
    }

    var header = document.createElement('th');
    header.className = currentHeader.className;
    header.classList.add('compilatio-document-header');
    header.scope = 'col';
    header.textContent = 'Compilatio';

    headerRow.insertBefore(header, currentHeader);
  }

  function getFileRow(submissionFileId) {
    var fileLink = document.querySelector(
      'a[href*="submissionFileId=' + submissionFileId + '"]',
    );

    if (!fileLink) {
      return null;
    }

    var row = fileLink.closest('tr');
    var filenameCell = fileLink.closest('th');

    return row && filenameCell ? {row: row, filenameCell: filenameCell} : null;
  }

  function getOrCreateCompilatioCell(row, filenameCell) {
    var existingCell = row.querySelector('.compilatio-document-cell');
    if (existingCell) {
      return existingCell;
    }

    var dateCell = filenameCell.nextElementSibling;
    var cell = document.createElement('td');
    cell.className = dateCell ? dateCell.className : '';
    cell.classList.add('compilatio-document-cell');
    row.insertBefore(cell, dateCell);

    return cell;
  }

  function createRenderedStatus(documentData) {
    var status = window.pkpCompilatioDocumentStatus.createStatus(documentData);
    status.dataset.fileId = String(documentData.submissionFileId);
    status.dataset.rendered = 'document';

    return status;
  }

  function renderDocument(documentData, submissionFileId) {
    var fileRow = getFileRow(submissionFileId);
    if (!fileRow) {
      return;
    }

    addCompilatioHeader(fileRow.row);

    var cell = getOrCreateCompilatioCell(fileRow.row, fileRow.filenameCell);
    var currentStatus = cell.querySelector('.compilatio-document-status');
    var statusIsCurrent = currentStatus
      && currentStatus.dataset.fileId === String(submissionFileId)
      && 'document' === currentStatus.dataset.rendered;

    if (statusIsCurrent) {
      return;
    }

    if (currentStatus) {
      currentStatus.remove();
    }

    cell.appendChild(createRenderedStatus(documentData));
  }

  function renderDocuments(documentsByFileId) {
    documentsByFileId.forEach(renderDocument);
  }

  window.pkpCompilatioDocumentsTable = {
    createRenderedStatus: createRenderedStatus,
    renderDocuments: renderDocuments,
  };
}());
