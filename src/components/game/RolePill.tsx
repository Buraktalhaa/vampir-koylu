import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { RolePortrait } from '@/components/RolePortrait';
import { TeamBadge } from '@/components/TeamBadge';
import { ROLES, type RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

type Props = { roleId: RoleId; label?: string; withTeam?: boolean };

/** Küçük rol rozeti: madalyon + isim (+ yetenek adı / takım etiketi). */
export function RolePill({ roleId, label, withTeam }: Props) {
  const { t } = useLanguage();
  return (
    <View style={styles.pill}>
      <RolePortrait roleId={roleId} size={32} />
      <View style={styles.text}>
        <AppText variant="button" numberOfLines={1}>
          {label ?? t.roles[roleId].name}
        </AppText>
        {withTeam ? <TeamBadge team={ROLES[roleId].team} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space[2],
    minHeight: 44,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  text: { gap: 2, flexShrink: 1 },
});
