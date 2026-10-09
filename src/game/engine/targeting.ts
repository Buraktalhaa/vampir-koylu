import { getRole } from '../roles';
import { teamOf } from '../teams';
import type { Ability, GameState, Player, PlayerId } from '../types';

export function findPlayer(state: GameState, id: PlayerId): Player {
  const player = state.players.find((p) => p.id === id);
  if (!player) throw new Error(`Unknown player: ${id}`);
  return player;
}

export function findAbility(player: Player, abilityId: string): Ability {
  const ability = getRole(player.roleId).abilities.find((a) => a.id === abilityId);
  if (!ability) throw new Error(`Role ${player.roleId} has no ability ${abilityId}`);
  return ability;
}

/** Oyuncu bu yeteneği şu an kullanabilir mi (hak, ilk gece vb.)? */
export function canUseAbility(state: GameState, player: Player, ability: Ability): boolean {
  const usesLeft = player.abilityState[ability.id]?.usesLeft;
  if (usesLeft !== undefined && usesLeft <= 0) return false;
  if (ability.trigger === 'night') {
    if (!player.alive || state.phase !== 'night') return false;
    if (ability.skipFirstNight && state.round === 1) return false;
  }
  return true;
}

export function needsTarget(ability: Ability): boolean {
  return ability.target !== 'none';
}

export function getValidTargets(state: GameState, actor: Player, ability: Ability): Player[] {
  if (ability.target === 'none') return [];
  const rule = ability.target ?? {};
  const last = actor.abilityState[ability.id];
  const lastNightTarget = last?.lastUsedRound === state.round - 1 ? last.lastTarget : undefined;
  return state.players.filter((p) => {
    if (!p.alive) return false;
    if (rule.noRepeatTarget && p.id === lastNightTarget) return false;
    if (p.id === actor.id) return rule.allowSelf ?? false;
    if (rule.allowTeammates === false && teamOf(p) === teamOf(actor)) return false;
    return true;
  });
}

/** Oyuncunun şu an kullanabileceği gece yetenekleri — arayüz bunu listeler. */
export function availableNightAbilities(state: GameState, player: Player): Ability[] {
  return getRole(player.roleId).abilities.filter(
    (a) => a.trigger === 'night' && canUseAbility(state, player, a),
  );
}
