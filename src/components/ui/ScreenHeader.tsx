import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, DEFAULT_PHASE, phases, radius, space, touch } from '@/theme/tokens';

import { AppText } from '@/components/ui/AppText';

type Props = {
  title: string;
  /** Sağda küçük içerik (ör. sayı rozeti). */
  right?: ReactNode;
  /** Kurulum adım göstergesi: [şu anki, toplam]. */
  step?: [number, number];
  stepLabel?: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, right, step, stepLabel, onBack = () => router.back() }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="‹" onPress={onBack} hitSlop={8} style={styles.back}>
          <ChevronLeft size={24} color={colors.text1} />
        </Pressable>
        <AppText variant="h1" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        {right}
      </View>
      {step ? (
        <View style={styles.stepWrap}>
          {stepLabel ? (
            <AppText variant="caption" color={colors.text3}>
              {stepLabel}
            </AppText>
          ) : null}
          <View style={styles.bars}>
            {Array.from({ length: step[1] }, (_, i) => (
              <View key={i} style={[styles.bar, i < step[0] && { backgroundColor: phases[DEFAULT_PHASE].accent }]} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Başlığın sağındaki küçük sayı rozeti. */
export function CountBadge({ value }: { value: number }) {
  return (
    <View style={styles.badge}>
      <AppText variant="caption">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[4], marginBottom: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  back: { width: touch.min, height: touch.min, marginLeft: -space[3], alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
  stepWrap: { gap: space[2] },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: colors.surface3 },
  badge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: space[2],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
