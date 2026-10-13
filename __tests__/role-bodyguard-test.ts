import { findAbility, getValidTargets, resolveNight } from '@/game';
import { alive, makeGame } from '@test-utils/game';

// p1 vampir, p2 Fedai, p3 korunan, diğerleri köylü
const roles = ['vampire', 'bodyguard', 'villager', 'villager', 'villager'] as const;

describe('Fedai', () => {
  it('korunan saldırıya uğrarsa onun yerine Fedai ölür', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'guard', targetId: 'p3' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
    ]);
    expect(alive(g, 'p3')).toBe(true);
    expect(alive(g, 'p2')).toBe(false);
    expect(g.events).toContainEqual(expect.objectContaining({ type: 'death', playerId: 'p2', cause: 'sacrifice' }));
  });

  it("Büyücü'nün lanetini de üstlenir", () => {
    const g = resolveNight(makeGame(['vampire', 'bodyguard', 'witch', 'villager', 'villager']), [
      { actorId: 'p2', abilityId: 'guard', targetId: 'p4' },
      { actorId: 'p3', abilityId: 'curse', targetId: 'p4' },
    ]);
    expect(alive(g, 'p4')).toBe(true);
    expect(alive(g, 'p2')).toBe(false);
  });

  it('Şifacı korunanı koruduysa kimse ölmez', () => {
    const g = resolveNight(makeGame(['vampire', 'bodyguard', 'healer', 'villager', 'villager']), [
      { actorId: 'p2', abilityId: 'guard', targetId: 'p4' },
      { actorId: 'p3', abilityId: 'heal', targetId: 'p4' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p4' },
    ]);
    expect(g.players.every((p) => p.alive)).toBe(true);
  });

  it("Şifacı Fedai'yi koruduysa Fedai de kurtulur", () => {
    const g = resolveNight(makeGame(['vampire', 'bodyguard', 'healer', 'villager', 'villager']), [
      { actorId: 'p2', abilityId: 'guard', targetId: 'p4' },
      { actorId: 'p3', abilityId: 'heal', targetId: 'p2' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p4' },
    ]);
    expect(g.players.every((p) => p.alive)).toBe(true);
  });

  it('korunan saldırıya uğramazsa Fedai yaşar', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'guard', targetId: 'p3' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p4' },
    ]);
    expect(alive(g, 'p2')).toBe(true);
    expect(alive(g, 'p4')).toBe(false);
  });

  it('kendini koruyamaz', () => {
    const g = makeGame([...roles]);
    const targets = getValidTargets(g, g.players[1], findAbility(g.players[1], 'guard')).map((p) => p.id);
    expect(targets).not.toContain('p2');
  });
});
