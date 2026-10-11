import {
  alivePlayers,
  availableNightAbilities,
  checkWinner,
  publicRoleOf,
  resolveDayVote,
  resolveDayVoteCounts,
  resolveNight,
  skipNight,
} from '@/game';

import { alive, everyoneVotes, makeGame } from '../test-utils/game';

describe('İlk gece ayarı', () => {
  it('kapalıysa ilk gece kimse yetenek kullanamaz', () => {
    const g = makeGame(['vampire', 'healer', 'witch', 'villager'], { firstNightActions: false });
    expect(g.players.every((p) => availableNightAbilities(g, p).length === 0)).toBe(true);
  });

  it('kapalıysa ilk gece gönderilen ısırık da işlemez', () => {
    const g = resolveNight(makeGame(['vampire', 'villager', 'villager'], { firstNightActions: false }), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(g.players.every((p) => p.alive)).toBe(true);
  });

  it('kapalıyken 1. günden sonraki gece yetenekler açılır', () => {
    let g = makeGame(['vampire', 'villager', 'villager', 'villager'], { firstNightActions: false });
    g = resolveDayVote(skipNight(g), {});
    expect(g.round).toBe(2);
    expect(availableNightAbilities(g, g.players[0]).map((a) => a.id)).toEqual(['bite']);
  });
});

describe('Gündüz oylaması', () => {
  it('en çok oyu alan asılır ve gece başlar', () => {
    const g = resolveDayVote(makeGame(['vampire', 'villager', 'villager', 'villager']), everyoneVotes(makeGame(['vampire', 'villager', 'villager', 'villager']), 'p2'));
    expect(alive(g, 'p2')).toBe(false);
    expect(g.phase).toBe('night');
    expect(g.round).toBe(2);
  });

  it('eşitlikte kimse asılmaz', () => {
    const g = resolveDayVote(makeGame(['vampire', 'villager', 'villager', 'villager']), { p1: 'p2', p2: 'p1' });
    expect(alivePlayers(g)).toHaveLength(4);
  });

  it('kimse oy vermezse (pas) kimse asılmaz', () => {
    const g = resolveDayVote(makeGame(['vampire', 'villager', 'villager']), {});
    expect(alivePlayers(g)).toHaveLength(3);
  });

  it('ölülerin verdiği ve ölülere verilen oylar sayılmaz', () => {
    let g = resolveNight(makeGame(['vampire', 'villager', 'villager', 'villager', 'villager']), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    g = resolveDayVote(g, { p2: 'p3', p4: 'p2', p5: 'p3' });
    expect(alive(g, 'p3')).toBe(false);
  });

  it('açık oylamada sayıya göre asılır, eşitlikte kimse asılmaz', () => {
    const base = makeGame(['vampire', 'villager', 'villager', 'villager', 'villager']);
    expect(alive(resolveDayVoteCounts(base, { p1: 3, p2: 1 }), 'p1')).toBe(false);
    expect(alivePlayers(resolveDayVoteCounts(base, { p1: 2, p2: 2 }))).toHaveLength(5);
  });
});

describe('Kazanma koşulları', () => {
  it('tüm vampirler ölünce köy kazanır', () => {
    const g = resolveDayVote(makeGame(['vampire', 'villager', 'villager', 'villager']), { p2: 'p1', p3: 'p1', p4: 'p1' });
    expect(g.winner).toBe('village');
  });

  it('vampirler köylülere eşit olunca vampirler kazanır', () => {
    const g = resolveNight(makeGame(['vampire', 'villager', 'villager']), [{ actorId: 'p1', abilityId: 'bite', targetId: 'p2' }]);
    expect(g.winner).toBe('vampire');
  });

  it('oyun sürüyorsa kazanan yok', () => {
    expect(checkWinner(makeGame(['vampire', 'villager', 'villager', 'villager']))).toBeNull();
  });
});

describe('Ölenin rolü ayarı', () => {
  it('açıksa ölünün rolü herkese açık', () => {
    const g = resolveNight(makeGame(['vampire', 'healer', 'villager', 'villager'], { revealRoleOnDeath: true }), [
      { actorId: 'p1', abilityId: 'bite', targetId: 'p2' },
    ]);
    expect(publicRoleOf(g, g.players[1])).toBe('healer');
  });

  it('kapalıysa hiçbir ölümde rol açıklanmaz', () => {
    let g = makeGame(['vampire', 'avenger', 'villager', 'villager', 'villager', 'villager'], { revealRoleOnDeath: false });
    g = resolveDayVote(resolveNight(g, [{ actorId: 'p1', abilityId: 'bite', targetId: 'p3' }]), { p1: 'p2', p4: 'p2', p5: 'p2' });
    expect(publicRoleOf(g, g.players[2])).toBeNull();
    expect(publicRoleOf(g, g.players[1])).toBeNull();
  });

  it('yaşayanların rolü hiçbir zaman açıklanmaz', () => {
    const g = makeGame(['vampire', 'villager', 'villager'], { revealRoleOnDeath: true });
    expect(publicRoleOf(g, g.players[0])).toBeNull();
  });
});
