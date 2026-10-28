import { getRole } from '@/game/roles';
import type { RoleDefinition } from '@/game/types';
import type { Translation } from '@/i18n/types';

/** Rolün kazanma koşulu: tarafsızlarda rolün kendi kuralı, diğerlerinde takım hedefi. Kurallardan üretilir. */
export function winCondition(role: RoleDefinition, t: Translation): string {
  if (role.winsIfLynched) return t.roleTraits.winIfLynched;
  if (role.stealsRoleVia) return t.roleTraits.winAsThief;
  return t.teams[role.team].goal;
}

/** Rolün özel durumları (görünüş, dönüşme, oy ağırlığı…). Yeni bir bayrak eklenince buraya bir satır yeter. */
export function specialTraits(role: RoleDefinition, t: Translation): string[] {
  const traits = t.roleTraits;
  const result: string[] = [];
  if (role.appearsAs && role.appearsAs !== role.team) result.push(traits.appearsAs(t.teams[role.appearsAs].name));
  if (role.hiddenFromTeam) result.push(traits.hiddenFromTeam);
  if (role.knowsTeammates) result.push(traits.knowsTeammates);
  // Isırılınca dönüştüğü rolün takımı (ör. Lanetli → vampir).
  if (role.convertsWhenBitten) result.push(traits.convertsWhenBitten(t.teams[getRole(role.convertsWhenBitten).team].name));
  if (role.voteWeight && role.voteWeight !== 1) result.push(traits.voteWeight(role.voteWeight));
  if (role.stealsRoleVia) result.push(traits.stealsRole);
  if (role.abilities.some((a) => a.onlyWhenTeamGone)) result.push(traits.unlocksWhenTeamGone);
  return result;
}
