import { PixelRatio, Text, type TextProps } from 'react-native';

import { colors, DISPLAY_FALLBACK_SCALE, fonts, MAX_FONT_SCALE, type, type TypeVariant } from '@/theme/tokens';

type Props = TextProps & {
  variant?: TypeVariant;
  color?: string;
};

/** Tüm metinler bundan geçer: tip ölçeği, renk ve dinamik yazı kuralları tek yerde. */
export function AppText({ variant = 'body', color = colors.text1, style, ...rest }: Props) {
  const base = type[variant];
  const isDisplay = base.fontFamily === fonts.display;
  const fontFamily = isDisplay && PixelRatio.getFontScale() > DISPLAY_FALLBACK_SCALE ? fonts.bodyBold : base.fontFamily;

  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[base, { fontFamily, color }, style]}
      {...rest}
    />
  );
}
