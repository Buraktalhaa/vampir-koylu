import { defineRole } from './defineRole';

/** İntikamcı: köy tarafından asılırsa yanında bir oyuncuyu daha götürür. */
export const avenger = defineRole({
  id: 'avenger',
  team: 'village',
  abilities: [
    {
      id: 'revenge',
      trigger: 'onDeath',
      deathCauses: ['lynch'],
      effect: 'kill',
      cause: 'revenge',
      uses: 1,
    },
  ],
});
