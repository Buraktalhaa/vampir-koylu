import { findAbility, getValidTargets, resolveNight } from '@/game';
import { makeGame } from '@test-utils/game';

// p1 vampir, p2 Dedektif, p3 vampir, p4-p5 köylü, p6 Deli
const roles = ['vampire', 'detective', 'vampire', 'villager', 'villager', 'jester'] as const;

const compare = (a: string, b: string) => {
  const g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'compare', targetId: a, secondTargetId: b }]);
  return g.events.find((e) => e.type === 'compared');
};

describe('Dedektif', () => {
  it('iki vampir → aynı takım', () => {
    expect(compare('p1', 'p3')).toMatchObject({ sameTeam: true });
  });

  it('iki köylü → aynı takım', () => {
    expect(compare('p4', 'p5')).toMatchObject({ sameTeam: true });
  });

  it('vampir ve köylü → farklı takım', () => {
    expect(compare('p1', 'p4')).toMatchObject({ sameTeam: false });
  });

  it('köylü ve tarafsız (Deli) → farklı takım', () => {
    expect(compare('p4', 'p6')).toMatchObject({ sameTeam: false });
  });

  it('aynı kişiyi iki kez seçemez (aksiyon geçersiz sayılır)', () => {
    expect(compare('p4', 'p4')).toBeUndefined();
  });

  it('ikinci hedef olmadan geçersiz', () => {
    const g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'compare', targetId: 'p4' }]);
    expect(g.events.some((e) => e.type === 'compared')).toBe(false);
  });

  it('kendini seçemez', () => {
    const g = makeGame([...roles]);
    const targets = getValidTargets(g, g.players[1], findAbility(g.players[1], 'compare')).map((p) => p.id);
    expect(targets).not.toContain('p2');
  });
});
