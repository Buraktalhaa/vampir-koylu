import { DEFAULT_SETTINGS, getRole, type GameSettings, type GameState, type PlayerId, type RoleId } from '@/game';

/**
 * Testler için oyun kurar: roller verilen sırayla p1, p2, ... oyuncularına atanır (rastgelelik yok).
 * Varsayılan olarak ilk gece yetenekler açık, böylece 1. gece doğrudan test edilebilir.
 */
export function makeGame(roles: RoleId[], settings: Partial<GameSettings> = {}): GameState {
  return {
    players: roles.map((roleId, i) => ({
      id: `p${i + 1}`,
      name: `P${i + 1}`,
      roleId,
      alive: true,
      abilityState: Object.fromEntries(getRole(roleId).abilities.map((a) => [a.id, { usesLeft: a.uses }])),
    })),
    settings: { ...DEFAULT_SETTINGS, firstNightActions: true, ...settings },
    phase: 'night',
    round: 1,
    events: [],
    pendingTriggers: [],
    winner: null,
  };
}

export function alive(state: GameState, id: PlayerId): boolean {
  return state.players.find((p) => p.id === id)!.alive;
}

/** Herkes aynı kişiye oy verir (kendisi hariç). */
export function everyoneVotes(state: GameState, targetId: PlayerId): Record<PlayerId, PlayerId> {
  return Object.fromEntries(state.players.filter((p) => p.alive && p.id !== targetId).map((p) => [p.id, targetId]));
}
