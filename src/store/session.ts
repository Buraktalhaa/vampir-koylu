import { alivePlayers } from '@/game/teams';
import type { ActionSubmission, GameState, PlayerId } from '@/game/types';

/** Oyun ekranının aşamaları: telefonun dolaştığı ve ortada durduğu adımlar. */
export type Stage = 'reveal' | 'night' | 'morning' | 'discussion' | 'vote' | 'verdict' | 'revenge' | 'avenged' | 'end';

/** Oyunun akıştaki yeri. Oyunla birlikte kaydedilir; uygulama kapansa da kaldığı yerden devam eder. */
export type Flow = {
  stage: Stage;
  /** Telefonun bu aşamada dolaşacağı oyuncular, sırayla. */
  queue: PlayerId[];
  turn: number;
  /** Sıradaki oyuncu devir ekranını geçti mi? */
  shown: boolean;
  submissions: ActionSubmission[];
  votes: Record<PlayerId, PlayerId>;
  /** Sabah/oylama sonucunda gösterilecek olayların başladığı yer. */
  eventsFrom: number;
  /** Son oylamada her oyuncunun aldığı oy (oylama sonucu ekranı için). */
  tally: Record<PlayerId, number>;
};

export type Session = { game: GameState; flow: Flow };

export function newSession(game: GameState): Session {
  return {
    game,
    flow: {
      stage: 'reveal',
      queue: alivePlayers(game).map((p) => p.id),
      turn: 0,
      shown: false,
      submissions: [],
      votes: {},
      eventsFrom: 0,
      tally: {},
    },
  };
}

/**
 * Kayıttan dönülünce gizli bilgi ekranda açık kalmasın:
 * sıradaki oyuncu yeniden devir ekranından geçer.
 */
export function resumeSafely(session: Session): Session {
  return { ...session, flow: { ...session.flow, shown: false } };
}
