import { defineRole } from './defineRole';

/**
 * Büyücü: iki tek kullanımlık büyüsü var, bir gecede en fazla birini kullanır.
 * - Kalkan: o gece herkesi korur.
 * - Lanet: bir oyuncuyu öldürür (Şifacı korursa ölmez).
 */
export const witch = defineRole({
  id: 'witch',
  team: 'village',
  maxNightActions: 1,
  abilities: [
    {
      id: 'shield',
      trigger: 'night',
      effect: 'protectAll',
      target: 'none',
      uses: 1,
    },
    {
      id: 'curse',
      trigger: 'night',
      effect: 'kill',
      cause: 'spell',
      uses: 1,
    },
  ],
});
