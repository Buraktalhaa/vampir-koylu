import { getRole } from '@/game/roles';
import { seemSameTeam, seenTeamOf } from '@/game/teams';
import type { DeathCause, EffectKind, EventBody, PlayerId } from '@/game/types';

export type ResolvedAction = {
  actorId: PlayerId;
  /** Hedefsiz yeteneklerde (ör. herkesi koru) boştur. */
  targetId?: PlayerId;
  secondTargetId?: PlayerId;
  cause: DeathCause;
};

/** Bir çözümleme turu boyunca efektlerin paylaştığı durum. */
export type EffectContext = {
  roleOf: (id: PlayerId) => string;
  aliveIds: PlayerId[];
  protectedIds: Set<PlayerId>;
  /** Korunan → onun yerine ölecek Fedai. */
  guards: Map<PlayerId, PlayerId>;
  /** O gece evinde olmayanlar (misafirliğe gidenler). */
  away: Set<PlayerId>;
  /** Misafir → gittiği ev sahibi. */
  visits: Map<PlayerId, PlayerId>;
  /** O gece saldırıya uğrayanlar (korunsalar bile). */
  attacked: Set<PlayerId>;
  /** Ölmek yerine rol değiştirenler (ör. ısırılan Lanetli → vampir). */
  conversions: Map<PlayerId, string>;
  /** Bu gece dirilenler → dirilten. */
  revivals: Map<PlayerId, PlayerId>;
  deaths: Map<PlayerId, { cause: DeathCause; by?: PlayerId }>;
  events: EventBody[];
};

type EffectHandler = {
  /** Küçük sayı önce çalışır (ör. koruma, öldürmeden önce). */
  priority: number;
  apply: (ctx: EffectContext, action: ResolvedAction) => void;
  /** Tüm aksiyonlar uygulandıktan sonra bir kez çalışır (ör. misafirin akıbeti saldırılar belli olunca belli olur). */
  finalize?: (ctx: EffectContext) => void;
};

function kill(ctx: EffectContext, playerId: PlayerId, cause: DeathCause, by?: PlayerId) {
  if (!ctx.deaths.has(playerId)) ctx.deaths.set(playerId, { cause, by });
}

/**
 * Tüm mekaniklerin tek merkezi. Yeni bir mekanik = buraya bir handler.
 * Rol tanımları sadece hangi efekti kullandığını söyler.
 */
export const EFFECTS: Record<EffectKind, EffectHandler> = {
  protect: {
    priority: 10,
    apply: (ctx, { targetId }) => {
      if (targetId) ctx.protectedIds.add(targetId);
    },
  },
  protectAll: {
    priority: 10,
    apply: (ctx) => {
      for (const id of ctx.aliveIds) ctx.protectedIds.add(id);
    },
  },
  // Gece Misafiri: o gece evinde değil; gittiği evin akıbetini paylaşır (bkz. finalize).
  visit: {
    priority: 5,
    apply: (ctx, { actorId, targetId }) => {
      if (!targetId) return;
      ctx.away.add(actorId);
      ctx.visits.set(actorId, targetId);
    },
    finalize: (ctx) => {
      for (const [visitor, host] of ctx.visits) {
        const hostIsVampire = getRole(ctx.roleOf(host)).team === 'vampire';
        if (hostIsVampire || ctx.attacked.has(host)) kill(ctx, visitor, 'visit', host);
      }
    },
  },
  // Fedai: korunan saldırıya uğrarsa onun yerine Fedai ölür.
  guard: {
    priority: 15,
    apply: (ctx, { actorId, targetId }) => {
      if (targetId) ctx.guards.set(targetId, actorId);
    },
  },
  kill: {
    priority: 20,
    apply: (ctx, { actorId, targetId, cause }) => {
      if (!targetId) return;
      ctx.attacked.add(targetId);
      // Evde olmayan (misafirlikte) saldırıdan etkilenmez.
      if (ctx.away.has(targetId) || ctx.protectedIds.has(targetId)) {
        ctx.events.push({ type: 'saved', playerId: targetId });
        return;
      }
      const guard = ctx.guards.get(targetId);
      if (guard && guard !== targetId && !ctx.deaths.has(guard)) {
        ctx.events.push({ type: 'saved', playerId: targetId });
        if (ctx.protectedIds.has(guard)) ctx.events.push({ type: 'saved', playerId: guard });
        else kill(ctx, guard, 'sacrifice', actorId);
        return;
      }
      // Vampir ısırığına "dönüşen" rol (ör. Lanetli) ölmez, vampir olur.
      const convertsTo = getRole(ctx.roleOf(targetId)).convertsWhenBitten;
      if (cause === 'vampire' && convertsTo) {
        ctx.conversions.set(targetId, convertsTo);
        return;
      }
      kill(ctx, targetId, cause, actorId);
    },
  },
  // Rol Çalan: hedef yalnızca kaydedilir (abilityState.lastTarget); rolü, hedef ölünce alınır (bkz. resolve).
  mark: {
    priority: 50,
    apply: () => {},
  },
  // Şaman: ölü birini diriltir (sabah hayatta uyanır).
  revive: {
    priority: 40,
    apply: (ctx, { actorId, targetId }) => {
      if (targetId) ctx.revivals.set(targetId, actorId);
    },
  },
  // Dedektif: iki oyuncunun (görünen) takımlarını karşılaştırır.
  compare: {
    priority: 30,
    apply: (ctx, { actorId, targetId, secondTargetId }) => {
      if (!targetId || !secondTargetId) return;
      const sameTeam = seemSameTeam(ctx.roleOf(targetId), ctx.roleOf(secondTargetId));
      ctx.events.push({ type: 'compared', actorId, targetId, secondTargetId, sameTeam });
    },
  },
  investigate: {
    priority: 30,
    apply: (ctx, { actorId, targetId }) => {
      if (!targetId) return;
      ctx.events.push({ type: 'investigated', actorId, targetId, seenTeam: seenTeamOf(ctx.roleOf(targetId)) });
    },
  },
};
