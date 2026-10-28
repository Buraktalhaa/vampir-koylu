import { Eye } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import type { Player, TeamId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { phases, radius, space } from '@/theme/tokens';

type Props = { header: ReactNode; summary: ReactNode; target: Player; team: TeamId; onDone: () => void };

/** Kâhin'in sonucu: yalnızca telefonu tutan görür, "Anladım, gizle" ile gece devam eder. */
export function SeerResult({ header, summary, target, team, onDone }: Props) {
  const { t } = useLanguage();
  const { icon: TeamIcon, fg, line, bg } = TEAM_VISUALS[team];
  return (
    <Screen phase="night" footer={<Button label={t.game.gotIt} icon={Eye} onPress={onDone} />}>
      {header}
      {summary}
      <View style={styles.result}>
        <PlayerAvatar name={target.name} size={84} />
        <AppText variant="h2" style={styles.center}>
          {t.game.seerResult(target.name)}
        </AppText>
        <View style={[styles.team, { borderColor: line, backgroundColor: bg }]}>
          <TeamIcon size={22} color={fg} />
          <AppText variant="h2" color={fg}>
            {t.teams[team].name}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: {
    alignItems: 'center',
    gap: space[4],
    paddingVertical: space[8],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: phases.night.border,
    backgroundColor: phases.night.surface,
  },
  center: { textAlign: 'center' },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
