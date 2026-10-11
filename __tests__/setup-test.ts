import { allRandomSetup, createGame, maxVampires, reservedSlots, rollRoles, validateSetup, type RoleCounts } from '@/game';

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

describe('Rastgele en az / en çok', () => {
  it('en az ve en çok sınırları her dağıtımda korunur', () => {
    for (let i = 0; i < 300; i++) {
      const c = rollRoles(8, {
        vampire: { min: 1, max: 2 },
        healer: { min: 1, max: 1 },
        witch: { min: 0, max: 2 },
        villager: { min: 2 },
      });
      expect(total(c)).toBe(8);
      expect(c.vampire).toBeGreaterThanOrEqual(1);
      expect(c.vampire).toBeLessThanOrEqual(2);
      expect(c.healer).toBe(1);
      expect(c.witch ?? 0).toBeLessThanOrEqual(2);
      expect(c.villager).toBeGreaterThanOrEqual(2);
    }
  });

  it('en az = en çok ise o kadar çıkar', () => {
    expect(rollRoles(6, { vampire: { min: 2, max: 2 }, villager: { min: 0 } }).vampire).toBe(2);
  });

  it('rastgele vampirde en az 0 verilse de en az 1 vampir garanti', () => {
    for (let i = 0; i < 100; i++) expect(rollRoles(5, { vampire: { min: 0 }, villager: { min: 0 } }).vampire).toBeGreaterThanOrEqual(1);
  });

  it('eski kayıtlardaki "random" değeri en az 0, sınırsız olarak çalışır', () => {
    expect(total(rollRoles(6, { vampire: 'random', villager: 'random' }))).toBe(6);
  });

  it('en az, en çoktan büyükse hata', () => {
    expect(codes(6, { vampire: 1, healer: { min: 3, max: 2 }, villager: { min: 0 } })).toContain('badRange');
  });

  it('en çoklar kalan yerleri dolduramıyorsa hata', () => {
    expect(codes(8, { vampire: 1, healer: { min: 0, max: 1 }, witch: { min: 0, max: 1 } })).toContain('notEnoughRoles');
  });

  it('en azların toplamı oyuncu sayısını aşarsa hata', () => {
    expect(codes(5, { vampire: 1, healer: { min: 3 }, villager: { min: 2 } })).toContain('tooManyRoles');
  });

  it('en çok 0 olan rastgele vampir = vampir yok hatası', () => {
    expect(codes(6, { vampire: { min: 0, max: 0 }, villager: { min: 0 } })).toContain('needVampire');
  });
});

describe('Ayrılmış yer (+ butonlarının kilitlenmesi)', () => {
  it('sabit sayılar ve en azlar sayılır, en çoklar sayılmaz', () => {
    expect(reservedSlots(5, { vampire: 1, healer: 4 })).toBe(5);
    expect(reservedSlots(8, { vampire: { min: 1, max: 3 }, healer: 2, villager: { min: 0 } })).toBe(3);
  });

  it('rastgele vampir en az 1 yer ayırır', () => {
    expect(reservedSlots(6, { vampire: { min: 0 }, villager: { min: 0 } })).toBe(1);
  });
});
