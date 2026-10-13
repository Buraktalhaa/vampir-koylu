import { defineRole } from '@/game/roles/defineRole';

/** Dedektif: her gece iki yaşayan oyuncu seçer ve aynı takımda olup olmadıklarını öğrenir. */
export const detective = defineRole({
  id: 'detective',
  team: 'village',
  abilities: [
    {
      id: 'compare',
      trigger: 'night',
      effect: 'compare',
      targets: 2,
    },
  ],
});
