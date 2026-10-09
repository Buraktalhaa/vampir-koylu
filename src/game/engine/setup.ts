import { getRole, ROLE_IDS, type RoleId } from '../roles';
import type { GameState, Player, Rng } from '../types';

/**
 * Lobide her karakter için seçim:
 * - sayı: tam olarak bu kadar
 * - 'random': kalan boş yerler rastgele dağıtılırken havuza girer
 * - yok (undefined): oyunda yer almaz
 *
 * Hepsi 'random' → tamamen rastgele; hepsi sayı → tamamen elle; karışık → "2 şifacı kesin, gerisi rastgele".
 */
export type RoleSlot = number | 'random';
export type RoleSetup = Partial<Record<RoleId, RoleSlot>>;
export type RoleCounts = Partial<Record<RoleId, number>>;

export type SetupError =
  | { code: 'tooManyRoles' }
  | { code: 'notEnoughRoles' }
  | { code: 'needVampire' }
  | { code: 'tooManyVampires'; max: number }
  | { code: 'unique'; roleId: RoleId }
  | { code: 'minPlayers'; roleId: RoleId; min: number };

/** Vampirler oyun başında köylülere eşit ya da fazla olursa oyun anında biter. */
export function maxVampires(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function entries(setup: RoleSetup): [RoleId, RoleSlot][] {
  return ROLE_IDS.filter((id) => setup[id] !== undefined).map((id) => [id, setup[id]!]);
}

/** Bir rolün bu oyunda alabileceği en fazla adet (sınırsız = Infinity). */
function capacityOf(id: RoleId, playerCount: number): number {
  const role = getRole(id);
  if (role.minPlayers && playerCount < role.minPlayers) return 0;
  if (id === 'vampire') return maxVampires(playerCount);
  return role.unique ? 1 : Infinity;
}

export function validateSetup(playerCount: number, setup: RoleSetup): SetupError[] {
  const errors: SetupError[] = [];
  const list = entries(setup);
  const fixed = list.reduce((sum, [, s]) => sum + (s === 'random' ? 0 : s), 0);
  const remaining = playerCount - fixed;

  if (remaining < 0) errors.push({ code: 'tooManyRoles' });

  for (const [id, slot] of list) {
    const role = getRole(id);
    const wanted = slot === 'random' ? 0 : slot;
    // Rastgele seçilenler bu durumda sadece havuza girmez (capacityOf → 0), hata değildir.
    if (role.minPlayers && playerCount < role.minPlayers && wanted > 0) {
      errors.push({ code: 'minPlayers', roleId: id, min: role.minPlayers });
    }
    if (role.unique && wanted > 1) errors.push({ code: 'unique', roleId: id });
  }

  const vampireSlot = setup.vampire;
  if (vampireSlot === undefined || vampireSlot === 0) errors.push({ code: 'needVampire' });
  if (typeof vampireSlot === 'number' && vampireSlot > maxVampires(playerCount)) {
    errors.push({ code: 'tooManyVampires', max: maxVampires(playerCount) });
  }

  // Rastgele havuz kalan yerleri doldurabiliyor mu?
  if (remaining > 0) {
    const capacity = list
      .filter(([, s]) => s === 'random')
      .reduce((sum, [id]) => sum + capacityOf(id, playerCount), 0);
    if (capacity < remaining) errors.push({ code: 'notEnoughRoles' });
  }

  return errors;
}

/** Kurulumu kesin sayılara çevirir: sabitler aynen kalır, kalan yerler rastgele dağıtılır. */
export function rollRoles(playerCount: number, setup: RoleSetup, rng: Rng = Math.random): RoleCounts {
  const errors = validateSetup(playerCount, setup);
  if (errors.length) throw new Error(errors.map((e) => e.code).join(', '));

  const counts: RoleCounts = {};
  const pool: RoleId[] = [];
  for (const [id, slot] of entries(setup)) {
    if (slot === 'random') pool.push(id);
    else counts[id] = slot;
  }

  let remaining = playerCount - Object.values(counts).reduce((s, n) => s + n, 0);
  // Vampir rastgeleyse en az 1 tane garanti.
  if (setup.vampire === 'random' && !counts.vampire) {
    counts.vampire = 1;
    remaining--;
  }

  while (remaining > 0) {
    const candidates = pool.filter((id) => (counts[id] ?? 0) < capacityOf(id, playerCount));
    const pick = candidates[Math.floor(rng() * candidates.length)];
    counts[pick] = (counts[pick] ?? 0) + 1;
    remaining--;
  }
  return counts;
}

/** Oyuncu sayısına göre hazır, dengeli bir öneri. */
export function suggestRoles(playerCount: number): RoleSetup {
  const vampire = Math.min(maxVampires(playerCount), Math.max(1, Math.floor(playerCount / 4)));
  const setup: RoleSetup = { vampire, witch: 1, healer: 1, avenger: 1 };
  const used = Object.values(setup).reduce<number>((s, n) => s + (n as number), 0);
  setup.villager = Math.max(0, playerCount - used);
  return setup;
}

/** Tüm karakterler rastgele. */
export function allRandomSetup(): RoleSetup {
  return Object.fromEntries(ROLE_IDS.map((id) => [id, 'random'])) as RoleSetup;
}

export function createGame(names: string[], setup: RoleSetup, rng: Rng = Math.random): GameState {
  const counts = rollRoles(names.length, setup, rng);
  const roleIds = (Object.entries(counts) as [RoleId, number][]).flatMap(([id, n]) => Array<RoleId>(n).fill(id));
  const shuffled = shuffle(roleIds, rng);

  const players: Player[] = names.map((name, i) => {
    const role = getRole(shuffled[i]);
    const abilityState = Object.fromEntries(role.abilities.map((a) => [a.id, { usesLeft: a.uses }]));
    return { id: `p${i + 1}`, name, roleId: role.id, alive: true, abilityState };
  });

  return { players, phase: 'night', round: 1, events: [], pendingTriggers: [], winner: null };
}
