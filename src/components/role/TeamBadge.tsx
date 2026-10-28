import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { TeamId } from '@/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { radius, space } from '@/theme/tokens';

/** Takım etiketi (28 yükseklik): amblem + büyük harfli takım adı, takım renginde kenar. Bilgi yalnız renkte değil. */
export function TeamBadge({ team }: { team: TeamId }) {
  const { t, language } = useLanguage();
  const { icon: Icon, fg } = TEAM_VISUALS[team];
  return (
    <View style={[styles.badge, { borderColor: fg }]}>
      <Icon size={16} />
      <AppText variant="caption" color={fg}>
        {t.teams[team].name.toLocaleUpperCase(language)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: 28,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
});
