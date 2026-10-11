import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { Phase } from '@/game/types';
import { colors, DEFAULT_PHASE, gutter, phases, space } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = {
  title?: string;
  children: ReactNode;
  /** Alt kısma sabitlenen aksiyonlar (tek elle kullanım). */
  footer?: ReactNode;
  phase?: Phase;
};

export function Screen({ title, children, footer, phase = DEFAULT_PHASE }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <PhaseBackdrop phase={phase} />
      <ScrollView contentContainerStyle={styles.content}>
        {title ? <AppText variant="h1">{title}</AppText> : null}
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

/** Faz atmosferi: gece üstte lacivert gökyüzü, gündüz üstte kehribar ışıma; alta doğru zemine iner. */
function PhaseBackdrop({ phase }: { phase: Phase }) {
  const { sky, deep } = phases[phase];
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`bg-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={phase === 'night' ? sky : deep} />
          <Stop offset="0.45" stopColor={phase === 'night' ? deep : sky} stopOpacity={phase === 'night' ? 1 : 0.6} />
          <Stop offset="1" stopColor={colors.bg1} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill={`url(#bg-${phase})`} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg1 },
  content: { paddingHorizontal: gutter, paddingTop: space[2], paddingBottom: space[5], gap: space[3] },
  footer: { paddingHorizontal: gutter, paddingTop: space[2], paddingBottom: space[3], gap: space[2] },
});
