import { availableNightAbilities, resolveDayVote, resolveNight, resolveTrigger, teamOf } from '@/game';
import { makeGame } from '@test-utils/game';

// p1 vampir, p2 Rol Çalan, p3 Şifacı, diğerleri köylü
const roles = ['vampire', 'thief', 'healer', 'villager', 'villager', 'villager'] as const;

describe('Rol Çalan', () => {
  it('işaretlediği kişi gece ölürse onun rolünü alır', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'mark', targetId: 'p3' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
    ]);
    expect(g.players[1].roleId).toBe('healer');
    expect(g.players[1].convertedFrom).toBe('thief');
    expect(teamOf(g.players[1])).toBe('village');
  });

  it('işaretlediği kişi oylamada asılırsa da rolünü alır (vampir → vampir olur)', () => {
    let g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'mark', targetId: 'p1' }]);
    g = resolveDayVote(g, { p3: 'p1', p4: 'p1', p5: 'p1' });
    expect(g.players[1].roleId).toBe('vampire');
    expect(teamOf(g.players[1])).toBe('vampire');
    // Köy, vampiri astı ama Rol Çalan vampir oldu: oyun bitmedi
    expect(g.winner).toBeNull();
  });

  it('intikamla ölen işaretlinin de rolünü alır', () => {
    let g = makeGame(['vampire', 'thief', 'avenger', 'villager', 'villager', 'villager']);
    g = resolveNight(g, [{ actorId: 'p2', abilityId: 'mark', targetId: 'p4' }]);
    g = resolveDayVote(g, { p1: 'p3', p4: 'p3', p5: 'p3' });
    g = resolveTrigger(g, g.pendingTriggers[0], 'p4');
    expect(g.players[1].roleId).toBe('villager');
  });

  it('oyunda yalnızca bir kez işaretler', () => {
    let g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'mark', targetId: 'p4' }]);
    g = resolveDayVote(g, {});
    expect(availableNightAbilities(g, g.players[1])).toHaveLength(0);
  });

  it('işaretli yaşarken rolü değişmez', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'mark', targetId: 'p4' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p5' },
    ]);
    expect(g.players[1].roleId).toBe('thief');
  });

  it('kendisi de aynı anda ölürse rol almaz', () => {
    let g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'mark', targetId: 'p4' }]);
    g = resolveDayVote(g, {});
    // Vampir ısırırken... Rol Çalan'ı ve işaretliyi aynı anda öldürmek için Büyücü yok; oylamayla Rol Çalan asılır
    g = resolveDayVote(resolveNight(g, [{ actorId: 'p1', abilityId: 'bite', targetId: 'p2' }]), { p1: 'p4', p3: 'p4', p5: 'p4' });
    expect(g.players[1].alive).toBe(false);
    expect(g.players[1].roleId).toBe('thief');
  });
});
