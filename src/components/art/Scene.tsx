import { useState } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { DAY_SCENES, NIGHT_SCENES, randomOf, SCENES, type SceneId } from '@/theme/art';

type Props = {
  /** Sahne; `night` / `day` verilirse o fazın sahnelerinden rastgele biri (ekran açıldığında bir kez seçilir). */
  id: SceneId | 'night' | 'day';
  style?: StyleProp<ViewStyle>;
};

/** Tam ekran gölge kukla sahnesi. Ekranı kaplar (kenarlardan kırpılır); dokunmaları engellemez. */
export function Scene({ id, style }: Props) {
  const [scene] = useState<SceneId>(() => (id === 'night' ? randomOf(NIGHT_SCENES) : id === 'day' ? randomOf(DAY_SCENES) : id));
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap, style]}>
      <SvgXml xml={SCENES[scene]} width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
