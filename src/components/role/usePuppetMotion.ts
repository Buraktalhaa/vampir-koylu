import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { PuppetPart } from '@/theme/portraits';
import { motion } from '@/theme/tokens';

const ease = (k: keyof typeof motion.ease) => {
  const [x1, y1, x2, y2] = motion.ease[k];
  return Easing.bezier(x1, y1, x2, y2);
};

/** Sonsuz gidip gelme: `from` değerinden başlar, `to`ya gider, geri döner. */
const sway = (to: number, duration: number, delay = 0, curve: keyof typeof motion.ease = 'sway') =>
  withDelay(delay, withRepeat(withTiming(to, { duration, easing: ease(curve) }), -1, true));

/**
 * Kukla parçalarının sürekli hareketi (design/puppet/TABLOLAR.md "Hareket: portre").
 * Tüm parçalar her zaman tanımlıdır (hook sayısı sabit); portrede olmayan parça kullanılmaz.
 * `salute`: Belediye Başkanı rol açılışında şapkasını bir kez kaldırır.
 */
export function usePuppetMotion({ enabled, salute }: { enabled: boolean; salute?: boolean }) {
  const reduced = useReducedMotion();
  const arm = useSharedValue(0);
  const head = useSharedValue(0);
  const hat = useSharedValue(0);
  const flameRotate = useSharedValue(0);
  const flameScale = useSharedValue(1);
  const bat = useSharedValue(1);
  const drum = useSharedValue(1);

  useEffect(() => {
    const all: SharedValue<number>[] = [arm, head, hat, flameRotate, flameScale, bat, drum];
    if (!enabled || reduced) return;
    arm.set(-3);
    arm.set(sway(4, 2400));
    head.set(-1.5);
    head.set(sway(1, 4000, 600));
    hat.set(salute ? 0 : -2);
    const hatSway = sway(2, 3200, salute ? 0 : 400);
    hat.set(
      salute
        ? withSequence(
            withTiming(-8, { duration: 450, easing: ease('overshoot') }),
            withTiming(-2, { duration: 450, easing: ease('overshoot') }),
            hatSway,
          )
        : hatSway,
    );
    flameRotate.set(-5);
    flameRotate.set(sway(5, 520, 0, 'flicker'));
    flameScale.set(0.88);
    flameScale.set(sway(1.08, 440, 0, 'flicker'));
    // Yarasa her 4 sn'de üç kez kanat çırpar.
    const flap = [withTiming(0.55, { duration: 150 }), withTiming(1, { duration: 150 })];
    bat.set(withRepeat(withSequence(withTiming(1, { duration: 3100 }), ...flap, ...flap, ...flap), -1));
    // Davul, kol en uca (+4°) vardığında titrer: kol 2400 ms'de bir uca varır, tam tur 4800 ms.
    drum.set(
      withDelay(
        2400,
        withRepeat(
          withSequence(
            withTiming(1.04, { duration: 90, easing: ease('decel') }),
            withTiming(1, { duration: 90, easing: ease('decel') }),
            withTiming(1, { duration: 4620 }),
          ),
          -1,
        ),
      ),
    );
    return () => all.forEach((v) => cancelAnimation(v));
  }, [enabled, reduced, salute, arm, head, hat, flameRotate, flameScale, bat, drum]);

  const styles = {
    arm: useAnimatedStyle(() => ({ transform: [{ rotate: `${arm.get()}deg` }] })),
    head: useAnimatedStyle(() => ({ transform: [{ rotate: `${head.get()}deg` }] })),
    hat: useAnimatedStyle(() => ({ transform: [{ rotate: `${hat.get()}deg` }] })),
    flame: useAnimatedStyle(() => ({ transform: [{ rotate: `${flameRotate.get()}deg` }, { scaleY: flameScale.get() }] })),
    bat: useAnimatedStyle(() => ({ transform: [{ scaleY: bat.get() }] })),
    drum: useAnimatedStyle(() => ({ transform: [{ scale: drum.get() }] })),
  } satisfies Record<PuppetPart, unknown>;
  return styles;
}
