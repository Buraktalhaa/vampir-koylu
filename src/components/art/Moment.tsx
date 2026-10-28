import { useMemo } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { MOMENTS, type MomentId, paintTeam } from '@/theme/art';
import { colors, motion, radius } from '@/theme/tokens';

type Props = {
  id: MomentId;
  /** `#TEAM` kakmasının rengi (ör. açıklanan rolün takımı; açıklanmıyorsa nötr deri). */
  inlay?: string;
  /** framed: kenarlıklı yuvarlak kart (sabah, karar) · bare: çerçevesiz (oyun sonu üst görseli) */
  variant?: 'framed' | 'bare';
  style?: StyleProp<ViewStyle>;
};

/** Dramatik an görseli (4:3): ölüm, kimse ölmedi, asılma, beraberlik, kazananlar. Yumuşakça belirir. */
export function Moment({ id, inlay = colors.metal.brass, variant = 'framed', style }: Props) {
  const xml = useMemo(() => paintTeam(MOMENTS[id], inlay), [id, inlay]);
  return (
    <Animated.View entering={FadeIn.duration(motion.portraitEnter)} style={[styles.base, variant === 'framed' && styles.framed, style]}>
      <View style={styles.ratio}>
        <SvgXml xml={xml} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', alignSelf: 'stretch' },
  framed: { borderRadius: radius.md, borderWidth: 2, borderColor: colors.wood },
  ratio: { aspectRatio: 4 / 3 },
});
