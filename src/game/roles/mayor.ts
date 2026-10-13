import { defineRole } from '@/game/roles/defineRole';

/** Belediye Başkanı: gündüz oylamasında oyu 2 sayılır. Gece yapacak bir şeyi yok. */
export const mayor = defineRole({
  id: 'mayor',
  team: 'village',
  voteWeight: 2,
  abilities: [],
});
