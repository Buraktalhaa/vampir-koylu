import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { Icon as IconComponent } from '@/components/icons/types';
import { AppText } from '@/components/ui/AppText';
import type { Phase } from '@/game/types';
import { usePressScale } from '@/hooks/usePressScale';
import { useLanguage } from '@/i18n/LanguageProvider';
import { usePhase } from '@/theme/PhaseContext';
import { colors, phases, radius, shadow, space, touch } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger';

type Props = {
  label: string;
  /** İkinci satır (ör. "3. gün · 8 oyuncu"). */
  sublabel?: string;
  onPress: () => void;
  variant?: Variant;
  /** Verilmezse ekranın perde modundan (gündüz/gece) gelir. */
  phase?: Phase;
  disabled?: boolean;
  icon?: IconComponent;
  trailingIcon?: IconComponent;
};

type Look = { bg: string; border: string; borderWidth: number; text: string; height: number; glow?: string };

function lookOf(variant: Variant, phase: Phase): Look {
  const night = phase === 'night';
  switch (variant) {
    case 'primary':
      return night
        ? { bg: colors.moon, border: colors.bg0, borderWidth: 2, text: phases.night.bg, height: touch.button, glow: shadow.moon }
        : { bg: 'transparent', border: colors.bg0, borderWidth: 2, text: colors.textInverse, height: touch.button, glow: shadow.lamp };
    case 'secondary':
      return { bg: 'transparent', border: night ? '#7D6CB8' : colors.lamp.mid, borderWidth: 1.5, text: colors.text1, height: 52 };
    case 'tertiary':
      return { bg: 'transparent', border: 'transparent', borderWidth: 0, text: night ? phases.night.text2 : colors.text2, height: 44 };
    case 'danger':
      return { bg: colors.danger.fill, border: colors.danger.fg, borderWidth: 1.5, text: colors.text1, height: 52 };
  }
}

/**
 * Hap biçimli buton (bkz. design/puppet/BILESENLER.md). Birincil: gündüz kandil degradesi, gece ay rengi; ikincil: kandil kenarlı;
 * üçüncül: yalnız metin; tehlike: koyu kan. Etiket büyük harf (dile göre: "i" → "İ").
 */
export function Button({ label, sublabel, onPress, variant = 'primary', phase: phaseProp, disabled, icon: Icon, trailingIcon: Trailing }: Props) {
  const { language } = useLanguage();
  const contextPhase = usePhase();
  const phase = phaseProp ?? contextPhase;
  const press = usePressScale();
  const look = lookOf(variant, phase);
  const lamp = variant === 'primary' && phase !== 'night';

  return (
    <Animated.View style={[press.style, look.glow && !disabled && { borderRadius: radius.pill, boxShadow: look.glow }, disabled && styles.disabled]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={({ pressed }) => [
          styles.base,
          { minHeight: sublabel ? 60 : look.height, backgroundColor: look.bg, borderColor: look.border, borderWidth: look.borderWidth },
          pressed && variant !== 'primary' && styles.pressed,
        ]}
      >
        {lamp ? <LampFill /> : null}
        {Icon ? <Icon size={20} color={look.text} /> : null}
        {sublabel ? (
          <View style={styles.labels}>
            <AppText variant="button" color={look.text} numberOfLines={1}>
              {label.toLocaleUpperCase(language)}
            </AppText>
            <AppText variant="small" color={colors.text2} numberOfLines={1} style={styles.sublabel}>
              {sublabel}
            </AppText>
          </View>
        ) : (
          <AppText
            variant="button"
            color={look.text}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[styles.label, variant === 'tertiary' && styles.tertiaryLabel]}
          >
            {variant === 'tertiary' ? label : label.toLocaleUpperCase(language)}
          </AppText>
        )}
        {Trailing ? <Trailing size={18} color={look.text} /> : null}
      </Pressable>
    </Animated.View>
  );
}

/** Kandil degradesi: üstte açık mum sarısı, altta turuncu. */
function LampFill() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 10 10">
      <Defs>
        <LinearGradient id="lamp-fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.lamp.core} />
          <Stop offset="1" stopColor={colors.lamp.mid} />
        </LinearGradient>
      </Defs>
      <Rect width="10" height="10" fill="url(#lamp-fill)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: space[6],
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  labels: { flex: 1, gap: 2 },
  sublabel: { fontSize: 13, lineHeight: 18 },
  label: { flexShrink: 1 },
  tertiaryLabel: { letterSpacing: 0 },
  pressed: { backgroundColor: 'rgba(224, 138, 60, 0.12)' },
  disabled: { opacity: 0.38 },
});
