import type { RoleDefinition } from '@/game/types';
import { avenger } from '@/game/roles/avenger';
import { healer } from '@/game/roles/healer';
import { jester } from '@/game/roles/jester';
import { mayor } from '@/game/roles/mayor';
import { seer } from '@/game/roles/seer';
import { vampire } from '@/game/roles/vampire';
import { villager } from '@/game/roles/villager';
import { witch } from '@/game/roles/witch';
import { bodyguard } from '@/game/roles/bodyguard';
import { visitor } from '@/game/roles/visitor';
import { detective } from '@/game/roles/detective';
import { loneVampire } from '@/game/roles/loneVampire';
import { cursed } from '@/game/roles/cursed';
import { shaman } from '@/game/roles/shaman';
import { thief } from '@/game/roles/thief';

/**
 * Yeni karakter eklemek için:
 * 1. `roles/<id>.ts` dosyasında `defineRole` ile tanımla
 * 2. Bu listeye ekle
 * 3. `i18n/locales/*` içine adını ve açıklamasını yaz (eksikse TypeScript hata verir)
 */
const ROLE_LIST = [villager, vampire, witch, healer, avenger, seer, mayor, jester, bodyguard, visitor, detective, loneVampire, cursed, shaman, thief] as const;

export type RoleId = (typeof ROLE_LIST)[number]['id'];

/** Oyunun ilk (klasik) karakterleri: ansiklopedide en üstte bu sırayla gösterilir. */
export const CLASSIC_ROLES: RoleId[] = ['villager', 'vampire', 'seer', 'healer', 'avenger', 'witch'];

export const ROLES = Object.fromEntries(ROLE_LIST.map((r) => [r.id, r])) as {
  [K in RoleId]: RoleDefinition<K>;
};

export const ROLE_IDS = ROLE_LIST.map((r) => r.id) as RoleId[];

export function getRole(id: string): RoleDefinition {
  const role = (ROLES as Record<string, RoleDefinition>)[id];
  if (!role) throw new Error(`Unknown role: ${id}`);
  return role;
}
