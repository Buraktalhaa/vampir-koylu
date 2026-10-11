import { resolveDayVote, resolveNight, resolveTrigger } from '@/game';

import { makeGame } from '../test-utils/game';

describe('Olay kaydı (oyun sonu özeti)', () => {
  it('gece kullanılan yetenekleri, kurtarmaları ve ölümleri tur/faz ile kaydeder', () => {
    const g = resolveNight(makeGame(['vampire', 'healer', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
      { actorId: 'p2', abilityId: 'heal', targetId: 'p3' },
    ]);
    const summary = g.events.map((e) => [e.type, e.round, e.phase]);
    expect(summary).toEqual([
      ['ability', 1, 'night'],
      ['ability', 1, 'night'],
      ['saved', 1, 'night'],
    ]);
  });

  it('asılma ve intikam, oylamanın yapıldığı güne yazılır (sonraki geceye değil)', () => {
    let g = makeGame(['vampire', 'avenger', 'villager', 'villager', 'villager', 'villager']);
    g = resolveNight(g, []);
    g = resolveDayVote(g, { p1: 'p2', p3: 'p2', p4: 'p2' });
    g = resolveTrigger(g, g.pendingTriggers[0], 'p1');
    const dayEvents = g.events.filter((e) => e.phase === 'day');
    expect(dayEvents.map((e) => e.type)).toEqual(['death', 'ability', 'death']);
    expect(dayEvents.every((e) => e.round === 1)).toBe(true);
    expect(dayEvents[2]).toMatchObject({ type: 'death', playerId: 'p1', cause: 'revenge', by: 'p2' });
  });

  it('ölüm nedenlerini doğru yazar', () => {
    const g = resolveNight(makeGame(['vampire', 'witch', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
      { actorId: 'p2', abilityId: 'curse', targetId: 'p4' },
    ]);
    const causes = Object.fromEntries(g.events.filter((e) => e.type === 'death').map((e) => [e.type === 'death' ? e.playerId : '', e.type === 'death' ? e.cause : '']));
    expect(causes).toEqual({ p3: 'vampire', p4: 'spell' });
  });
});
