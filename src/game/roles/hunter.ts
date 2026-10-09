import { defineRole } from './defineRole';

/** Avcı: öldüğünde (gece ya da asılarak) yanında birini götürür. */
export const hunter = defineRole({
  id: 'hunter',
  team: 'village',
  unique: true,
  minPlayers: 6,
  abilities: [
    {
      id: 'lastShot',
      trigger: 'onDeath',
      effect: 'kill',
      uses: 1,
    },
  ],
});
