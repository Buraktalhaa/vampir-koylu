import { getRole, type RoleId } from '../roles';
import type { GameState, Player, Rng } from '../types';

export type RoleCounts = Partial<Record<RoleId, number>>;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Kurulum hatalarını döner; boş dizi = geçerli. Hatalar i18n anahtarıdır. */
export function validateSetup(playerCount: number, counts: RoleCounts): string[] {
  const errors: string[] = [];
  const entries = Object.entries(counts) as [RoleId, number][];
  const total = entries.reduce((sum, [, n]) => sum + n, 0);
  if (total !== playerCount) errors.push('setup.countMismatch');
  if (!(counts.vampire && counts.vampire > 0)) errors.push('setup.needVampire');
  for (const [id, n] of entries) {
    const role = getRole(id);
    if (role.unique && n > 1) errors.push(`setup.unique:${id}`);
    if (n > 0 && role.minPlayers && playerCount < role.minPlayers) errors.push(`setup.minPlayers:${id}`);
  }
  return errors;
}

/** Oyuncu sayısına göre varsayılan dağılım önerisi. */
export function suggestRoles(playerCount: number): RoleCounts {
  const vampire = Math.max(1, Math.floor(playerCount / 4));
  const counts: RoleCounts = { vampire, seer: 1, healer: 1 };
  if (playerCount >= (getRole('hunter').minPlayers ?? 0)) counts.hunter = 1;
  const used = Object.values(counts).reduce((s, n) => s + n, 0);
  counts.villager = Math.max(0, playerCount - used);
  return counts;
}

export function createGame(names: string[], counts: RoleCounts, rng: Rng = Math.random): GameState {
  const errors = validateSetup(names.length, counts);
  if (errors.length) throw new Error(errors.join(', '));

  const roleIds = (Object.entries(counts) as [RoleId, number][]).flatMap(([id, n]) => Array(n).fill(id));
  const shuffled = shuffle(roleIds, rng);

  const players: Player[] = names.map((name, i) => {
    const role = getRole(shuffled[i]);
    const abilityState = Object.fromEntries(
      role.abilities.map((a) => [a.id, { usesLeft: a.uses }]),
    );
    return { id: `p${i + 1}`, name, roleId: role.id, alive: true, abilityState };
  });

  return { players, phase: 'night', round: 1, events: [], pendingTriggers: [], winner: null };
}
