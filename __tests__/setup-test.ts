import { allRandomSetup, createGame, maxVampires, rollRoles, validateSetup, type RoleCounts } from '@/game';

const total = (c: RoleCounts) => Object.values(c).reduce((a, b) => a + (b ?? 0), 0);
const codes = (n: number, setup: Parameters<typeof validateSetup>[1]) => validateSetup(n, setup).map((e) => e.code);

describe('Rol dağılımı', () => {
  it('hepsi rastgele: toplam doğru, en az 1 vampir, vampir sınırı aşılmaz', () => {
    for (let i = 0; i < 500; i++) {
      const n = 3 + (i % 14);
      const c = rollRoles(n, allRandomSetup());
      expect(total(c)).toBe(n);
      expect(c.vampire).toBeGreaterThanOrEqual(1);
      expect(c.vampire).toBeLessThanOrEqual(maxVampires(n));
    }
  });

  it('sabit + rastgele: sabit sayılar korunur, kalanlar dolar', () => {
    for (let i = 0; i < 200; i++) {
      const c = rollRoles(6, { healer: 2, vampire: 'random', witch: 'random', avenger: 'random', villager: 'random' });
      expect(c.healer).toBe(2);
      expect(total(c)).toBe(6);
    }
  });

  it('hepsi elle: aynen uygulanır, aynı karakterden birden fazla olabilir', () => {
    expect(rollRoles(8, { vampire: 1, healer: 3, witch: 3, villager: 1 })).toEqual({ vampire: 1, healer: 3, witch: 3, villager: 1 });
  });

  it('karakterlerde adet ya da oyuncu sayısı sınırı yok (ör. 5 kişide 2 İntikamcı)', () => {
    expect(codes(5, { vampire: 1, avenger: 2, villager: 2 })).toEqual([]);
  });

  it('createGame herkese bir rol verir', () => {
    const g = createGame(['a', 'b', 'c', 'd', 'e', 'f'], allRandomSetup());
    expect(g.players).toHaveLength(6);
    expect(g.players.every((p) => p.alive && p.roleId)).toBe(true);
  });
});

describe('Kurulum hataları', () => {
  it('toplam oyuncudan azsa ve rastgele havuz yoksa', () => {
    expect(codes(6, { vampire: 2, healer: 2 })).toContain('notEnoughRoles');
  });
  it('rol sayısı oyuncu sayısını aşarsa', () => {
    expect(codes(6, { vampire: 2, villager: 5 })).toContain('tooManyRoles');
  });
  it('hiç vampir yoksa', () => {
    expect(codes(6, { villager: 'random' })).toContain('needVampire');
  });
  it('vampirler oyun başında kazanacak kadar çoksa', () => {
    expect(codes(6, { vampire: 3, villager: 3 })).toContain('tooManyVampires');
  });
});
