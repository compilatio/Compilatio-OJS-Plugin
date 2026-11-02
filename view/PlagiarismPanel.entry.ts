import './tailwind.css';
import './compilatioDocumentsApi';
import './compilatioDocumentsTable';
import './compilatioDocuments';

import { h, shallowRef } from 'vue';
import DocumentFrame from './components/apps/DocumentFrame.vue';
import SettingsPanel from './components/apps/SettingsPanel.vue';
import { createI18n } from 'vue-i18n';
import { tooltipDirective } from '@elastisafe/components';
import { translationsKey } from './settings/lib/i18n';
import { messages, resolveLocale } from './locales';

window.mountCompilatioSettingsApp = (target) => {
  const locale = resolveLocale(window.pkpCompilatioDocuments.locale);
  const app = window.pkp.pkpCreateVueApp({
    render: () => h(SettingsPanel, {
      apiUrl: target.dataset.apiUrl ?? '',
      csrfToken: target.dataset.csrfToken ?? '',
    }),
  });
  app.provide(translationsKey, messages[locale]);
  app.directive('tooltip', tooltipDirective);
  app.mount(target);

  return app;
};

window.mountCompilatioDocumentApp = (target, documentData, onUpdated) => {
  const config = window.pkpCompilatioDocuments;
  const document = shallowRef(documentData);
  const app = window.pkp.pkpCreateVueApp({
    render: () =>
      h(DocumentFrame, {
        document: document.value,
        thresholds: config.thresholds,
        api: window.pkpCompilatioDocumentsApi,
        onUpdated,
      }),
  });
  app.use(createI18n({
    legacy: false,
    locale: resolveLocale(config.locale),
    fallbackLocale: 'en',
    messages,
  }));
  app.mount(target);
  return {
    unmount: () => app.unmount(),
    update: (updated: typeof documentData) => { document.value = updated; },
  };
};
window.dispatchEvent(new Event('compilatio:document-app-ready'));
