import type { GameSettings } from '@/game/settings';

export type PlayerId = string;

/** neutral: kendi başına oynayan roller (ör. Deli); her birinin kendi kazanma koşulu var. */
export type TeamId = 'village' | 'vampire' | 'neutral';

export type Phase = 'night' | 'day';

/**
 * Oyundaki tüm mekanikler bu efektlerden oluşur. Yeni bir karakter genelde
 * mevcut efektleri yeniden kullanır; yeni bir mekanik gerekiyorsa
 * `engine/effects.ts` içine tek bir handler eklenir.
 */
export type EffectKind = 'protect' | 'protectAll' | 'guard' | 'visit' | 'kill' | 'investigate' | 'compare' | 'revive' | 'mark';

export type AbilityTrigger =
  /** Her gece kullanılabilir. */
  | 'night'
  /** Sahibi öldüğünde tetiklenir (ör. İntikamcı). `deathCauses` ile daraltılabilir. */
  | 'onDeath';

export type TargetRule = {
  /** Kendini seçebilir mi? Varsayılan: false */
  allowSelf?: boolean;
  /** Kendi takım arkadaşını seçebilir mi? Varsayılan: true */
  allowTeammates?: boolean;
  /** Aynı kişiyi art arda iki gece seçemez. Varsayılan: false */
  noRepeatTarget?: boolean;
  /** Yalnızca ölüleri hedefler (ör. Şaman'ın diriltmesi). */
  deadOnly?: boolean;
};

export type Ability = {
  /** Rol içinde benzersiz anahtar. */
  id: string;
  trigger: AbilityTrigger;
  effect: EffectKind;
  /** Hedef seçimi kuralları. `'none'` = hedefsiz (ör. herkesi koru). */
  target?: TargetRule | 'none';
  /** Bu yetenekle ölen oyuncunun ölüm nedeni. Varsayılan: 'ability' */
  cause?: DeathCause;
  /** onDeath: sadece bu nedenlerle ölünce tetiklenir. Boş = her ölümde. */
  deathCauses?: readonly DeathCause[];
  /** Toplam kullanım hakkı. undefined = sınırsız */
  uses?: number;
  /**
   * Takımdaki herkes ortak oy verir, tek bir sonuç uygulanır
   * (ör. vampirlerin gece kurbanı).
   */
  teamVote?: boolean;
  /** İlk gece kullanılamaz. */
  skipFirstNight?: boolean;
  /** Kaç hedef seçilir (ör. Dedektif: 2). Varsayılan: 1 */
  targets?: 1 | 2;
  /** Yalnızca takımında (gizli olmayan) başka yaşayan üye kalmayınca kullanılabilir (ör. Yalnız Vampir). */
  onlyWhenTeamGone?: boolean;
  /** Pas geçilemez; oyuncu mutlaka bir hedef seçer (ör. vampir ısırığı). */
  required?: boolean;
};

export type RoleDefinition<Id extends string = string> = {
  id: Id;
  team: TeamId;
  abilities: readonly Ability[];
  /** Takım arkadaşlarını oyun başında görür. */
  knowsTeammates?: boolean;
  /** Kâhin gibi araştıran rollere farklı bir takım olarak görünür (ileride: gizli roller). */
  appearsAs?: TeamId;
  /** Gündüz oylamasında oyu kaç sayılır (ör. Belediye Başkanı: 2). Varsayılan: 1 */
  voteWeight?: number;
  /** Bu yetenekle işaretlediği oyuncu ölünce onun rolünü alır (ör. Rol Çalan: 'mark'). */
  stealsRoleVia?: string;
  /** Takım arkadaşları onu tanımaz, o da onları (ör. Yalnız Vampir). */
  hiddenFromTeam?: boolean;
  /** Vampirler ısırınca ölmez, bu role dönüşür (ör. Lanetli → vampire). */
  convertsWhenBitten?: string;
  /** Köy tarafından asılırsa tek başına kazanır ve oyun biter (ör. Deli). */
  winsIfLynched?: boolean;
  /** Bir gecede kullanılabilecek en fazla yetenek sayısı. Varsayılan: 1 */
  maxNightActions?: number;
  /** Oyunda en fazla 1 tane olabilir. */
  unique?: boolean;
  /** Bu rolün oyuna eklenebilmesi için gereken minimum oyuncu sayısı. */
  minPlayers?: number;
};

export type AbilityState = {
  usesLeft?: number;
  lastTarget?: PlayerId;
  lastUsedRound?: number;
};

export type Player = {
  id: PlayerId;
  name: string;
  roleId: string;
  alive: boolean;
  abilityState: Record<string, AbilityState>;
  /** Oyun sırasında rol değiştirdiyse önceki rolü (ör. ısırılan Lanetli). */
  convertedFrom?: string;
};

/** sacrifice: başkasının yerine öldü (Fedai) · visit: misafir gittiği evde öldü (Gece Misafiri) */
export type DeathCause = 'vampire' | 'lynch' | 'spell' | 'revenge' | 'sacrifice' | 'visit' | 'ability';

export type EventBody =
  | { type: 'death'; playerId: PlayerId; cause: DeathCause; by?: PlayerId }
  | { type: 'saved'; playerId: PlayerId }
  | { type: 'revived'; playerId: PlayerId; by: PlayerId }
  | { type: 'converted'; playerId: PlayerId; fromRoleId: string; toRoleId: string }
  | { type: 'investigated'; actorId: PlayerId; targetId: PlayerId; seenTeam: TeamId }
  /** Kullanılan yetenek (oyun sonu özeti için). Takım oylarında her oyuncunun seçimi ayrı kaydedilir. */
  | { type: 'ability'; actorId: PlayerId; abilityId: string; targetId?: PlayerId; secondTargetId?: PlayerId }
  | { type: 'compared'; actorId: PlayerId; targetId: PlayerId; secondTargetId: PlayerId; sameTeam: boolean };

/** Her olay hangi tur ve fazda olduğunu taşır. */
export type GameEvent = EventBody & { round: number; phase: Phase };

export type DeathEvent = Extract<GameEvent, { type: 'death' }>;

/** Tetiklendiği tur/faz saklanır; olaylar oraya yazılır (ör. asılan İntikamcı'nın atışı gündüze ait). */
export type PendingTrigger = { actorId: PlayerId; abilityId: string; round: number; phase: Phase };

export type GameState = {
  /** Oturma / telefonun dolaşma sırası. */
  players: Player[];
  settings: GameSettings;
  phase: Phase;
  round: number;
  events: GameEvent[];
  /** Kullanıcı girdisi bekleyen tetiklenmiş yetenekler (ör. asılan İntikamcı'nın seçimi). */
  pendingTriggers: PendingTrigger[];
  winner: TeamId | null;
  /** Tek başına kazananlar (ör. asılan Deli). Takım galibiyetinde boş. */
  winners?: PlayerId[];
};

export type ActionSubmission = {
  actorId: PlayerId;
  abilityId: string;
  /** Hedefsiz yeteneklerde boş bırakılır. */
  targetId?: PlayerId;
  /** İki hedefli yeteneklerde ikinci hedef (ör. Dedektif). */
  secondTargetId?: PlayerId;
};

export type Rng = () => number;
