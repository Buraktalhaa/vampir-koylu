import type { RoleId } from '../../game/roles';
import type { VoteMode } from '../../game/settings';
import type { EffectKind, TeamId } from '../../game/types';

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
  menu: { tagline: string; resume: string; newGame: string; roles: string; settings: string; howToPlay: string };
  appSettings: { title: string; language: string };
  encyclopedia: {
    title: string;
    all: string;
    abilities: string;
    team: string;
    search: string;
    noResults: string;
    noResultsHint: (query: string) => string;
    clearFilters: string;
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
  common: { back: string; comingSoon: string };
  setup: {
    step: (current: number, total: number) => string;
    playerCount: (n: number) => string;
    savedFromLast: string;
    clear: string;
    duplicate: string;
    needMore: (n: number) => string;
    fixFirst: string;
    none: string;
    summaryCount: (roles: number, players: number) => string;
    summaryDetail: (fixed: number, random: number) => string;
    issues: (n: number) => string;
    summaryTitle: string;
    summaryPlayers: string;
    summaryVampires: string;
    summaryRoles: string;
    summaryDiscussion: string;
    randomMark: string;
    players: string;
    namePlaceholder: string;
    add: string;
    roles: string;
    random: string;
    allRandom: string;
    summary: (players: number, roles: number) => string;
    start: string;
    next: string;
    secretVote: { label: string; hint: string };
    errors: {
      minPlayers3: string;
      tooManyRoles: string;
      notEnoughRoles: string;
      needVampire: string;
      tooManyVampires: (max: number) => string;
      unique: string;
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
    toDiscussion: string;
    seeResult: string;
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
    sleepTitle: string;
    sleepText: string;
    continueIn: (s: number) => string;
    giveTo: string;
    dontLook: string;
    tapToRevealName: (name: string) => string;
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

export const tr: Translation = {
  languageName: 'Türkçe',
  teams: {
    village: { name: 'Köy', goal: 'Tüm vampirleri bul ve köyden at.' },
    vampire: { name: 'Vampirler', goal: 'Sayıca köylülere eşit ya da fazla ol.' },
  },
  quiz: [
    { q: 'En iyi su hangisi?', a: 'Elmacık', b: 'Badem' },
    { q: 'Çay mı kahve mi?', a: 'Çay', b: 'Kahve' },
    { q: 'Kedi mi köpek mi?', a: 'Kedi', b: 'Köpek' },
    { q: 'Deniz mi dağ mı?', a: 'Deniz', b: 'Dağ' },
    { q: 'Yaz mı kış mı?', a: 'Yaz', b: 'Kış' },
    { q: 'Pizza mı lahmacun mu?', a: 'Pizza', b: 'Lahmacun' },
    { q: 'Simit mi poğaça mı?', a: 'Simit', b: 'Poğaça' },
    { q: 'Tatlı mı tuzlu mu?', a: 'Tatlı', b: 'Tuzlu' },
    { q: 'Film mi dizi mi?', a: 'Film', b: 'Dizi' },
    { q: 'Ayran mı kola mı?', a: 'Ayran', b: 'Kola' },
    { q: 'Menemen nasıl olmalı?', a: 'Soğanlı', b: 'Soğansız' },
    { q: 'Baklava mı künefe mi?', a: 'Baklava', b: 'Künefe' },
    { q: 'Kumsal mı havuz mu?', a: 'Kumsal', b: 'Havuz' },
    { q: 'Sabahçı mısın gececi mi?', a: 'Sabahçı', b: 'Gececi' },
    { q: 'Kitap mı podcast mi?', a: 'Kitap', b: 'Podcast' },
    { q: 'Sıcak çikolata mı dondurma mı?', a: 'Sıcak çikolata', b: 'Dondurma' },
    { q: 'Mantı mı makarna mı?', a: 'Mantı', b: 'Makarna' },
    { q: 'Uçak mı tren mi?', a: 'Uçak', b: 'Tren' },
    { q: 'Döner nasıl olmalı?', a: 'Dürüm', b: 'Ekmek arası' },
    { q: 'Kahvaltıda hangisi?', a: 'Bal kaymak', b: 'Sucuklu yumurta' },
  ],
  roles: {
    villager: {
      name: 'Köylü',
      tip: "Bir rolün yok, niye buraya baktın? Gündüz oyunu dinle, şüphelendiğine oy ver. O kadar.",
      description: 'Özel bir gücün yok. Gündüz tartış, şüphelendiğin kişiye oy ver.',
    },
    vampire: {
      name: 'Vampir',
      tip: "Uzun uzun okumaya gerek yok: birini öldür işte. Diğer vampirlerle aynı kişiyi seçmeye çalış, oylar bölünürse kurban rastgele seçilir. Gündüz de masum köylü taklidi yap.",
      description: 'Her gece diğer vampirlerle birlikte bir kurban seçersin. Takım arkadaşlarını tanırsın.',
      abilities: { bite: { name: 'Isırık', prompt: 'Bu gece kimi ısıracaksınız?', description: 'Vampirler her gece birlikte bir kurban seçer. Oylar eşitse kurban rastgele belirlenir.' } },
    },
    witch: {
      name: 'Büyücü',
      tip: "İki büyün var, ikisi de oyun boyunca yalnızca bir kez kullanılabilir. Koruma Kalkanı o gece tüm köyü korur, kimse ölmez. Ölüm Laneti seçtiğin kişiyi öldürür; ancak Şifacı o kişiyi koruduysa ölmez. Bir gecede en fazla bir büyü kullanabilirsin.",
      description:
        "İki büyün var, her biri bir kez kullanılır. Bir gecede yalnızca birini yapabilirsin: o gece herkesi korumak ya da bir oyuncuyu lanetleyip öldürmek. Şifacı'nın koruduğu kişiye lanetin işlemez.",
      abilities: {
        shield: { name: 'Koruma Kalkanı', prompt: 'Bu gece tüm köyü korumak istiyor musun?', description: 'O gece tüm köyü korur; kimse öldürülemez.' },
        curse: { name: 'Ölüm Laneti', prompt: 'Kimi lanetleyeceksin?', description: 'Bir oyuncuyu öldürür. Şifacı\'nın koruduğu kişiye işlemez.' },
      },
    },
    healer: {
      name: 'Şifacı',
      tip: "Her gece bir oyuncuyu korursun; korunan kişi o gece vampir saldırısından ve Ölüm Laneti'nden ölmez. Kendini de koruyabilirsin. Aynı kişiyi art arda iki gece koruyamazsın, ama bir gece ara verirsen tekrar koruyabilirsin.",
      description:
        'Her gece bir oyuncuyu korursun, kendini de koruyabilirsin. Aynı kişiyi art arda iki gece koruyamazsın.',
      abilities: { heal: { name: 'Şifa', prompt: 'Bu gece kimi koruyacaksın?', description: 'Bir oyuncuyu o gece saldırılardan korur. Kendini de koruyabilirsin.' } },
    },
    avenger: {
      name: 'İntikamcı',
      tip: "Gündüz oylamasında asılırsan yanında bir oyuncuyu daha götürürsün; telefon sana verilir ve kimi götüreceğini seçersin. İstersen pas geçebilirsin. Gece öldürülürsen bu yetenek çalışmaz.",
      idle: "Bu gece yapacak bir şeyin yok. Sabırlı ol; asılırsan son söz senin.",
      description: 'Köy seni asarsa yanında bir oyuncuyu daha götürürsün.',
      abilities: { revenge: { name: 'İntikam', prompt: 'Yanında kimi götüreceksin?', description: 'Köy seni asarsa yanında bir oyuncuyu daha götürürsün.' } },
    },
  },
  menu: { tagline: 'Köyde biri vampir. Kim olduğunu bulun.', resume: 'Devam eden oyuna dön', newGame: 'Yeni Oyun', roles: 'Karakterler', settings: 'Ayarlar', howToPlay: 'Nasıl Oynanır' },
  appSettings: { title: 'Ayarlar', language: 'Dil' },
  encyclopedia: {
    title: 'Karakterler',
    all: 'Hepsi',
    abilities: 'Yetenekler',
    team: 'Takım',
    search: 'İsim ya da yetenek ara',
    noResults: 'Sonuç yok',
    noResultsHint: (query) => `“${query}” için karakter bulunamadı.`,
    clearFilters: 'Filtreyi ve aramayı temizle',
  },
  abilityTags: {
    night: 'Gece',
    onDeath: 'Ölünce',
    onLynch: 'Asılınca',
    uses: (n) => `${n} kez`,
    unlimited: 'Her gece',
    teamVote: 'Takım oyu',
    noTarget: 'Hedefsiz',
    self: 'Kendine de',
    noRepeat: 'Art arda aynı kişi olmaz',
    effects: { protect: 'Koruma', protectAll: 'Koruma', kill: 'Öldürme', investigate: 'Bilgi' },
  },
  common: { back: 'Geri', comingSoon: 'Yakında' },
  setup: {
    step: (current, total) => `Kurulum ${current} / ${total}`,
    playerCount: (n) => `${n} oyuncu`,
    savedFromLast: 'son oyundan kaydedildi',
    clear: 'Temizle',
    duplicate: 'Bu isim zaten listede.',
    needMore: (n) => `En az 3 oyuncu gerekiyor. ${n} oyuncu daha ekle.`,
    fixFirst: 'Devam · önce sorunları düzelt',
    none: 'Yok',
    summaryCount: (roles, players) => `${roles} / ${players}`,
    summaryDetail: (fixed, random) => `${fixed} sabit · ${random} rastgele`,
    issues: (n) => `${n} sorun`,
    summaryTitle: 'Özet',
    summaryPlayers: 'Oyuncular',
    summaryVampires: 'Vampir',
    summaryRoles: 'Roller',
    summaryDiscussion: 'Tartışma',
    randomMark: 'rastgele',
    players: 'Oyuncular',
    namePlaceholder: 'Oyuncu adı',
    add: 'Ekle',
    roles: 'Karakterler',
    random: 'Rastgele',
    allRandom: 'Hepsi Rastgele',
    summary: (players, roles) => `${players} oyuncu · ${roles} sabit rol`,
    start: 'Oyunu Başlat',
    next: 'Devam',
    secretVote: {
      label: 'Gizli oylama',
      hint: 'Açıksa telefon elden ele dolaşır ve herkes gizlice oy verir. Kapalıysa telefon ortada durur, herkesin aldığı oy sayısı girilir.',
    },
    errors: {
      minPlayers3: 'En az 3 oyuncu gerekli.',
      tooManyRoles: 'Rol sayısı oyuncu sayısını aşıyor.',
      notEnoughRoles: 'Kalan yerleri dolduracak rastgele karakter yok.',
      needVampire: 'En az 1 vampir olmalı.',
      tooManyVampires: (max) => `Bu oyuncu sayısında en fazla ${max} vampir olabilir.`,
      unique: 'Bu karakterden oyunda yalnızca 1 tane olabilir.',
      minPlayers: (min) => `Bu karakter için en az ${min} oyuncu gerekir.`,
    },
  },
  game: {
    morningSub: 'Sabah · telefon ortada',
    diedCount: (n) => (n === 1 ? 'Bu gece biri öldü' : n === 2 ? 'Bu gece iki kişi öldü' : `Bu gece ${n} kişi öldü`),
    nobodyDiedTitle: 'Bu gece kimse ölmedi',
    nobodyDiedText: 'Köy bir sabaha daha sağ salim uyandı. Ama vampirler hâlâ aramızda.',
    leftGame: (name, alive) => `${name} artık oyunda değil. Telefon sırası ${alive} kişiyle devam edecek.`,
    rolesAtEnd: 'Roller oyun sonunda açıklanacak.',
    toDiscussion: 'Tartışmaya geç',
    seeResult: 'Sonucu gör',
    firstNightIdle: 'İlk gece yetenekler kapalı. Bu gece sadece rolünü öğreniyorsun.',
    moreInfo: 'Detaylı açıklama',
    discussSub: (alive) => `Tartışma · ${alive} kişi hayatta`,
    introSub: 'Tanışma · oylama yok',
    remaining: 'kalan',
    timeUp: 'süre doldu',
    playersLabel: 'Oyuncular',
    aliveDead: (alive, dead) => (dead ? `${alive} hayatta · ${dead} ölü` : `${alive} hayatta`),
    introInfo: 'İlk gün sadece tanışma. Bugün kimse asılmaz. Süre bitince ilk gece başlar.',
    autoVote: (s) => `Süre doldu. Oylama ${s} sn içinde başlıyor.`,
    startNow: 'Şimdi başlat',
    skipVoteTitle: 'Oylama atlansın mı?',
    skipVoteMessage: 'Bugün kimse asılmayacak ve gece başlayacak.',
    secretSub: (i, n) => `Gizli oylama · oy ${i} / ${n}`,
    voter: (name) => `Oy veren: ${name}`,
    openSub: 'Açık oylama · telefon ortada',
    openTitle: 'Her oyuncunun aldığı oy',
    votesGiven: (given, total) => `Verilen oy ${given} / ${total}`,
    notVoted: (n) => `${n} kişi oy vermedi`,
    tie: 'Beraberlik',
    leader: 'En çok',
    equal: 'Eşit',
    finishWill: (name) => `Oylamayı bitir · ${name} asılacak`,
    finishNobody: 'Oylamayı bitir · kimse asılmayacak',
    verdictSub: 'Oylama sonucu',
    villageDecided: 'Köy kararını verdi',
    hangedWith: (votes) => `${votes} oyla asıldı`,
    nobodyHangedTitle: 'Kimse asılmadı',
    tieText: (names) => `Oylar eşit çıktı: ${names}. Köy bugün karar veremedi.`,
    noVotesText: 'Kimse oy vermedi. Köy bugün karar veremedi.',
    lastChoice: (name) => `${name} son bir seçim yapacak.`,
    revengeTriggered: (name) => `İntikamcı'nın yeteneği tetiklendi. ${name} yanında bir kişiyi daha götürecek.`,
    giveToName: (name) => `Telefonu ver: ${name}`,
    revengeSub: 'İntikamcı · son seçim',
    revengeHint: 'Bu seçim geri alınamaz. Pas geçersen kimseyi götürmezsin.',
    revengeTitle: (name) => `${name} · İntikam`,
    wentWith: (name) => `${name} ile birlikte gitti`,
    vampiresLeft: (n) => (n > 0 ? `Bir vampir eksildi. Köyde ${n} vampir kaldı.` : 'Bir vampir eksildi.'),
    spellQuestion: 'Bu gece bir büyü kullanacak mısın?',
    spellHint: 'Bir gecede en fazla bir büyü.',
    usesOf: (left, total) => (left > 0 ? `${left} / ${total} kaldı` : `0 / ${total} · bitti`),
    usedStamp: (round) => `Kullanıldı · ${round}. gece`,
    choose: 'Seç',
    chooseTarget: 'Hedef seç',
    useShield: 'Kalkanı kullan',
    sleepTitle: 'Köy uyuyor…',
    sleepText: 'Bu gece yapacak bir şeyin yok. Gözlerini kapat ve dinle.',
    continueIn: (s) => `Devam · 0:${String(s).padStart(2, '0')}`,
    giveTo: 'Telefonu ver:',
    dontLook: 'Diğerleri ekrana bakmasın.',
    tapToRevealName: (name) => `${name}, görmek için dokun`,
    turnOf: (i, n) => `Sıra ${i} / ${n}`,
    yourRole: (name) => `${name} · Rolün`,
    goal: 'Hedefin',
    gotIt: 'Anladım, gizle',
    confirmWith: (name) => `Onayla · ${name}`,
    pass: 'Pas geç',
    self: 'Sen',
    next: 'Sıradaki oyuncu',
    tapToReveal: 'Görmek için dokun',
    hideAndPass: 'Gizle ve devret',
    teammates: 'Takım arkadaşların',
    night: (n) => `${n}. Gece`,
    day: (n) => `${n}. Gün`,
    sleeping: 'Köy uyuyor... Bu gece yapacak bir şeyin yok.',
    confirm: 'Onayla',
    skip: 'Bu gece pas geç',
    usesLeft: (n) => (n > 0 ? `${n} hak kaldı` : 'Kullanıldı'),
    protectedLastNight: 'Dün gece korudun',
    teammate: 'Takım arkadaşı',
    died: (name) => `${name} öldü`,
    nobodyDied: 'Bu gece kimse ölmedi.',
    discuss: 'Tartışın ve şüphelendiğiniz kişiye karar verin.',
    toVote: 'Oylamaya geç',
    vote: 'Kimin asılmasını istiyorsun?',
    finishVote: 'Oylamayı bitir',
    hanged: (name) => `${name} asıldı`,
    nobodyHanged: 'Beraberlik, kimse asılmadı.',
    continue: 'Devam',
    wins: (team) => `${team} kazandı!`,
    newGame: 'Yeni Oyun',
    mainMenu: 'Ana Menü',
    dead: 'Öldü',
    addTime: '+1 dk',
    endEarly: 'Erken bitir',
    skipVote: 'Oylamayı atla',
    toNight: 'Geceye geç',
    quitTitle: 'Oyundan çıkılsın mı?',
    quitMessage: 'Bu oyun silinecek ve geri getirilemeyecek.',
    cancel: 'Vazgeç',
    quit: 'Oyundan çık',
    timeline: 'Olaylar',
    usedAbility: (actor, ability, target) => (target ? `${actor}: ${ability} → ${target}` : `${actor}: ${ability}`),
    saved: (name) => `${name} kurtarıldı`,
    pickedBy: (names) => `Seçen: ${names}`,
    abstain: "Pas geç (kimseye oy verme)",
    verdict: 'Oylama Sonucu',
    timeLeft: 'Kalan süre',
  },
  gameSettings: {
    title: 'Oyun Ayarları',
    firstNightActions: {
      label: 'İlk gece yetenekler kullanılsın',
      hint: 'Kapalıysa ilk gece kimse işlem yapmaz: vampirler öldürmez, kimse korunmaz. Herkes sadece rolünü öğrenir.',
    },
    revealRoleOnDeath: {
      label: 'Ölenin rolü açıklansın',
      hint: 'Bir oyuncu öldüğünde rolü herkese gösterilir.',
    },
    voteMode: {
      label: 'Oylama şekli',
      options: {
        secret: { label: 'Gizli oy', hint: 'Telefon elden ele dolaşır, herkes gizlice oy verir.' },
        open: { label: 'Açık oy', hint: 'Telefon ortada durur, herkesin aldığı oy sayısı girilir.' },
      },
    },
  },
};
