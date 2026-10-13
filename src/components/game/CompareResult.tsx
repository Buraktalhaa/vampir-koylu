import { Equal, EqualNot, Eye } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import type { Player } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

type Props = { header: ReactNode; summary: ReactNode; first: Player; second: Player; sameTeam: boolean; onDone: () => void };

/** Dedektif'in sonucu: iki oyuncu aynı takımda mı? Yalnızca telefonu tutan görür. */
export function CompareResult({ header, summary, first, second, sameTeam, onDone }: Props) {
  const { t } = useLanguage();
  const tone = sameTeam ? colors.success : { fg: colors.danger.fg, bg: colors.team.vampire.bg };
  const Sign = sameTeam ? Equal : EqualNot;
  return (
    <Screen phase="night" footer={<Button label={t.game.gotIt} icon={Eye} onPress={onDone} />}>
      {header}
      {summary}
      <View style={styles.result}>
        <View style={styles.pair}>
          <Person player={first} />
          <View style={[styles.sign, { backgroundColor: tone.bg, borderColor: tone.fg }]}>
            <Sign size={26} color={tone.fg} />
          </View>
          <Person player={second} />
        </View>
        <AppText variant="h2" color={tone.fg} style={styles.center}>
          {sameTeam ? t.game.sameTeam : t.game.differentTeams}
        </AppText>
      </View>
    </Screen>
  );
}

function Person({ player }: { player: Player }) {
  return (
    <View style={styles.person}>
      <PlayerAvatar name={player.name} size={64} />
      <AppText variant="button" numberOfLines={1} style={styles.center}>
        {player.name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  result: {
    alignItems: 'center',
    gap: space[5],
    paddingVertical: space[8],
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  pair: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  person: { width: 96, alignItems: 'center', gap: space[2] },
  sign: { width: 48, height: 48, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
