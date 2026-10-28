import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

/** Basınca hafifçe içe göçme (1 → 0.97). `Animated.View` stiline ve Pressable'ın onPressIn/onPressOut'una bağlanır. */
export function usePressScale(scaleTo: number = motion.press.scale) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const to = (value: number, duration: number) => {
    if (!reduced) scale.set(withTiming(value, { duration, easing: Easing.out(Easing.quad) }));
  };
  return {
    style,
    onPressIn: () => to(scaleTo, motion.press.in),
    onPressOut: () => to(1, motion.press.out),
  };
}
