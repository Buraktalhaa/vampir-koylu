import type { RoleId } from '../../game/roles';
import type { TeamId } from '../../game/types';

export type RoleText = { name: string; description: string; abilityPrompt?: string };

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
      abilityPrompt: 'Bu gece kimi ısıracaksınız?',
    },
    seer: {
      name: 'Büyücü',
      description: 'Her gece bir oyuncunun gerçek rolünü öğrenirsin.',
      abilityPrompt: 'Kimin rolüne bakmak istiyorsun?',
    },
    healer: {
      name: 'Şifacı',
      description: 'Her gece bir oyuncuyu vampir saldırısından korursun. Aynı kişiyi art arda iki gece koruyamazsın.',
      abilityPrompt: 'Bu gece kimi koruyacaksın?',
    },
    hunter: {
      name: 'Avcı',
      description: 'Öldüğünde son bir atış yaparak bir oyuncuyu yanında götürürsün.',
      abilityPrompt: 'Son kurşununu kime sıkacaksın?',
    },
  },
};
