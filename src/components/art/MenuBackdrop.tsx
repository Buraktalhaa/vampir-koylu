import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, SvgXml } from 'react-native-svg';

import { colors } from '@/theme/tokens';

import { MENU_ART_XML } from './menuArt';

/** Menü görseli + altta butonlar okunsun diye koyulaşan perde. */
export function MenuBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <SvgXml xml={MENU_ART_XML} width="100%" height="100%" />
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="menuShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg0} stopOpacity={0.35} />
            <Stop offset="0.3" stopColor={colors.bg0} stopOpacity={0} />
            <Stop offset="0.65" stopColor={colors.bg0} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.bg0} stopOpacity={0.85} />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill="url(#menuShade)" />
      </Svg>
    </View>
  );
}
