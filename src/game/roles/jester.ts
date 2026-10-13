import { defineRole } from '@/game/roles/defineRole';

/** Deli: köy onu asarsa tek başına kazanır ve oyun biter. Gece öldürülürse kazanamaz. */
export const jester = defineRole({
  id: 'jester',
  team: 'neutral',
  winsIfLynched: true,
  abilities: [],
});
