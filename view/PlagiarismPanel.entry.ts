import './tailwind.css';
import './compilatioDocumentsApi';
import './compilatioDocumentsTable';
import './compilatioDocuments';

import { h } from 'vue';
import DocumentFrame from './components/apps/DocumentFrame.vue';
import SettingsPanel from './components/apps/SettingsPanel.vue';
import { createI18n } from 'vue-i18n';
import en from './locales/en.js';
import fr from './locales/fr.js';

window.mountCompilatioSettingsApp = (target) => {
  console.log(document.documentElement.lang)
  const i18n = createI18n({
    legacy: false,
    locale: document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'fr',
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
  const app = window.pkp.pkpCreateVueApp({
    render: () =>
      h(DocumentFrame, {
        document: documentData,
        thresholds: config.thresholds,
        api: window.pkpCompilatioDocumentsApi,
        onUpdated,
      }),
  });
  app.use(createI18n({
    legacy: false,
    locale: config.locale,
    fallbackLocale: 'en',
    messages: { en, fr },
  }));
  app.mount(target);
  return app;
};
window.dispatchEvent(new Event('compilatio:document-app-ready'));
