import { defineRole } from './defineRole';

/** Şifacı: her gece bir oyuncuyu vampir saldırısından korur. */
export const healer = defineRole({
  id: 'healer',
  team: 'village',
  unique: true,
  abilities: [
    {
      id: 'heal',
      trigger: 'night',
      effect: 'protect',
      target: { allowSelf: true, noRepeatTarget: true },
    },
  ],
});
