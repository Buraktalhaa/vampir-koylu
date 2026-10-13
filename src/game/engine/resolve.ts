import { getRole } from '@/game/roles';
import { checkWinner, teamOf } from '@/game/teams';
import type {
  ActionSubmission,
  DeathEvent,
  EventBody,
  GameEvent,
  GameState,
  PendingTrigger,
  Player,
  PlayerId,
  Rng,
} from '@/game/types';
import { EFFECTS, type EffectContext, type ResolvedAction } from '@/game/engine/effects';
import { canUseAbility, findAbility, findPlayer, getValidTargets, needsTarget } from '@/game/engine/targeting';

type Resolvable = ResolvedAction & { effect: keyof typeof EFFECTS };

function pickMostVoted(targets: PlayerId[], rng: Rng): PlayerId {
  const counts = new Map<PlayerId, number>();
  for (const t of targets) counts.set(t, (counts.get(t) ?? 0) + 1);
  const max = Math.max(...counts.values());
  const tied = [...counts].filter(([, c]) => c === max).map(([id]) => id);
  return tied[Math.floor(rng() * tied.length)];
}

/** Geçersiz aksiyonları ayıklar, takım oylarını tek aksiyona indirger. */
function collectNightActions(
  state: GameState,
  submissions: ActionSubmission[],
  rng: Rng,
): { actions: Resolvable[]; used: ActionSubmission[] } {
  const used: ActionSubmission[] = [];
  const teamVotes = new Map<string, { actorIds: PlayerId[]; targets: PlayerId[] }>();
  const actions: Resolvable[] = [];
  const actionCount = new Map<PlayerId, number>();

  for (const sub of submissions) {
    const actor = findPlayer(state, sub.actorId);
    const ability = findAbility(actor, sub.abilityId);
    if (ability.trigger !== 'night' || !canUseAbility(state, actor, ability)) continue;
    if (needsTarget(ability)) {
      const valid = new Set(getValidTargets(state, actor, ability).map((p) => p.id));
      if (!sub.targetId || !valid.has(sub.targetId)) continue;
      // İki hedefli yetenek: ikinci hedef de geçerli ve birinciden farklı olmalı.
      if ((ability.targets ?? 1) === 2 && (!sub.secondTargetId || sub.secondTargetId === sub.targetId || !valid.has(sub.secondTargetId))) {
        continue;
      }
    }
    const count = actionCount.get(actor.id) ?? 0;
    if (count >= (getRole(actor.roleId).maxNightActions ?? 1)) continue;
    actionCount.set(actor.id, count + 1);
    used.push(sub);

    if (ability.teamVote) {
      const key = `${teamOf(actor)}:${actor.roleId}:${ability.id}`;
      const vote = teamVotes.get(key) ?? { actorIds: [], targets: [] };
      vote.actorIds.push(actor.id);
      vote.targets.push(sub.targetId!);
      teamVotes.set(key, vote);
      continue;
    }
    actions.push({
      actorId: actor.id,
      targetId: sub.targetId,
      secondTargetId: sub.secondTargetId,
      effect: ability.effect,
      cause: ability.cause ?? 'ability',
    });
  }

  for (const { actorIds, targets } of teamVotes.values()) {
    const actor = findPlayer(state, actorIds[0]);
    const ability = getRole(actor.roleId).abilities.find((a) => a.teamVote)!;
    actions.push({ actorId: actor.id, targetId: pickMostVoted(targets, rng), effect: ability.effect, cause: ability.cause ?? 'ability' });
  }

  return { actions, used };
}

function withAbilityUsed(state: GameState, players: Player[], actorId: PlayerId, abilityId: string, targetId?: PlayerId) {
  return players.map((p) => {
    if (p.id !== actorId) return p;
    const prev = p.abilityState[abilityId] ?? {};
    return {
      ...p,
      abilityState: {
        ...p.abilityState,
        [abilityId]: {
          lastTarget: targetId,
          lastUsedRound: state.round,
          usesLeft: prev.usesLeft === undefined ? undefined : prev.usesLeft - 1,
        },
      },
    };
  });
}

/** Olaylara tur ve faz bilgisini ekler. */
function stamp(at: { round: number; phase: GameState['phase'] }, events: EventBody[]): GameEvent[] {
  return events.map((e) => ({ ...e, round: at.round, phase: at.phase }));
}

/** Ölümleri uygular, ölenlerin onDeath yeteneklerini kuyruğa alır, kazananı kontrol eder. */
function applyDeaths(
  state: GameState,
  deaths: EffectContext['deaths'],
  at: { round: number; phase: GameState['phase'] } = state,
): GameState {
  const players = state.players.map((p) => (deaths.has(p.id) ? { ...p, alive: false } : p));
  const triggers: PendingTrigger[] = [];
  for (const [id, { cause }] of deaths) {
    const player = players.find((p) => p.id === id)!;
    for (const ability of getRole(player.roleId).abilities) {
      if (ability.trigger !== 'onDeath' || !canUseAbility(state, player, ability)) continue;
      if (!ability.deathCauses || ability.deathCauses.includes(cause)) {
        triggers.push({ actorId: id, abilityId: ability.id, round: at.round, phase: at.phase });
      }
    }
  }
  const deathEvents: EventBody[] = [...deaths].map(([playerId, d]) => ({ type: 'death' as const, playerId, ...d }));

  // Rol Çalan: işaretlediği kişi (nasıl olursa olsun) öldüyse onun rolünü alır.
  const stolen = new Map<PlayerId, string>();
  for (const thief of players) {
    const via = getRole(thief.roleId).stealsRoleVia;
    const mark = via ? thief.abilityState[via]?.lastTarget : undefined;
    if (thief.alive && mark && deaths.has(mark)) stolen.set(thief.id, findPlayer(state, mark).roleId);
  }
  for (const [id, toRoleId] of stolen) {
    const fromRoleId = players.find((p) => p.id === id)!.roleId;
    const i = players.findIndex((p) => p.id === id);
    players[i] = {
      ...players[i],
      roleId: toRoleId,
      convertedFrom: fromRoleId,
      abilityState: Object.fromEntries(getRole(toRoleId).abilities.map((ab) => [ab.id, { usesLeft: ab.uses }])),
    };
    deathEvents.push({ type: 'converted', playerId: id, fromRoleId, toRoleId });
  }
  const events = stamp(at, deathEvents);
  const next = {
    ...state,
    players,
    events: [...state.events, ...events],
    pendingTriggers: [...state.pendingTriggers, ...triggers],
  };
  // Köyün astığı "asılırsa kazanır" rolü (ör. Deli) tek başına kazanır; oyun hemen biter.
  const soloWinner = [...deaths].find(([id, d]) => d.cause === 'lynch' && getRole(findPlayer(state, id).roleId).winsIfLynched);
  if (soloWinner) return { ...next, pendingTriggers: [], winner: 'neutral', winners: [soloWinner[0]] };
  // Bekleyen tetikleyici varsa (ör. İntikamcı) kazanan, atış yapıldıktan sonra belirlenir.
  return { ...next, winner: next.pendingTriggers.length ? null : checkWinner(next) };
}

function newContext(state: GameState): EffectContext {
  return {
    roleOf: (id) => findPlayer(state, id).roleId,
    aliveIds: state.players.filter((p) => p.alive).map((p) => p.id),
    protectedIds: new Set(),
    guards: new Map(),
    away: new Set(),
    visits: new Map(),
    attacked: new Set(),
    conversions: new Map(),
    revivals: new Map(),
    deaths: new Map(),
    events: [],
  };
}

export function resolveNight(
  state: GameState,
  submissions: ActionSubmission[],
  rng: Rng = Math.random,
): GameState {
  const { actions, used } = collectNightActions(state, submissions, rng);
  actions.sort((a, b) => EFFECTS[a.effect].priority - EFFECTS[b.effect].priority);

  const ctx = newContext(state);
  for (const action of actions) EFFECTS[action.effect].apply(ctx, action);
  // Tur sonu adımları (öncelik sırasıyla, her efekt bir kez).
  for (const kind of [...new Set(actions.map((a) => a.effect))]) EFFECTS[kind].finalize?.(ctx);

  let players = state.players;
  for (const sub of used) players = withAbilityUsed(state, players, sub.actorId, sub.abilityId, sub.targetId);

  // Dirilenler (ör. Şaman): hayata döner, rolü ve hakları aynen kalır.
  for (const [id, by] of ctx.revivals) {
    players = players.map((p) => (p.id === id ? { ...p, alive: true } : p));
    ctx.events.push({ type: 'revived', playerId: id, by });
  }

  // Dönüşenler (ör. Lanetli): yeni rol, yeni yetenek hakları; olay kaydına yazılır.
  for (const [id, toRoleId] of ctx.conversions) {
    if (ctx.deaths.has(id)) continue;
    players = players.map((p) =>
      p.id === id
        ? {
            ...p,
            roleId: toRoleId,
            convertedFrom: p.roleId,
            abilityState: Object.fromEntries(getRole(toRoleId).abilities.map((a) => [a.id, { usesLeft: a.uses }])),
          }
        : p,
    );
    ctx.events.push({ type: 'converted', playerId: id, fromRoleId: findPlayer(state, id).roleId, toRoleId });
  }

  const usedEvents: EventBody[] = used.map((u) => ({
    type: 'ability',
    actorId: u.actorId,
    abilityId: u.abilityId,
    targetId: u.targetId,
    secondTargetId: u.secondTargetId,
  }));
  const next = applyDeaths(
    { ...state, players, events: [...state.events, ...stamp(state, [...usedEvents, ...ctx.events])] },
    ctx.deaths,
  );
  return { ...next, phase: 'day' };
}

/** Belirli bir olaydan sonraki ölümler (sabah raporu, oylama sonucu). */
export function deathsSince(state: GameState, from: number): DeathEvent[] {
  return state.events.slice(from).filter((e): e is DeathEvent => e.type === 'death');
}

/** Gizli oyları (kim → kime) oy sayısına çevirir. */
export function countVotes(votes: Record<PlayerId, PlayerId>): Record<PlayerId, number> {
  const tally: Record<PlayerId, number> = {};
  for (const target of Object.values(votes)) tally[target] = (tally[target] ?? 0) + 1;
  return tally;
}

/** Gece hiç oynanmadan gündüze geçer (ör. ilk gece yetenekler kapalıysa). */
export function skipNight(state: GameState): GameState {
  return { ...state, phase: 'day' };
}

/** Oy sayımından asılacak kişiyi bulur. Beraberlikte kimse asılmaz. */
function resolveTally(state: GameState, tally: Map<PlayerId, number>): GameState {
  const max = Math.max(0, ...tally.values());
  const top = [...tally].filter(([, c]) => c === max);

  const deaths: EffectContext['deaths'] = new Map();
  if (max > 0 && top.length === 1) deaths.set(top[0][0], { cause: 'lynch' });

  const next = applyDeaths(state, deaths);
  return { ...next, phase: 'night', round: state.round + 1 };
}

/** Gizli oylama (voteMode 'secret'): her oyuncunun kime oy verdiği. */
export function resolveDayVote(state: GameState, votes: Record<PlayerId, PlayerId>): GameState {
  const tally = new Map<PlayerId, number>();
  for (const [voterId, targetId] of Object.entries(votes)) {
    if (!findPlayer(state, voterId).alive || !findPlayer(state, targetId).alive) continue;
    // Oy ağırlığı (ör. Belediye Başkanı 2 sayılır).
    const weight = getRole(findPlayer(state, voterId).roleId).voteWeight ?? 1;
    tally.set(targetId, (tally.get(targetId) ?? 0) + weight);
  }
  return resolveTally(state, tally);
}

/** Açık oylama (voteMode 'open'): her oyuncunun aldığı oy sayısı elle girilir. */
export function resolveDayVoteCounts(state: GameState, counts: Record<PlayerId, number>): GameState {
  const tally = new Map<PlayerId, number>();
  for (const [targetId, n] of Object.entries(counts)) {
    if (n > 0 && findPlayer(state, targetId).alive) tally.set(targetId, n);
  }
  return resolveTally(state, tally);
}

/** Ölen oyuncunun tetiklenen yeteneğini (ör. İntikamcı) çözer. */
export function resolveTrigger(state: GameState, trigger: PendingTrigger, targetId: PlayerId): GameState {
  const actor = findPlayer(state, trigger.actorId);
  const ability = findAbility(actor, trigger.abilityId);
  const target = findPlayer(state, targetId);
  if (!target.alive || target.id === actor.id) throw new Error('Invalid trigger target');

  const ctx = newContext(state);
  EFFECTS[ability.effect].apply(ctx, { actorId: actor.id, targetId, cause: ability.cause ?? 'ability' });

  const remaining = state.pendingTriggers.filter(
    (t) => !(t.actorId === trigger.actorId && t.abilityId === trigger.abilityId),
  );
  const players = withAbilityUsed(state, state.players, actor.id, ability.id, targetId);
  const abilityEvent: EventBody = { type: 'ability', actorId: actor.id, abilityId: ability.id, targetId };
  return applyDeaths(
    { ...state, players, pendingTriggers: remaining, events: [...state.events, ...stamp(trigger, [abilityEvent, ...ctx.events])] },
    ctx.deaths,
    trigger,
  );
}

/** Tetikleyiciyi kullanmadan geçer (oyuncu kullanmak istemezse). */
export function skipTrigger(state: GameState, trigger: PendingTrigger): GameState {
  const pendingTriggers = state.pendingTriggers.filter((t) => t !== trigger);
  const next = { ...state, pendingTriggers };
  return { ...next, winner: pendingTriggers.length ? null : checkWinner(next) };
}
