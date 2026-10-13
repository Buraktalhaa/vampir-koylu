import { availableNightAbilities, findAbility, getValidTargets, resolveDayVote, resolveNight } from '@/game';
import { alive, makeGame } from '@test-utils/game';

// p1 vampir, p2 Şaman, diğerleri köylü
const roles = ['vampire', 'shaman', 'villager', 'villager', 'villager', 'villager'] as const;

describe('Şaman', () => {
  it('ölen yokken yeteneği görünmez', () => {
    const g = makeGame([...roles]);
    expect(availableNightAbilities(g, g.players[1])).toHaveLength(0);
  });

  it('yalnızca ölüleri hedefleyebilir', () => {
    let g = resolveNight(makeGame([...roles]), [{ actorId: 'p1', abilityId: 'bite', targetId: 'p3' }]);
    g = resolveDayVote(g, {});
    const targets = getValidTargets(g, g.players[1], findAbility(g.players[1], 'raise')).map((p) => p.id);
    expect(targets).toEqual(['p3']);
  });

  it('ölü birini diriltir; rolü kalır', () => {
    let g = resolveNight(makeGame([...roles]), [{ actorId: 'p1', abilityId: 'bite', targetId: 'p3' }]);
    g = resolveDayVote(g, {});
    g = resolveNight(g, [{ actorId: 'p2', abilityId: 'raise', targetId: 'p3' }]);
    expect(alive(g, 'p3')).toBe(true);
    expect(g.players[2].roleId).toBe('villager');
    expect(g.events).toContainEqual(expect.objectContaining({ type: 'revived', playerId: 'p3', by: 'p2' }));
  });

  it('oyun boyunca yalnızca bir kez', () => {
    let g = resolveNight(makeGame([...roles]), [{ actorId: 'p1', abilityId: 'bite', targetId: 'p3' }]);
    g = resolveDayVote(g, {});
    g = resolveNight(g, [
      { actorId: 'p2', abilityId: 'raise', targetId: 'p3' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p4' },
    ]);
    g = resolveDayVote(g, {});
    expect(availableNightAbilities(g, g.players[1])).toHaveLength(0);
  });
});
