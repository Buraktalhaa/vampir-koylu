import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors } from '@/theme/tokens';

type Props = { remaining: number; total: number; label: string; size?: number };

/** Son saniyeler: halka kırmızıya döner, sayı her saniye nabız gibi atar. */
const WARN_SECONDS = 30;

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Geri sayım halkası (tasarım 06): ahşap ray, kandil degradeli ilerleme; ortada Cinzel sayaç ve etiket. */
export function CountdownRing({ remaining, total, label, size = 230 }: Props) {
  const { language } = useLanguage();
  const reduced = useReducedMotion();
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = total > 0 ? remaining / total : 0;
  const warn = remaining <= WARN_SECONDS;

  const pulse = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));
  useEffect(() => {
    if (warn && remaining > 0 && !reduced) pulse.set(withSequence(withTiming(1.06, { duration: 120 }), withTiming(1, { duration: 120 })));
  }, [remaining, warn, reduced, pulse]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ring-lamp" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.lamp.mid} />
            <Stop offset="1" stopColor={colors.lamp.core} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.wood} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={warn ? colors.danger.fg : 'url(#ring-lamp)'}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Animated.View style={pulseStyle}>
        <AppText variant="timer" accessibilityRole="timer" color={warn ? colors.danger.fg : colors.text1} style={styles.time}>
          {format(remaining)}
        </AppText>
      </Animated.View>
      <AppText variant="caption" color={colors.text2}>
        {label.toLocaleUpperCase(language)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  time: { fontVariant: ['tabular-nums'] },
});
