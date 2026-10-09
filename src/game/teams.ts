import { getRole } from './roles';
import type { GameState, Player, TeamId } from './types';

export function teamOf(player: Player): TeamId {
  return getRole(player.roleId).team;
}

/** Hayattaki oyuncular, oturma sırasıyla. Telefon sadece bunlar arasında dolaşır. */
export function alivePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.alive);
}

/** Herkese açık rol bilgisi: ölmüşse ve ayar açıksa rolü, aksi halde null. */
export function publicRoleOf(state: GameState, player: Player): string | null {
  return !player.alive && state.settings.revealRoleOnDeath ? player.roleId : null;
}

type TeamDefinition = {
  id: TeamId;
  /** Kazanma kontrolü — her takım kendi koşulunu tanımlar. */
  hasWon: (state: GameState) => boolean;
};

export const TEAMS: Record<TeamId, TeamDefinition> = {
  village: {
    id: 'village',
    hasWon: (state) => alivePlayers(state).every((p) => teamOf(p) !== 'vampire'),
  },
  vampire: {
    id: 'vampire',
    hasWon: (state) => {
      const alive = alivePlayers(state);
      const vampires = alive.filter((p) => teamOf(p) === 'vampire').length;
      return vampires > 0 && vampires >= alive.length - vampires;
    },
  },
};

/** Kontrol sırası: aynı anda iki takım kazanıyorsa öncelik vampirlerde. */
const WIN_CHECK_ORDER: TeamId[] = ['vampire', 'village'];

export function checkWinner(state: GameState): TeamId | null {
  return WIN_CHECK_ORDER.find((id) => TEAMS[id].hasWon(state)) ?? null;
}
