import { getRole } from '@/game/roles';
import { teamOf } from '@/game/teams';
import type { Ability, GameState, Player, PlayerId } from '@/game/types';

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
    if (state.round === 1 && (ability.skipFirstNight || !state.settings.firstNightActions)) return false;
    if (ability.onlyWhenTeamGone) {
      const team = teamOf(player);
      const othersAlive = state.players.some(
        (p) => p.alive && p.id !== player.id && teamOf(p) === team && !getRole(p.roleId).hiddenFromTeam,
      );
      if (othersAlive) return false;
    }
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
    if (rule.deadOnly) return !p.alive && p.id !== actor.id;
    if (!p.alive) return false;
    if (rule.noRepeatTarget && p.id === lastNightTarget) return false;
    if (p.id === actor.id) return rule.allowSelf ?? false;
    // Gizli üyeler (ör. Yalnız Vampir) takım arkadaşı sayılmaz: tanınmadıkları için hedef alınabilirler.
    const hidden = getRole(p.roleId).hiddenFromTeam || getRole(actor.roleId).hiddenFromTeam;
    if (rule.allowTeammates === false && !hidden && teamOf(p) === teamOf(actor)) return false;
    return true;
  });
}

/** Oyuncunun şu an kullanabileceği gece yetenekleri — arayüz bunu listeler. */
export function availableNightAbilities(state: GameState, player: Player): Ability[] {
  // Hedefi olmayan yetenek gösterilmez (ör. henüz ölen yokken diriltme).
  return getRole(player.roleId).abilities.filter(
    (a) => a.trigger === 'night' && canUseAbility(state, player, a) && (!needsTarget(a) || getValidTargets(state, player, a).length > 0),
  );
}
