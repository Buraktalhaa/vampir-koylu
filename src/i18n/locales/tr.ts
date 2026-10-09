import type { RoleId } from '../../game/roles';
import type { VoteMode } from '../../game/settings';
import type { EffectKind, TeamId } from '../../game/types';

export type AbilityText = { name: string; prompt?: string; description?: string };

export type RoleText = {
  name: string;
  description: string;
  /** Yetenek id'sine göre metinler (roles/<id>.ts içindeki ability.id). */
  abilities?: Record<string, AbilityText>;
};

export type Translation = {
  languageName: string;
  teams: Record<TeamId, { name: string; goal: string }>;
  roles: Record<RoleId, RoleText>;
  menu: { resume: string; newGame: string; roles: string; settings: string; howToPlay: string };
  appSettings: { title: string; language: string };
  encyclopedia: { title: string; all: string; abilities: string; team: string };
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
    players: string;
    namePlaceholder: string;
    add: string;
    roles: string;
    random: string;
    allRandom: string;
    suggested: string;
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
  roles: {
    villager: {
      name: 'Köylü',
      description: 'Özel bir gücün yok. Gündüz tartış, şüphelendiğin kişiye oy ver.',
    },
    vampire: {
      name: 'Vampir',
      description: 'Her gece diğer vampirlerle birlikte bir kurban seçersin. Takım arkadaşlarını tanırsın.',
      abilities: { bite: { name: 'Isırık', prompt: 'Bu gece kimi ısıracaksınız?', description: 'Vampirler her gece birlikte bir kurban seçer. Oylar eşitse kurban rastgele belirlenir.' } },
    },
    witch: {
      name: 'Büyücü',
      description:
        "İki büyün var, her biri bir kez kullanılır. Bir gecede yalnızca birini yapabilirsin: o gece herkesi korumak ya da bir oyuncuyu lanetleyip öldürmek. Şifacı'nın koruduğu kişiye lanetin işlemez.",
      abilities: {
        shield: { name: 'Koruma Kalkanı', prompt: 'Bu gece tüm köyü korumak istiyor musun?', description: 'O gece tüm köyü korur; kimse öldürülemez.' },
        curse: { name: 'Ölüm Laneti', prompt: 'Kimi lanetleyeceksin?', description: 'Bir oyuncuyu öldürür. Şifacı\'nın koruduğu kişiye işlemez.' },
      },
    },
    healer: {
      name: 'Şifacı',
      description:
        'Her gece bir oyuncuyu korursun, kendini de koruyabilirsin. Aynı kişiyi art arda iki gece koruyamazsın.',
      abilities: { heal: { name: 'Şifa', prompt: 'Bu gece kimi koruyacaksın?', description: 'Bir oyuncuyu o gece saldırılardan korur. Kendini de koruyabilirsin.' } },
    },
    avenger: {
      name: 'İntikamcı',
      description: 'Köy seni asarsa yanında bir oyuncuyu daha götürürsün.',
      abilities: { revenge: { name: 'İntikam', prompt: 'Yanında kimi götüreceksin?', description: 'Köy seni asarsa yanında bir oyuncuyu daha götürürsün.' } },
    },
  },
  menu: { resume: 'Devam eden oyuna dön', newGame: 'Yeni Oyun', roles: 'Karakterler', settings: 'Ayarlar', howToPlay: 'Nasıl Oynanır' },
  appSettings: { title: 'Ayarlar', language: 'Dil' },
  encyclopedia: { title: 'Karakterler', all: 'Hepsi', abilities: 'Yetenekler', team: 'Takım' },
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
    players: 'Oyuncular',
    namePlaceholder: 'Oyuncu adı',
    add: 'Ekle',
    roles: 'Karakterler',
    random: 'Rastgele',
    allRandom: 'Hepsi Rastgele',
    suggested: 'Önerilen',
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
    vote: 'Kimi asmak istiyorsun?',
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
