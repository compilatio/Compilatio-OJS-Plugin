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
import settingsEn from './settings/locales/en';
import settingsFr from './settings/locales/fr';
import en from './locales/en.js';
import fr from './locales/fr.js';

window.mountCompilatioSettingsApp = (target) => {
  const locale = window.pkpCompilatioDocuments.locale.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const app = window.pkp.pkpCreateVueApp({
    render: () => h(SettingsPanel, {
      apiUrl: target.dataset.apiUrl ?? '',
      csrfToken: target.dataset.csrfToken ?? '',
    }),
  });
  app.provide(translationsKey, locale === 'en' ? settingsEn : settingsFr);
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
    locale: config.locale,
    fallbackLocale: 'en',
    messages: { en, fr },
  }));
  app.mount(target);
  return {
    unmount: () => app.unmount(),
    update: (updated: typeof documentData) => { document.value = updated; },
  };
};
window.dispatchEvent(new Event('compilatio:document-app-ready'));
