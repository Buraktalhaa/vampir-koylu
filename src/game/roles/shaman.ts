import { defineRole } from '@/game/roles/defineRole';

/** Şaman: oyun boyunca bir kez, ölü bir oyuncuyu diriltir. */
export const shaman = defineRole({
  id: 'shaman',
  team: 'village',
  abilities: [
    {
      id: 'raise',
      trigger: 'night',
      effect: 'revive',
      uses: 1,
      target: { deadOnly: true },
    },
  ],
});
