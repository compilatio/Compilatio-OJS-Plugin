import './tailwind.css';

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
