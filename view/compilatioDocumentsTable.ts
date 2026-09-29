import type { CompilatioDocument } from "./types/document";

(function () {
  const mountedApps = new Map();
  function addCompilatioHeader(row: HTMLTableRowElement) {
    const table = row.closest('table');
    const headerRow = table ? table.querySelector('thead tr') : null;

    if (!headerRow || headerRow.querySelector('.compilatio-document-header')) {
      return;
    }

    const currentHeader = headerRow.children.length > 2 ? headerRow.children[2] : null;

    if (!currentHeader) {
      return;
    }

    const header = document.createElement('th');
    header.className = currentHeader.className;
    header.classList.add('compilatio-document-header', 'w-52', 'min-w-52', 'text-start');
    header.scope = 'col';
    header.textContent = 'Compilatio';

    headerRow.insertBefore(header, currentHeader);
  }

  function getFileRow(submissionFileId: number) {
    const fileLink = document.querySelector('a[href*="submissionFileId=' + submissionFileId + '"]');

    if (!fileLink) {
      return null;
    }

    const row = fileLink.closest('tr');
    const filenameCell = fileLink.closest('th');

    return row && filenameCell ? { row: row, filenameCell: filenameCell } : null;
  }

  function getOrCreateCompilatioCell(row: HTMLTableRowElement, filenameCell: HTMLTableCellElement) {
    const existingCell = row.querySelector('.compilatio-document-cell');
    if (existingCell) {
      return existingCell;
    }

    const dateCell = filenameCell.nextElementSibling;
    const cell = document.createElement('td');
    cell.className = dateCell ? dateCell.className : '';
    cell.classList.add('compilatio-document-cell', 'w-52', 'min-w-52', 'text-start');
    row.insertBefore(cell, dateCell);

    return cell;
  }

  function cleanup(documentsByFileId: Map<number, CompilatioDocument>) {
    mountedApps.forEach(function (entry, target) {
      if (!target.isConnected || !documentsByFileId.has(entry.fileId)) {
        entry.app.unmount();
        target.remove();
        mountedApps.delete(target);
      }
    });
  }

  function renderDocuments(documentsByFileId: Map<number, CompilatioDocument>) {
    cleanup(documentsByFileId);

    const mountDocumentApp = window.mountCompilatioDocumentApp;
    if (!mountDocumentApp) {
      return;
    }

    documentsByFileId.forEach(function (documentData, submissionFileId) {
      const fileRow = getFileRow(submissionFileId);

      if (!fileRow) {
        return;
      }

      addCompilatioHeader(fileRow.row);

      const cell = getOrCreateCompilatioCell(fileRow.row, fileRow.filenameCell);
      const current = cell.querySelector('.compilatio-document-app');
    
      if (current) {
        const existing = mountedApps.get(current);

        if (existing && existing.fileId === submissionFileId) {
          return;
        }

        if (existing) {
          existing.app.unmount();
          mountedApps.delete(current);
        }

        current.remove();
      }

      const target = document.createElement('span');
      target.className = 'compilatio-document-app';
      cell.appendChild(target);

      const app = mountDocumentApp(target, documentData, function (updated) {
        documentsByFileId.set(submissionFileId, updated);
      });
      mountedApps.set(target, { app: app, fileId: submissionFileId });
    });
  }

  function unmountAll() {
    mountedApps.forEach(function (entry, target) {
      entry.app.unmount();
      target.remove();
    });
    mountedApps.clear();
  }

  window.pkpCompilatioDocumentsTable = {
    renderDocuments: renderDocuments,
    unmountAll: unmountAll,
  };
})();
