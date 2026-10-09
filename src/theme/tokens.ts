/**
 * Vampir Köylü — Tasarım Sistemi v1 token'ları (Claude Design).
 * Tek, sabit karanlık tema. Faz (gece/gündüz) yalnızca atmosfer katmanını ve
 * birincil vurguyu değiştirir; yüzeyler, metin, takım ve durum renkleri iki fazda da aynıdır.
 */
import type { Phase } from '@/game/types';

export const colors = {
  bg0: '#07060D', // Uçurum — kök, kenar boşlukları
  bg1: '#0E0C18', // Zemin — ekran tabanı
  surface1: '#16132A', // kart, liste satırı
  surface2: '#1F1B38', // sheet, modal
  surface3: '#2A2547', // aktif sekme, hover
  line: '#3A3360', // ayırıcı, kenarlık
  lineStrong: '#564C85', // giriş alanı, ikincil buton
  bgHandoff: '#0A0912', // devir ekranı (fazdan bağımsız)

  text1: '#F3EFFA', // birincil
  text2: '#BDB5D1', // ikincil
  text3: '#948BAD', // üçüncül / ipucu
  textInverse: '#120F1E', // buton üstü metin

  /** Takım renkleri yalnızca telefonu tutan kişinin gördüğü küçük alanlarda (kart çerçevesi, etiket). */
  team: {
    village: { fg: '#E9C46A', line: '#6E5A2C', bg: '#241C10' },
    vampire: { fg: '#FF7A86', fill: '#B3182E', line: '#6E2632', bg: '#26101A' },
    neutral: { fg: '#7DD3C8', line: '#2E615B', bg: '#0E2524' },
  },

  danger: { fill: '#B3182E', fg: '#FF7A86' },
  success: { fg: '#5BCB8E', bg: '#0F2A1C' },
  warning: { fg: '#F5DBA0', bg: '#2A2010' },
  info: { fg: '#8DB8FF', bg: '#141F3A' }, // korunmuş durumu da bu renk
} as const;

type PhaseTheme = {
  sky: string;
  deep: string;
  mist: string;
  /** Birincil vurgu: birincil buton, seçili çerçeve. Üstündeki metin `textInverse`. */
  accent: string;
  selectBg: string;
};

export const phases: Record<Phase, PhaseTheme> = {
  night: { sky: '#0E1338', deep: '#141038', mist: '#2E1F5E', accent: '#CBD5FF', selectBg: '#25224F' },
  day: { sky: '#2A140E', deep: '#1B0E0B', mist: '#E0683A', accent: '#F2A541', selectBg: '#3A1F14' },
};

/** Oyun dışındaki ekranlar (menü, ayarlar) gece atmosferini kullanır. */
export const DEFAULT_PHASE: Phase = 'night';

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 14: 56 } as const;

/** Ekran yan kenar boşluğu. */
export const gutter = space[5];

/** Dokunma alanı ≥ 44×44, ana butonlar 52–56. */
export const touch = { min: 44, button: 54 } as const;

export const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const shadow = {
  1: '0px 2px 8px rgba(0, 0, 0, 0.45)',
  2: '0px 12px 32px rgba(0, 0, 0, 0.55)', // sheet, toast
  glowMoon: '0px 0px 16px rgba(203, 213, 255, 0.35)', // seçim, gece
  glowAmber: '0px 0px 16px rgba(242, 165, 65, 0.35)', // seçim, gündüz
} as const;

export const motion = {
  instant: 100, // basış geri bildirimi
  fast: 200, // seçim, toggle
  base: 320, // sheet, ekran
  flip: 600, // kart çevirme
  hold: 1300, // basılı tut (1200–1500)
  phase: 1600, // gece ↔ gündüz
  /** Standart eğri: cubic-bezier(0.2, 0, 0, 1) */
  easing: [0.2, 0, 0, 1] as const,
};

export const fonts = {
  logo: 'PirataOne_400Regular',
  display: 'Cinzel_700Bold',
  body: 'FiraSans_400Regular',
  bodySemiBold: 'FiraSans_600SemiBold',
  bodyBold: 'FiraSans_700Bold',
} as const;

type TypeStyle = { fontFamily: string; fontSize: number; lineHeight?: number; letterSpacing?: number };

export const type = {
  logo: { fontFamily: fonts.logo, fontSize: 56 },
  display: { fontFamily: fonts.display, fontSize: 36 },
  h1: { fontFamily: fonts.display, fontSize: 28 },
  h2: { fontFamily: fonts.display, fontSize: 22 },
  h3: { fontFamily: fonts.display, fontSize: 18 },
  button: { fontFamily: fonts.bodySemiBold, fontSize: 17 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.bodySemiBold, fontSize: 12, letterSpacing: 12 * 0.12 },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof type;

/** Dinamik yazı: tüm ölçüler en fazla 1.6× büyür. */
export const MAX_FONT_SCALE = 1.6;
/** Cinzel başlıklar bu ölçeğin üstünde okunabilirlik için Fira Sans 700'e düşer. */
export const DISPLAY_FALLBACK_SCALE = 1.3;
