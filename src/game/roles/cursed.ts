import { defineRole } from '@/game/roles/defineRole';

/** Lanetli: normal bir köylü; ama vampirler onu ısırırsa ölmez, vampire dönüşür. */
export const cursed = defineRole({
  id: 'cursed',
  team: 'village',
  convertsWhenBitten: 'vampire',
  abilities: [],
});
