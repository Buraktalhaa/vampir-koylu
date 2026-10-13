import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ROLES, type RoleId } from '@/game/roles';
import { ROLE_ICONS } from '@/theme/roles';
import { TEAM_VISUALS } from '@/theme/teams';

type Props = { roleId: RoleId; size?: number; style?: StyleProp<ViewStyle> };

/**
 * Kartın arka planındaki dev, soluk, hafif eğik karakter ikonu (filigran).
 * Kapsayıcı `overflow: 'hidden'` olmalı; ikon kenardan taşar. Dokunmaları engellemez.
 */
export function RoleWatermark({ roleId, size = 120, style }: Props) {
  const Icon = ROLE_ICONS[roleId];
  const { fg } = TEAM_VISUALS[ROLES[roleId].team];
  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Icon size={size} color={fg} strokeWidth={1.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: -18, top: -12, opacity: 0.14, transform: [{ rotate: '-14deg' }] },
});
