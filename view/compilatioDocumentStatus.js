(function () {
  var tooltipId = 0;

  function icon(kind) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 640 640');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var paths = {
      play: 'M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z',
      report: 'M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM168 280L168 344C168 357.3 178.7 368 192 368C205.3 368 216 357.3 216 344L216 280C216 266.7 205.3 256 192 256C178.7 256 168 266.7 168 280zM248 184L248 344C248 357.3 258.7 368 272 368C285.3 368 296 357.3 296 344L296 184C296 170.7 285.3 160 272 160C258.7 160 248 170.7 248 184zM328 248L328 344C328 357.3 338.7 368 352 368C365.3 368 376 357.3 376 344L376 248C376 234.7 365.3 224 352 224C338.7 224 328 234.7 328 248z',
      retry: 'M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z',
      loading: 'M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM272 528C272 501.5 293.5 480 320 480C346.5 480 368 501.5 368 528C368 554.5 346.5 576 320 576C293.5 576 272 554.5 272 528zM112 272C138.5 272 160 293.5 160 320C160 346.5 138.5 368 112 368C85.5 368 64 346.5 64 320C64 293.5 85.5 272 112 272zM480 320C480 293.5 501.5 272 528 272C554.5 272 576 293.5 576 320C576 346.5 554.5 368 528 368C501.5 368 480 346.5 480 320zM139 433.1C157.8 414.3 188.1 414.3 206.9 433.1C225.7 451.9 225.7 482.2 206.9 501C188.1 519.8 157.8 519.8 139 501C120.2 482.2 120.2 451.9 139 433.1zM139 139C157.8 120.2 188.1 120.2 206.9 139C225.7 157.8 225.7 188.1 206.9 206.9C188.1 225.7 157.8 225.7 139 206.9C120.2 188.1 120.2 157.8 139 139zM501 433.1C519.8 451.9 519.8 482.2 501 501C482.2 519.8 451.9 519.8 433.1 501C414.3 482.2 414.3 451.9 433.1 433.1C451.9 414.3 482.2 414.3 501 433.1z',
      index: 'M483.6 56.2L360 89.3L380.7 166.6L504.3 133.4L483.6 56.2zM516.7 179.8L393.1 212.9L459.4 460.2L583 427.1L516.7 179.8zM492.4 583.8L616 550.7L595.3 473.4L471.7 506.5L492.4 583.8zM64.1 64L64.1 144L192.1 144L192.1 64L64.1 64zM64.1 192L64.1 448L192.1 448L192.1 192L64.1 192zM64.1 496L64.1 576L192.1 576L192.1 496L64.1 496zM240.1 160L240.1 576L352.1 576L352.1 160L240.1 160z',
      true: 'M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z',
      false: 'M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z'
    };
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', paths[kind]);
    svg.appendChild(path);
    if (kind === 'loading') svg.classList.add('compilatio-spinner');
    if (kind === 'play') svg.classList.add('compilatio-play-icon');
    return svg;
  }

  function createButton(className, url, label, kind) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'pkp_button ' + className;

    if (url) {
      button.dataset.url = url;
    }

    button.title = label;
    button.setAttribute('aria-label', label);
    button.appendChild(icon(kind));

    return button;
  }

  function updateIndexingButton(button, indexed) {
    var messages = window.pkpCompilatioDocuments.messages;

    button.dataset.indexed = String(indexed);
    button.title = indexed ? messages.unindex : messages.index;
    button.setAttribute('aria-label', (indexed ? messages.indexed : messages.notIndexed) + ' — ' + button.title);
    button.setAttribute('aria-pressed', String(indexed));
    button.replaceChildren(icon('index'));

    var badge = document.createElement('span');

    badge.className = 'compilatio-indexing-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.appendChild(icon(indexed ? 'true' : 'false'));

    button.appendChild(badge);
  }

  function setError(error, detail) {
    error.classList.remove('compilatio-error-open');
    error.replaceChildren();
    error.hidden = !detail;

    if (!detail) {
      return;
    }

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'compilatio-error-trigger';
    trigger.textContent = window.pkpCompilatioDocuments.messages.apiError;

    var tooltip = document.createElement('span');
    tooltip.className = 'compilatio-error-tooltip';
    tooltip.id = 'compilatio-error-' + (++tooltipId);
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = detail;

    trigger.setAttribute('aria-describedby', tooltip.id);
    trigger.addEventListener('click', function () {
      error.classList.toggle('compilatio-error-open');
    });

    trigger.addEventListener('keydown', function (event) {
      if ('Escape' === event.key) {
        error.classList.remove('compilatio-error-open');
        trigger.blur();
      }
    });

    error.appendChild(trigger);
    error.appendChild(tooltip);
  }

  function createLoadingButton(status) {
    var messages = window.pkpCompilatioDocuments.messages;
    var button = createButton('compilatio-service-button', null,
      'queue' === status ? messages.queue : messages.analysing, 'loading');

    button.disabled = true;

    return button;
  }

  function createStatus(data) {
    var messages = window.pkpCompilatioDocuments.messages;
    var container = document.createElement('span');
    container.className = 'compilatio-document-status';
    container.dataset.status = data.status;
    var logo = document.createElement('span');
    logo.className = 'compilatio-document-logo';
    logo.setAttribute('role', 'img');
    logo.setAttribute('aria-label', 'Compilatio Magister');
    container.appendChild(logo);

    var score = document.createElement('span');
    score.className = 'compilatio-document-score';
    if (null !== data.score && undefined !== data.score && Number.isFinite(Number(data.score))) {
      score.textContent = new Intl.NumberFormat(window.pkpCompilatioDocuments.locale.replace('_', '-'), {
        maximumFractionDigits: 1,
      }).format(Number(data.score)) + '%';
    }
    container.appendChild(score);

    if (data.canIndex) {
      var indexing = createButton('compilatio-indexing-button', data.indexingUrl, messages.index, 'index');
      updateIndexingButton(indexing, data.indexed);
      container.appendChild(indexing);
    }

    var action;

    switch (data.status) {
      case 'sent':
        action = createButton('compilatio-service-button compilatio-analysis-button', data.analyseUrl, messages.launch, 'play');
        break;
      case 'scored':
        action = createButton('compilatio-service-button compilatio-report-button', data.reportUrl, messages.report, 'report');
        break;
      case 'queue':
      case 'analysing':
        action = createLoadingButton(data.status);
        break;
      case 'error_sending_failed':
        action = createButton('compilatio-service-button compilatio-retry-button', data.retryUrl, messages.retry, 'retry');
        break;
      default:
        action = null;
    }

    if (action) {
      container.appendChild(action);
    }

    var error = document.createElement('span');
    error.className = 'compilatio-document-error';
    error.setAttribute('aria-live', 'polite');
    error.hidden = true;

    if (data.status.startsWith('error_')) {
      setError(error, data.statusLabel);
    }

    container.appendChild(error);

    return container;
  }

  window.pkpCompilatioDocumentStatus = {
    updateIndexingButton: updateIndexingButton,
    createLoadingButton: createLoadingButton,
    setError: setError,
    createStatus: createStatus,
  };
}());
