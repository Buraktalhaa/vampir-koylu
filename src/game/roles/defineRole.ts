import type { RoleDefinition } from '@/game/types';

/** Rol tanımlarında tip çıkarımı ve id literal'ının korunması için yardımcı. */
export function defineRole<const Id extends string>(role: RoleDefinition<Id>): RoleDefinition<Id> {
  return role;
}
