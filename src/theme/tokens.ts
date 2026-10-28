/**
 * Vampir Köylü — Gölge Kukla tasarım sistemi (Claude Design, B yönü). Kaynak: design/puppet/TABLOLAR.md.
 * Tek, sabit karanlık tema. Gündüz/menü kandil ışığıyla ısınır, gece indigo perdeye döner.
 * Kartlar yarı saydam koyu deridir: altındaki perdenin (kandil ya da gece) rengini alır, böylece iki fazda da uyar.
 */
import type { Phase } from '@/game/types';

export const colors = {
  bg0: '#0B0705', // en koyu zemin, siluet
  bg1: '#160D09', // gündüz / menü zemini
  surface1: 'rgba(26, 16, 11, 0.9)', // kart, liste satırı (gündüz derisi; gece ekranları phases.night.surface kullanır)
  surface2: '#1A100B', // alt sayfa, modal (opak)
  surface3: 'rgba(243, 226, 196, 0.1)', // aktif sekme, basılı satır
  line: '#3A2214', // ayırıcı, kart kenarı (ahşap)
  lineStrong: '#5A3822', // giriş alanı, sayaç kenarı
  bgHandoff: '#0E0A1C', // devir ekranı (gece perdesi)
  scrim: 'rgba(11, 7, 5, 0.72)', // alt sayfa arkası

  text1: '#F3E2C4', // birincil (≥ 12:1)
  text2: '#C2A688', // ikincil (≥ 7:1)
  text3: '#97806A', // üçüncül / ipucu
  textInverse: '#1A0D07', // kandil renkli buton üstü

  /** Takım renkleri yalnızca telefonu tutan kişinin gördüğü küçük alanlarda (kart çerçevesi, etiket). */
  team: {
    village: { fg: '#E6C34A', line: '#6B5A22', bg: '#231B0B' },
    vampire: { fg: '#E35A4C', fill: '#C8392B', line: '#6A2219', bg: '#260E0B' },
    neutral: { fg: '#4FC495', line: '#1F5A44', bg: '#0C2219' },
  },

  danger: { fill: '#8E2A1F', fg: '#E0644F', bg: 'rgba(224, 100, 79, 0.14)', line: 'rgba(224, 100, 79, 0.5)', text: '#F3C9C0' },
  success: { fg: '#8BCB7E', bg: 'rgba(139, 203, 126, 0.12)', line: 'rgba(139, 203, 126, 0.4)' },
  warning: { fg: '#F8CF8C', bg: 'rgba(224, 138, 60, 0.14)', line: 'rgba(224, 138, 60, 0.45)' },
  info: { fg: '#A9A3C9', bg: 'rgba(169, 163, 201, 0.12)', line: 'rgba(169, 163, 201, 0.35)' }, // korunmuş durumu da bu renk

  lamp: { core: '#F8CF8C', mid: '#E08A3C', edge: '#6A2D10' },
  wood: '#3A2214', // gündüz kart kenarı (ahşap perde çerçevesi)
  moon: '#E9E0F5', // gece birincil buton ve seçim
  metal: { brass: '#C9A26B', iron: '#8C7A64' },
  glow: '#FFF1C8',
} as const;

/** Oyuncu avatar renkleri (isimden kararlı şekilde seçilir; takım bilgisi taşımaz). */
export const avatarColors = ['#D9B98C', '#C9A0B4', '#A9C29A', '#9DBFC2', '#E0A37A', '#BFAE8E', '#E3CF8E', '#B3A6D6'] as const;

type PhaseTheme = {
  /** Ekran zemini. */
  bg: string;
  /** Kart / panel dolgusu ve kenarı. */
  surface: string;
  border: string;
  /** İkincil metin. */
  text2: string;
  /** Perdenin üstten sızan ışığı (zemine iner). */
  glow: string;
  /** Uyarı / son saniyeler. */
  mist: string;
  /** Seçim vurgusu: seçili çerçeve, aktif öğe. Üstündeki metin `textInverse`. */
  accent: string;
  selectBg: string;
};

export const phases: Record<Phase, PhaseTheme> = {
  night: { bg: '#0E0A1C', surface: '#161230', border: '#2E2650', text2: '#A9A3C9', glow: '#4A3A78', mist: '#2A2050', accent: '#E9E0F5', selectBg: '#2A2050' },
  day: { bg: '#160D09', surface: '#1A100B', border: '#3A2214', text2: '#C2A688', glow: '#8A3C16', mist: '#E0644F', accent: '#F8CF8C', selectBg: '#3A2214' },
};

/** Oyun dışındaki ekranlar (menü, kurulum, ayarlar) kandil ışığını kullanır. */
export const DEFAULT_PHASE: Phase = 'day';

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 14: 56 } as const;

/** Ekran yan kenar boşluğu. */
export const gutter = space[5];

/** En küçük dokunma alanı 48×48, birincil buton 56. */
export const touch = { min: 48, button: 56 } as const;

export const radius = { xs: 6, sm: 10, md: 16, lg: 20, xl: 28, pill: 999 } as const;

export const shadow = {
  card: '0px 12px 14px rgba(0, 0, 0, 0.55)',
  lamp: '0px 0px 14px rgba(224, 138, 60, 0.35)', // birincil buton ışıltısı
  moon: '0px 0px 14px rgba(201, 191, 245, 0.3)', // gece seçimi
} as const;

/** Süreler (ms) ve eğriler: design/puppet/TABLOLAR.md "Hareket". */
export const motion = {
  press: { in: 90, out: 160, scale: 0.97 },
  fast: 200,
  base: 320,
  flipOut: 220,
  flipIn: 320,
  portraitEnter: 420,
  teamReveal: 600,
  nightToDay: 1800,
  dayToNight: 1200,
  deathDrop: 700,
  /** cubic-bezier değerleri */
  ease: {
    standard: [0.4, 0, 0.2, 1],
    out: [0.2, 0.8, 0.2, 1],
    in: [0.4, 0, 1, 1],
    decel: [0, 0, 0.2, 1],
    sway: [0.37, 0, 0.63, 1],
    flicker: [0.45, 0, 0.55, 1],
    drop: [0.55, 0, 1, 0.45],
    overshoot: [0.34, 1.56, 0.64, 1],
  },
} as const;

export const fonts = {
  logo: 'PirataOne_400Regular',
  display: 'Cinzel_700Bold',
  body: 'Karla_400Regular',
  bodyItalic: 'Karla_400Regular_Italic',
  bodySemiBold: 'Karla_600SemiBold',
  bodyBold: 'Karla_700Bold',
} as const;

type TypeStyle = { fontFamily: string; fontSize: number; lineHeight?: number; letterSpacing?: number };

export const type = {
  logo: { fontFamily: fonts.logo, fontSize: 56 },
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, letterSpacing: 22 * 0.02 },
  h3: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24 },
  button: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 20, letterSpacing: 15 * 0.12 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 12 * 0.16 },
  timer: { fontFamily: fonts.display, fontSize: 56, lineHeight: 60 },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof type;

/** Dinamik yazı: tüm ölçüler en fazla 1.6× büyür. */
export const MAX_FONT_SCALE = 1.6;
/** Cinzel başlıklar bu ölçeğin üstünde okunabilirlik için Karla 700'e düşer. */
export const DISPLAY_FALLBACK_SCALE = 1.3;

/**
 * Gölge Kukla (Claude Design, B yönü) — karakter portreleri. Kaynak: design/puppet/TABLOLAR.md.
 * Siluet perdenin önünde durur; deliklerden arkadaki ışık görünür. Takım rengi yalnızca kakmada (`#TEAM`).
 */
export const puppet = {
  silhouette: '#0B0705',
  /** Kakma rengi; gizli bağlamda (devir, oylama) `hidden`. */
  team: { village: '#E6C34A', vampire: '#C8392B', neutral: '#36A57C' },
  hidden: '#5A4A3C',
  /** Perde ışığı (radyal, merkez %50 / %40): [renk, konum]. */
  backdrop: {
    lamp: [['#F8CF8C', 0], ['#E08A3C', 0.42], ['#6A2D10', 0.78], ['#1A0D07', 1]],
    night: [['#4A3A78', 0], ['#2A2050', 0.45], ['#0E0A1C', 1]],
  },
} as const;

export type Backdrop = keyof typeof puppet.backdrop;
