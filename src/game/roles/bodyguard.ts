import { defineRole } from '@/game/roles/defineRole';

/** Fedai: her gece başka birini korumaya alır; ona saldırı gelirse onun yerine kendisi ölür. */
export const bodyguard = defineRole({
  id: 'bodyguard',
  team: 'village',
  abilities: [
    {
      id: 'guard',
      trigger: 'night',
      effect: 'guard',
    },
  ],
});
