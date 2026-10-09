import { getRole } from '../roles';
import type { DeathCause, EffectKind, GameEvent, PlayerId } from '../types';

export type ResolvedAction = {
  actorId: PlayerId;
  /** Hedefsiz yeteneklerde (ör. herkesi koru) boştur. */
  targetId?: PlayerId;
  cause: DeathCause;
};

/** Bir çözümleme turu boyunca efektlerin paylaştığı durum. */
export type EffectContext = {
  roleOf: (id: PlayerId) => string;
  aliveIds: PlayerId[];
  protectedIds: Set<PlayerId>;
  deaths: Map<PlayerId, { cause: DeathCause; by?: PlayerId }>;
  events: GameEvent[];
};

type EffectHandler = {
  /** Küçük sayı önce çalışır (ör. koruma, öldürmeden önce). */
  priority: number;
  apply: (ctx: EffectContext, action: ResolvedAction) => void;
};

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
  kill: {
    priority: 20,
    apply: (ctx, { actorId, targetId, cause }) => {
      if (!targetId) return;
      if (ctx.protectedIds.has(targetId)) {
        ctx.events.push({ type: 'saved', playerId: targetId });
        return;
      }
      if (!ctx.deaths.has(targetId)) ctx.deaths.set(targetId, { cause, by: actorId });
    },
  },
  investigate: {
    priority: 30,
    apply: (ctx, { actorId, targetId }) => {
      if (!targetId) return;
      const role = getRole(ctx.roleOf(targetId));
      ctx.events.push({
        type: 'investigated',
        actorId,
        targetId,
        seenRoleId: role.appearsAs ?? role.id,
      });
    },
  },
};
