import { resolveNight } from '@/game';
import { alive, makeGame } from '@test-utils/game';

// p1 vampir, p2 Gece Misafiri, diğerleri köylü
const roles = ['vampire', 'visitor', 'villager', 'villager', 'villager'] as const;

describe('Gece Misafiri', () => {
  it('kendi evine saldırı gelirse evde olmadığı için ölmez', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'visit', targetId: 'p3' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(alive(g, 'p2')).toBe(true);
  });

  it('vampirin evine giderse ölür', () => {
    const g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'visit', targetId: 'p1' }]);
    expect(alive(g, 'p2')).toBe(false);
    expect(g.events).toContainEqual(expect.objectContaining({ type: 'death', playerId: 'p2', cause: 'visit' }));
  });

  it('gittiği ev saldırıya uğrarsa ev sahibiyle birlikte ölür', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'visit', targetId: 'p3' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
    ]);
    expect(alive(g, 'p3')).toBe(false);
    expect(alive(g, 'p2')).toBe(false);
  });

  it('ev sahibi korunsa bile saldırı olduysa misafir ölür', () => {
    const g = resolveNight(makeGame(['vampire', 'visitor', 'healer', 'villager', 'villager']), [
      { actorId: 'p2', abilityId: 'visit', targetId: 'p4' },
      { actorId: 'p3', abilityId: 'heal', targetId: 'p4' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p4' },
    ]);
    expect(alive(g, 'p4')).toBe(true);
    expect(alive(g, 'p2')).toBe(false);
  });

  it('güvenli bir eve giderse ve kimse saldırmazsa yaşar', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'visit', targetId: 'p3' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p4' },
    ]);
    expect(alive(g, 'p2')).toBe(true);
  });
});
