import { defineRole } from './defineRole';

/** Büyücü: her gece bir oyuncunun rolünü öğrenir. */
export const seer = defineRole({
  id: 'seer',
  team: 'village',
  unique: true,
  abilities: [
    {
      id: 'divine',
      trigger: 'night',
      effect: 'investigate',
    },
  ],
});
