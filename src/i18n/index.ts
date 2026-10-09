import { en } from './locales/en';
import { tr, type Translation } from './locales/tr';

/** Yeni dil = locales/<kod>.ts + buraya bir satır. Eksik metin TypeScript hatası verir. */
export const LOCALES = { tr, en } satisfies Record<string, Translation>;

export type Language = keyof typeof LOCALES;

export const DEFAULT_LANGUAGE: Language = 'tr';

export function getStrings(lang: Language): Translation {
  return LOCALES[lang];
}
