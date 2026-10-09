import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_LANGUAGE, getStrings, LOCALES, type Language } from './index';
import type { Translation } from './locales/tr';

const STORAGE_KEY = 'language';

function isLanguage(value: string | null | undefined): value is Language {
  return !!value && value in LOCALES;
}

/** İlk açılışta cihaz dili destekleniyorsa o, değilse varsayılan. */
function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isLanguage(code) ? code : DEFAULT_LANGUAGE;
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(deviceLanguage);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isLanguage(saved)) setLanguageState(saved);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: getStrings(language),
      setLanguage: (lang) => {
        setLanguageState(lang);
        AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
