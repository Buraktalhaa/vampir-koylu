import type { Ability } from '@/game/types';

import type { Translation } from './locales/tr';

/** Yetenek etiketleri kurallardan üretilir; yeni yetenek için ayrıca metin yazmak gerekmez. */
export function abilityTags(ability: Ability, t: Translation): string[] {
  const tags = t.abilityTags;
  const result: string[] = [];

  if (ability.trigger === 'night') result.push(tags.night);
  else if (ability.deathCauses?.length === 1 && ability.deathCauses[0] === 'lynch') result.push(tags.onLynch);
  else result.push(tags.onDeath);

  result.push(tags.effects[ability.effect]);
  result.push(ability.uses !== undefined ? tags.uses(ability.uses) : ability.trigger === 'night' ? tags.unlimited : '');
  if (ability.teamVote) result.push(tags.teamVote);

  if (ability.target === 'none') result.push(tags.noTarget);
  else {
    if (ability.target?.allowSelf) result.push(tags.self);
    if (ability.target?.noRepeatTarget) result.push(tags.noRepeat);
  }
  return result.filter(Boolean);
}
