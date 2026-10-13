import { en } from '@/i18n/locales/en';
import { tr } from '@/i18n/locales/tr';
import type { Translation } from '@/i18n/types';

/** Yeni dil = locales/<kod>.ts + buraya bir satır. Eksik metin TypeScript hatası verir. */
export const LOCALES = { tr, en } satisfies Record<string, Translation>;

export type Language = keyof typeof LOCALES;

export const DEFAULT_LANGUAGE: Language = 'tr';

export function getStrings(lang: Language): Translation {
  return LOCALES[lang];
}
