import { defineRole } from '@/game/roles/defineRole';

export const vampire = defineRole({
  id: 'vampire',
  team: 'vampire',
  knowsTeammates: true,
  abilities: [
    {
      id: 'bite',
      trigger: 'night',
      effect: 'kill',
      cause: 'vampire',
      teamVote: true,
      required: true,
      target: { allowTeammates: false },
    },
  ],
});
