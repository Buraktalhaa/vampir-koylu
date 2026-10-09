/**
 * Oyun başında lobide seçilen ayarlar. Yeni ayar = buraya bir alan + varsayılan + i18n metni.
 */
export type VoteMode =
  /** Telefon elden ele dolaşır, herkes gizlice oy verir. */
  | 'secret'
  /** Telefon ortada durur, her oyuncunun aldığı oy sayısı elle girilir. */
  | 'open';

export type GameSettings = {
  /** Ölen oyuncunun rolü herkese açıklanır. */
  revealRoleOnDeath: boolean;
  voteMode: VoteMode;
  /** Kapalıysa ilk gece kimse yetenek kullanmaz; herkes sadece rolünü öğrenir. */
  firstNightActions: boolean;
  /** Gündüz tartışma süresi (saniye). */
  discussionSeconds: number;
};

export const DEFAULT_SETTINGS: GameSettings = {
  revealRoleOnDeath: true,
  voteMode: 'secret',
  firstNightActions: false,
  discussionSeconds: 120,
};

export const VOTE_MODES: VoteMode[] = ['secret', 'open'];
