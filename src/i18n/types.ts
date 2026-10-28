/** Tüm dillerin uyması gereken metin yapısı. Bir metin eksikse TypeScript hata verir. */
import type { RoleId } from '@/game/roles';
import type { VoteMode } from '@/game/settings';
import type { EffectKind, TeamId } from '@/game/types';

export type AbilityText = { name: string; prompt?: string; description?: string };

export type RoleText = {
  name: string;
  description: string;
  /** Rol panelindeki ⓘ ile açılan detaylı (ve biraz esprili) açıklama. */
  tip: string;
  /** Bu gece yapacak bir şeyi olmadığında gösterilen metin. Yoksa genel metin kullanılır. */
  idle?: string;
  /** Yetenek id'sine göre metinler (roles/<id>.ts içindeki ability.id). */
  abilities?: Record<string, AbilityText>;
};

/** Yetenek kullanmayan oyuncunun ekrana bir şey basması için iki seçenekli basit soru. */
export type QuizItem = { q: string; a: string; b: string };

export type Translation = {
  languageName: string;
  teams: Record<TeamId, { name: string; goal: string }>;
  roles: Record<RoleId, RoleText>;
  quiz: QuizItem[];
  menu: {
    tagline: string;
    resume: string;
    /** Devam eden oyunun özeti, ör. "3. Gün · 8 oyuncu". */
    resumeInfo: (when: string, players: number) => string;
    newGame: string;
    roles: string;
    settings: string;
  };
  appSettings: {
    title: string;
    language: string;
    soundSection: string;
    music: { label: string; hint: string };
    sounds: { label: string; hint: string };
    vibration: { label: string; hint: string };
  };
  encyclopedia: {
    title: string;
    all: string;
    abilities: string;
    team: string;
    classic: string;
    search: string;
    noResults: string;
    noResultsHint: (query: string) => string;
    clearFilters: string;
    /** Detay sayfası: yetenek kartı başlığı, uzun açıklama başlığı, kapat ve sayfa düğmeleri. */
    ability: string;
    tip: string;
    close: string;
    prev: string;
    next: string;
  };
  abilityTags: {
    night: string;
    onDeath: string;
    onLynch: string;
    uses: (n: number) => string;
    unlimited: string;
    teamVote: string;
    noTarget: string;
    self: string;
    noRepeat: string;
    effects: Record<EffectKind, string>;
  };
  /** Ansiklopedi detayı: rol kurallarından üretilen kazanma koşulu ve özel durumlar (bkz. i18n/roleTraits). */
  roleTraits: {
    winSection: string;
    specialSection: string;
    /** Tarafsız: asılınca tek başına kazanır. */
    winIfLynched: string;
    /** Tarafsız: rolü çalınca o takımla kazanır. */
    winAsThief: string;
    appearsAs: (team: string) => string;
    hiddenFromTeam: string;
    knowsTeammates: string;
    convertsWhenBitten: (team: string) => string;
    voteWeight: (n: number) => string;
    stealsRole: string;
    unlocksWhenTeamGone: string;
  };
  common: { back: string };
  setup: {
    step: (current: number, total: number) => string;
    playerCount: (n: number) => string;
    savedFromLast: string;
    reorderHint: string;
    clear: string;
    duplicate: string;
    needMore: (n: number) => string;
    none: string;
    fixed: string;
    /** "Yok" seçili kartta sayaç yerine. */
    notInGame: string;
    /** Kurulum alt çubuğundaki yer sayacının etiketi. */
    slotsLabel: string;
    summaryCount: (roles: number, players: number) => string;
    summaryDetail: (fixed: number, random: number) => string;
    summaryTitle: string;
    summaryPlayers: string;
    summaryDiscussion: string;
    rangeEdit: string;
    rangeTitle: (role: string) => string;
    rangeFree: string;
    rangeAtLeastOne: string;
    rangeAtMostOne: string;
    rangeExactlyOne: string;
    unlimited: string;
    done: string;
    rangeSentence: (role: string, min: number, max: number | undefined) => string;
    rangeBalancedVampire: string;
    min: string;
    max: string;
    players: string;
    namePlaceholder: string;
    add: string;
    roles: string;
    random: string;
    allRandom: string;
    classicMode: string;
    start: string;
    next: string;
    secretVote: { label: string; hint: string };
    errors: {
      tooManyRoles: string;
      notEnoughRoles: string;
      needVampire: string;
      tooManyVampires: (max: number) => string;
      unique: string;
      badRange: string;
      minPlayers: (min: number) => string;
    };
  };
  game: {
    morningSub: string;
    diedCount: (n: number) => string;
    nobodyDiedTitle: string;
    nobodyDiedText: string;
    leftGame: (name: string, alive: number) => string;
    rolesAtEnd: string;
    /** Sabah ölüm kartının alt satırı. */
    nightVictim: string;
    toDiscussion: string;
    seeResult: string;
    soloWin: (name: string, role: string) => string;
    seerResult: (name: string) => string;
    markedTarget: (name: string) => string;
    revived: (name: string) => string;
    roleChanged: (from: string, to: string) => string;
    sameTeam: string;
    differentTeams: string;
    firstNightIdle: string;
    moreInfo: string;
    discussSub: (alive: number) => string;
    introSub: string;
    remaining: string;
    timeUp: string;
    playersLabel: string;
    aliveDead: (alive: number, dead: number) => string;
    introInfo: string;
    autoVote: (s: number) => string;
    startNow: string;
    skipVoteTitle: string;
    skipVoteMessage: string;
    secretSub: (i: number, n: number) => string;
    voter: (name: string) => string;
    openSub: string;
    openTitle: string;
    votesGiven: (given: number, total: number) => string;
    notVoted: (n: number) => string;
    tie: string;
    leader: string;
    equal: string;
    finishWill: (name: string) => string;
    finishNobody: string;
    verdictSub: string;
    villageDecided: string;
    hangedWith: (votes: number) => string;
    nobodyHangedTitle: string;
    hangedTitle: (name: string) => string;
    roleRevealed: string;
    tieText: (names: string) => string;
    noVotesText: string;
    revengeTriggered: (name: string) => string;
    lastChoice: (name: string) => string;
    giveToName: (name: string) => string;
    revengeSub: string;
    revengeHint: string;
    revengeTitle: (name: string) => string;
    wentWith: (name: string) => string;
    vampiresLeft: (n: number) => string;
    spellQuestion: string;
    spellHint: string;
    usesOf: (left: number, total: number) => string;
    usedStamp: (round: number) => string;
    choose: string;
    chooseTarget: string;
    useShield: string;
    /** Gece bekleme ekranı: soru kartı başlığı, bekleme notu, alt not. */
    quizTitle: string;
    optionsSoon: string;
    pickToClose: string;
    sleepText: string;
    giveTo: string;
    dontLook: string;
    tapToRevealName: (name: string) => string;
    /** Devir ekranındaki yuvarlak düğmenin etiketi. */
    tap: string;
    turnOf: (i: number, n: number) => string;
    yourRole: (name: string) => string;
    goal: string;
    gotIt: string;
    confirmWith: (name: string) => string;
    pass: string;
    self: string;
    next: string;
    tapToReveal: string;
    hideAndPass: string;
    teammates: string;
    night: (n: number) => string;
    day: (n: number) => string;
    sleeping: string;
    confirm: string;
    skip: string;
    usesLeft: (n: number) => string;
    protectedLastNight: string;
    teammate: string;
    died: (name: string) => string;
    nobodyDied: string;
    discuss: string;
    toVote: string;
    vote: string;
    finishVote: string;
    hanged: (name: string) => string;
    nobodyHanged: string;
    continue: string;
    wins: (team: string) => string;
    newGame: string;
    mainMenu: string;
    dead: string;
    addTime: string;
    endEarly: string;
    abstain: string;
    menuTitle: string;
    restart: string;
    restartTitle: string;
    restartMessage: string;
    close: string;
    quitTitle: string;
    quitMessage: string;
    cancel: string;
    quit: string;
    timeline: string;
    usedAbility: (actor: string, ability: string, target?: string) => string;
    saved: (name: string) => string;
    pickedBy: (names: string) => string;
    skipVote: string;
    toNight: string;
    verdict: string;
    timeLeft: string;
  };
  gameSettings: {
    title: string;
    revealRoleOnDeath: { label: string; hint: string };
    firstNightActions: { label: string; hint: string };
    voteMode: { label: string; options: Record<VoteMode, { label: string; hint: string }> };
  };
};
