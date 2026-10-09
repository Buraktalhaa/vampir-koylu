import { defineRole } from './defineRole';

export const vampire = defineRole({
  id: 'vampire',
  team: 'vampire',
  knowsTeammates: true,
  abilities: [
    {
      id: 'bite',
      trigger: 'night',
      effect: 'kill',
      teamVote: true,
      target: { allowTeammates: false },
    },
  ],
});
