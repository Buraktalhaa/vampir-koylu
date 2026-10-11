import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, phases } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = { remaining: number; total: number; label: string; size?: number };

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Renk eşikleri: >30 sn kehribar, ≤30 gün batımı, ≤10 tehlike. Rakam her zaman görünür. */
function ringColor(remaining: number): string {
  if (remaining <= 10) return colors.danger.fg;
  if (remaining <= 30) return phases.day.mist;
  return phases.day.accent;
}

export function CountdownRing({ remaining, total, label, size = 210 }: Props) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = total > 0 ? remaining / total : 0;
  const color = ringColor(remaining);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surface3} strokeOpacity={0.6} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <AppText accessibilityRole="timer" style={[styles.time, { color: remaining <= 10 ? colors.danger.fg : colors.text1 }]}>
        {format(remaining)}
      </AppText>
      <AppText variant="small" color={colors.text2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  time: { fontSize: 52, lineHeight: 60, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
