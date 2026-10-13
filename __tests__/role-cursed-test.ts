import { availableNightAbilities, isKnownTeammate, resolveNight, teamOf } from '@/game';
import { alive, makeGame } from '@test-utils/game';

// p1 vampir, p2 Lanetli, diğerleri köylü / Şifacı / Fedai
describe('Lanetli', () => {
  it('ısırılınca ölmez, vampire dönüşür', () => {
    const g = resolveNight(makeGame(['vampire', 'cursed', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    const p2 = g.players[1];
    expect(alive(g, 'p2')).toBe(true);
    expect(p2.roleId).toBe('vampire');
    expect(p2.convertedFrom).toBe('cursed');
    expect(teamOf(p2)).toBe('vampire');
    expect(g.events).toContainEqual(expect.objectContaining({ type: 'converted', playerId: 'p2', toRoleId: 'vampire' }));
  });

  it('dönüşünce vampirlerle tanışır ve ısırabilir', () => {
    let g = resolveNight(makeGame(['vampire', 'cursed', 'villager', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(isKnownTeammate(g.players[0], g.players[1])).toBe(true);
    g = { ...g, phase: 'night', round: 2 };
    expect(availableNightAbilities(g, g.players[1]).map((a) => a.id)).toEqual(['bite']);
  });

  it('Şifacı korursa dönüşmez', () => {
    const g = resolveNight(makeGame(['vampire', 'cursed', 'healer', 'villager', 'villager']), [
      { actorId: 'p3', abilityId: 'heal', targetId: 'p2' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(g.players[1].roleId).toBe('cursed');
  });

  it("Büyücü'nün laneti onu dönüştürmez, öldürür", () => {
    const g = resolveNight(makeGame(['vampire', 'cursed', 'witch', 'villager', 'villager']), [
      { actorId: 'p3', abilityId: 'curse', targetId: 'p2' },
    ]);
    expect(alive(g, 'p2')).toBe(false);
  });
});
