import { CLASSIC_ROLES, ROLE_IDS, ROLES, type RoleId } from '@/game/roles';
import type { TeamId } from '@/game/types';

/** Ansiklopedide ve kurulumda grup sırası. */
export const TEAM_ORDER: TeamId[] = ['village', 'vampire', 'neutral'];

/** Ansiklopedi sırası: önce klasik karakterler, sonra takımlarına göre diğerleri. Detay sayfası bu sırayla kaydırılır. */
export const ROLE_ORDER: RoleId[] = [
  ...CLASSIC_ROLES,
  ...TEAM_ORDER.flatMap((team) => ROLE_IDS.filter((id) => ROLES[id].team === team && !CLASSIC_ROLES.includes(id))),
];
