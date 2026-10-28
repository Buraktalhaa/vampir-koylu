import { SvgXml } from 'react-native-svg';

import { LOGO } from '@/theme/art';

/**
 * Oyun logosu (Cinzel Black harfleri path olarak; yazı tipine bağlı değil).
 * lamp: koyu zeminde kandil renkli · silhouette: kandil perdesi üstünde koyu siluet (ana menü).
 */
export function Logo({ width = 290, variant = 'silhouette' }: { width?: number; variant?: keyof typeof LOGO }) {
  return <SvgXml xml={LOGO[variant]} width={width} height={(width * 400) / 591.12} accessibilityRole="header" accessibilityLabel="Vampir Köylü" />;
}
