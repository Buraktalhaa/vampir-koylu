import { defineRole } from '@/game/roles/defineRole';

/**
 * Rol Çalan: tarafsız başlar. Oyunda bir kez bir oyuncuyu işaretler; o kişi nasıl ölürse ölsün (gece, oylama, intikam)
 * onun rolünü ve takımını alır. Rolü almadan oyun biterse kaybeder.
 */
export const thief = defineRole({
  id: 'thief',
  team: 'neutral',
  stealsRoleVia: 'mark',
  abilities: [
    {
      id: 'mark',
      trigger: 'night',
      effect: 'mark',
      uses: 1,
      required: true,
    },
  ],
});
