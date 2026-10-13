import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { ROLES, type RoleId } from '@/game/roles';
import { ROLE_ICONS } from '@/theme/roles';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors } from '@/theme/tokens';

/**
 * Karakter madalyonu: takım renginde halka + ışıma + büyük karakter ikonu. Tüm boyutlar tek bileşen.
 * İkon madalyonun ~%60'ı; küçük boyutlarda çizgi kalınlaşır ki belli olsun.
 */
export function RolePortrait({ roleId, size = 56 }: { roleId: RoleId; size?: number }) {
  const { fg, line, bg } = TEAM_VISUALS[ROLES[roleId].team];
  const Icon = ROLE_ICONS[roleId];
  const gradientId = `glow-${roleId}`;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="40%" r="60%">
            <Stop offset="0" stopColor={fg} stopOpacity={0.4} />
            <Stop offset="0.6" stopColor={bg} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.bg0} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="47.5" fill={`url(#${gradientId})`} stroke={line} strokeWidth={3} />
      </Svg>
      <Icon size={size * 0.6} color={fg} strokeWidth={size < 48 ? 2.25 : 1.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
