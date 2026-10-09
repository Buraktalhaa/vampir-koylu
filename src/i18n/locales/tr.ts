import type { RoleId } from '../../game/roles';
import type { TeamId } from '../../game/types';

export type AbilityText = { name: string; prompt?: string };

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
      abilities: { bite: { name: 'Isırık', prompt: 'Bu gece kimi ısıracaksınız?' } },
    },
    witch: {
      name: 'Büyücü',
      description:
        "İki büyün var, her biri bir kez kullanılır. Bir gecede yalnızca birini yapabilirsin: o gece herkesi korumak ya da bir oyuncuyu lanetleyip öldürmek. Şifacı'nın koruduğu kişiye lanetin işlemez.",
      abilities: {
        shield: { name: 'Koruma Kalkanı', prompt: 'Bu gece tüm köyü korumak istiyor musun?' },
        curse: { name: 'Ölüm Laneti', prompt: 'Kimi lanetleyeceksin?' },
      },
    },
    healer: {
      name: 'Şifacı',
      description:
        'Her gece bir oyuncuyu korursun, kendini de koruyabilirsin. Aynı kişiyi art arda iki gece koruyamazsın.',
      abilities: { heal: { name: 'Şifa', prompt: 'Bu gece kimi koruyacaksın?' } },
    },
    avenger: {
      name: 'İntikamcı',
      description: 'Köy seni asarsa yanında bir oyuncuyu daha götürürsün.',
      abilities: { revenge: { name: 'İntikam', prompt: 'Yanında kimi götüreceksin?' } },
    },
  },
};
