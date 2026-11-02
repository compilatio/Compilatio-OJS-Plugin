import de from './de.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';
import pt from './pt.json';

export const messages = { de, en, es, fr, it, pt };
export type Locale = keyof typeof messages;

export function resolveLocale(locale: string): Locale {
  const language = locale.split(/[-_]/, 1)[0]?.toLowerCase();
  return language && language in messages ? language as Locale : 'en';
}
