import { defineRole } from '@/game/roles/defineRole';

/**
 * Gece Misafiri: her gece başka birinin evine misafir gider. Kendi evine saldırı gelirse evde olmadığı için ölmez;
 * ama gittiği kişi vampirse ya da o gece saldırıya uğrarsa o da ölür.
 */
export const visitor = defineRole({
  id: 'visitor',
  team: 'village',
  abilities: [
    {
      id: 'visit',
      trigger: 'night',
      effect: 'visit',
    },
  ],
});
