import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { allRandomSetup, type RoleSetup } from '@/game/engine/setup';
import { DEFAULT_SETTINGS, type GameSettings } from '@/game/settings';
import type { GameState } from '@/game/types';

import { newSession, resumeSafely, type Session } from './session';

/** Kurulum adımları (oyuncular → karakterler → ayarlar) arasında paylaşılan taslak. */
export type GameDraft = {
  names: string[];
  setup: RoleSetup;
  settings: GameSettings;
};

type GameContextValue = {
  draft: GameDraft;
  updateDraft: (patch: Partial<GameDraft>) => void;
  /** Devam eden oyun (yoksa null). Her değişiklikte telefona kaydedilir. */
  session: Session | null;
  startSession: (game: GameState) => void;
  updateSession: (update: (session: Session) => Session) => void;
  endSession: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

const DRAFT_KEY = 'gameDraft';
const SESSION_KEY = 'activeSession';
/** Varsayılan ayarlar değişince artırılır: eski kayıtlı ayarlar atılır, oyuncular ve dağılım korunur. */
const SETTINGS_VERSION = 2;
/** Oyun kayıt biçimi değişince artırılır: uyumsuz eski kayıt yüklenmez. */
const SESSION_VERSION = 1;

function defaultDraft(): GameDraft {
  return { names: [], setup: allRandomSetup(), settings: DEFAULT_SETTINGS };
}

/** Kayıtlı taslak eski sürümden kalmış olabilir; eksik alanlar varsayılanla tamamlanır. */
function restoreDraft(raw: string): GameDraft {
  const saved = JSON.parse(raw) as Partial<GameDraft> & { settingsVersion?: number };
  const base = defaultDraft();
  return {
    names: Array.isArray(saved.names) ? saved.names : base.names,
    setup: saved.setup ?? base.setup,
    settings: saved.settingsVersion === SETTINGS_VERSION ? { ...base.settings, ...saved.settings } : base.settings,
  };
}

function restoreSession(raw: string): Session | null {
  const saved = JSON.parse(raw) as Session & { version?: number };
  if (saved.version !== SESSION_VERSION || saved.game.winner) return null;
  return resumeSafely({ game: saved.game, flow: saved.flow });
}

/** Kayıt yüklenmeden önce yazılırsa eski veriyi ezer; yükleme bitince kaydetmeye başlanır. */
function usePersisted<T>(key: string, value: T, serialize: (v: T) => string | null, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const data = serialize(value);
    (data === null ? AsyncStorage.removeItem(key) : AsyncStorage.setItem(key, data)).catch(() => {});
  }, [key, value, serialize, ready]);
}

const serializeDraft = (d: GameDraft) => JSON.stringify({ ...d, settingsVersion: SETTINGS_VERSION });
const serializeSession = (s: Session | null) => (s ? JSON.stringify({ ...s, version: SESSION_VERSION }) : null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<GameDraft>(defaultDraft);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const loading = useRef(false);

  useEffect(() => {
    if (loading.current) return;
    loading.current = true;
    AsyncStorage.multiGet([DRAFT_KEY, SESSION_KEY])
      .then(([[, rawDraft], [, rawSession]]) => {
        if (rawDraft) setDraft(restoreDraft(rawDraft));
        if (rawSession) setSession(restoreSession(rawSession));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  usePersisted(DRAFT_KEY, draft, serializeDraft, ready);
  usePersisted(SESSION_KEY, session, serializeSession, ready);

  const value: GameContextValue = {
    draft,
    updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
    session,
    startSession: (game) => setSession(newSession(game)),
    updateSession: (update) => setSession((s) => (s ? update(s) : s)),
    endSession: () => setSession(null),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
