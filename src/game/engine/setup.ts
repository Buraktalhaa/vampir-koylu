import { getRole, ROLE_IDS, type RoleId } from '../roles';
import { DEFAULT_SETTINGS, type GameSettings } from '../settings';
import type { GameState, Player, Rng } from '../types';

/**
 * Lobide her karakter için seçim:
 * - sayı: tam olarak bu kadar
 * - rastgele ({ min, max }): en az `min` tane kesin, kalan boş yerler dağıtılırken en fazla `max` tane
 *   ('random' eski kayıtlarla uyum için { min: 0 } demektir; `max` yoksa sınırsız)
 * - yok (undefined): oyunda yer almaz
 *
 * Hepsi rastgele → tamamen rastgele; hepsi sayı → tamamen elle; karışık → "2 şifacı kesin, gerisi rastgele".
 */
export type RandomRange = { min: number; max?: number };
export type RoleSlot = number | RandomRange | 'random';
export type RoleSetup = Partial<Record<RoleId, RoleSlot>>;
export type RoleCounts = Partial<Record<RoleId, number>>;

export type SetupError =
  | { code: 'tooManyRoles' }
  | { code: 'notEnoughRoles' }
  | { code: 'needVampire' }
  | { code: 'tooManyVampires'; max: number }
  | { code: 'badRange'; roleId: RoleId }
  | { code: 'unique'; roleId: RoleId }
  | { code: 'minPlayers'; roleId: RoleId; min: number };

/** Rastgele seçimse aralığını döner, değilse null. */
export function randomRange(slot: RoleSlot | undefined): Required<Pick<RandomRange, 'min'>> & Pick<RandomRange, 'max'> | null {
  if (slot === 'random') return { min: 0 };
  if (typeof slot === 'object') return { min: slot.min, max: slot.max };
  return null;
}

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

/** Bir rolün bu oyunda alabileceği en fazla adet (sınırsız = Infinity). */
function capacityOf(id: RoleId, playerCount: number): number {
  const role = getRole(id);
  if (role.minPlayers && playerCount < role.minPlayers) return 0;
  if (id === 'vampire') return maxVampires(playerCount);
  return role.unique ? 1 : Infinity;
}

type Plan = {
  /** Kesin yerleşecek adetler (sabit sayılar + rastgelelerin en azı). */
  base: RoleCounts;
  /** Rastgele havuzdaki roller ve her birinin üst sınırı. */
  pool: { id: RoleId; cap: number }[];
  remaining: number;
};

/** Kurulumu sabit kısım + rastgele havuz olarak çözer (doğrulama ve dağıtım ortak kullanır). */
function plan(playerCount: number, setup: RoleSetup): Plan {
  const base: RoleCounts = {};
  const pool: Plan['pool'] = [];
  for (const id of ROLE_IDS) {
    const slot = setup[id];
    if (slot === undefined) continue;
    const range = randomRange(slot);
    if (!range) {
      base[id] = slot as number;
      continue;
    }
    // Vampir rastgeleyse en az 1 tane garanti.
    const min = id === 'vampire' ? Math.max(1, range.min) : range.min;
    const cap = Math.min(range.max ?? Infinity, capacityOf(id, playerCount));
    if (min > 0) base[id] = min;
    pool.push({ id, cap });
  }
  const placed = Object.values(base).reduce((s, n) => s + (n ?? 0), 0);
  return { base, pool, remaining: playerCount - placed };
}

/** Kesin ayrılmış yer sayısı: sabit sayılar + rastgelelerin en azları. Oyuncu sayısını geçemez. */
export function reservedSlots(playerCount: number, setup: RoleSetup): number {
  return playerCount - plan(playerCount, setup).remaining;
}

export function validateSetup(playerCount: number, setup: RoleSetup): SetupError[] {
  const errors: SetupError[] = [];
  const { base, pool, remaining } = plan(playerCount, setup);

  if (remaining < 0) errors.push({ code: 'tooManyRoles' });

  for (const id of ROLE_IDS) {
    const slot = setup[id];
    if (slot === undefined) continue;
    const role = getRole(id);
    const range = randomRange(slot);
    if (range && range.max !== undefined && range.max < range.min) errors.push({ code: 'badRange', roleId: id });
    const wanted = range ? range.min : (slot as number);
    // Rastgele seçilenler bu durumda sadece havuza girmez (capacityOf → 0), hata değildir.
    if (role.minPlayers && playerCount < role.minPlayers && wanted > 0) {
      errors.push({ code: 'minPlayers', roleId: id, min: role.minPlayers });
    }
    if (role.unique && wanted > 1) errors.push({ code: 'unique', roleId: id });
  }

  const vampireRange = randomRange(setup.vampire);
  if (setup.vampire === undefined || setup.vampire === 0 || vampireRange?.max === 0) errors.push({ code: 'needVampire' });
  else if ((base.vampire ?? 0) > maxVampires(playerCount)) {
    errors.push({ code: 'tooManyVampires', max: maxVampires(playerCount) });
  }

  // Rastgele havuz kalan yerleri (üst sınırları aşmadan) doldurabiliyor mu?
  if (remaining > 0) {
    const room = pool.reduce((sum, { id, cap }) => sum + Math.max(0, cap - (base[id] ?? 0)), 0);
    if (room < remaining) errors.push({ code: 'notEnoughRoles' });
  }

  return errors;
}

/** Kurulumu kesin sayılara çevirir: sabitler ve en azlar yerleşir, kalan yerler üst sınırlar içinde rastgele dağıtılır. */
export function rollRoles(playerCount: number, setup: RoleSetup, rng: Rng = Math.random): RoleCounts {
  const errors = validateSetup(playerCount, setup);
  if (errors.length) throw new Error(errors.map((e) => e.code).join(', '));

  const { base, pool, remaining: toFill } = plan(playerCount, setup);
  const counts: RoleCounts = { ...base };
  let remaining = toFill;

  while (remaining > 0) {
    const candidates = pool.filter(({ id, cap }) => (counts[id] ?? 0) < cap);
    const { id } = candidates[Math.floor(rng() * candidates.length)];
    counts[id] = (counts[id] ?? 0) + 1;
    remaining--;
  }
  return counts;
}

/** Tüm karakterler rastgele. */
export function allRandomSetup(): RoleSetup {
  return Object.fromEntries(ROLE_IDS.map((id) => [id, { min: 0 }])) as RoleSetup;
}

export function createGame(
  names: string[],
  setup: RoleSetup,
  settings: GameSettings = DEFAULT_SETTINGS,
  rng: Rng = Math.random,
): GameState {
  const counts = rollRoles(names.length, setup, rng);
  const roleIds = (Object.entries(counts) as [RoleId, number][]).flatMap(([id, n]) => Array<RoleId>(n).fill(id));
  const shuffled = shuffle(roleIds, rng);

  const players: Player[] = names.map((name, i) => {
    const role = getRole(shuffled[i]);
    const abilityState = Object.fromEntries(role.abilities.map((a) => [a.id, { usesLeft: a.uses }]));
    return { id: `p${i + 1}`, name, roleId: role.id, alive: true, abilityState };
  });

  return { players, settings, phase: 'night', round: 1, events: [], pendingTriggers: [], winner: null };
}
