import { Pressable, StyleSheet, View } from 'react-native';

import { getRole, type RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, radius, shadow, space } from '@/theme/tokens';

import { AppText } from './AppText';
import { RolePortrait } from './RolePortrait';
import { TeamBadge } from './TeamBadge';

type Props = {
  roleId: RoleId;
  size?: 'small' | 'large';
  onPress?: () => void;
};

/**
 * Tüm karakterler için tek kart bileşeni — sadece veri değişir.
 */
export function RoleCard({ roleId, size = 'small', onPress }: Props) {
  const { t } = useLanguage();
  const role = getRole(roleId);
  const text = t.roles[roleId];
  const { line } = TEAM_VISUALS[role.team];
  const large = size === 'large';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderColor: line }, large && styles.cardLarge, pressed && styles.pressed]}
    >
      <RolePortrait roleId={roleId} size={large ? 128 : 56} />
      <View style={[styles.body, large && styles.bodyLarge]}>
        <AppText variant={large ? 'display' : 'h3'}>{text.name}</AppText>
        <View style={styles.badgeRow}>
          <TeamBadge team={role.team} />
        </View>
        {large ? (
          <AppText color={colors.text2} style={[styles.description, styles.centerText]}>
            {text.description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: space[4],
    alignItems: 'center',
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface1,
    boxShadow: shadow[1],
  },
  cardLarge: { flexDirection: 'column', alignItems: 'center', padding: space[6], borderRadius: radius.xl },
  pressed: { backgroundColor: colors.surface3 },
  body: { flexShrink: 1, gap: space[2] },
  bodyLarge: { alignItems: 'center' },
  badgeRow: { flexDirection: 'row' },
  centerText: { textAlign: 'center' },
  description: { marginTop: space[2] },
});
