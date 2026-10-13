import {
  allRandomSetup,
  balancedVampires,
  CLASSIC_ROLES,
  classicSetup,
  createGame,
  maxVampires,
  randomRange,
  reservedSlots,
  rollRoles,
  sameSetup,
  validateSetup,
  type RoleCounts,
} from '@/game';

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

describe('"Yok" = 0', () => {
  it('0 olan karakter oyunda yer almaz ve yer ayırmaz', () => {
    expect(rollRoles(5, { vampire: 1, healer: 0, villager: { min: 0 } }).healer ?? 0).toBe(0);
    expect(reservedSlots(5, { vampire: 1, healer: 0 })).toBe(1);
  });
  it('vampir 0 ise vampir yok hatası', () => {
    expect(codes(5, { vampire: 0, villager: { min: 0 } })).toContain('needVampire');
  });
});

describe('Bozuk aralık değerleri', () => {
  it('NaN / eksik en az-en çok güvenli değerlere döner', () => {
    expect(randomRange({ min: Number.NaN })).toEqual({ min: 0, max: undefined });
    expect(randomRange({ min: 2, max: Number.NaN })).toEqual({ min: 2, max: undefined });
    expect(randomRange({ min: -3, max: -1 })).toEqual({ min: 0, max: 0 });
  });
});

describe('Klasik Mod', () => {
  it('yalnızca klasik karakterler dağıtılır', () => {
    for (let i = 0; i < 200; i++) {
      const c = rollRoles(8, classicSetup());
      expect(total(c)).toBe(8);
      for (const [id, n] of Object.entries(c)) if (n) expect(CLASSIC_ROLES).toContain(id);
    }
  });
});

describe('Hazır seçenek tanıma (butonun seçili görünmesi)', () => {
  it('aynı kurulumu tanır', () => {
    expect(sameSetup(classicSetup(), classicSetup())).toBe(true);
    expect(sameSetup(allRandomSetup(), allRandomSetup())).toBe(true);
    expect(sameSetup(classicSetup(), allRandomSetup())).toBe(false);
  });

  it('bir kart değişince artık aynı sayılmaz', () => {
    expect(sameSetup({ ...classicSetup(), vampire: 2 }, classicSetup())).toBe(false);
    expect(sameSetup({ ...allRandomSetup(), healer: { min: 1 } }, allRandomSetup())).toBe(false);
  });

  it('eski "random" kaydı { min: 0 } ile aynı sayılır', () => {
    const legacy = Object.fromEntries(Object.keys(allRandomSetup()).map((id) => [id, 'random'])) as Parameters<typeof sameSetup>[0];
    expect(sameSetup(legacy, allRandomSetup())).toBe(true);
  });
});

describe('Dengeli vampir sayısı', () => {
  it('her 4 oyuncuya 1, ±1; 1 ile üst sınır arasında', () => {
    for (const n of [3, 5, 8, 12, 16, 20]) {
      const target = Math.max(1, Math.floor(n / 4));
      for (const r of [0, 0.3, 0.9]) {
        const v = balancedVampires(n, () => r);
        expect(v).toBeGreaterThanOrEqual(Math.max(1, target - 1));
        expect(v).toBeLessThanOrEqual(Math.min(maxVampires(n), target + 2));
      }
    }
  });

  it('üst sınır oyuncuların yarısından bir az', () => {
    expect([5, 6, 8, 12].map(maxVampires)).toEqual([2, 2, 3, 5]);
  });

  it('serbest aralıkta (0–∞) vampir sayısı dengelenir; 10 kişide 4 vampir nadiren gelir', () => {
    const h: Record<number, number> = {};
    for (let i = 0; i < 2000; i++) {
      const v = rollRoles(10, allRandomSetup()).vampire!;
      h[v] = (h[v] ?? 0) + 1;
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(4);
    }
    expect(h[2]).toBeGreaterThan(h[4]); // hedef en olası
    expect(h[4]).toBeGreaterThan(100); // ama 4 de gelebiliyor (~%10)
  });

  it('elle verilen aralığa dokunulmaz (Tam 1 → hep 1)', () => {
    for (let i = 0; i < 100; i++) expect(rollRoles(12, { vampire: { min: 1, max: 1 }, villager: { min: 0 } }).vampire).toBe(1);
  });
});

describe('Küçük oyunda vampir', () => {
  it('7 ve altı oyuncuda çoğunlukla 1 vampir (≈%90)', () => {
    let one = 0;
    for (let i = 0; i < 1000; i++) if (rollRoles(5, allRandomSetup()).vampire === 1) one++;
    expect(one).toBeGreaterThan(820);
  });
});
