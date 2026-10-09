import type { GameSettings } from './settings';

export type PlayerId = string;

export type TeamId = 'village' | 'vampire';

export type Phase = 'night' | 'day';

/**
 * Oyundaki tüm mekanikler bu efektlerden oluşur. Yeni bir karakter genelde
 * mevcut efektleri yeniden kullanır; yeni bir mekanik gerekiyorsa
 * `engine/effects.ts` içine tek bir handler eklenir.
 */
export type EffectKind = 'protect' | 'protectAll' | 'kill' | 'investigate';

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
};

export type RoleDefinition<Id extends string = string> = {
  id: Id;
  team: TeamId;
  abilities: readonly Ability[];
  /** Takım arkadaşlarını oyun başında görür. */
  knowsTeammates?: boolean;
  /** Araştırıldığında farklı bir rol olarak görünür (ileride: gizli roller). */
  appearsAs?: string;
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
};

export type DeathCause = 'vampire' | 'lynch' | 'spell' | 'revenge' | 'ability';

export type EventBody =
  | { type: 'death'; playerId: PlayerId; cause: DeathCause; by?: PlayerId }
  | { type: 'saved'; playerId: PlayerId }
  | { type: 'investigated'; actorId: PlayerId; targetId: PlayerId; seenRoleId: string }
  /** Kullanılan yetenek (oyun sonu özeti için). Takım oylarında her oyuncunun seçimi ayrı kaydedilir. */
  | { type: 'ability'; actorId: PlayerId; abilityId: string; targetId?: PlayerId };

/** Her olay hangi tur ve fazda olduğunu taşır. */
export type GameEvent = EventBody & { round: number; phase: Phase };

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
};

export type ActionSubmission = {
  actorId: PlayerId;
  abilityId: string;
  /** Hedefsiz yeteneklerde boş bırakılır. */
  targetId?: PlayerId;
};

export type Rng = () => number;
