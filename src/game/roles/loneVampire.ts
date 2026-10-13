import { defineRole } from '@/game/roles/defineRole';

/**
 * Yalnız Vampir: vampir takımında ama gizli. Diğer vampirler yaşadıkça köylü gibidir (yeteneği yok, kimseyi tanımaz,
 * kimse onu tanımaz). Diğer vampirlerin hepsi ölünce ısırma yeteneği açılır. Kâhin'e köylü görünür.
 */
export const loneVampire = defineRole({
  id: 'loneVampire',
  team: 'vampire',
  hiddenFromTeam: true,
  appearsAs: 'village',
  abilities: [
    {
      id: 'bite',
      trigger: 'night',
      effect: 'kill',
      cause: 'vampire',
      required: true,
      onlyWhenTeamGone: true,
      target: { allowTeammates: false },
    },
  ],
});
