import { StyleSheet, View } from 'react-native';

import type { TeamId } from '@/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { radius, space } from '@/theme/tokens';

import { AppText } from './AppText';

/** Takım etiketi: sembol + renk + metin. */
export function TeamBadge({ team }: { team: TeamId }) {
  const { t } = useLanguage();
  const { icon: Icon, fg, bg, line } = TEAM_VISUALS[team];
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: line }]}>
      <Icon size={14} color={fg} strokeWidth={2} />
      <AppText variant="caption" color={fg}>
        {t.teams[team].name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
