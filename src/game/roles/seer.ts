import { defineRole } from '@/game/roles/defineRole';

/** Kâhin: her gece bir oyuncunun takımını (Köy / Vampirler / Tarafsız) öğrenir. */
export const seer = defineRole({
  id: 'seer',
  team: 'village',
  abilities: [
    {
      id: 'divine',
      trigger: 'night',
      effect: 'investigate',
    },
  ],
});
