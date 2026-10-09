import type { RoleDefinition, TeamId } from '../types';
import { avenger } from './avenger';
import { healer } from './healer';
import { vampire } from './vampire';
import { villager } from './villager';
import { witch } from './witch';

/**
 * Yeni karakter eklemek için:
 * 1. `roles/<id>.ts` dosyasında `defineRole` ile tanımla
 * 2. Bu listeye ekle
 * 3. `i18n/locales/*` içine adını ve açıklamasını yaz (eksikse TypeScript hata verir)
 */
const ROLE_LIST = [villager, vampire, witch, healer, avenger] as const;

export type RoleId = (typeof ROLE_LIST)[number]['id'];

export const ROLES = Object.fromEntries(ROLE_LIST.map((r) => [r.id, r])) as {
  [K in RoleId]: RoleDefinition<K>;
};

export const ROLE_IDS = ROLE_LIST.map((r) => r.id) as RoleId[];

export function getRole(id: string): RoleDefinition {
  const role = (ROLES as Record<string, RoleDefinition>)[id];
  if (!role) throw new Error(`Unknown role: ${id}`);
  return role;
}

export function rolesOfTeam(team: TeamId): RoleId[] {
  return ROLE_IDS.filter((id) => ROLES[id].team === team);
}
