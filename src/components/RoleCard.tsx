import { Pressable, StyleSheet, View } from 'react-native';

import { getRole, type RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, radius, space } from '@/theme/tokens';

import { AppText } from './AppText';
import { RolePortrait } from './RolePortrait';

type Props = {
  roleId: RoleId;
  /** cell: ansiklopedi ızgarası hücresi · large: rol açılışı ve detay kartı */
  size?: 'cell' | 'large';
  onPress?: () => void;
  /** Büyük kartın altına eklenecek içerik (ör. etiketler). */
  footer?: React.ReactNode;
};

/** Tüm karakterler için tek kart bileşeni — sadece veri değişir. */
export function RoleCard({ roleId, size = 'cell', onPress, footer }: Props) {
  const { t } = useLanguage();
  const role = getRole(roleId);
  const text = t.roles[roleId];
  const { icon: TeamIcon, fg, line, bg } = TEAM_VISUALS[role.team];

  if (size === 'cell') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${text.name}, ${t.teams[role.team].name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.cell, { borderColor: line, backgroundColor: bg }, pressed && styles.pressed]}
      >
        <View>
          <RolePortrait roleId={roleId} size={76} />
          <View style={[styles.teamDot, { borderColor: line }]}>
            <TeamIcon size={12} color={fg} />
          </View>
        </View>
        <AppText variant="caption" numberOfLines={1} style={styles.cellName}>
          {text.name}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.large, { borderColor: line, backgroundColor: bg }]}>
      <View style={styles.teamRow}>
        <TeamIcon size={14} color={fg} />
        <AppText variant="caption" color={fg}>
          {t.teams[role.team].name.toLocaleUpperCase('tr')}
        </AppText>
      </View>
      <View style={styles.portraitArea}>
        <RolePortrait roleId={roleId} size={128} />
      </View>
      <AppText variant="display">{text.name.toLocaleUpperCase('tr')}</AppText>
      <AppText color={colors.text2}>{text.description}</AppText>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  cell: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[3],
    paddingHorizontal: space[1],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  teamDot: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.bg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellName: { fontSize: 13, color: colors.text1 },
  large: { gap: space[3], padding: space[4], borderRadius: radius.lg + 4, borderWidth: 1 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  portraitArea: {
    height: 160,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
