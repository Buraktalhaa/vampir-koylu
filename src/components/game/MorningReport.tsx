import { ChevronRight, HeartPulse, Info, Sun } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { DeathCard } from '@/components/game/DeathCard';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { alivePlayers, findPlayer, publicRoleOf, type DeathEvent, type GameState, type Player, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, radius, space } from '@/theme/tokens';

import { InfoBand } from '@/components/ui/InfoBand';

type Props = { game: GameState; deaths: DeathEvent[]; /** Bu gece dirilenler (ör. Şaman). */ revived?: Player[]; onDone: () => void };

export function MorningReport({ game, deaths, revived = [], onDone }: Props) {
  const { t } = useLanguage();
  const alive = alivePlayers(game).length;
  return (
    <Screen phase="day" footer={<Button label={game.winner ? t.game.seeResult : t.game.toDiscussion} phase="day" trailingIcon={ChevronRight} onPress={onDone} />}>
      <PhaseHeader icon={Sun} phase="day" title={t.game.day(game.round)} subtitle={t.game.morningSub} />
      {revived.map((p) => (
        <InfoBand key={p.id} icon={HeartPulse} tone="success" text={t.game.revived(p.name)} />
      ))}
      {deaths.length === 0 ? (
        <View style={styles.nobody}>
          <View style={styles.sunOrb} />
          <AppText variant="h1" style={styles.center}>
            {t.game.nobodyDiedTitle}
          </AppText>
          <AppText color={colors.text2} style={styles.center}>
            {t.game.nobodyDiedText}
          </AppText>
        </View>
      ) : (
        <>
          <AppText variant="h1" style={styles.center}>
            {t.game.diedCount(deaths.length)}
          </AppText>
          <View style={[styles.deaths, deaths.length > 1 && styles.deathsRow]}>
            {deaths.map((d) => {
              const player = findPlayer(game, d.playerId);
              return (
                <DeathCard
                  key={d.playerId}
                  name={player.name}
                  roleId={publicRoleOf(game, player) as RoleId | null}
                  compact={deaths.length > 1}
                />
              );
            })}
          </View>
          {!game.settings.revealRoleOnDeath ? <InfoBand icon={Info} tone="warning" text={t.game.rolesAtEnd} /> : null}
          {deaths.length === 1 ? (
            <AppText variant="small" color={colors.text2} style={styles.center}>
              {t.game.leftGame(findPlayer(game, deaths[0].playerId).name, alive)}
            </AppText>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  nobody: { alignItems: 'center', gap: space[4], paddingTop: space[10] },
  sunOrb: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: phases.day.mist,
    boxShadow: '0px 0px 60px rgba(242, 165, 65, 0.55)',
  },
  deaths: { gap: space[3] },
  deathsRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
