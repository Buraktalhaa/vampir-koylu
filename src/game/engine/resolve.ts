import { getRole } from '../roles';
import { checkWinner, teamOf } from '../teams';
import type {
  ActionSubmission,
  GameState,
  PendingTrigger,
  Player,
  PlayerId,
  Rng,
} from '../types';
import { EFFECTS, type EffectContext, type ResolvedAction } from './effects';
import { canUseAbility, findAbility, findPlayer, getValidTargets, needsTarget } from './targeting';

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
    if (needsTarget(ability) && !getValidTargets(state, actor, ability).some((p) => p.id === sub.targetId)) continue;
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
    actions.push({ actorId: actor.id, targetId: sub.targetId, effect: ability.effect, cause: ability.cause ?? 'ability' });
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

/** Ölümleri uygular, ölenlerin onDeath yeteneklerini kuyruğa alır, kazananı kontrol eder. */
function applyDeaths(state: GameState, deaths: EffectContext['deaths']): GameState {
  const players = state.players.map((p) => (deaths.has(p.id) ? { ...p, alive: false } : p));
  const triggers: PendingTrigger[] = [];
  for (const [id, { cause }] of deaths) {
    const player = players.find((p) => p.id === id)!;
    for (const ability of getRole(player.roleId).abilities) {
      if (ability.trigger !== 'onDeath' || !canUseAbility(state, player, ability)) continue;
      if (!ability.deathCauses || ability.deathCauses.includes(cause)) {
        triggers.push({ actorId: id, abilityId: ability.id });
      }
    }
  }
  const events = [...deaths].map(([playerId, d]) => ({ type: 'death' as const, playerId, ...d }));
  const next = {
    ...state,
    players,
    events: [...state.events, ...events],
    pendingTriggers: [...state.pendingTriggers, ...triggers],
  };
  // Bekleyen tetikleyici varsa (ör. İntikamcı) kazanan, atış yapıldıktan sonra belirlenir.
  return { ...next, winner: next.pendingTriggers.length ? null : checkWinner(next) };
}

function newContext(state: GameState): EffectContext {
  return {
    roleOf: (id) => findPlayer(state, id).roleId,
    aliveIds: state.players.filter((p) => p.alive).map((p) => p.id),
    protectedIds: new Set(),
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

  let players = state.players;
  for (const sub of used) players = withAbilityUsed(state, players, sub.actorId, sub.abilityId, sub.targetId);

  const next = applyDeaths({ ...state, players, events: [...state.events, ...ctx.events] }, ctx.deaths);
  return { ...next, phase: 'day' };
}

/** Gündüz oylaması. Beraberlikte kimse asılmaz. */
export function resolveDayVote(state: GameState, votes: Record<PlayerId, PlayerId>): GameState {
  const counts = new Map<PlayerId, number>();
  for (const [voterId, targetId] of Object.entries(votes)) {
    if (!findPlayer(state, voterId).alive || !findPlayer(state, targetId).alive) continue;
    counts.set(targetId, (counts.get(targetId) ?? 0) + 1);
  }
  const max = Math.max(0, ...counts.values());
  const top = [...counts].filter(([, c]) => c === max);

  const deaths: EffectContext['deaths'] = new Map();
  if (max > 0 && top.length === 1) deaths.set(top[0][0], { cause: 'lynch' });

  const next = applyDeaths(state, deaths);
  return { ...next, phase: 'night', round: state.round + 1 };
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
  return applyDeaths(
    { ...state, players, pendingTriggers: remaining, events: [...state.events, ...ctx.events] },
    ctx.deaths,
  );
}

/** Tetikleyiciyi kullanmadan geçer (oyuncu kullanmak istemezse). */
export function skipTrigger(state: GameState, trigger: PendingTrigger): GameState {
  const pendingTriggers = state.pendingTriggers.filter((t) => t !== trigger);
  const next = { ...state, pendingTriggers };
  return { ...next, winner: pendingTriggers.length ? null : checkWinner(next) };
}
