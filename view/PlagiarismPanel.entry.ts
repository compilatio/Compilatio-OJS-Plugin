import './tailwind.css';
import './compilatioDocumentsApi';
import './compilatioDocumentsTable';
import './compilatioDocuments';

import { h } from 'vue';
import DocumentFrame from './components/DocumentFrame.vue';
import { createI18n } from 'vue-i18n';
import SettingsPanel from './components/SettingsPanel.vue';
import en from './locales/en.js';
import fr from './locales/fr.js';

window.mountCompilatioSettingsApp = (target) => {
  const documentLocale = document.documentElement.lang || 'fr';
  const locale = documentLocale.replace('_', '-').split('-')[0];
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'fr',
    messages: { en, fr },
  });

  const app = window.pkp.pkpCreateVueApp(SettingsPanel);
  app.use(i18n);
  app.mount(target);

  return app;
};

window.mountCompilatioDocumentApp = (target, documentData, onUpdated) => {
  const config = window.pkpCompilatioDocuments;
  const locale = (config.locale || document.documentElement.lang || 'fr').replace('_', '-');
  const app = window.pkp.pkpCreateVueApp({
    render: () =>
      h(DocumentFrame, {
        document: documentData,
        thresholds: config.thresholds,
        api: window.pkpCompilatioDocumentsApi,
        onUpdated,
      }),
  });
  app.use(
    createI18n({
      legacy: false,
      locale,
      messages: { [locale]: config.messages },
    }),
  );
  app.mount(target);
  return app;
};
window.dispatchEvent(new Event('compilatio:document-app-ready'));
