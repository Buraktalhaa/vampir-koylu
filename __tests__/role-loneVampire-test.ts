import { availableNightAbilities, findAbility, getValidTargets, isKnownTeammate, resolveDayVote, resolveNight, seenTeamOf } from '@/game';
import { alive, makeGame } from '@test-utils/game';

// p1 vampir, p2 Yalnız Vampir, diğerleri köylü
const roles = ['vampire', 'loneVampire', 'villager', 'villager', 'villager', 'villager'] as const;

describe('Yalnız Vampir', () => {
  it('diğer vampir yaşarken yeteneği yok', () => {
    const g = makeGame([...roles]);
    expect(availableNightAbilities(g, g.players[1])).toHaveLength(0);
  });

  it('vampirler onu tanımaz, o da onları', () => {
    const g = makeGame([...roles]);
    expect(isKnownTeammate(g.players[0], g.players[1])).toBe(false);
    expect(isKnownTeammate(g.players[1], g.players[0])).toBe(false);
  });

  it('vampirler onu ısırabilir (takım arkadaşı olarak kilitlenmez)', () => {
    const g = makeGame([...roles]);
    const targets = getValidTargets(g, g.players[0], findAbility(g.players[0], 'bite')).map((p) => p.id);
    expect(targets).toContain('p2');
  });

  it("Kâhin'e köylü görünür", () => {
    expect(seenTeamOf('loneVampire')).toBe('village');
  });

  it('diğer vampirler ölünce ısırma açılır ve öldürebilir', () => {
    let g = resolveDayVote(resolveNight(makeGame([...roles]), []), { p3: 'p1', p4: 'p1', p5: 'p1' });
    expect(alive(g, 'p1')).toBe(false);
    expect(g.winner).toBeNull(); // Yalnız Vampir yaşıyor: köy henüz kazanmadı
    expect(availableNightAbilities(g, g.players[1]).map((a) => a.id)).toEqual(['bite']);
    g = resolveNight(g, [{ actorId: 'p2', abilityId: 'bite', targetId: 'p3' }]);
    expect(alive(g, 'p3')).toBe(false);
  });

  it('o da ölünce köy kazanır', () => {
    let g = resolveDayVote(resolveNight(makeGame([...roles]), []), { p3: 'p1', p4: 'p1', p5: 'p1' });
    g = resolveDayVote(resolveNight(g, []), { p3: 'p2', p4: 'p2', p5: 'p2' });
    expect(g.winner).toBe('village');
  });
});
