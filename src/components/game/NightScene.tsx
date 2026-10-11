import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { nightSceneXml, SCENE_COUNT } from './nightScenes';

/** Rastgele bir gece manzarası. Her yeni ekranda (yeni key ile) farklı sahne gelebilir. */
export function NightScene({ style }: { style?: StyleProp<ViewStyle> }) {
  const [index] = useState(() => Math.floor(Math.random() * SCENE_COUNT));
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <SvgXml xml={nightSceneXml(index)} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
