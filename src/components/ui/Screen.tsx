import { type ReactNode, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Phase } from '@/game/types';
import { PhaseProvider } from '@/theme/PhaseContext';
import { colors, DEFAULT_PHASE, gutter, motion, phases, space } from '@/theme/tokens';

import { AppText } from '@/components/ui/AppText';

type Props = {
  title?: string;
  children: ReactNode;
  /** Alt kısma sabitlenen aksiyonlar (tek elle kullanım). */
  footer?: ReactNode;
  phase?: Phase;
  /** Faz degradesi yerine özel arka plan (ör. ana menü görseli). */
  backdrop?: ReactNode;
  /** Sürükle-bırak sırasında ekran kaymasın diye kapatılabilir. */
  scrollEnabled?: boolean;
  /** Alt çubuk kendi zemininde (ör. kurulumda yer sayacı + hata + İleri). */
  footerSurface?: boolean;
};

export function Screen({ title, children, footer, phase = DEFAULT_PHASE, backdrop, scrollEnabled = true, footerSurface }: Props) {
  return (
    <PhaseProvider value={phase}>
    <SafeAreaView style={[styles.root, { backgroundColor: phases[phase].bg }]}>
      {backdrop ?? <PhaseLayer phase={phase} />}
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={scrollEnabled}>
        {title ? <AppText variant="h1">{title}</AppText> : null}
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, footerSurface && { backgroundColor: phases[phase].surface, borderTopColor: phases[phase].border, borderTopWidth: 2, paddingTop: space[4] }]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
    </PhaseProvider>
  );
}

/** Son gösterilen faz: sonraki ekran farklı fazdaysa perde ondan yeni faza geçer. */
const shown: { phase?: Phase } = {};

/**
 * Faz zemini + faz geçişi: önceki ekran başka fazdaysa onun perdesi yeni perdenin üstünde söner
 * (gece → gündüz 1800 ms, kandil ısınır; gündüz → gece 1200 ms, kandil söner). İçerik beklemeden görünür.
 */
function PhaseLayer({ phase }: { phase: Phase }) {
  const reduced = useReducedMotion();
  const [from] = useState(() => (shown.phase && shown.phase !== phase && !reduced ? shown.phase : undefined));
  const fade = useSharedValue(1);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));
  // Gündüz kandili titrer (opaklık .92 ↔ 1).
  const flicker = useSharedValue(1);
  const flickerStyle = useAnimatedStyle(() => ({ opacity: flicker.get() }));
  useEffect(() => {
    if (phase !== 'day' || reduced) return;
    flicker.set(withRepeat(withSequence(withTiming(0.92, { duration: 700 }), withTiming(1, { duration: 520 }), withTiming(0.95, { duration: 300 }), withTiming(1, { duration: 400 })), -1));
    return () => cancelAnimation(flicker);
  }, [phase, reduced, flicker]);

  useEffect(() => {
    shown.phase = phase;
    if (!from) return;
    const [x1, y1, x2, y2] = phase === 'day' ? motion.ease.standard : motion.ease.in;
    fade.set(withTiming(0, { duration: phase === 'day' ? motion.nightToDay : motion.dayToNight, easing: Easing.bezier(x1, y1, x2, y2) }));
  }, [phase, from, fade]);

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, flickerStyle]}>
        <PhaseBackdrop phase={phase} />
      </Animated.View>
      {from ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, fadeStyle]}>
          <PhaseBackdrop phase={from} />
        </Animated.View>
      ) : null}
    </>
  );
}

/** Faz atmosferi: perdenin üstünden sızan ışık (gündüz kandil, gece indigo) zemine doğru söner; kenarlar is rengine kararır. */
export function PhaseBackdrop({ phase }: { phase: Phase }) {
  const { bg, glow } = phases[phase];
  return (
    <Svg style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} preserveAspectRatio="none" viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`light-${phase}`} cx="50" cy="-8" rx="95" ry="70" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={glow} stopOpacity={0.75} />
          <Stop offset="0.55" stopColor={glow} stopOpacity={0.18} />
          <Stop offset="1" stopColor={bg} stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="soot" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.6" stopColor={colors.bg0} stopOpacity={0} />
          <Stop offset="1" stopColor={colors.bg0} stopOpacity={0.6} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill={`url(#light-${phase})`} />
      <Rect width="100" height="100" fill="url(#soot)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: gutter, paddingTop: space[2], paddingBottom: space[5], gap: space[3] },
  footer: { paddingHorizontal: gutter, paddingTop: space[2], paddingBottom: space[3], gap: space[2] },
});
