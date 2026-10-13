import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { setMusicEnabled, setMusicTrack, setSoundsEnabled, type MusicTrack } from '@/feedback/audio';
import { setHapticsEnabled } from '@/feedback/haptics';

/** Uygulama geneli ayarlar (oyun ayarlarından ayrı): ses, müzik, titreşim. */
export type AppSettings = { music: boolean; sounds: boolean; vibration: boolean };

const DEFAULTS: AppSettings = { music: true, sounds: true, vibration: true };
const KEY = 'appSettings';

type Value = { settings: AppSettings; update: (patch: Partial<AppSettings>) => void };

const Ctx = createContext<Value | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Kayıtlı ayarlar yüklenince ses/titreşim modüllerine ilet ve kaydet.
  // (Yüklenmeden çalmaya başlarsa müziği kapatmış biri açılışta bir an ses duyar.)
  useEffect(() => {
    if (!loaded) return;
    setMusicEnabled(settings.music);
    setSoundsEnabled(settings.sounds);
    setHapticsEnabled(settings.vibration);
    AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const value: Value = { settings, update: (patch) => setSettings((s) => ({ ...s, ...patch })) };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppSettings(): Value {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppSettings must be used inside AppSettingsProvider');
  return ctx;
}

/** Ekran açıkken çalacak müzik. Ekran kapanınca menü müziğine döner. */
export function useMusic(track: MusicTrack) {
  useEffect(() => {
    setMusicTrack(track);
  }, [track]);
  useEffect(() => () => setMusicTrack('menu'), []);
}
