import {
  availableNightAbilities,
  findAbility,
  getValidTargets,
  resolveDayVote,
  resolveNight,
  resolveTrigger,
  seenTeamOf,
  skipTrigger,
} from '@/game';

import { alive, makeGame } from '@test-utils/game';

// Oyuncu sırası her testte açıkça yazılı: p1, p2, ...

describe('Vampir', () => {
  it('seçtiği kişiyi gece öldürür', () => {
    const g = resolveNight(makeGame(['vampire', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(alive(g, 'p2')).toBe(false);
  });

  it('takım arkadaşını hedef seçemez', () => {
    const g = makeGame(['vampire', 'vampire', 'villager', 'villager', 'villager']);
    const targets = getValidTargets(g, g.players[0], findAbility(g.players[0], 'bite')).map((p) => p.id);
    expect(targets).not.toContain('p2');
    expect(targets).not.toContain('p1');
  });

  it('iki vampir aynı kişiyi seçerse o kişi ölür', () => {
    const g = resolveNight(makeGame(['vampire', 'vampire', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
      { actorId: 'p2', abilityId: 'bite', targetId: 'p3' },
    ]);
    expect(alive(g, 'p3')).toBe(false);
    expect(g.players.filter((p) => !p.alive)).toHaveLength(1);
  });

  it('oylar eşitse kurban rastgele seçilir ama yalnızca bir kişi ölür', () => {
    const base = makeGame(['vampire', 'vampire', 'villager', 'villager', 'villager']);
    const subs = [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
      { actorId: 'p2', abilityId: 'bite', targetId: 'p4' },
    ];
    const low = resolveNight(base, subs, () => 0);
    const high = resolveNight(base, subs, () => 0.99);
    expect(low.players.filter((p) => !p.alive)).toHaveLength(1);
    expect(high.players.filter((p) => !p.alive)).toHaveLength(1);
    expect(alive(low, 'p3')).not.toBe(alive(high, 'p3'));
  });

  it('ısırık zorunludur (pas geçilemez)', () => {
    const g = makeGame(['vampire', 'villager', 'villager']);
    expect(findAbility(g.players[0], 'bite').required).toBe(true);
  });
});

describe('Şifacı', () => {
  it('koruduğu kişi vampir saldırısından ölmez', () => {
    const g = resolveNight(makeGame(['vampire', 'healer', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p3' },
      { actorId: 'p2', abilityId: 'heal', targetId: 'p3' },
    ]);
    expect(alive(g, 'p3')).toBe(true);
    expect(g.events.some((e) => e.type === 'saved' && e.playerId === 'p3')).toBe(true);
  });

  it('kendini koruyabilir', () => {
    const g = makeGame(['vampire', 'healer', 'villager', 'villager']);
    const targets = getValidTargets(g, g.players[1], findAbility(g.players[1], 'heal')).map((p) => p.id);
    expect(targets).toContain('p2');
  });

  it('aynı kişiyi art arda iki gece koruyamaz', () => {
    let g = makeGame(['vampire', 'healer', 'villager', 'villager', 'villager']);
    g = resolveNight(g, [{ actorId: 'p2', abilityId: 'heal', targetId: 'p3' }]);
    g = resolveDayVote(g, {});
    const healer = g.players[1];
    const targets = getValidTargets(g, healer, findAbility(healer, 'heal')).map((p) => p.id);
    expect(targets).not.toContain('p3');
  });

  it('kendini de art arda iki gece koruyamaz', () => {
    let g = makeGame(['vampire', 'healer', 'villager', 'villager', 'villager']);
    g = resolveNight(g, [{ actorId: 'p2', abilityId: 'heal', targetId: 'p2' }]);
    g = resolveDayVote(g, {});
    const targets = getValidTargets(g, g.players[1], findAbility(g.players[1], 'heal')).map((p) => p.id);
    expect(targets).not.toContain('p2');
  });

  it('arada bir gece boş geçerse aynı kişiyi tekrar koruyabilir', () => {
    let g = makeGame(['vampire', 'healer', 'villager', 'villager', 'villager']);
    g = resolveNight(g, [{ actorId: 'p2', abilityId: 'heal', targetId: 'p3' }]);
    g = resolveDayVote(g, {});
    g = resolveNight(g, []);
    g = resolveDayVote(g, {});
    const targets = getValidTargets(g, g.players[1], findAbility(g.players[1], 'heal')).map((p) => p.id);
    expect(targets).toContain('p3');
  });
});

describe('Büyücü', () => {
  const roles = ['vampire', 'witch', 'healer', 'villager', 'villager', 'villager'] as const;

  it('Ölüm Laneti hedefi öldürür', () => {
    const g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'curse', targetId: 'p4' }]);
    expect(alive(g, 'p4')).toBe(false);
  });

  it('Şifacı korursa lanet işlemez', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'curse', targetId: 'p4' },
      { actorId: 'p3', abilityId: 'heal', targetId: 'p4' },
    ]);
    expect(alive(g, 'p4')).toBe(true);
  });

  it('Koruma Kalkanı o gece herkesi korur', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'shield' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p5' },
    ]);
    expect(g.players.every((p) => p.alive)).toBe(true);
  });

  it('bir gecede en fazla bir büyü kullanır; ikincisi yok sayılır ve hakkı harcanmaz', () => {
    const g = resolveNight(makeGame([...roles]), [
      { actorId: 'p2', abilityId: 'shield' },
      { actorId: 'p2', abilityId: 'curse', targetId: 'p1' },
    ]);
    expect(alive(g, 'p1')).toBe(true);
    expect(g.players[1].abilityState.shield.usesLeft).toBe(0);
    expect(g.players[1].abilityState.curse.usesLeft).toBe(1);
  });

  it('her büyü yalnızca bir kez kullanılabilir', () => {
    let g = resolveNight(makeGame([...roles]), [{ actorId: 'p2', abilityId: 'shield' }]);
    g = resolveDayVote(g, {});
    const witch = g.players[1];
    expect(availableNightAbilities(g, witch).map((a) => a.id)).toEqual(['curse']);
    g = resolveNight(g, [
      { actorId: 'p2', abilityId: 'shield' },
      { actorId: 'p1', abilityId: 'bite', targetId: 'p5' },
    ]);
    expect(alive(g, 'p5')).toBe(false);
  });
});

describe('İntikamcı', () => {
  it('asılırsa tetiklenir ve yanında birini götürür', () => {
    let g = makeGame(['vampire', 'avenger', 'villager', 'villager', 'villager', 'villager']);
    g = resolveNight(g, []);
    g = resolveDayVote(g, { p1: 'p2', p3: 'p2', p4: 'p2', p5: 'p2' });
    expect(g.pendingTriggers).toHaveLength(1);
    expect(g.winner).toBeNull();
    g = resolveTrigger(g, g.pendingTriggers[0], 'p1');
    expect(alive(g, 'p1')).toBe(false);
    expect(g.winner).toBe('village');
  });

  it('gece öldürülürse tetiklenmez', () => {
    const g = resolveNight(makeGame(['vampire', 'avenger', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(alive(g, 'p2')).toBe(false);
    expect(g.pendingTriggers).toHaveLength(0);
  });

  it('pas geçerse kimseyi götürmez', () => {
    let g = makeGame(['vampire', 'avenger', 'villager', 'villager', 'villager', 'villager']);
    g = resolveDayVote(resolveNight(g, []), { p1: 'p2', p3: 'p2', p4: 'p2' });
    const before = g.players.filter((p) => p.alive).length;
    g = skipTrigger(g, g.pendingTriggers[0]);
    expect(g.players.filter((p) => p.alive)).toHaveLength(before);
    expect(g.pendingTriggers).toHaveLength(0);
  });
});

describe('Köylü', () => {
  it('gece yapacak bir şeyi yok', () => {
    const g = makeGame(['vampire', 'villager', 'villager']);
    expect(availableNightAbilities(g, g.players[1])).toHaveLength(0);
  });
});

describe('Kâhin', () => {
  it('takımları doğru görür: köy, vampir, tarafsız', () => {
    expect(seenTeamOf('villager')).toBe('village');
    expect(seenTeamOf('vampire')).toBe('vampire');
    expect(seenTeamOf('jester')).toBe('neutral');
  });

  it('kehaneti olay kaydına takım olarak yazılır', () => {
    const g = resolveNight(makeGame(['vampire', 'seer', 'villager', 'villager']), [
      { actorId: 'p2', abilityId: 'divine', targetId: 'p1' },
    ]);
    expect(g.events).toContainEqual(expect.objectContaining({ type: 'investigated', actorId: 'p2', targetId: 'p1', seenTeam: 'vampire' }));
  });

  it('kendine bakamaz', () => {
    const g = makeGame(['vampire', 'seer', 'villager']);
    const targets = getValidTargets(g, g.players[1], findAbility(g.players[1], 'divine')).map((p) => p.id);
    expect(targets).not.toContain('p2');
  });
});

describe('Belediye Başkanı', () => {
  it('gizli oylamada oyu 2 sayılır', () => {
    // p2 (Başkan) → p1, p3 → p4: 2'ye 1, p1 asılır
    const g = resolveDayVote(makeGame(['vampire', 'mayor', 'villager', 'villager']), { p2: 'p1', p3: 'p4' });
    expect(alive(g, 'p1')).toBe(false);
  });

  it('2 oy, 2 tek oyla eşitlenirse kimse asılmaz', () => {
    const g = resolveDayVote(makeGame(['vampire', 'mayor', 'villager', 'villager', 'villager']), { p2: 'p1', p3: 'p4', p5: 'p4' });
    expect(g.players.every((p) => p.alive)).toBe(true);
  });

  it('ölü başkanın oyu sayılmaz', () => {
    let g = resolveNight(makeGame(['vampire', 'mayor', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    g = resolveDayVote(g, { p2: 'p1', p3: 'p4' });
    expect(alive(g, 'p4')).toBe(false);
    expect(alive(g, 'p1')).toBe(true);
  });
});

describe('Deli', () => {
  it('köy onu asarsa tek başına kazanır ve oyun biter', () => {
    const g = resolveDayVote(makeGame(['vampire', 'jester', 'villager', 'villager', 'villager']), { p1: 'p2', p3: 'p2', p4: 'p2' });
    expect(g.winner).toBe('neutral');
    expect(g.winners).toEqual(['p2']);
  });

  it('gece öldürülürse kazanmaz', () => {
    const g = resolveNight(makeGame(['vampire', 'jester', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(g.winner).toBeNull();
    expect(g.winners).toBeUndefined();
  });

  it('İntikamcı götürürse kazanmaz', () => {
    let g = makeGame(['vampire', 'avenger', 'jester', 'villager', 'villager', 'villager']);
    g = resolveDayVote(resolveNight(g, []), { p1: 'p2', p4: 'p2', p5: 'p2' });
    g = resolveTrigger(g, g.pendingTriggers[0], 'p3');
    expect(g.winner).toBeNull();
  });

  it('vampirler ölünce köy kazanır, hayattaki deli kaybeder', () => {
    const g = resolveDayVote(makeGame(['vampire', 'jester', 'villager', 'villager']), { p2: 'p1', p3: 'p1', p4: 'p1' });
    expect(g.winner).toBe('village');
    expect(g.winners).toBeUndefined();
  });
});
