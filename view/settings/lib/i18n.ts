import { inject, type InjectionKey } from 'vue'

export type Translations = Record<string, string>

export const translationsKey: InjectionKey<Translations> = Symbol('translations')

export function useTranslations() {
  const translations = inject(translationsKey, {})

  function t(key: string): string {
    return translations[key] ?? key
  }

  return { t }
}
