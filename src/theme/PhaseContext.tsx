import { createContext, useContext } from 'react';

import type { Phase } from '@/game/types';
import { DEFAULT_PHASE } from '@/theme/tokens';

/**
 * Ekranın perde modu (gündüz kandil / gece indigo). `Screen` sağlar; avatar, kart ve butonlar
 * buna göre renk seçer, böylece her bileşene ayrıca `phase` geçmek gerekmez.
 */
const PhaseContext = createContext<Phase>(DEFAULT_PHASE);

export const PhaseProvider = PhaseContext.Provider;

export function usePhase(): Phase {
  return useContext(PhaseContext);
}
